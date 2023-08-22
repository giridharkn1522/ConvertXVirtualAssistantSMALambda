export class GoHighLevelContact {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  name: string;
  dateOfBirth: string;
  address1: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  companyName: string;
  website: string;
  tags: string[];
  source: string;
  customField: any;

  constructor(id: string, email: string, phone: string, firstName: string, lastName: string, name: string, dateOfBirth: string, address1: string, city: string, state: string, country: string, postalCode: string, companyName: string, website: string, tags: string[], source: string, customField: any) {
    this.id = id;
    this.email = email;
    this.phone = phone;
    this.firstName = firstName;
    this.lastName = lastName;
    this.name = name;
    this.dateOfBirth = dateOfBirth;
    this.address1 = address1;
    this.city = city;
    this.state = state;
    this.country = country;
    this.postalCode = postalCode;
    this.companyName = companyName;
    this.website = website;
    this.tags = tags;
    this.source = source;
    this.customField = customField;
  }

  static fromJson(json: any): GoHighLevelContact {
    return new GoHighLevelContact(json.id, json.email, json.phone, json.firstName, json.lastName, json.name, json.dateOfBirth, json.address1, json.city, json.state, json.country, json.postalCode, json.companyName, json.website, json.tags, json.source, json.customField);
  }
}