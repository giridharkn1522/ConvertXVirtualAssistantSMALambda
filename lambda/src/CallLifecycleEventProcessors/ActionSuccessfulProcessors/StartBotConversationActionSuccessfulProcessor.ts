import { GoHighLevelActionsProcessor } from "../../GoHighLevel/GoHighLevelActionsProcessor";
import { GoHighLevelContextData } from "../../GoHighLevel/GoHighLevelContextData";
import { GoHighLevelGetContactAction } from "../../GoHighLevel/actions/GoHighLevelGetContactAction";
import { GoHighLevelActionResponse } from "../../GoHighLevel/models/GoHighLevelActionResponse";
import { PlayAudioAction, createPlayAudioAction } from "../../models/Actions/PlayAudioAction";
import { CallLifecyleEventResponse } from "../../models/CallLifecycleEventResponse";
import { VirtualAssistantConfiguration } from "../../models/VirtualAssistantConfiguration";
import { OpenAIIntentProcessor } from "../../utils/OpenAIIntentProcessor";
import { CallLifecycleEventProcessor, CallLifecycleEventType } from "../CallLifecyleEventProcessor";

export class StartBotConversationActionSuccessfulProcessor extends CallLifecycleEventProcessor {
  event: any;

  constructor(event: any, config: VirtualAssistantConfiguration) {
    super('ACTION_SUCCESSFUL' as CallLifecycleEventType, config);
    this.event = event;
  }

