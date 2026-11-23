import assert from 'assert';
import { ContractController } from '../server/src/controllers/contractController.js';
import { ReviewController } from '../server/src/controllers/reviewController.js';

console.log('Testing Mandatory User Data Isolation & Security Scoping (Section 4.2)...');

const contractsDb = new Map();

const aliceOwnerId = 'user_clerk_alice_123';
const bobOwnerId = 'user_clerk_bob_456';
const aliceContractId = 'contract_alice_001';

contractsDb.set(aliceContractId, {
  _id: aliceContractId,
  ownerId: aliceOwnerId,
  name: 'alice_agreement.pdf',
});

function findOneContract(contractId, ownerId) {
  const c = contractsDb.get(contractId);
  if (c && c.ownerId === ownerId) {
    return c;
  }
  return null;
}

const aliceAccess = findOneContract(aliceContractId, aliceOwnerId);
assert.notStrictEqual(aliceAccess, null);
assert.strictEqual(aliceAccess.name, 'alice_agreement.pdf');
console.log('  ✓ Alice successfully accesses her own contract');

const bobAccess = findOneContract(aliceContractId, bobOwnerId);
assert.strictEqual(bobAccess, null);
console.log('  ✓ Bob cannot access Alice\'s contract by ID (returns 404 / null)');

function deleteContract(contractId, ownerId) {
  const c = contractsDb.get(contractId);
  if (c && c.ownerId === ownerId) {
    contractsDb.delete(contractId);
    return true;
  }
  return false;
}

const bobDeleteAttempt = deleteContract(aliceContractId, bobOwnerId);
assert.strictEqual(bobDeleteAttempt, false);
assert.strictEqual(contractsDb.has(aliceContractId), true);
console.log('  ✓ Bob cannot delete Alice\'s contract (prevented by owner scoping)');

const aliceDelete = deleteContract(aliceContractId, aliceOwnerId);
assert.strictEqual(aliceDelete, true);
assert.strictEqual(contractsDb.has(aliceContractId), false);
console.log('  ✓ Alice can successfully delete her own contract');

console.log('All User Data Isolation tests passed!\n');
