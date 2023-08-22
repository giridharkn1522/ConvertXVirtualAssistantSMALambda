import { VirtualAssistantConfiguration } from "../models/VirtualAssistantConfiguration";
import { VirtualAssistantGoHighLevelAction } from "../models/VirtualAssistantGoHighLevelAction";
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

  async processGoHighLevelActions(intentMatchString: string, slotValue: string): Promise<string> {
    console.log(`In GoHighLevelActionsProcessor.processGoHighLevelActions, 
      intentMatchString: ${intentMatchString}, slotValue: ${slotValue}`);
    try {
      let response: GoHighLevelActionResponse | undefined = undefined;
      for (const intent of this.config.intents) {
        if (intent.matchString === intentMatchString) {
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

        for (const slot of intent.slots) {
          if (slot.intent === intentMatchString) {
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
        }
      }

      console.log(`In GoHighLevelActionsProcessor.processGoHighLevelActions - GoHighLevel actions processed`);
      return Promise.resolve('200');
    } catch (error) {
      console.error(`Error processing GoHighLevel actions: ${error}`);
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