import { getAuth } from '@clerk/express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { config } from '../config/index.js';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';

let client = null;

function getClerkFrontendDomain() {
  try {
    if (config.clerkPublishableKey) {
      const b64 = config.clerkPublishableKey.replace(/^pk_(test|live)_/, '');
      const decoded = Buffer.from(b64, 'base64').toString('utf8');
      const clean = decoded.endsWith('$') ? decoded.slice(0, -1) : decoded;
      if (clean && clean.includes('.')) return clean;
    }
  } catch (e) {

  }
  return 'cosmic-flounder-8063.clerk.accounts.dev';
}

function getJwksClient() {
  if (!client) {
    const domain = getClerkFrontendDomain();
    client = jwksClient({
      jwksUri: `https://${domain}/.well-known/jwks.json`,
      requestHeaders: config.clerkSecretKey
        ? { Authorization: `Bearer ${config.clerkSecretKey}` }
        : {},
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    });
  }
  return client;
}

function getKey(header, callback) {
  try {
    const jwks = getJwksClient();
    jwks.getSigningKey(header?.kid, (err, key) => {
      if (err) return callback(err, null);
      if (!key) return callback(new Error('Signing key not found'), null);
      const signingKey = key.getPublicKey ? key.getPublicKey() : key.rsaPublicKey;
      callback(null, signingKey);
    });
  } catch (err) {
    callback(err, null);
  }
}

export async function requireAuth(req, res, next) {
  try {

    try {
      const auth = getAuth(req);
      if (auth && auth.userId) {
        req.auth = {
          userId: auth.userId,
          claims: auth.claims,
        };
        return next();
      }
    } catch (e) {

    }

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (token && token.includes('.')) {
      return jwt.verify(
        token,
        getKey,
        { algorithms: ['RS256'] },
        (err, decoded) => {
          if (!err && decoded && decoded.sub) {
            req.auth = {
              userId: decoded.sub,
              claims: decoded,
            };
            return next();
          }

          if (config.devMockAuth && req.headers['x-mock-user-id']) {
            req.auth = { userId: String(req.headers['x-mock-user-id']) };
            return next();
          }

          return next(ApiError.unauthorized('Invalid or expired Clerk authentication token.'));
        }
      );
    }

    if (config.devMockAuth && req.headers['x-mock-user-id']) {
      req.auth = { userId: String(req.headers['x-mock-user-id']) };
      return next();
    }

    throw ApiError.unauthorized('Authentication token is missing. Please sign in via Clerk.');
  } catch (error) {
    next(error);
  }
}
