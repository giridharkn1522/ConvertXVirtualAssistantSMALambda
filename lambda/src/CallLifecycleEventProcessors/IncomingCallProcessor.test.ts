import { GoHighLevelContextData } from "../GoHighLevel/GoHighLevelContextData";
import { GoHighLevelActionResponse } from "../GoHighLevel/models/GoHighLevelActionResponse";
import { dentistVirtualAssistantConfig, goHighLevelContact } from "./CommonTestConfiguration";
import { IncomingCallProcessor } from "./IncomingCallProcessor";

const baseIncomingCallEvent = {
  SchemaVersion: "1.0",
  Sequence: 1,
  InvocationEventType: "NEW_INBOUND_CALL",
  CallDetails: {
      TransactionId: "99182902-57a7-4321-a4d6-28e3fc1d20b4",
      AwsAccountId: "263387561161",
      AwsRegion: "us-west-2",
      SipRuleId: "3300a3be-f7e9-4865-9af8-26fd2e7ffa70",
      SipMediaApplicationId: "bd68d6a4-d1c2-4d74-ab69-1dc1a0be0ebe",
      Participants: [
          {
              CallId: "15310483-652c-4b3c-b551-225e8e684f7d",
              ParticipantTag: "LEG-A",
              To: "+15418013522",
              From: "+17785549099",
              Direction: "Inbound",
              StartTimeInMilliseconds: "1692463229198",
              SipHeaders: {
                  "Diversion": "<sip:+14256005114@67.231.13.175:5060>;privacy=off;screen=no;reason=unconditional;counter=1"
              }
          }
      ]
  }
};

jest.mock('../GoHighLevel/GoHighLevelContextData', () => {
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

jest.mock('../GoHighLevel/actions/GoHighLevelLookupContactAction', () => {
  return {
    GoHighLevelLookupContactAction: jest.fn().mockImplementation(() => {
      return {
        contactId: 'goHighLevelContactId',
        actionType: 'LookupContact',
        goHighLevelContext: new GoHighLevelContextData('goHighLevelAPIKey'),
        setGoHighLevelContext: (context: GoHighLevelContextData) => {
          console.log('In mock GoHighLevelLookupContactAction.setGoHighLevelContext')
        },
        execute: () => {
          console.log('In mock GoHighLevelLookupContactAction.execute');
          return Promise.resolve(new GoHighLevelActionResponse(
            '200', 
            goHighLevelContact));
        }
      };
    })
  }
});

jest.mock('../GoHighLevel/actions/GoHighLevelCreateContactAction', () => {
  return {
    GoHighLevelCreateContactAction: jest.fn().mockImplementation(() => {
      return {
        contactId: 'goHighLevelContactId',
        actionType: 'CreateContact',
        goHighLevelContext: new GoHighLevelContextData('goHighLevelAPIKey'),
        setGoHighLevelContext: (context: GoHighLevelContextData) => {
          console.log('In mock GoHighLevelCreateContactAction.setGoHighLevelContext')
        },
        execute: () => {
          console.log('In mock GoHighLevelCreateContactAction.execute');
          return Promise.resolve(new GoHighLevelActionResponse(
            '200', 
            goHighLevelContact));
        }
      };
    })
  }
});

test('IncomingCallProcessor: processLifecycleEvent', async () => {
  const processor = new IncomingCallProcessor(baseIncomingCallEvent, dentistVirtualAssistantConfig);
  const response = await processor.processLifecycleEvent();
  expect(response).toBeDefined();
  expect(response.Actions).toBeDefined();
  expect(response.Actions.length).toBe(1);
  expect(response.Actions[0].Type).toBe('PlayAudio');
  expect(response.Actions[0].Parameters.AudioSource.Key).toBe('Welcome.wav');
});