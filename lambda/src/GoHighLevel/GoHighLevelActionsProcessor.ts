import { VirtualAssistantConfiguration } from "../models/VirtualAssistantConfiguration";
import { VirtualAssistantGoHighLevelAction } from "../models/VirtualAssistantGoHighLevelAction";
import { VirtualAssistantIntent } from "../models/VirtualAssistantIntent";
import { GoHighLevelContextData } from "./GoHighLevelContextData";
import { GoHighLevelCreateOpportunityAction } from "./actions/GoHighLevelCreateOpportunityAction";
import { GoHighLevelCreateTaskAction } from "./actions/GoHighLevelCreateTaskAction";
import { GoHighLevelTriggerWorkflowAction } from "./actions/GoHighLevelTriggerWorkflowAction";
import { GoHighLevelActionResponse } from "./models/GoHighLevelActionResponse";

export class GoHighLevelActionsProcessor {
  config: VirtualAssistantConfiguration;
  context: GoHighLevelContextData;

  constructor(config: VirtualAssistantConfiguration, context: GoHighLevelContextData) {
    this.config = config;
    this.context = context;
  }

  async processCallStartGoHighLevelActions(): Promise<string> {
    console.log(`GoHighLevelActionsProcessor.processCallStartGoHighLevelActions - Start`);
    try {
      let response: GoHighLevelActionResponse | undefined = undefined;
      for (const action of this.config.callStartGoHighLevelActions) {
        try {
          response = await this.executeGoHighLevelAction(action);
          if (response === undefined || response.status !== '200') {
            console.error(`Error executing GoHighLevel action ${action.actionType}: ${response?.status}`);
          }
        } catch (error) {
          console.error(`Error executing GoHighLevel action ${action.actionType}: ${error}`);
        }
      }

      console.log(`In GoHighLevelActionsProcessor.processCallStartGoHighLevelActions - Success`);
      return Promise.resolve('200');
    } catch (error) {
      console.error(`GoHighLevelActionsProcessor.processCallStartGoHighLevelActions - Error = ${error}`);
      return Promise.reject(error);
    }
  }

  async processCallEndGoHighLevelActions(): Promise<string> {
    console.log(`GoHighLevelActionsProcessor.processCallEndGoHighLevelActions - Start`);
    try {
      let response: GoHighLevelActionResponse | undefined = undefined;
      for (const action of this.config.callStartGoHighLevelActions) {
        try {
          response = await this.executeGoHighLevelAction(action);
          if (response === undefined || response.status !== '200') {
            console.error(`Error executing GoHighLevel action ${action.actionType}: ${response?.status}`);
          }
        } catch (error) {
          console.error(`Error executing GoHighLevel action ${action.actionType}: ${error}`);
        }
      }

      console.log(`In GoHighLevelActionsProcessor.processCallEndGoHighLevelActions - Success`);
      return Promise.resolve('200');
    } catch (error) {
      console.error(`GoHighLevelActionsProcessor.processCallEndGoHighLevelActions - Error = ${error}`);
      return Promise.reject(error);
    }
  }

  async processIntentGoHighLevelActions(intentMatchString: string, slotValue: string): Promise<string> {
    console.log(`GoHighLevelActionsProcessor.processIntentGoHighLevelActions - Start, 
      intentMatchString: ${intentMatchString}, slotValue: ${slotValue}`);
    try {
      for (const intent of this.config.intents) {
        if (intent.matchString === intentMatchString) {
          let response: GoHighLevelActionResponse | undefined = undefined;
          for (const action of intent.goHighLevelActions) {
            try {
              response = await this.executeGoHighLevelAction(action);
              if (response === undefined || response.status !== '200') {
                console.error(`Error executing GoHighLevel action ${action.actionType}: ${response?.status}`);
              }
            } catch (error) {
              console.error(`Error executing GoHighLevel action ${action.actionType}: ${error}`);
            }
          }
        }
      }

      console.log(`GoHighLevelActionsProcessor.processIntentGoHighLevelActions - Success`);
      return Promise.resolve('200');
    } catch (error) {
      console.error(`GoHighLevelActionsProcessor.processIntentGoHighLevelActions - Error = ${error}`);
      return Promise.reject(error);
    }
  }

