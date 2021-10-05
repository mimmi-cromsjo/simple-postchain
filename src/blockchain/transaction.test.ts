import { BlockchainClient } from './blockchain-client';

describe('Transaction', () => {
  const blockchainClient = BlockchainClient.initialize('http://127.0.0.1:7740');

  describe('Transaction Builder', () => {
    it('should be able to create a transaction successfully', async () => {
      const user1 = blockchainClient.createKeyPair();
      const user2 = blockchainClient.createKeyPair();

      await blockchainClient.transaction().addOperation('create_account', user1.publicKey).sign(user1).send();

      await blockchainClient.transaction().addOperation('create_account', user2.publicKey).sign(user2).send();

      await blockchainClient.transaction().addOperation('transfer_balance', user1.publicKey, user2.publicKey, 10).sign(user1).send();

      const user2Balance = await blockchainClient.query().name('get_balance').addParameter('pubkey', user2.publicKey.toString('hex')).send();

      expect(user2Balance).toEqual(30);
    });
  });
});
