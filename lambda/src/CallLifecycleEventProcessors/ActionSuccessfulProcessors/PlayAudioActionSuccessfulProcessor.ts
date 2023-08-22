import { Action } from "../../models/Actions/Action";
import { createHangupAction } from "../../models/Actions/HangupAction";
import { PlayAudioAction, createPlayAudioAction } from "../../models/Actions/PlayAudioAction";
import { StartBotConversationAction, createStartBotConversationAction } from "../../models/Actions/StartBotConversationAction";
import { CallLifecyleEventResponse } from "../../models/CallLifecycleEventResponse";
import { VirtualAssistantConfiguration } from "../../models/VirtualAssistantConfiguration";
import { CallLifecycleEventProcessor, CallLifecycleEventType } from "../CallLifecyleEventProcessor";

export class PlayAudioActionSuccessfulProcessor extends CallLifecycleEventProcessor {
  event: any;
  playAudioFileToIntentMap: Map<string, Action<any>> = new Map<string, Action<any>>();

  constructor(event: any, config: VirtualAssistantConfiguration) {
    super('ACTION_SUCCESSFUL' as CallLifecycleEventType, config);
    this.event = event;
    this.generatePlayAudioFileToNextActionMap();
  }

  generatePlayAudioFileToNextActionMap(): void {
    if (this.config === undefined) {
      throw new Error('Virtual Assistant Configuration is undefined');
    }

    this.playAudioFileToIntentMap.set(
      this.config.welcomeAudioFileName,
      createStartBotConversationAction(
        this.event.CallDetails.Participants[0].CallId,
        this.config.lexBotAliasArn,
        'en_US',
        'MainIntent'));
    this.playAudioFileToIntentMap.set(
      this.config.subsequentAudioFileName,
      createStartBotConversationAction(
        this.event.CallDetails.Participants[0].CallId,
        this.config.lexBotAliasArn,
        'en_US',
        'MainIntent'));
    this.playAudioFileToIntentMap.set(
      this.config.fallbackAudioFileName,
      createStartBotConversationAction(
        this.event.CallDetails.Participants[0].CallId,
        this.config.lexBotAliasArn,
        'en_US',
        'MainIntent'));
    this.playAudioFileToIntentMap.set(
      this.config.continuationAudioFileName,
      createStartBotConversationAction(
        this.event.CallDetails.Participants[0].CallId,
        this.config.lexBotAliasArn,
        'en_US',
        'MainIntent'));
    this.playAudioFileToIntentMap.set(
      this.config.goodbyeAudioFileName,
      createHangupAction(
        '0',
        ''));

    for (const intent of this.config.intents) {
      if (intent.confirmationAudioFileName !== undefined && intent.confirmationAudioFileName !== '') {
        if (intent.slots === undefined || intent.slots.length === 0) {
            this.playAudioFileToIntentMap.set(
            intent.confirmationAudioFileName,
            createPlayAudioAction(
              this.event.CallDetails.Participants[0].CallId,
              this.config.mediaFilesBucketName,
              intent.fulfillmentAudioFileName
            ));
        }
        else { 
          this.playAudioFileToIntentMap.set(
            intent.confirmationAudioFileName,
            createPlayAudioAction(
              this.event.CallDetails.Participants[0].CallId,
              this.config.mediaFilesBucketName,
              intent.slots[0].promptAudioFileName
            ));
        }
      }

      for (const slot of intent.slots) {
        this.playAudioFileToIntentMap.set(
          slot.promptAudioFileName,
          createStartBotConversationAction(
            this.event.CallDetails.Participants[0].CallId,
            this.config.lexBotAliasArn,
            'en_US',
            slot.intent)
        );
      }
    }
  }

  async processLifecycleEvent(): Promise<CallLifecyleEventResponse> {
    console.log(`PlayAudioActionSuccessfulProcessor: Processing ACTION_SUCCESSFUL event`);
    let response: CallLifecyleEventResponse;

    try {
      if (this.config === undefined) {
        throw new Error('Virtual Assistant Configuration is undefined');
      }

      if (this.config.intents === undefined ||
        this.config.intents.length === 0) {
        throw new Error('Virtual Assistant Configuration intents are undefined or empty');
      }

      if (this.event === undefined ||
        this.event.InvocationEventType !== 'ACTION_SUCCESSFUL' ||
        this.event.ActionData.Type !== 'PlayAudio' ||
        this.event.ActionData.Parameters === undefined ||
        this.event.ActionData.Parameters.AudioSource === undefined ||
        this.event.ActionData.Parameters.AudioSource.Key === undefined
      ) {
        console.log(
          `Invalid event -
            ${this.event.InvocationEventType}
            ${this.event.ActionData.Type}
            ${this.event.ActionData.Parameters.AudioSource.Key}
            `);
        throw new Error('Invalid event');
      }

      const action = this.playAudioFileToIntentMap.get(this.event.ActionData.Parameters.AudioSource.Key);
      if (action === undefined) {
        console.log(`PlayAudioActionSuccessfulProcessor: Intent name is undefined, playing subsequent audio file`);
        response = this.createPlayAudioResponse(this.config.subsequentAudioFileName);
      } else {
        console.log(`PlayAudioActionSuccessfulProcessor: Next Action = ${JSON.stringify(action)}`);
        const startBotConversationAction: StartBotConversationAction = action as StartBotConversationAction;
        response = new CallLifecyleEventResponse(this.event.CallDetails.TransactionAttributes);
        response.addAction(startBotConversationAction);
      }
      
      console.log(`PlayAudioActionSuccessfulProcessor: Returning response: ${JSON.stringify(response)}`);
    } catch (err) {
      console.log(`PlayAudioActionSuccessfulProcessor: Error processing ACTION_SUCCESSFUL event: ${err}`);
      response = this.createPlayAudioResponse(this.config.subsequentAudioFileName);
    }

    return Promise.resolve(response);
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