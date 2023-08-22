import { GoHighLevelContextData } from "../GoHighLevel/GoHighLevelContextData";
import { GoHighLevelCreateContactAction } from "../GoHighLevel/actions/GoHighLevelCreateContactAction";
import { GoHighLevelLookupContactAction } from "../GoHighLevel/actions/GoHighLevelLookupContactAction";
import { AudioSourceData, PlayAudioAction, PlayAudioActionParameters } from "../models/Actions/PlayAudioAction";
import { CallLifecyleEventResponse } from "../models/CallLifecycleEventResponse";
import { VirtualAssistantConfiguration } from "../models/VirtualAssistantConfiguration";
import { CallLifecycleEventProcessor, CallLifecycleEventType } from "./CallLifecyleEventProcessor";

export class IncomingCallProcessor extends CallLifecycleEventProcessor {
  fromPhoneNumber: string;
  toPhoneNumber: string;
  callId: string;

  constructor(event: any, config: VirtualAssistantConfiguration) {
    super('NEW_INBOUND_CALL' as CallLifecycleEventType, config);

    this.fromPhoneNumber = event.CallDetails.Participants[0].From;
    this.toPhoneNumber = event.CallDetails.Participants[0].To;
    this.callId = event.CallDetails.Participants[0].CallId;
  }

  async processLifecycleEvent(): Promise<CallLifecyleEventResponse> {
    console.log(`Processing NEW_INBOUND_CALL event for callId: ${this.callId}`);
    const goHighLevelContext = new GoHighLevelContextData(
      this.config.goHighLevelAPIKey);
    const goHighLevelLookupContactAction = new GoHighLevelLookupContactAction(
      this.fromPhoneNumber);
    goHighLevelLookupContactAction.setGoHighLevelContext(goHighLevelContext);
    await goHighLevelLookupContactAction.execute();
    if (!goHighLevelLookupContactAction.contact) {
      const goHighLevelCreateContactAction = new GoHighLevelCreateContactAction(
        this.fromPhoneNumber,
        '',
        '',
        '');
      goHighLevelCreateContactAction.setGoHighLevelContext(goHighLevelContext);
      await goHighLevelCreateContactAction.execute();
    } else {
      console.log(`Contact already exists, skipping creation`);
      goHighLevelContext.setContact(goHighLevelLookupContactAction.contact);
    }

    const playAudioAction = new PlayAudioAction(
      new PlayAudioActionParameters(
        this.callId,
        'Leg-A',
        ["1", "8", "#"],
        '1',
        new AudioSourceData(
          'S3',
          this.config.mediaFilesBucketName,
          this.config.welcomeAudioFileName,
        )
      ));
    
    const response = new CallLifecyleEventResponse();
    response.addAction(playAudioAction);
    response.TransactionAttributes = {
      'goHighLevelContactId': goHighLevelContext.contact?.id
    };
  
    return Promise.resolve(response);
  }
}