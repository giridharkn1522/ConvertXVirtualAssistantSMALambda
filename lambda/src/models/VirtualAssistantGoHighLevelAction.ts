export class VirtualAssistantGoHighLevelActionData {
  workflowId: string;
  pipelineId: string;
  stageId: string;

  constructor(workflowId: string, pipelineId: string, stageId: string) {
    this.workflowId = workflowId;
    this.pipelineId = pipelineId;
    this.stageId = stageId;
  }

  static fromJson(json: any): VirtualAssistantGoHighLevelActionData {
    return new VirtualAssistantGoHighLevelActionData(json.workflowId, json.pipelineId, json.stageId);
  }
}

export class VirtualAssistantGoHighLevelAction {
  slotValue: string;
  actionType: string;
  actionData: VirtualAssistantGoHighLevelActionData;

  constructor(slotValue: string, actionType: string, actionData: any) {
    this.slotValue = slotValue;
    this.actionType = actionType;
    this.actionData = actionData;
  }

  static fromJson(json: any): VirtualAssistantGoHighLevelAction {
    return new VirtualAssistantGoHighLevelAction(json.slotValue, json.actionType, json.actionData);
  }
}