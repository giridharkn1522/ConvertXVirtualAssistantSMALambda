import { dentistVirtualAssistantConfig } from "../CommonTestConfiguration";
import { PlayAudioActionSuccessfulProcessor } from "./PlayAudioActionSuccessfulProcessor";

const basePlayAudioActionSuccessfulEvent = {
  SchemaVersion: "1.0",
  Sequence: 13,
  InvocationEventType: "ACTION_SUCCESSFUL",
  ActionData: {
    Type: "PlayAudio",
    Parameters: {
      AudioSource: {
        Type: "S3",
        BucketName: "convertx-mediafiles-bucketname",
        Key: ""
      },
      PlaybackTerminators: [
        "1",
        "8",
        "#"
      ],
      Repeat: 1,
      CallId: "0536a601-016b-4a21-97c1-2e12e58eb23a",
      ParticipantTag: "LEG-A"
    }
  },
  CallDetails: {
    TransactionId: "8ff30ffd-f6c2-43b6-ad79-93fb9340fe92",
    TransactionAttributes: {
      goHighLevelContactId: "iMRViLrAxfA5cqAZqZNI",
    },
    Participants: [
      {
        "CallId": "0536a601-016b-4a21-97c1-2e12e58eb23a",
        "ParticipantTag": "LEG-A",
        "To": "+17785610510",
        "From": "+14258021533",
        "Direction": "Inbound",
        "StartTimeInMilliseconds": "1692152244524",
        "Status": "Connected"
      }
    ]
  }
}

test('Tests PlayAudioActionSuccessfulProcessor - PlayAudio Welcome.wav successful event', async () => {
  const processor = new PlayAudioActionSuccessfulProcessor(
    basePlayAudioActionSuccessfulEvent, 
    dentistVirtualAssistantConfig);
  let event = basePlayAudioActionSuccessfulEvent;
  event.ActionData.Parameters.AudioSource.Key = 'Welcome.wav';
  const response = await processor.processLifecycleEvent()
  expect(response.Actions.length).toBe(1);
  expect(response.Actions[0].Type).toBe('StartBotConversation');
  expect(response.Actions[0].Parameters.LexBotAliasArn === dentistVirtualAssistantConfig.lexBotAliasArn);
  expect(response.Actions[0].Parameters.CallId === event.CallDetails.Participants[0].CallId);
  expect(response.Actions[0].Parameters.Configuration.SessionState.Intent.Name).toBe('MainIntent');
});


test('Tests PlayAudioActionSuccessfulProcessor - PlayAudio Subsequent.wav successful event', async () => {
  const processor = new PlayAudioActionSuccessfulProcessor(
    basePlayAudioActionSuccessfulEvent, 
    dentistVirtualAssistantConfig);
  let event = basePlayAudioActionSuccessfulEvent;
  event.ActionData.Parameters.AudioSource.Key = 'Subsequent.wav';
  const response = await processor.processLifecycleEvent()
  expect(response.Actions.length).toBe(1);
  expect(response.Actions[0].Type).toBe('StartBotConversation');
  expect(response.Actions[0].Parameters.Configuration.SessionState.Intent.Name).toBe('MainIntent');
});

test('Tests PlayAudioActionSuccessfulProcessor - PlayAudio Fallback.wav successful event', async () => {
  const processor = new PlayAudioActionSuccessfulProcessor(
    basePlayAudioActionSuccessfulEvent, 
    dentistVirtualAssistantConfig);
  let event = basePlayAudioActionSuccessfulEvent;
  event.ActionData.Parameters.AudioSource.Key = 'Fallback.wav';
  const response = await processor.processLifecycleEvent()
  expect(response.Actions.length).toBe(1);
  expect(response.Actions[0].Type).toBe('StartBotConversation');
  expect(response.Actions[0].Parameters.Configuration.SessionState.Intent.Name).toBe('MainIntent');
});

test('Tests PlayAudioActionSuccessfulProcessor - PlayAudio Goodbye.wav successful event', async () => {
  const processor = new PlayAudioActionSuccessfulProcessor(
    basePlayAudioActionSuccessfulEvent, 
    dentistVirtualAssistantConfig);
  let event = basePlayAudioActionSuccessfulEvent;
  event.ActionData.Parameters.AudioSource.Key = 'Goodbye.wav';
  const response = await processor.processLifecycleEvent()
  expect(response.Actions.length).toBe(1);
  expect(response.Actions[0].Type).toBe('Hangup');
});

dentistVirtualAssistantConfig.intents.map((intent) => {
  intent.slots.map((slot) => {
    test(`Tests PlayAudioActionSuccessfulProcessor - PlayAudio ${slot.promptAudioFileName} successful event`, async () => {
      const processor = new PlayAudioActionSuccessfulProcessor(
        basePlayAudioActionSuccessfulEvent, 
        dentistVirtualAssistantConfig);
      let event = basePlayAudioActionSuccessfulEvent;
      event.ActionData.Parameters.AudioSource.Key = slot.promptAudioFileName;
      const response = await processor.processLifecycleEvent()
      expect(response.Actions.length).toBe(1);
      expect(response.Actions[0].Type).toBe('StartBotConversation');
      expect(response.Actions[0].Parameters.Configuration.SessionState.Intent.Name).toBe(slot.intent);
    });
  });
});

dentistVirtualAssistantConfig.intents.map((intent) => {
  test(`Tests PlayAudioActionSuccessfulProcessor - PlayAudio ${intent.fulfillmentAudioFileName} successful event`, async () => {
    const processor = new PlayAudioActionSuccessfulProcessor(
      basePlayAudioActionSuccessfulEvent, 
      dentistVirtualAssistantConfig);
    let event = basePlayAudioActionSuccessfulEvent;
    event.ActionData.Parameters.AudioSource.Key = intent.fulfillmentAudioFileName;
    const response = await processor.processLifecycleEvent()
    expect(response.Actions.length).toBe(1);
    expect(response.Actions[0].Type).toBe('PlayAudio');
    expect(response.Actions[0].Parameters.AudioSource.Key).toBe(dentistVirtualAssistantConfig.subsequentAudioFileName);
  });

  test(`Tests PlayAudioActionSuccessfulProcessor - PlayAudio ${intent.fulfillmentAudioFileName} successful event`, async () => {
    const processor = new PlayAudioActionSuccessfulProcessor(
      basePlayAudioActionSuccessfulEvent, 
      dentistVirtualAssistantConfig);
    let event = basePlayAudioActionSuccessfulEvent;
    event.ActionData.Parameters.AudioSource.Key = intent.failedAudioFileName;
    const response = await processor.processLifecycleEvent()
    expect(response.Actions.length).toBe(1);
    expect(response.Actions[0].Type).toBe('PlayAudio');
    expect(response.Actions[0].Parameters.AudioSource.Key).toBe(dentistVirtualAssistantConfig.subsequentAudioFileName);
  });
});
