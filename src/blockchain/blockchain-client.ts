import { Query } from './query';
import { KeyPair } from './key-pair';
import { Transaction } from './transaction';

const pc = require('postchain-client');
const fetch = require('node-fetch');

export class BlockchainClient {
  private readonly nodeUrl: string;
  private readonly brid: Promise<string>;
  private readonly restClient: Promise<any>;
  private readonly gtx: Promise<any>;

  private constructor(nodeApiUrl: string, blockchainRid = '', chainId = 0) {
    this.nodeUrl = nodeApiUrl;

    if (!blockchainRid) {
      this.brid = BlockchainClient.getBrid(nodeApiUrl, chainId);
    } else {
      this.brid = Promise.resolve(blockchainRid);
    }

    this.restClient = this.brid.then((rid: string) => pc.restClient.createRestClient(nodeApiUrl, rid, 5));
    this.gtx = Promise.all([this.brid, this.restClient]).then((promises) => pc.gtxClient.createClient(promises[1], Buffer.from(promises[0], 'hex'), []));
  }

  public createKeyPair(privateKey?: string): KeyPair {
    if (privateKey) {
      const key = Buffer.from(privateKey, 'hex');
      return { privateKey: key, publicKey: pc.util.createPublicKey(key) };
    }
    const kp = pc.util.makeKeyPair();
    return { publicKey: pc.util.toBuffer(kp.pubKey), privateKey: pc.util.toBuffer(kp.privKey) };
  }

  public query<T>(): Query<T> {
    return Query.init<T>(this.gtx);
  }

  public transaction(): Transaction {
    return Transaction.init(this.gtx);
  }

  public async getBlockHeight(): Promise<number> {
    const rid = await this.brid;
    const url = `${this.nodeUrl}/blocks/${rid}??limit=1`;

    return fetch(url)
      .then((response: any) => response.json())
      .then((json: any) => json[0].height);
  }

  public static initialize(nodeApiUrl: string): BlockchainClient {
    return new BlockchainClient(nodeApiUrl, '');
  }

  public static initializeByBrid(nodeApiUrl: string, brid: string): BlockchainClient {
    return new BlockchainClient(nodeApiUrl, brid);
  }

  public static initializeByChainId(nodeApiUrl: string, chainId: number): BlockchainClient {
    return new BlockchainClient(nodeApiUrl, '', chainId);
  }

  private static getBrid(nodeApiUrl: string, chainId: number): Promise<string> {
    const url = `${nodeApiUrl}/brid/iid_${chainId}`;
    return fetch(url).then((response: Response) => {
      if (response.ok) return response.text();
      throw new Error(`Error resolving BRID for chainId ${chainId}, reason: ${response.statusText}`);
    });
  }
}
