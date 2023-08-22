import { CallLifecyleEventResponse } from "../models/CallLifecycleEventResponse";
import { VirtualAssistantConfiguration } from "../models/VirtualAssistantConfiguration";
import { CallLifecycleEventProcessor, CallLifecycleEventType } from "./CallLifecyleEventProcessor";

export class HangupProcessor extends CallLifecycleEventProcessor {
  event: any;
  constructor(event: any, config: VirtualAssistantConfiguration) {
    super('HANGUP' as CallLifecycleEventType, config);
    this.event = event;
  }

  async processLifecycleEvent(): Promise<any> {
    console.log('HangupProcessor.processLifecycleEvent');
    return Promise.resolve(
      new CallLifecyleEventResponse(this.event.CallDetails.TransactionAttributes)
    );
  }
}