  async processLifecycleEvent(): Promise<CallLifecyleEventResponse> {
    console.log(`StartBotConversationActionSuccessfulProcessor: Processing ACTION_SUCCESSFUL event = ${JSON.stringify(this.event)}`);
    let response: CallLifecyleEventResponse;

    try {
      if (this.config === undefined) {
        throw new Error('Virtual Assistant Configuration is undefined');
      }

      if (this.config.intents === undefined || this.config.intents.length === 0) {
        throw new Error('Virtual Assistant Configuration intents are undefined or empty');
      }

      if (this.event === undefined ||
        this.event.InvocationEventType !== 'ACTION_SUCCESSFUL' ||
        this.event.ActionData.Type !== 'StartBotConversation' ||
        this.event.ActionData.IntentResult === undefined ||
        this.event.ActionData.IntentResult.SessionState === undefined ||
        this.event.ActionData.IntentResult.SessionState.Intent === undefined ||
        this.event.ActionData.IntentResult.SessionState.Intent.Name === undefined ||
        this.event.CallDetails.TransactionAttributes === undefined ||
        this.event.CallDetails.TransactionAttributes.goHighLevelContactId === undefined) {
        console.log(
          `Invalid event -
          ${this.event.InvocationEventType}
           ${this.event.ActionData.Type}
           ${this.event.ActionData.IntentResult.SessionState.Intent.Name}
           ${this.event.CallDetails.TransactionAttributes.goHighLevelContactId }
          `);
        throw new Error('Invalid event');
      }

      let intentString: string = this.event.ActionData.IntentResult.SessionState.Intent.Name;

      // Get GoHighLevel contact by Id
      const goHighLevelContext = new GoHighLevelContextData(
        this.config.goHighLevelAPIKey);
      const goHighLevelGetContactAction = new GoHighLevelGetContactAction(
        this.event.CallDetails.TransactionAttributes.goHighLevelContactId);
      goHighLevelGetContactAction.setGoHighLevelContext(goHighLevelContext);
      const getContactResponse: GoHighLevelActionResponse = await goHighLevelGetContactAction.execute();
      if (getContactResponse.status !== '200') {
        throw new Error(`Could not get goHighLevelContact from 
          contactId = ${this.event.CallDetails.TransactionAttributes.goHighLevelContactId}, 
          status = ${getContactResponse.status}`);
      } else {
        goHighLevelContext.setContact(goHighLevelGetContactAction.contact);
      }

      // Step 0 - FallbackIntent event, choose FallbackIntents
      if (intentString === 'FallbackIntent') {
        // FallbackIntent event, choose FallbackIntent
        response = this.createPlayAudioResponse(this.config.fallbackAudioFileName);
        console.log(`StartBotConversationActionSuccessfulProcessor: FallbackIntent matched, 
          playing ${this.config.fallbackAudioFileName}, 
          response = ${JSON.stringify(response)}`);
        return Promise.resolve(response);
      } 

      // Step 1 - Open AI lookup intent if it is MainIntent
      if (intentString === 'MainIntent') {
        let mainRequest: string = this.event.ActionData.IntentResult.SessionState.Intent.Slots.MainRequest.Value.OriginalValue;
        if (mainRequest.toLowerCase() === 'yes') {
          response = this.createPlayAudioResponse(this.config.continuationAudioFileName);
          console.log(`StartBotConversationActionSuccessfulProcessor: Yes matched, 
            playing ${this.config.continuationAudioFileName}, 
            response = ${JSON.stringify(response)}`);
          return Promise.resolve(response);
        } else if (mainRequest.toLowerCase() === 'no') {
          response = this.createPlayAudioResponse(this.config.goodbyeAudioFileName);
          console.log(`StartBotConversationActionSuccessfulProcessor: No matched, 
            playing ${this.config.goodbyeAudioFileName}, 
            response = ${JSON.stringify(response)}`);
          return Promise.resolve(response);
        }

        const openAIIntentProcessor = new OpenAIIntentProcessor(
          process.env.OPENAI_API_KEY as string,
        );
        intentString = await openAIIntentProcessor.lookupIntentUsingOpenAI(
          this.config,
          mainRequest
        );

        if (intentString === undefined || intentString === 'FallbackIntent') {
          // Could not lookup intent using OpenAI or it matched the FallbackIntent, choose FallbackIntent
          response = this.createPlayAudioResponse(this.config.fallbackAudioFileName);
          console.log(`StartBotConversationActionSuccessfulProcessor: Step 1 - OpenAI lookupIntentUsingOpenAI failed or matched FallbackIntent,
            intentName = ${intentString}, 
            playing fallbackAudioFileName = ${this.config.fallbackAudioFileName}`);
          return Promise.resolve(response);
        }

        // OpenAI lookup intent matched, continue with the matched intent
        console.log(`StartBotConversationActionSuccessfulProcessor: Step 1 - OpenAI lookupIntentUsingOpenAI matched, 
          intentString = ${intentString}`);
      } else {
        console.log(`StartBotConversationActionSuccessfulProcessor: Step 1 - matched SlotIntent, 
          intentString = ${intentString}`);
      }

      // Step 2 - Process GoHighLevel actions if needed
      for (const intent of this.config.intents) {
        // If intent has actions, execute them
        if (intent.goHighLevelActions.length !== 0) {

          // If the resolved intentString matches the current intent's name and it has no slots or 
          // If the resolved intentString matches the current intent's last slot's intent name, execute the actions
          if ((intent.matchString === intentString && intent.slots.length === 0) ||
            (intent.slots.length !== 0 && intent.slots[intent.slots.length - 1].intent === intentString)) {
            if (!await this.processGoHighLevelActions(intentString, '', goHighLevelContext)) {
              response = this.createPlayAudioResponse(intent.failedAudioFileName);
              console.log(`StartBotConversationActionSuccessfulProcessor: Step 2 - GoHighLevel Intent actions processed, 
                fulfillmentAudioFileName = ${intent.failedAudioFileName}`);
              return Promise.resolve(response);
            }
          }
        }

        for (const slot of intent.slots) {
          // If slot has actions, execute them
          if (slot.goHighLevelActions.length !== 0) {
            // If the intentString matches the slot's intent name, execute the actions
            if (slot.intent === intentString) {
              // TODO: This needs to be cleaned up and refactored
              goHighLevelContext.description = this.event.ActionData.IntentResult.SessionState.Intent.Slots[slot.name].Value.OriginalValue;
              if (!await this.processGoHighLevelActions(
                intentString,
                this.event.ActionData.IntentResult.SessionState.Intent.Slots[slot.name].Value.OriginalValue,
                goHighLevelContext)) {
                response = this.createPlayAudioResponse(intent.failedAudioFileName);
                console.log(`StartBotConversationActionSuccessfulProcessor: Step 2 - GoHighLevel Slot actions processed, 
                    fulfillmentAudioFileName = ${intent.failedAudioFileName}`);
                return Promise.resolve(response);
              }
            }
          }
        }
      }

      // Step 3 - Identify next steps and play appropriate audio file
      let audioFileName: string | undefined = this.config.fallbackAudioFileName;
      for (const intent of this.config.intents) {
        if ((intent.matchString === intentString && intent.slots.length === 0) ||
          (intent.slots.length !== 0 && intent.slots[intent.slots.length - 1].intent === intentString)) {
          // If the resolved intentString matches the current intent's name and it has no slots or 
          // If the resolved intentString matches the current intent's last slot's intent name, intent is fulfilled
          audioFileName = intent.fulfillmentAudioFileName;
          console.log(`StartBotConversationActionSuccessfulProcessor: Step 3 - ${intent.matchString} fulfilled,
            playing fulfillmentAudioFileName = ${audioFileName}`);
        } else if (intent.matchString === intentString && intent.slots.length !== 0) {
          if (intent.confirmationAudioFileName === undefined || intent.confirmationAudioFileName === '') {
            // If the resolved intentString matches the current intent's name and it has slots, and there is no confirmation prompt
            // play the first slots prompt
            audioFileName = intent.slots[0].promptAudioFileName;
            console.log(`StartBotConversationActionSuccessfulProcessor: Step 3 - ${intent.matchString} fulfilled,
              playing promptAudioFileName = ${audioFileName}`);
          } else {
            // If the resolved intentString matches the current intent's name and it has slots, play the confirmation prompt
            audioFileName = intent.confirmationAudioFileName;
            console.log(`StartBotConversationActionSuccessfulProcessor: Step 3 - ${intent.matchString} fulfilled,
              playing confirmationAudioFileName = ${audioFileName}`);
          }
        } else {
          let index: number = 0;
          for (const slot of intent.slots) {
            // If the intentString matches the slot's intent name, execute the actions
            if (slot.intent === intentString && index < intent.slots.length - 1) {
              audioFileName = intent.slots[index + 1].promptAudioFileName;
              console.log(`StartBotConversationActionSuccessfulProcessor: Step 3 - slot fulfilled,
              playing the next promptAudioFileName = ${audioFileName}`);
            }
            index++;
          }
        }
      }

      response = this.createPlayAudioResponse(audioFileName);
      console.log(`StartBotConversationActionSuccessfulProcessor: processLifecycleEvent completed, response = ${JSON.stringify(response)}`);
      return Promise.resolve(response);
    } catch (error) {
      response = this.createPlayAudioResponse(this.config.fallbackAudioFileName);
      console.log(`StartBotConversationActionSuccessfulProcessor: processLifecycleEvent error = ${error}, response = ${JSON.stringify(response)}`);
      return Promise.resolve(response);
    }
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

  private async processGoHighLevelActions(intentString: string, slotValue: string, goHighLevelContext: GoHighLevelContextData): Promise<boolean> {
    let success: boolean = true;
    const goHighLevelActionsProcessor = new GoHighLevelActionsProcessor(
      this.config,
      goHighLevelContext
    );
    const status = await goHighLevelActionsProcessor.processGoHighLevelActions(intentString, slotValue);
    if (status !== '200') {
      console.log(`processGoHighLevelActions: processGoHighLevelActions failed, status = ${status}`);
      success = false;
    } else {
      console.log(`processGoHighLevelActions: processGoHighLevelActions completed, status = ${status}`);
    }
    return Promise.resolve(success);
  }
}