  async processSlotGoHighLevelActions(intentMatchString: string, slotValue: string): Promise<string> {
    console.log(`GoHighLevelActionsProcessor.processSlotGoHighLevelActions - Start, 
      intentMatchString: ${intentMatchString}, slotValue: ${slotValue}`);
    try {
      let response: GoHighLevelActionResponse | undefined = undefined;
      for (const intent of this.config.intents) {
        let lastSlotMatched: boolean = false;
        let index: number = 0;
        for (const slot of intent.slots) {
          if (slot.intent === intentMatchString) {
            if (index === intent.slots.length - 1) {
              console.log(`Last slot matched, setting lastSlotMatched to true`);
              lastSlotMatched = true;
            }

            for (const action of slot.goHighLevelActions) {
              // Execute the action if slotValue is undefined or matches the slotValue of the action
              if (action.slotValue === undefined || action.slotValue === '' || action.slotValue === slotValue) {
                try {
                  response = await this.executeGoHighLevelAction(action);
                  if (response === undefined || response.status !== '200') {
                    console.error(`Error executing GoHighLevel action ${action.actionType}: ${response?.status}`);
                  }
                } catch (error) {
                  console.error(`Error executing GoHighLevel action ${action.actionType}: ${error}`);
                }
              }
              else {
                console.log(`Skipping GoHighLevel action ${action.actionType} because slotValue ${slotValue} does not match action.slotValue ${action.slotValue}`);
              }
            }
          }
          index++;
        }

        if (lastSlotMatched) {
          // Execute the intent-level actions if it was the last slot
          for (const action of intent.goHighLevelActions) {
            try {
              response = await this.executeGoHighLevelAction(action);
              if (response === undefined || response.status !== '200') {
                console.error(`Error executing GoHighLevel action ${action.actionType}: ${response?.status}`);
              }
            } catch (error) {
              console.error(`Error executing GoHighLevel action ${action.actionType}: ${error}`);
            }
          }
        }
      }

      console.log(`GoHighLevelActionsProcessor.processSlotGoHighLevelActions - Success`);
      return Promise.resolve('200');
    } catch (error) {
      console.error(`GoHighLevelActionsProcessor.processSlotGoHighLevelActions - Error = ${error}`);
      return Promise.reject(error);
    }
  }


  async executeGoHighLevelAction(action: VirtualAssistantGoHighLevelAction): Promise<GoHighLevelActionResponse | undefined> {
    let response: GoHighLevelActionResponse | undefined = undefined;
    switch (action.actionType) {
      case 'TriggerWorkflow':
        const triggerWorkflowAction = new GoHighLevelTriggerWorkflowAction(
          action.actionData.workflowId);
        triggerWorkflowAction.setGoHighLevelContext(this.context);
        response = await triggerWorkflowAction.execute();
        console.log(`GoHighLevel action ${action.actionType}, status: ${response.status}`);
        break;
      
      case 'CreateTask':
        const createTaskAction = new GoHighLevelCreateTaskAction();
        createTaskAction.setGoHighLevelContext(this.context);
        response = await createTaskAction.execute();
        console.log(`GoHighLevel action ${action.actionType}, status: ${response.status}`);
        break;

      case 'CreateOpportunity':
        const createOpportunityAction = new GoHighLevelCreateOpportunityAction(
          action.actionData.pipelineId,
          action.actionData.stageId);
        createOpportunityAction.setGoHighLevelContext(this.context);
        response = await createOpportunityAction.execute();
        console.log(`GoHighLevel action ${action.actionType}, status: ${response.status}`);
        break;

      default:
        console.error(`Unknown GoHighLevel action type: ${action.actionType}`);
        break;
    }

    return Promise.resolve(response);
  }
}