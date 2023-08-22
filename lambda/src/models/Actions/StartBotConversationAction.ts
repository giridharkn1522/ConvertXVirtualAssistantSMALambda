import { Action, ActionType } from "./Action";

export class StartBotConversationDialogAction {
  Type: string;

  constructor(type: string) {
    this.Type = type;
  }
}

export class StartBotConversationIntent {
  Name: string;

  constructor(name: string) {
    this.Name = name;
  }
}

export class StartBotConversationSessionState {
  DialogAction: StartBotConversationDialogAction;
  Intent: StartBotConversationIntent;

  constructor(dialogAction: StartBotConversationDialogAction, intent: StartBotConversationIntent) {
    this.DialogAction = dialogAction;
    this.Intent = intent;
  }
}

export class StartBotConversationConfiguration {
  SessionState: StartBotConversationSessionState;

  constructor(sessionState: StartBotConversationSessionState) {
    this.SessionState = sessionState;
  }
}

export class StartBotConversationParameters {
  CallId: string;
  BotAliasArn: string;
  LocaleId: string;
  Configuration: StartBotConversationConfiguration;

  constructor(callId: string, botAliasArn: string, localeId: string, configuration: StartBotConversationConfiguration) {
    this.CallId = callId;
    this.BotAliasArn = botAliasArn;
    this.LocaleId = localeId;
    this.Configuration = configuration;
  }
}

export class StartBotConversationAction extends Action<StartBotConversationParameters> {
  constructor(parameters: StartBotConversationParameters) {
    super('StartBotConversation' as ActionType, parameters);
  }
}

export function createStartBotConversationAction(callId: string, botAliasArn: string, localeId: string, intent: string) {
  const sessionState = new StartBotConversationSessionState(
    new StartBotConversationDialogAction('Delegate'), 
    new StartBotConversationIntent(intent));
  const configuration = new StartBotConversationConfiguration(sessionState);
  const parameters = new StartBotConversationParameters(callId, botAliasArn, localeId, configuration);
  return new StartBotConversationAction(parameters);
}