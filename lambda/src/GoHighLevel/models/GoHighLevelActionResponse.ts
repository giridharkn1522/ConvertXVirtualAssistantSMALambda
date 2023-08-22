export class GoHighLevelActionResponse {
  status: string;
  data: any;

  constructor(status: string, data: any) {
    this.status = status;
    this.data = data;
  }
}