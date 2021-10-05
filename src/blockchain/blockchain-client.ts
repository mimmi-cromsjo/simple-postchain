import { Query } from './query';
import { KeyPair } from './key-pair';
import { Transaction } from './transaction';

const pc = require('postchain-client');
const fetch = require('node-fetch');

export class BlockchainClient {
  private readonly nodeUrl: string;
  private readonly chainId: number;

  private brid: string;
  private gtx: any;

  private constructor(nodeApiUrl: string, blockchainRid = '', chainId = 0) {
    this.nodeUrl = nodeApiUrl;
    this.brid = blockchainRid;
    this.chainId = chainId;

    this.clientRetriever = this.clientRetriever.bind(this);
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
    return Query.init<T>(this.clientRetriever);
  }

  public transaction(): Transaction {
    return Transaction.init(this.clientRetriever);
  }

  public fromRawTx(rawTx: string): Transaction {
    return Transaction.initFromRawTx(this.clientRetriever, rawTx);
  }

  public async getBlockHeight(): Promise<number> {
    await this.ensureBrid();

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

  private async ensureBrid(): Promise<void> {
    if (!this.brid) {
      this.brid = await BlockchainClient.getBrid(this.nodeUrl, this.chainId);
    }
  }

  private async clientRetriever(): Promise<any> {
    if (this.gtx) return this.gtx;

    if (!this.brid) {
      this.brid = await BlockchainClient.getBrid(this.nodeUrl, this.chainId);
    }

    const rest = pc.restClient.createRestClient(this.nodeUrl, this.brid, 5);
    this.gtx = pc.gtxClient.createClient(rest, Buffer.from(this.brid, 'hex'), []);

    return this.gtx;
  }
}
