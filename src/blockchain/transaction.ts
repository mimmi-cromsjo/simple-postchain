/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { uuidv4 } from '../utils/uuidv4';
import { KeyPair } from './key-pair';

export class Transaction {
  private readonly gtxRetriever: () => any;
  private readonly operations: Operation[];
  private readonly signers: Set<KeyPair>;
  private readonly rawTx?: string;

  private constructor(gtxRetriever: () => any, rawTx?: string) {
    this.gtxRetriever = gtxRetriever;
    this.operations = [];
    this.signers = new Set<KeyPair>();
    this.rawTx = rawTx;
  }

  public static init(gtx: () => any): Transaction {
    return new Transaction(gtx, undefined);
  }

  public static initFromRawTx(gtxRetriever: () => any, rawTx: string): Transaction {
    return new Transaction(gtxRetriever, rawTx);
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

    console.log('GTX: ', gtx);
    const signersArr = Array.from(this.signers.values());

    let tx: any = null;

    if (!this.rawTx) {
      tx = gtx.newTransaction(signersArr.map((kp) => kp.publicKey));
      this.operations.forEach((op) => tx.addOperation(op.name, ...op.data));
    } else {
      tx = gtx.transactionFromRawTransaction(this.rawTx);
    }

    signersArr.forEach((kp) => tx.sign(kp.privateKey, kp.publicKey));

    return tx.postAndWaitConfirmation();
  }
}

interface Operation {
  name: string;
  data: any[];
}
