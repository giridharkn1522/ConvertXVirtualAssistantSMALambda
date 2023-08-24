import axios from "axios";
import { GoHighLevelAction, GoHighLevelActionType } from "./GoHighLevelAction";
import { GoHighLevelActionResponse } from "../models/GoHighLevelActionResponse";
import { GoHighLevelContact } from "../models/GoHighLevelContact";

export class GoHighLevelGetContactAction extends GoHighLevelAction {
  contact: GoHighLevelContact;
  contactId: string;

  constructor(contactId: string) {
    super('GetContact' as GoHighLevelActionType);
    this.contactId = contactId;
  }
  
  async execute(): Promise<GoHighLevelActionResponse> {
    try {
      console.log(`GoHighLevelGetContactAction.execute - start, contactId = ${this.contactId}`);
      const {data} = await axios.get(`https://rest.gohighlevel.com/v1/contacts/${this.contactId}`, 
      {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${this.goHighLevelContext.apiKey}`
          }
      });
      
      this.contact = data.contact;
      console.log(`GoHighLevelGetContactAction.execute - success, contact = ${JSON.stringify(this.contact)}`);
      return new GoHighLevelActionResponse('200', this.contact);
    } catch (error) {
      console.log(`GoHighLevelGetContactAction.execute - failed, error = ${error}`);
      return new GoHighLevelActionResponse(JSON.stringify(error), undefined);
    }
  }
}