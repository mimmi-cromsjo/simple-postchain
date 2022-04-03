/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { uuidv4 } from '../utils/uuidv4';
import { KeyPair } from './key-pair';
const pc = require('postchain-client');

export class Transaction {
  private readonly gtxRetriever: () => any;
  private readonly operations: Operation[];
  private readonly signers: Set<KeyPair>;

  private rawTxSigners: Buffer[];
  private rawTxSignatures: Buffer[];

  private constructor(gtxRetriever: () => any) {
    this.gtxRetriever = gtxRetriever;
    this.operations = [];
    this.rawTxSigners = [];
    this.rawTxSignatures = [];
    this.signers = new Set<KeyPair>();
  }

  public static init(gtx: () => any): Transaction {
    return new Transaction(gtx);
  }

  public static initFromRawTx(gtxRetriever: () => any, rawTx: string): Transaction {
    const deserializedTx = pc.gtx.deserialize(Buffer.from(rawTx, 'hex'));
    const tx = new Transaction(gtxRetriever);

    deserializedTx.operations.map((operation: any) => {
      tx.addOperation(operation.opName, ...operation.args);
    });

    tx.rawTxSigners = deserializedTx.signers;
    tx.rawTxSignatures = deserializedTx.signatures;

    return tx;
  }

  public addOperation(name: string, ...args: any): Transaction {
    this.operations.push({ name, data: args });
    return this;
  }

  public addNop(): Transaction {
    if (!this.operations.map((op) => op.name).includes('nop')) {
      this.operations.push({ name: 'nop', data: [uuidv4()] });
    }

    return this;
  }

  public sign(keyPair: KeyPair): Transaction {
    this.signers.add(keyPair);
    return this;
  }

  public async send(): Promise<any> {
    const gtx = await this.gtxRetriever();

    const signersArr = Array.from(this.signers.values());

    const tx = gtx.newTransaction(this.rawTxSigners.length > 0 ? this.rawTxSigners : signersArr.map((kp) => kp.publicKey));
    this.operations.forEach((op) => tx.addOperation(op.name, ...op.data));

    tx.gtx.signatures = this.rawTxSignatures.length > 1 ? this.rawTxSignatures : this.rawTxSignatures.concat(signersArr.map(() => Buffer.alloc(0)));

    signersArr.forEach((kp) => tx.sign(kp.privateKey, kp.publicKey));

    return tx.postAndWaitConfirmation();
  }

  public getOperations(): Operation[] {
    return this.operations.slice();
  }

  public getSigners(): Buffer[] {
    if (this.rawTxSigners.length > 0) {
      return this.rawTxSigners.slice();
    }

    return [...this.signers].map((kp) => kp.publicKey);
  }
}

interface Operation {
  name: string;
  data: any[];
}
