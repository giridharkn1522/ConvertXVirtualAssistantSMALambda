import axios from "axios";
import { GoHighLevelActionResponse } from "../models/GoHighLevelActionResponse";
import { GoHighLevelAction, GoHighLevelActionType } from "./GoHighLevelAction";

export class GoHighLevelCreateTaskAction extends GoHighLevelAction {
  constructor() {
    super('CreateTask' as GoHighLevelActionType);
  }

  async execute(): Promise<GoHighLevelActionResponse> {
    try {
      console.log(`GoHighLevelCreateTaskAction.execute - start, contactId = ${this.goHighLevelContext.contact.id}`);
      const currentTime = new Date().getTime();
      const taskData = {
        "title": `Customer Voicemail Message`,
        "dueDate": ((new Date(currentTime + 2 * 60 * 60 * 1000)).toISOString().split('.')[0])+"Z",
        "description": this.goHighLevelContext.description,
        "assignedTo": '',
        "status": 'incompleted'
      };
      console.log(`contactId = ${this.goHighLevelContext.contact.id} 
        phoneNumber = ${this.goHighLevelContext.contact.phone} 
        voicemailMessage = ${this.goHighLevelContext.description}`);
      console.log(`taskData = ${JSON.stringify(taskData)}`);
      const { data } = await axios.post(`https://rest.gohighlevel.com/v1/contacts/${this.goHighLevelContext.contact.id}/tasks`,
        taskData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.goHighLevelContext.apiKey}`
        }
      });
      console.log(`GoHighLevelCreateTaskAction.execute - success, response = ${JSON.stringify(data)}`);
      return new GoHighLevelActionResponse('200', data);
    } catch (error) {
      console.log(`GoHighLevelCreateTaskAction.execute - failed, error - ${error}`);
      return new GoHighLevelActionResponse(JSON.stringify(error), undefined);
    }
  }
}