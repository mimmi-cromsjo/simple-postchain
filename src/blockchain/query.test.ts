import { BlockchainClient } from "./blockchain-client";

describe('Query', () => {
  const blockchainClient = BlockchainClient.initialize('http://127.0.0.1:7740');

  describe('Query Builder',  () => {
    it('should be able to create and send a query', async () => {
      const data = await blockchainClient.query<string>()
        .name('say_hello')
        .addParameter('name', 'Viktor')
        .send();

      expect(data).toEqual('Hello Viktor!');
    });
  });
})
