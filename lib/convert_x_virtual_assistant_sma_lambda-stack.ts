import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import path = require('path');

export class ConvertXVirtualAssistantSmaLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const smaLambda = new lambda.Function(this, 'ConvertXVirtualAssistantSmaLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join('./lambda')),
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(10),
      memorySize: 512,
      environment: {
        OPENAI_API_KEY: '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'
      }
    });
  }
}
