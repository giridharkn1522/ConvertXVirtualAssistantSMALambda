import { VirtualAssistantConfiguration } from "../../models/VirtualAssistantConfiguration";
import { GoHighLevelContextData } from "../../GoHighLevel/GoHighLevelContextData";
import { GoHighLevelActionResponse } from "../../GoHighLevel/models/GoHighLevelActionResponse";
import { dentistVirtualAssistantConfig, goHighLevelContact } from "../CommonTestConfiguration";

const baseStartBotConversationActionSuccessfulEvent = {
  InvocationEventType: 'ACTION_SUCCESSFUL',
  CallDetails: {
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
    ],
    TransactionAttributes: {
      goHighLevelContactId: 'goHighLevelContactId'
    }
  },
  ActionData: {
    Type: 'StartBotConversation',
    IntentResult: {
      SessionState: {
        Intent: {
        }
      },
    },
  },
}

jest.mock('../../GoHighLevel/GoHighLevelContextData', () => {
  return {
    GoHighLevelContextData: jest.fn().mockImplementation(() => {
      return {
        apiKey: 'goHighLevelAPIKey',
        contact: goHighLevelContact,
        setContact: () => {
          console.log('In mock GoHighLevelContextData.setContact');
        }
      };
    })
  }
});
jest.mock('../../GoHighLevel/actions/GoHighLevelGetContactAction', () => {
  return {
    GoHighLevelGetContactAction: jest.fn().mockImplementation(() => {
      return {
        contactId: 'goHighLevelContactId',
        actionType: 'GetContact',
        goHighLevelContext: new GoHighLevelContextData('goHighLevelAPIKey'),
        setGoHighLevelContext: (context: GoHighLevelContextData) => {
          console.log('In mock GoHighLevelGetContactAction.setGoHighLevelContext')
        },
        execute: () => {
          console.log('In mock GoHighLevelGetContactAction.execute');
          return Promise.resolve(new GoHighLevelActionResponse(
            '200', 
            goHighLevelContact));
        }
      };
    })
  }
});
jest.mock('../../GoHighLevel/GoHighLevelActionsProcessor', () => {
  return {
    GoHighLevelActionsProcessor: jest.fn().mockImplementation(() => {
      return {
        config: dentistVirtualAssistantConfig,
        context: new GoHighLevelContextData('goHighLevelAPIKey'),
        processGoHighLevelActions: (intentMatchString: string) => {
          console.log('In mock GoHighLevelActionsProcessor.processGoHighLevelActions');
          return Promise.resolve('200');
        }
      };
    })
  }
});

jest.mock('../../utils/OpenAIIntentProcessor', () => {
  return {
    OpenAIIntentProcessor: jest.fn().mockImplementation(() => {
      return {
        openAIAPIKey: 'openAIAPIKey',
        generateIntentMatchStringList: (config: VirtualAssistantConfiguration) => {
          let intentMatchStringList = '';
          config.intents.forEach((intent) => {
            intentMatchStringList += `"${intent.matchString}", `;
          });
          intentMatchStringList += `or "FallbackIntent" if there is no match.`;
          return intentMatchStringList;
        },
        lookupIntentUsingOpenAI: (config: VirtualAssistantConfiguration, mainRequest: string) => {
          console.log('In mock OpenAIIntentProcessor.lookupIntentUsingOpenAI');
          for (let index = 0; index < config.intents.length; index++) {
            if (config.intents[index].matchString === mainRequest) {
              return Promise.resolve(mainRequest);
            }
          }
          return Promise.resolve('FallbackIntent');
        }
      }
    })
  }
});

import { StartBotConversationActionSuccessfulProcessor } from "./StartBotConversationActionSuccessfulProcessor";
import { VirtualAssistantIntentSlot } from "../../models/VirtualAssistantIntentSlot";

test('Tests StartBotConversationActionSuccessfulProcessor - invalid event', async () => {
  const processor = new StartBotConversationActionSuccessfulProcessor(
    baseStartBotConversationActionSuccessfulEvent, 
    dentistVirtualAssistantConfig);
  const response = await processor.processLifecycleEvent()
  expect(response.Actions.length).toBe(1);
  expect(response.Actions[0].Type).toBe('PlayAudio');
  expect(response.Actions[0].Parameters.AudioSource.Key).toBe('Fallback.wav');
});

test(`Tests StartBotConversationActionSuccessfulProcessor - MainIntent with 'foo bar' MainRequest`, async () => {
  let event = {
    ...baseStartBotConversationActionSuccessfulEvent,
    ActionData: {
      IntentResult: {
        SessionState: {
          Intent: {
            Name: 'MainIntent',
            Slots: {
              MainRequest: {
                Value: {
                  OriginalValue: "foo bar"
                }
              }
            }
          }
        }
      },
    },
  }
  const processor = new StartBotConversationActionSuccessfulProcessor(event, dentistVirtualAssistantConfig);
  const response = await processor.processLifecycleEvent()
  expect(response.Actions.length).toBe(1);
  expect(response.Actions[0].Type).toBe('PlayAudio');
  expect(response.Actions[0].Parameters.AudioSource.Key).toBe(dentistVirtualAssistantConfig.fallbackAudioFileName);
});

test(`Tests StartBotConversationActionSuccessfulProcessor - FallbackIntent`, async () => {
  let event = {
    ...baseStartBotConversationActionSuccessfulEvent,
    ActionData: {
      IntentResult: {
        SessionState: {
          Intent: {
            Name: 'FallbackIntent',
          }
        }
      },
    },
  }
  const processor = new StartBotConversationActionSuccessfulProcessor(event, dentistVirtualAssistantConfig);
  const response = await processor.processLifecycleEvent()
  expect(response.Actions.length).toBe(1);
  expect(response.Actions[0].Type).toBe('PlayAudio');
  expect(response.Actions[0].Parameters.AudioSource.Key).toBe(dentistVirtualAssistantConfig.fallbackAudioFileName);
});

