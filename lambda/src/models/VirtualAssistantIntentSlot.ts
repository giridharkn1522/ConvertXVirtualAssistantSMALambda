import { GoHighLevelAction } from "../GoHighLevel/actions/GoHighLevelAction";
import { VirtualAssistantGoHighLevelAction } from "./VirtualAssistantGoHighLevelAction";

export class VirtualAssistantIntentSlot {
  intent: string;
  name: string;
  type: string;
  promptAudioFileName: string;
  goHighLevelActions: VirtualAssistantGoHighLevelAction[];

  constructor(intent: string, name: string, type: string,promptAudioFileName: string, goHighLevelActions: VirtualAssistantGoHighLevelAction[]) {
    this.intent = intent;
    this.name = name;
    this.type = type;
    this.promptAudioFileName = promptAudioFileName;
    this.goHighLevelActions = goHighLevelActions;
  }

  static fromJson(json: any): VirtualAssistantIntentSlot {
    const goHighLevelActions: VirtualAssistantGoHighLevelAction[] = [];
    if (json.goHighLevelActions !== undefined) {
      for (const goHighLevelAction of json.goHighLevelActions) {
        goHighLevelActions.push(VirtualAssistantGoHighLevelAction.fromJson(goHighLevelAction));
      }
    }
    return new VirtualAssistantIntentSlot(json.intent, json.name, json.type, json.promptAudioFile, goHighLevelActions);
  }
}