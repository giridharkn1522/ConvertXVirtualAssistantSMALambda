import { Handler } from 'aws-lambda';
import { CallLifecyleEventResponse } from './src/models/CallLifecycleEventResponse';
import { IncomingCallProcessor } from './src/CallLifecycleEventProcessors/IncomingCallProcessor';
import { CallLifecycleEventProcessor } from './src/CallLifecycleEventProcessors/CallLifecyleEventProcessor';
import { dentistVirtualAssistantConfig } from './src/CallLifecycleEventProcessors/CommonTestConfiguration';
import { PlayAudioActionSuccessfulProcessor } from './src/CallLifecycleEventProcessors/ActionSuccessfulProcessors/PlayAudioActionSuccessfulProcessor';
import { StartBotConversationActionSuccessfulProcessor } from './src/CallLifecycleEventProcessors/ActionSuccessfulProcessors/StartBotConversationActionSuccessfulProcessor';
import { PlayAudioActionFailedProcessor } from './src/CallLifecycleEventProcessors/ActionFailedProcessors/PlayAudioActionFailedProcessor';
import { StartBotConversationActionFailedProcessor } from './src/CallLifecycleEventProcessors/ActionFailedProcessors/StartBotConversationActionFailedProcessor';

export const handler: Handler = async (event: any) => {
  console.log('ConvertX SMA Lambda Incoming event - ', JSON.stringify(event));
  let response: CallLifecyleEventResponse;
  let callLifecycleProcessor: CallLifecycleEventProcessor;

  // TODO: Lookup config from DDB
  let config = dentistVirtualAssistantConfig;

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