dentistVirtualAssistantConfig.intents.map((intent) => {
  test(`Tests StartBotConversationActionSuccessfulProcessor - ${intent.matchString}`, async () => {
    let event = baseStartBotConversationActionSuccessfulEvent;
    event.ActionData.IntentResult.SessionState.Intent = {
      Name: 'MainIntent',
      Slots: {
        MainRequest: {
          Value: {
            OriginalValue: intent.matchString,
          }
        }
      }
    };

    const processor = new StartBotConversationActionSuccessfulProcessor(event, dentistVirtualAssistantConfig);
    const response = await processor.processLifecycleEvent()
    expect(response.Actions.length).toBe(1);
    expect(response.Actions[0].Type).toBe('PlayAudio');
    if (intent.slots.length === 0) {
      expect(response.Actions[0].Parameters.AudioSource.Key).toBe(intent.fulfillmentAudioFileName);
    } else {
      if (intent.confirmationAudioFileName !== undefined && intent.confirmationAudioFileName !== '') {
        expect(response.Actions[0].Parameters.AudioSource.Key).toBe(intent.confirmationAudioFileName);
      } else {
        expect(response.Actions[0].Parameters.AudioSource.Key).toBe(intent.slots[0].promptAudioFileName);
      }
    }
  });
});


dentistVirtualAssistantConfig.intents.map((intent) => {
  let index: number = 0;
  intent.slots.map((slot: VirtualAssistantIntentSlot) => {
    test(`Tests StartBotConversationActionSuccessfulProcessor - ${intent.matchString} - ${slot.name}`, async () => {
      const slotName = slot.name;
      console.log('Slot.name = ' + slotName);
      let event = baseStartBotConversationActionSuccessfulEvent;
      event.ActionData.IntentResult.SessionState.Intent = {
        Name: slot.intent,
        Slots: {
          [slotName]: {
            Value: {
              OriginalValue: 'Test value',
            }
          }
        }
      };

      const processor = new StartBotConversationActionSuccessfulProcessor(event, dentistVirtualAssistantConfig);
      const response = await processor.processLifecycleEvent()
      expect(response.Actions.length).toBe(1);
      expect(response.Actions[0].Type).toBe('PlayAudio');
      if (index === (intent.slots.length - 1)) {
        expect(response.Actions[0].Parameters.AudioSource.Key).toBe(intent.fulfillmentAudioFileName);
      } else {
        expect(response.Actions[0].Parameters.AudioSource.Key).toBe(intent.slots[index+1].promptAudioFileName);
      }
      index++;
    });
  });
});

dentistVirtualAssistantConfig.intents.map((intent) => {
  let index: number = 0;
  intent.slots.map((slot: VirtualAssistantIntentSlot) => {
    test(`Tests StartBotConversationActionSuccessfulProcessor - ${intent.matchString} - ${slot.name}`, async () => {
      const slotName = slot.name;
      console.log('Slot.name = ' + slotName);
      let event = baseStartBotConversationActionSuccessfulEvent;
      event.ActionData.IntentResult.SessionState.Intent = {
        Name: slot.intent,
        Slots: {
          [slotName]: {
            Value: {
              OriginalValue: 'yes',
            }
          }
        }
      };

      const processor = new StartBotConversationActionSuccessfulProcessor(event, dentistVirtualAssistantConfig);
      const response = await processor.processLifecycleEvent()
      expect(response.Actions.length).toBe(1);
      expect(response.Actions[0].Type).toBe('PlayAudio');
      if (index === (intent.slots.length - 1)) {
        expect(response.Actions[0].Parameters.AudioSource.Key).toBe(intent.fulfillmentAudioFileName);
      } else {
        expect(response.Actions[0].Parameters.AudioSource.Key).toBe(intent.slots[index+1].promptAudioFileName);
      }
      index++;
    });
  });
});

test(`Tests StartBotConversationActionSuccessfulProcessor - MainIntent with 'yes' MainRequest`, async () => {
  let event = baseStartBotConversationActionSuccessfulEvent;
  event.ActionData.IntentResult.SessionState.Intent = {
    Name: 'MainIntent',
    Slots: {
      MainRequest: {
        Value: {
          OriginalValue: 'yes',
        }
      }
    }
  };
  const processor = new StartBotConversationActionSuccessfulProcessor(event, dentistVirtualAssistantConfig);
  const response = await processor.processLifecycleEvent()
  expect(response.Actions.length).toBe(1);
  expect(response.Actions[0].Type).toBe('PlayAudio');
  expect(response.Actions[0].Parameters.AudioSource.Key).toBe(dentistVirtualAssistantConfig.continuationAudioFileName);
});

test(`Tests StartBotConversationActionSuccessfulProcessor - MainIntent with 'no' MainRequest`, async () => {
  let event = baseStartBotConversationActionSuccessfulEvent;
  event.ActionData.IntentResult.SessionState.Intent = {
    Name: 'MainIntent',
    Slots: {
      MainRequest: {
        Value: {
          OriginalValue: "no",
        }
      }
    }
  };
  const processor = new StartBotConversationActionSuccessfulProcessor(event, dentistVirtualAssistantConfig);
  const response = await processor.processLifecycleEvent()
  expect(response.Actions.length).toBe(1);
  expect(response.Actions[0].Type).toBe('PlayAudio');
  expect(response.Actions[0].Parameters.AudioSource.Key).toBe(dentistVirtualAssistantConfig.goodbyeAudioFileName);
});