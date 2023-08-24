import { GoHighLevelActionsProcessor } from "../GoHighLevel/GoHighLevelActionsProcessor";
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
    console.log('HangupProcessor.processLifecycleEvent - Start');
    let success = true;
    const goHighLevelActionsProcessor = new GoHighLevelActionsProcessor(this.config, this.event.CallDetails.Context);
    const status = await goHighLevelActionsProcessor.processCallEndGoHighLevelActions();
    if (status !== '200') {
      console.log(`HangupProcessor.processLifecycleEvent: processCallEndGoHighLevelActions failed, status = ${status}`);
      success = false;
    } else {
      console.log(`HangupProcessor.processLifecycleEvent: processCallEndGoHighLevelActions completed, status = ${status}`);
    }

    console.log('HangupProcessor.processLifecycleEvent - End');
    return Promise.resolve(
      new CallLifecyleEventResponse(this.event.CallDetails.TransactionAttributes)
    );
  }
}