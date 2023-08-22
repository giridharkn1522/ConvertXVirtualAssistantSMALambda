import axios from "axios";
import { GoHighLevelAction, GoHighLevelActionType } from "./GoHighLevelAction";
import { GoHighLevelActionResponse } from "../models/GoHighLevelActionResponse";
import { GoHighLevelContact } from "../models/GoHighLevelContact";

export class GoHighLevelCreateContactAction extends GoHighLevelAction {
  contact: GoHighLevelContact;
  phone: string;
  firstName: string;
  lastName: string;

  constructor(phone: string, firstName: string, lastName: string, email: string) {
    super('CreateContact' as GoHighLevelActionType);
    this.phone = phone;
    this.firstName = firstName;
    this.lastName = lastName;
  }
  
  async execute(): Promise<GoHighLevelActionResponse> {
    try {
      const {data} = await axios.post('https://rest.gohighlevel.com/v1/contacts/', {
        //"email": "john@deo.com",
        "phone": this.phone,
        "firstName": this.firstName,
        "lastName": this.lastName,
        //"name": "John Deo",
        //"dateOfBirth": "1990-09-25",
        //"address1": "3535 1st St N",
        //"city": "Dolomite",
        //"state": "AL",
        //"country": "US",
        //"postalCode": "35061",
        //"companyName": "DGS VolMAX",
        //"website": "35061",
        //"tags": [
        //    "commodo",
        //    "veniam ut reprehenderit"
        //],
        source: "ConvertXVirtualAssistant",
        //"customField": {
        //    "__custom_field_id__": "do in Lorem ut exercitation"
        //}
      }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${this.goHighLevelContext.apiKey}`
          }
      });
      
      console.log(`Create contact response - ${data}`);
      this.contact = data.contact?? undefined;
      return new GoHighLevelActionResponse('200', this.contact);
    } catch (error) {
      console.log(`Create contact failed, error - ${error}`);
      return new GoHighLevelActionResponse(JSON.stringify(error), undefined);
    }
  }
}