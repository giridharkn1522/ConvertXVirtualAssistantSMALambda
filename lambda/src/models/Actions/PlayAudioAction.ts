import { Action, ActionType } from "./Action";

export class AudioSourceData {
  Type: string;
  BucketName: string;
  Key: string;

  constructor(type: string, bucketName: string, key: string) {
    this.Type = type;
    this.BucketName = bucketName;
    this.Key = key;
  }
}

export class PlayAudioActionParameters {
  CallId: string;
  ParticipantTag: string;
  PlaybackTerminators: string[];
  Repeat: string;
  AudioSource: AudioSourceData;

  constructor(callId: string, participantTag: string, playbackTerminators: string[], repeat: string, audioSource: AudioSourceData) {
    this.CallId = callId;
    this.ParticipantTag = participantTag;
    this.PlaybackTerminators = playbackTerminators;
    this.Repeat = repeat;
    this.AudioSource = audioSource;
  }
}

export class PlayAudioAction extends Action<PlayAudioActionParameters> {
  constructor(parameters: PlayAudioActionParameters) {
    super('PlayAudio' as ActionType, parameters);
  }
}

export function createPlayAudioAction(callId: string, mediaFilesBucketName: string, audioFileName: string) {
  const audioSource = new AudioSourceData('S3', mediaFilesBucketName, audioFileName);
  return new PlayAudioAction(
    new PlayAudioActionParameters(callId, 'Leg-A', ["1", "8", "#"], '1', audioSource));  
}