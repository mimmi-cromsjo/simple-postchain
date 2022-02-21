import { BlockchainClient } from './blockchain-client';

const config = require('../../config.json');

describe('BlockchainClient', () => {
  it('Able to initialize a BlockchainClient without brid or ChainId', async () => {
    const blockchainClient = BlockchainClient.initialize('http://127.0.0.1:7740');

    const data = await blockchainClient.query<string>().name('say_hello').addParameter('name', 'Viktor').send();

    expect(data).toEqual('Hello Viktor!');
  });

  it('Able to initialize a BlockchainClient by chainId', async () => {
    const blockchainClient = BlockchainClient.initializeByChainId('http://127.0.0.1:7740', 0);

    const data = await blockchainClient.query<string>().name('say_hello').addParameter('name', 'Viktor').send();

    expect(data).toEqual('Hello Viktor!');
  });

  it('Able to initialize a BlockchainClient by BRID', async () => {
    const blockchainClient = BlockchainClient.initializeByBrid('http://127.0.0.1:7740', config.brid);

    const data = await blockchainClient.query<string>().name('say_hello').addParameter('name', 'Viktor').send();

    expect(data).toEqual('Hello Viktor!');
  });

  it('Initializing BlockchainClient with invalid chainId should throw error', async () => {
    const blockchainClient = BlockchainClient.initializeByChainId('http://127.0.0.1:7740', 2);

    try {
      await blockchainClient.query<string>().name('say_hello').addParameter('name', 'Viktor').send();

      fail();
    } catch (error: unknown) {
      if (error instanceof Error) {
        expect(error.message).toContain('Not Found');
      } else {
        fail('Expected error to be instance of Error');
      }
    }
  });

  it('Initializing BlockchainClient with invalid BRID should throw error', async () => {
    const blockchainClient = BlockchainClient.initializeByBrid('http://127.0.0.1:7740', '898C56DA662CE388FDA9C2DACB1FEA2D983B3097E83FFD68F51E959B6A4BCD0B');

    try {
      await blockchainClient.query<string>().name('say_hello').addParameter('name', 'Viktor').send();

      fail();
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).toContain('404');
      } else {
        fail('Expected error to be instance of Error');
      }
    }
  });

  it('Able to create KeyPair from existing private key', () => {
    const blockchainClient = BlockchainClient.initialize('http://127.0.0.1:7740');

    const kp = blockchainClient.createKeyPair('c377688ca018f87a174abe7812a7c58bcee34309979e24291b3ed34bed4efc3c');

    expect(kp.publicKey.toString('hex')).toBe('03041fd637fd50840e46a0ec08689392e6bebd5103808ba730d276f953a95349fd');
  });
});
