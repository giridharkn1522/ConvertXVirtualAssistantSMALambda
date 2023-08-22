import { VirtualAssistantGoHighLevelAction } from "./VirtualAssistantGoHighLevelAction";
import { VirtualAssistantIntentSlot } from "./VirtualAssistantIntentSlot";

export class VirtualAssistantIntent {
  matchString: string; // "Dental Emergency", "Reschedule Appointment", "Cancel Appointment
  confirmationAudioFileName: string;
  fulfillmentAudioFileName: string;
  failedAudioFileName: string;
  goHighLevelActions: VirtualAssistantGoHighLevelAction[];
  slots: VirtualAssistantIntentSlot[];

  constructor(
    matchString: string, 
    confirmationAudioFileName: string,
    fulfillmentAudioFileName: string,
    failedAudioFileName: string,
    goHighLevelActions: VirtualAssistantGoHighLevelAction[],
    slots: VirtualAssistantIntentSlot[]) {
    this.matchString = matchString;
    this.confirmationAudioFileName = confirmationAudioFileName;
    this.fulfillmentAudioFileName = fulfillmentAudioFileName;
    this.failedAudioFileName = failedAudioFileName;
    this.goHighLevelActions = goHighLevelActions;
    this.slots = slots;
  }

  static fromJson(json: any): VirtualAssistantIntent {
    const goHighLevelActions = json.goHighLevelActions.map((actionJson: any) => {
      return VirtualAssistantGoHighLevelAction.fromJson(actionJson);
    });
    const slots = json.slots.map((slotJson: any) => {
      return VirtualAssistantIntentSlot.fromJson(slotJson);
    });
    return new VirtualAssistantIntent(json.matchString, json.confirmationAudioFileName, json.fulfillmentAudioFileName, json.failedAudioFileName, goHighLevelActions, slots);
  }
}