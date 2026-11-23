import assert from 'assert';
import mongoose from '../server/node_modules/mongoose/index.js';
import { Contract } from '../server/src/models/Contract.js';
import { connectDB, disconnectDB } from '../server/src/config/db.js';

console.log('Testing MongoDB connection and /api/contracts operations...');

await connectDB();

const testContract = await Contract.create({
  ownerId: 'user_mock_dev_01',
  originalName: 'vendor_test.pdf',
  storageKey: 'test_storage_key_01',
  mimeType: 'application/pdf',
  extension: 'pdf',
  sizeBytes: 15400,
  status: 'reviewed',
});

assert.ok(testContract._id);
console.log('  ✓ Contract.create succeeded in real MongoDB:', String(testContract._id));

const list = await Contract.find({ ownerId: 'user_mock_dev_01' }).sort({ uploadedAt: -1 }).lean();
assert.ok(Array.isArray(list));
assert.ok(list.length >= 1);
assert.strictEqual(list[0].originalName, 'vendor_test.pdf');
console.log('  ✓ Contract.find succeeded');

await Contract.findOneAndDelete({ _id: testContract._id, ownerId: 'user_mock_dev_01' });
const afterDelete = await Contract.findOne({ _id: testContract._id, ownerId: 'user_mock_dev_01' }).lean();
assert.strictEqual(afterDelete, null);
console.log('  ✓ Contract.findOneAndDelete and cleanup succeeded in MongoDB');

await disconnectDB();
console.log('API /api/contracts real MongoDB integration test passed!\n');
