import {BlockchainClient} from "./blockchain-client";

const config = require('../../config.json');

describe('BlockchainClient', () => {
  it('Able to initialize a BlockchainClient without brid or ChainId', async () => {
    const blockchainClient = BlockchainClient.Initialize('http://127.0.0.1:7740');

    const data = await blockchainClient.query<string>()
      .name('say_hello')
      .addParameter('name', 'Viktor')
      .send();

    expect(data).toEqual('Hello Viktor!');
  });

  it('Able to initialize a BlockchainClient by chainId', async () => {
    const blockchainClient = BlockchainClient.InitializeByChainId('http://127.0.0.1:7740', 0);

    const data = await blockchainClient.query<string>()
      .name('say_hello')
      .addParameter('name', 'Viktor')
      .send();

    expect(data).toEqual('Hello Viktor!');
  });

  it('Able to initialize a BlockchainClient by BRID', async () => {
    const blockchainClient = BlockchainClient.InitializeByBrid('http://127.0.0.1:7740', config.brid);

    const data = await blockchainClient.query<string>()
      .name('say_hello')
      .addParameter('name', 'Viktor')
      .send();

    expect(data).toEqual('Hello Viktor!');
  });

  it('Initializing BlockchainClient with invalid chainId should throw error', async () => {
    const blockchainClient = BlockchainClient.InitializeByChainId('http://127.0.0.1:7740', 2);

    try {
      await blockchainClient.query<string>()
        .name('say_hello')
        .addParameter('name', 'Viktor')
        .send();

      fail();
    } catch (error) {
      expect(error.message).toContain("Not Found");
    }
  });

  it('Initializing BlockchainClient with invalid BRID should throw error', async () => {
    const blockchainClient = BlockchainClient
      .InitializeByBrid('http://127.0.0.1:7740', '898C56DA662CE388FDA9C2DACB1FEA2D983B3097E83FFD68F51E959B6A4BCD0B');

    try {
      await blockchainClient.query<string>()
        .name('say_hello')
        .addParameter('name', 'Viktor')
        .send();

      fail();
    } catch (error) {
      expect(error.message).toContain("404");
    }
  });
});
