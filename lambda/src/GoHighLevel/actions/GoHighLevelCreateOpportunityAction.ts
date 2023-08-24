import axios from "axios";
import { GoHighLevelActionResponse } from "../models/GoHighLevelActionResponse";
import { GoHighLevelAction, GoHighLevelActionType } from "./GoHighLevelAction";

export class GoHighLevelCreateOpportunityAction extends GoHighLevelAction {
  pipelineId: string;
  stageId: string;

  constructor(piplineId: string, stageId: string) {
    super("CreateOpportunity" as GoHighLevelActionType);
    this.pipelineId = piplineId;
    this.stageId = stageId;
  }

  async execute(): Promise<GoHighLevelActionResponse> {
    console.log(`GoHighLevelCreateOpportunityAction.execute - start, contactId = ${this.goHighLevelContext.contact.id}`);
    const opportunityData = {
      "title": this.goHighLevelContext.contact.phone,
      "stageId": this.stageId,
      "contactId": this.goHighLevelContext.contact.id,
      "phone": this.goHighLevelContext.contact.phone,
      "status": 'open'
    };
    try {
      const { data } = await axios.post(`https://rest.gohighlevel.com/v1/pipelines/${this.pipelineId}/opportunities`,
        opportunityData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${this.goHighLevelContext.apiKey}`
          }
        });
      console.log(`GoHighLevelCreateOpportunityAction.execute - success, response = ${JSON.stringify(data)}`);
      return new GoHighLevelActionResponse('200', data);
    } catch (error) {
      console.log(`GoHighLevelCreateOpportunityAction.execute - failed, error - ${error}`);
      return new GoHighLevelActionResponse(JSON.stringify(error), undefined);
    }
  }
}