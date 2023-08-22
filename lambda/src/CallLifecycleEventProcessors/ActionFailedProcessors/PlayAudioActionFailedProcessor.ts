import { HangupAction, createHangupAction } from "../../models/Actions/HangupAction";
import { CallLifecyleEventResponse } from "../../models/CallLifecycleEventResponse";
import { VirtualAssistantConfiguration } from "../../models/VirtualAssistantConfiguration";
import { CallLifecycleEventProcessor, CallLifecycleEventType } from "../CallLifecyleEventProcessor";

export class PlayAudioActionFailedProcessor extends CallLifecycleEventProcessor {
    event: any;

    constructor(event: any, config: VirtualAssistantConfiguration) {
        super('ACTION_FAILED' as CallLifecycleEventType, config);
        this.event = event;
    }
    async processLifecycleEvent(): Promise<CallLifecyleEventResponse> {
        console.log(`PlayAudioActionSuccessfulProcessor: Goodbye audio file played, hanging up`);
        let response = new CallLifecyleEventResponse(this.event.CallDetails.TransactionAttributes);
        response.addAction(createHangupAction('0', ''));
        return Promise.resolve(response);
    }
}