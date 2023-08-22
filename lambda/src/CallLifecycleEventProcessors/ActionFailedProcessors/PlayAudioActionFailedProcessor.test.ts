import { dentistVirtualAssistantConfig } from "../CommonTestConfiguration";
import { PlayAudioActionFailedProcessor } from "./PlayAudioActionFailedProcessor";

const basePlayAudioActionFailedEvent = {
  SchemaVersion: "1.0",
  Sequence: 2,
  InvocationEventType: "ACTION_FAILED",
  ActionData: {
    Type: "PlayAudio",
    Parameters: {
      CallId: "call-id-1",
      AudioSource: {
        Type: "S3",
        BucketName: "bucket-name",
        Key: "audio-file-name.wav"
      },
    },
    ErrorType: "InvalidAudioSource",
    ErrorMessage: "Audio Source parameter value is invalid."
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

test('Tests PlayAudioActionFailedProcessor - audio file not found', async () => {
  const processor = new PlayAudioActionFailedProcessor(
    basePlayAudioActionFailedEvent, 
    dentistVirtualAssistantConfig);
  let event = basePlayAudioActionFailedEvent;
  event.ActionData.Parameters.AudioSource.Key = 'audio-file-name.wav';
  const response = await processor.processLifecycleEvent()
  expect(response.Actions.length).toBe(1);
  expect(response.Actions[0].Type).toBe('Hangup');
});