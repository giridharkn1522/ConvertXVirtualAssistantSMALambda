import { GoHighLevelContextData } from '../GoHighLevelContextData';
import { GoHighLevelActionResponse } from '../models/GoHighLevelActionResponse';

export enum GoHighLevelActionType {
  LookupContact = 'LookupContact',
  GetContact = 'GetContact',
  CreateContact = 'CreateContact',
  TriggerWorkflow = 'TriggerWorkflow',
  CreateTask = 'CreateTask',
}

export class GoHighLevelAction {
  actionType: GoHighLevelActionType;
  goHighLevelContext: GoHighLevelContextData;

  constructor(actionType: GoHighLevelActionType) {
    this.actionType = actionType;
  }

  setGoHighLevelContext(goHighLevelContext: GoHighLevelContextData) {
    this.goHighLevelContext = goHighLevelContext;
  }

  async execute(): Promise<GoHighLevelActionResponse> {
    throw new Error('Not implemented');
  }
}