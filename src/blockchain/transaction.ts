/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { uuidv4 } from '../utils/uuidv4';
import { KeyPair } from './key-pair';

export class Transaction {
  private readonly gtx: Promise<any>;
  private readonly operations: Operation[];
  // @ts-ignore
  private keyPair: KeyPair;

  private constructor(gtx: Promise<any>) {
    this.gtx = gtx;
    this.operations = [];
  }

  public static init(gtx: any): Transaction {
    return new Transaction(gtx);
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
    this.keyPair = keyPair;
    return this;
  }

  public send(): Promise<any> {
    return this.gtx.then((client) => {
      const rq = client.newTransaction([this.keyPair.publicKey]);

      this.operations.forEach((op) => rq.addOperation(op.name, ...op.data));
      rq.sign(this.keyPair.privateKey, this.keyPair.publicKey);

      return rq.postAndWaitConfirmation();
    });
  }
}

interface Operation {
  name: string;
  data: any[];
}
