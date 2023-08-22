import { dentistVirtualAssistantConfig } from "../CommonTestConfiguration";
import { StartBotConversationActionFailedProcessor } from "./StartBotConversationActionFailedProcessor";

const baseStartBotConversationActionFailedEvent = {
  SchemaVersion: "1.0",
  Sequence: 3,
  InvocationEventType: "ACTION_FAILED",
  ActionData: {
    Type: "StartBotConversation",
    Parameters: {
      BotAliasArn: "arn:aws:lex:us-west-2:263387561161:bot-alias/OQSJJSOWMT/X2VVQAG65Q",
      LocaleId: "en_US",
      Configuration: {
        SessionState: {
          SessionAttributes: {
          },
          DialogAction: {
            Type: "Delegate"
          },
          Intent: {
          }
        }
      },
      CallId: "650257c4-fe0b-4cb4-8742-27184061c12e"
    },
    ErrorType: "InvalidActionParameter",
    ErrorMessage: "Invalid Request: The intent name MainIntent isn't valid. Provide a valid intent and try the request again. (Service: lex, Status Code: 400, Request ID: 00bcd67d-c37f-402a-8837-d02c08bbb92a)"
  },
  CallDetails: {
    TransactionId: "8f8e776e-7ea0-493d-a8e4-e44b22699271",
    TransactionAttributes: {
      goHighLevelContactId: "bMxOchasOGFFoi6vD2i6",
    },
    Participants: [
      {
        CallId: "650257c4-fe0b-4cb4-8742-27184061c12e",
        ParticipantTag: "LEG-A",
        To: "+15418013522",
        From: "+14258021533",
        Direction: "Inbound",
        StartTimeInMilliseconds: "1692156696815",
        Status: "Connected"
      }
    ]
  }
};

test('Tests StartBotConversationActionFailedProcessor - MainIntent failed event', async () => {
  const processor = new StartBotConversationActionFailedProcessor(
    baseStartBotConversationActionFailedEvent, 
    dentistVirtualAssistantConfig);
  let event = baseStartBotConversationActionFailedEvent;
  event.ActionData.Parameters.Configuration.SessionState.Intent = {
    Name: "MainIntent"
  };
  const response = await processor.processLifecycleEvent()
  expect(response.Actions.length).toBe(1);
  expect(response.Actions[0].Type).toBe('PlayAudio');
  expect(response.Actions[0].Parameters.AudioSource.Key).toBe('Fallback.wav');
});

dentistVirtualAssistantConfig.intents.map((intent) => {
  intent.slots.map((slot) => {
    test(`Tests StartBotConversationActionFailedProcessor - ${slot.intent} failed event`, async () => {
      const processor = new StartBotConversationActionFailedProcessor(
        baseStartBotConversationActionFailedEvent,
        dentistVirtualAssistantConfig);
      let event = baseStartBotConversationActionFailedEvent;
      event.ActionData.Parameters.Configuration.SessionState.Intent = {
        Name: slot.intent,
      };
      const response = await processor.processLifecycleEvent()
      expect(response.Actions.length).toBe(1);
      expect(response.Actions[0].Type).toBe('PlayAudio');
      expect(response.Actions[0].Parameters.AudioSource.Key).toBe(intent.failedAudioFileName);
    });
  });
});