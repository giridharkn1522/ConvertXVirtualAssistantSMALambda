import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as kinesis from 'aws-cdk-lib/aws-kinesis';
import path = require('path');

export class ConvertXVirtualAssistantSmaLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    let functionName: string;
    let ddbTableName: string;
    switch (props?.stackName) {
      case 'ConvertXVirtualAssistantSmaLambdaStack-Prod':
        functionName = 'ConvertXVirtualAssistantSmaLambda-Prod';
        ddbTableName = 'ConvertXVirtualAssistantConfigurationsTable-Prod';
        break;
      default:
      case 'ConvertXVirtualAssistantSmaLambdaStack-Dev':
        functionName = 'ConvertXVirtualAssistantSmaLambda-Dev';
        ddbTableName = 'ConvertXVirtualAssistantConfigurationsTable-Dev';
        break;
    }

    // The code that defines your stack goes here
    const smaLambda = new lambda.Function(this, functionName, {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join('./lambda')),
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(10),
      memorySize: 512,
      environment: {
        OPENAI_API_KEY_SECRET_NAME: 'ConvertXVirtualAssistantOpenAIAPIKey',
      }
    });

    // Grant the SMA Lambda read permissions to the OPENAI_API_KEY secret
    const dbReadSecret = secretsmanager.Secret.fromSecretNameV2(this, 'ConvertXVirtualAssistantOpenAIAPIKey', 'ConvertXVirtualAssistantOpenAIAPIKey');
    dbReadSecret.grantRead(smaLambda);

    // Create the DDB store for storing the Virtual Assistant config for each phone number
    const ddbTable = new dynamodb.Table(this, ddbTableName, {
      partitionKey: { name: 'phoneNumber', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES
    });
    
    // Grant the SMA Lambda read/write permissions to the DDB table
    ddbTable.grantReadWriteData(smaLambda);

    smaLambda.addEnvironment('DYNAMODB_TABLE_NAME', ddbTable.tableName);
    smaLambda.addEnvironment('DYNAMODB_TABLE_KEY_NAME', 'phoneNumber');
    smaLambda.addEnvironment('DYNAMODB_TABLE_VALUE_NAME', 'configuration');
  }
}
