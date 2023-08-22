import { Action } from "./Actions/Action";

export class CallLifecyleEventResponse {
  SchemaVersion: string;
  Actions: Action<any>[];
  TransactionAttributes?: any;

  constructor(transactionAttributes?: any) {
    this.SchemaVersion = '1.0';
    this.Actions = [];
    this.TransactionAttributes = transactionAttributes;
  }

  public addAction(action: Action<any>) {
    this.Actions.push(action);
  }
}
