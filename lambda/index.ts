import { Handler } from 'aws-lambda';
import { CallLifecyleEventResponse } from './src/models/CallLifecycleEventResponse';
import { IncomingCallProcessor } from './src/CallLifecycleEventProcessors/IncomingCallProcessor';
import { CallLifecycleEventProcessor } from './src/CallLifecycleEventProcessors/CallLifecyleEventProcessor';
import { PlayAudioActionSuccessfulProcessor } from './src/CallLifecycleEventProcessors/ActionSuccessfulProcessors/PlayAudioActionSuccessfulProcessor';
import { StartBotConversationActionSuccessfulProcessor } from './src/CallLifecycleEventProcessors/ActionSuccessfulProcessors/StartBotConversationActionSuccessfulProcessor';
import { PlayAudioActionFailedProcessor } from './src/CallLifecycleEventProcessors/ActionFailedProcessors/PlayAudioActionFailedProcessor';
import { StartBotConversationActionFailedProcessor } from './src/CallLifecycleEventProcessors/ActionFailedProcessors/StartBotConversationActionFailedProcessor';
import { SecretsManagerClient } from './src/utils/SecretsManagerClient';
import { createHangupAction } from './src/models/Actions/HangupAction';
import { DynamoDB } from 'aws-sdk';
import { DynamoDBTableClient } from './src/utils/DynamoDBTableClient';
import { VirtualAssistantConfiguration } from './src/models/VirtualAssistantConfiguration';

export const handler: Handler = async (event: any) => {
  console.log('ConvertX SMA Lambda Incoming event - ', JSON.stringify(event));
  let response: CallLifecyleEventResponse;
  let callLifecycleProcessor: CallLifecycleEventProcessor;

  // Load OPENAI_API_KEY from secrets manager
  if (process.env.OPENAI_API_KEY_SECRET_NAME === undefined) {
    response = new CallLifecyleEventResponse();
    response.addAction(createHangupAction('0', ''));
    console.log('OPENAI_API_KEY_SECRET_NAME is undefined');
    return response;
  }
  const secretKeys: string[] = [
    process.env.OPENAI_API_KEY_SECRET_NAME??'',
  ];
  const secretsManagerClient = new SecretsManagerClient(secretKeys);
  if (!await secretsManagerClient.loadSecrets()) {
    response = new CallLifecyleEventResponse();
    response.addAction(createHangupAction('0', ''));
    console.log('Error loading secrets from secrets manager');
    return response;
  }
  const secretString = secretsManagerClient.secrets.get(process.env.OPENAI_API_KEY_SECRET_NAME??'')??'';
  process.env.OPENAI_API_KEY = JSON.parse(secretString).ConvertXVirtualAssistantOpenAIAPIKey;

  // Lookup config for the To phone number from DDB
  if (event.CallDetails === undefined ||
      event.CallDetails.Participants === undefined ||
      event.CallDetails.Participants.length === 0 ||
      event.CallDetails.Participants[0].To === undefined) {
    console.log('CallDetails.Participants[0].To is undefined, hanging up');
    response = new CallLifecyleEventResponse();
    response.addAction(createHangupAction('0', ''));
    return response;
  }

  const ddbTableClient = new DynamoDBTableClient();
  const config: VirtualAssistantConfiguration | undefined = await ddbTableClient.getConfig(
    event.CallDetails.Participants[0].To);
  if (config === undefined) {
    console.log('Config not found in DDB, hanging up');
    response = new CallLifecyleEventResponse();
    response.addAction(createHangupAction('0', ''));
    return response;
  }
  console.log('Config loaded from DDB - ', JSON.stringify(config));

  // Process the event
  switch (event.InvocationEventType) {
    case 'NEW_INBOUND_CALL':
      console.log('NEW_INBOUND_CALL');
      callLifecycleProcessor = new IncomingCallProcessor(event, config);
      response = await callLifecycleProcessor.processLifecycleEvent();
      break;

    case 'ACTION_SUCCESSFUL':
      console.log('ACTION_SUCCESSFUL');
      if (event.ActionData.Type === 'PlayAudio') {
        callLifecycleProcessor = new PlayAudioActionSuccessfulProcessor(event, config);
        response = await callLifecycleProcessor.processLifecycleEvent();
      } else if (event.ActionData.Type === 'StartBotConversation') {
        console.log('StartBotConversation');
        callLifecycleProcessor = new StartBotConversationActionSuccessfulProcessor(event, config);
        response = await callLifecycleProcessor.processLifecycleEvent();
      } else {
        console.log(`Unknown ActionData.Type: ${event.ActionData.Type}`);
        response = new CallLifecyleEventResponse();
      }
      break;

    case 'ACTION_FAILED':
      console.log('ACTION_FAILED');
      if (event.ActionData.Type === 'PlayAudio') {
        console.log('PlayAudio');
        callLifecycleProcessor = new PlayAudioActionFailedProcessor(event, config);
        response = await callLifecycleProcessor.processLifecycleEvent();
      } else if (event.ActionData.Type === 'StartBotConversation') {
        console.log('StartBotConversation');
        callLifecycleProcessor = new StartBotConversationActionFailedProcessor(event, config);
        response = await callLifecycleProcessor.processLifecycleEvent();
      } else {
        console.log(`Unknown ActionData.Type: ${event.ActionData.Type}`);
        response = new CallLifecyleEventResponse();
      }
      break;

    case 'RINGING':
      console.log('RINGING');
    default:
      console.log('Unknown event type');
      response = new CallLifecyleEventResponse();
      break;
  }

  console.log('ConvertX SMA Lambda response - ', JSON.stringify(response));
  return response;
}