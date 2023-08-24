import { VirtualAssistantConfiguration } from "../models/VirtualAssistantConfiguration";
import * as AWS from 'aws-sdk';
import { DocumentClient } from "aws-sdk/clients/dynamodb";

export class DynamoDBTableClient {

  constructor() {
    const region: string | undefined = process.env.AWS_REGION;
  }

  async getConfig(partitionKey: string): Promise<VirtualAssistantConfiguration | undefined> {
    if (process.env.DYNAMODB_TABLE_NAME === undefined ||
      process.env.DYNAMODB_TABLE_KEY_NAME === undefined ||
      process.env.DYNAMODB_TABLE_VALUE_NAME === undefined) {
      console.log('DYNAMODB_TABLE_NAME, DYNAMODB_TABLE_KEY_NAME, DYNAMODB_TABLE_VALUE_NAME, is undefined, returning undefined');
      return Promise.resolve(undefined);
    }

    const ddb = new AWS.DynamoDB(
      {
        apiVersion: '2012-08-10',
        region: process.env.AWS_REGION
      }
    );
    const ddbResponse = await ddb.getItem({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        [process.env.DYNAMODB_TABLE_KEY_NAME ?? '']: {
          S: partitionKey
        }
      }
    }).promise();
    console.log(`DynamoDBTableClient.getConfig - ddbResponse = ${JSON.stringify(ddbResponse)}`);

    let configString = ddbResponse.Item?.[process.env.DYNAMODB_TABLE_VALUE_NAME].S;
    if (configString === undefined ||
      configString === null ||
      configString === '') {
      console.log('Config not found in DDB, returning undefined');
      return Promise.resolve(undefined);
    }

    try {
      const configJson = JSON.parse(configString);
      const config = VirtualAssistantConfiguration.fromJson(configJson);
      console.log(`Config successfully loaded from DDB - ${JSON.stringify(config)}`);
      return config;
    } catch (error) {
      console.log(`Error parsing config from DDB, error = ${error}, configString = ${configString}`);
      return Promise.resolve(undefined);
    }
  }
}