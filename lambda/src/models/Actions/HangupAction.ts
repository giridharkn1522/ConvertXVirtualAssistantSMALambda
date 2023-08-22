import { Action, ActionType } from "./Action";

export class HangupActionParameters {
  SipResponseCode: string;
  ParticipantTag: string;

  constructor(sipResponseCode: string, participantTag: string) {
    this.SipResponseCode = sipResponseCode;
    this.ParticipantTag = participantTag;
  }
}

export class HangupAction extends Action<HangupActionParameters> {
  constructor(parameters: HangupActionParameters) {
    super('Hangup' as ActionType, parameters);
  }
}

export function createHangupAction(sipResponseCode: string, participantTag: string) {
  return new HangupAction(
    new HangupActionParameters(sipResponseCode, participantTag));
}