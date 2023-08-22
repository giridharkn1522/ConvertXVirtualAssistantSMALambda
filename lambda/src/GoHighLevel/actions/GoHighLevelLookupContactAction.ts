import axios from "axios";
import { GoHighLevelAction, GoHighLevelActionType } from "./GoHighLevelAction";
import { GoHighLevelActionResponse } from "../models/GoHighLevelActionResponse";
import { GoHighLevelContact } from "../models/GoHighLevelContact";

export class GoHighLevelLookupContactAction extends GoHighLevelAction {
  contact: GoHighLevelContact;
  phone: string;

  constructor(phone: string) {
    super('LookupContact' as GoHighLevelActionType);
    this.phone = phone;
  }
  
  async execute(): Promise<GoHighLevelActionResponse> {
    try {
      const {data} = await axios.get(`https://rest.gohighlevel.com/v1/contacts/lookup?phone=${encodeURI(this.phone)}`, 
      {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${this.goHighLevelContext.apiKey}`
          }
      });
      
      this.contact = data.contacts.length > 0 ? data.contacts[0] : undefined;
      return new GoHighLevelActionResponse('200', this.contact);
    } catch (error) {
      console.log(`lookupContact failed, error = ${error}`);
      return new GoHighLevelActionResponse(JSON.stringify(error), undefined);
    }
  }
}