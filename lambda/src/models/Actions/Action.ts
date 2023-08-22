export enum ActionType {
  PLAY_AUDIO = 'PlayAudio',
  START_BOT_CONVERSATION = 'StartBotConversation',
  RECORD_AUDIO = 'RecordAudio',
  HANGUP = 'Hangup',
}

export class Action<T> {
  Type: ActionType;
  Parameters: T;

  constructor(actionType: ActionType, parameters: any) {
    this.Type = actionType;
    this.Parameters = parameters;
  }
}