import axios from "axios";
import { GoHighLevelAction, GoHighLevelActionType } from "./GoHighLevelAction";
import { GoHighLevelActionResponse } from "../models/GoHighLevelActionResponse";

export class GoHighLevelTriggerWorkflowAction extends GoHighLevelAction {
  workflowId: string;

  constructor(workflowId: string) {
    super('TriggerWorkflow' as GoHighLevelActionType);
    this.workflowId = workflowId;
  }

  static fromJson(json: any): GoHighLevelTriggerWorkflowAction {
    return new GoHighLevelTriggerWorkflowAction(json.workflowId);
  }

  toIsoString(date: Date) {
    const tzo = -date.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function(num: number) {
            return (num < 10 ? '0' : '') + num;
        };
  
    return date.getFullYear() +
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate()) +
        'T' + pad(date.getHours()) +
        ':' + pad(date.getMinutes()) +
        ':' + pad(date.getSeconds()) +
        dif + pad(Math.floor(Math.abs(tzo) / 60)) +
        ':' + pad(Math.abs(tzo) % 60);
  }

  async execute(): Promise<GoHighLevelActionResponse> {
    try {
      console.log(`GoHighLevelTriggerWorkflowAction.execute - start, workflowId = ${this.workflowId}`);

      if (this.goHighLevelContext.contact === undefined) {
        throw new Error('GoHighLevelTriggerWorkflowAction requires a contact to be set');
      }

      const eventStartTime = this.toIsoString(new Date());
      console.log(`eventStartTime = ${eventStartTime}`);
      const {data} = await axios.post(
        `https://rest.gohighlevel.com/v1/contacts/${this.goHighLevelContext.contact.id}/workflow/${this.workflowId}`, 
        {
          "eventStartTime": eventStartTime
        }, 
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${this.goHighLevelContext.apiKey}`
          }
        });
      
      console.log(`GoHighLevelTriggerWorkflowAction.execute - success, response = ${JSON.stringify(data)}`);
      return new GoHighLevelActionResponse('200', data);
    } catch (error) {
      console.log(`GoHighLevelTriggerWorkflowAction.execute - failed, error = ${error}`);
      return new GoHighLevelActionResponse('Error', undefined);
    }
  }
}