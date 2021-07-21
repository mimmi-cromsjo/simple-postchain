/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { uuidv4 } from '../utils/uuidv4';
import { KeyPair } from './key-pair';

export class Transaction {
  private readonly gtx: Promise<any>;
  private readonly operations: Operation[];
  private signers: Set<KeyPair>;

  private constructor(gtx: Promise<any>) {
    this.gtx = gtx;
    this.operations = [];
    this.signers = new Set<KeyPair>();
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
    this.signers.add(keyPair);
    return this;
  }

  public send(): Promise<any> {
    return this.gtx.then((client) => {
      const signersArr = Array.from(this.signers.values());
      const rq = client.newTransaction(signersArr.map((kp) => kp.publicKey));

      this.operations.forEach((op) => rq.addOperation(op.name, ...op.data));
      signersArr.forEach((kp) => rq.sign(kp.privateKey, kp.publicKey));

      return rq.postAndWaitConfirmation();
    });
  }
}

interface Operation {
  name: string;
  data: any[];
}
