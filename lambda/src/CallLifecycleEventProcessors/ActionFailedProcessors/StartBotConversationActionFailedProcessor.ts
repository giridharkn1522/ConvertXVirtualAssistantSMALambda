import { createHangupAction } from "../../models/Actions/HangupAction";
import { PlayAudioAction, createPlayAudioAction } from "../../models/Actions/PlayAudioAction";
import { CallLifecyleEventResponse } from "../../models/CallLifecycleEventResponse";
import { VirtualAssistantConfiguration } from "../../models/VirtualAssistantConfiguration";
import { CallLifecycleEventProcessor, CallLifecycleEventType } from "../CallLifecyleEventProcessor";

export class StartBotConversationActionFailedProcessor extends CallLifecycleEventProcessor {
  intentToPlayAudioFileMap: Map<string, string> = new Map<string, string>();
  event: any;

  generateIntentToPlayAudioFileMap(): void {
    if (this.config === undefined) {
      throw new Error('Virtual Assistant Configuration is undefined');
    }

    this.intentToPlayAudioFileMap.set(
      'MainIntent',
      this.config.fallbackAudioFileName
    );

    for (const intent of this.config.intents) {
      for (const slot of intent.slots) {
        this.intentToPlayAudioFileMap.set(
          slot.intent,
          intent.failedAudioFileName
        );
      }
    }
  }

  constructor(event: any, config: VirtualAssistantConfiguration) {
    super('ACTION_FAILED' as CallLifecycleEventType, config);
    this.event = event;
    this.generateIntentToPlayAudioFileMap();
  }

  async processLifecycleEvent(): Promise<CallLifecyleEventResponse> {
    console.log(`StartBotConversationActionFailedProcessor: Processing ACTION_FAILED event = ${JSON.stringify(this.event)}`);
    let response: CallLifecyleEventResponse;
    let audioFileName: string | undefined = this.config.fallbackAudioFileName;

    try {
      if (this.config === undefined) {
        throw new Error('Virtual Assistant Configuration is undefined');
      }

      if (this.config.intents === undefined || this.config.intents.length === 0) {
        throw new Error('Virtual Assistant Configuration intents are undefined or empty');
      }

      if (this.event === undefined ||
        this.event.InvocationEventType !== 'ACTION_FAILED' ||
        this.event.ActionData.Type !== 'StartBotConversation'
        ) {
        console.log(
          `Invalid event -
            ${this.event.InvocationEventType}
            ${this.event.ActionData.Type}
            `);
        throw new Error('Invalid event');
      }

      let intentName = '';
      if (this.event.ActionData.Parameters.Configuration !== undefined &&
          this.event.ActionData.Parameters.Configuration.SessionState !== undefined &&
          this.event.ActionData.Parameters.Configuration.SessionState.Intent !== undefined &&
          this.event.ActionData.Parameters.Configuration.SessionState.Intent.Name !== undefined) {
        intentName = this.event.ActionData.Parameters.Configuration.SessionState.Intent.Name;
      } else if (this.event.ActionData.IntentResult !== undefined &&
          this.event.ActionData.IntentResult.SessionState !== undefined &&
          this.event.ActionData.IntentResult.SessionState.Intent !== undefined &&
          this.event.ActionData.IntentResult.SessionState.Intent.Name !== undefined) {
        intentName = this.event.ActionData.IntentResult.SessionState.Intent.Name;
      }

      console.log(`StartBotConversationActionFailedProcessor: failed intentName = ${intentName}`);

      const audioFileName = this.intentToPlayAudioFileMap.get(intentName);
      if (audioFileName === undefined) {
        throw new Error('Audio file name is undefined');
      }

      response = this.createPlayAudioResponse(audioFileName);
      console.log(`StartBotConversationActionFailedProcessor: completed, response = ${JSON.stringify(response)}`);
    } catch (error) {
      console.error(`StartBotConversationActionFailedProcessor: error = ${error}`);
      response = this.createPlayAudioResponse(audioFileName);
      console.log(`StartBotConversationActionFailedProcessor: processLifecycleEvent error = ${error}, response = ${JSON.stringify(response)}`);
    }

    return Promise.resolve(
      response
    );
  }

  private createPlayAudioResponse(audioFileName: string): CallLifecyleEventResponse {
    let response = new CallLifecyleEventResponse(this.event.CallDetails.TransactionAttributes);
    const playAudioAction: PlayAudioAction = createPlayAudioAction(
      this.event.CallDetails.Participants[0].CallId,
      this.config.mediaFilesBucketName,
      audioFileName
    );
    response.addAction(playAudioAction);
    return response;
  }
}