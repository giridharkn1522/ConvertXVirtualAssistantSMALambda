import { GoHighLevelContact } from "./models/GoHighLevelContact";

export class GoHighLevelContextData {
  apiKey: string;
  contact: GoHighLevelContact;
  description: string;

  constructor(goHighLevelApiKey: string) {
    this.apiKey = goHighLevelApiKey;
  }

  setContact(contact: GoHighLevelContact) {
    this.contact = contact;
  }

  setDescription(description: GoHighLevelContact) {
    this.description = this.description;
  }

  static fromJson(json: any): GoHighLevelContextData {
    return new GoHighLevelContextData(json.goHighLevelApiKey);
  }
}