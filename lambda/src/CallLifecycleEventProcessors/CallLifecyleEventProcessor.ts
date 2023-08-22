import { CallLifecyleEventResponse } from "../models/CallLifecycleEventResponse";
import { VirtualAssistantConfiguration } from "../models/VirtualAssistantConfiguration";

export enum CallLifecycleEventType {
  NEW_INBOUND_CALL = 'NEW_INBOUND_CALL',
  RINGING = 'RINGING',
  ACTION_SUCCESSFUL = 'ACTION_SUCCESSFUL',
  ACTION_FAILED = 'ACTION_FAILED',
  HANGUP = 'HANGUP',
  DEFAULT = 'DEFAULT'
}

export class CallLifecycleEventProcessor {
  type: CallLifecycleEventType;
  config: VirtualAssistantConfiguration;

  constructor(type: CallLifecycleEventType, config: VirtualAssistantConfiguration) {
    this.type = type;
    this.config = config;
  }

  async processLifecycleEvent(): Promise<CallLifecyleEventResponse> {
    throw new Error('Not implemented');
  }
}