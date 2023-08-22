import { Action, ActionType } from "./Action";

export class RecordAudioActionRecordingDestination {
  Type: string;
  BucketName: string;
  Prefix: string;

  constructor(type: string, bucketName: string, prefix: string) {
    this.Type = type;
    this.BucketName = bucketName;
    this.Prefix = prefix;
  }
}

export class RecordAudioActionParameters {
  CallId: string;
  Track: string;
  RecordingDestination: RecordAudioActionRecordingDestination;

  constructor(callId: string, track: string, recordingDestination: RecordAudioActionRecordingDestination) {
    this.CallId = callId;
    this.Track = track;
    this.RecordingDestination = recordingDestination;
  }
}

export class RecordAudioAction extends Action<RecordAudioActionParameters> {
  constructor(parameters: RecordAudioActionParameters) {
    super('RecordAudio' as ActionType, parameters);
  }
}

export function createRecordAudioAction(callId: string, track: string, recordingBucketName: string, prefix: string) {
  const recordingDestination = new RecordAudioActionRecordingDestination('S3', recordingBucketName, prefix);
  const parameters = new RecordAudioActionParameters(callId, track, recordingDestination);
  return new RecordAudioAction(parameters);
}