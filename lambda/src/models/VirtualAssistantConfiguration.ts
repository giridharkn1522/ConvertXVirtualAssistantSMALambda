import { VirtualAssistantIntent } from "./VirtualAssistantIntent";

export class VirtualAssistantConfiguration {
  goHighLevelAPIKey: string;
  lexBotAliasArn: string;
  mediaFilesBucketName: string;
  welcomeAudioFileName: string;
  goodbyeAudioFileName: string;
  fallbackAudioFileName: string;
  subsequentAudioFileName: string;
  continuationAudioFileName: string;
  businessContextForOpenAI: string;
  intents: VirtualAssistantIntent[];

  constructor(goHighLevelAPIKey: string, 
    lexBotAliasArn: string, 
    mediaFilesBucketName: string, 
    welcomeAudioFileName: string, 
    goodbyeAudioFileName: string, 
    fallbackAudioFileName: string, 
    subsequentAudioFileName: string, 
    continuationAudioFileName: string,
    businessContextForOpenAI: string,
    intents: VirtualAssistantIntent[]) {
    this.goHighLevelAPIKey = goHighLevelAPIKey;
    this.lexBotAliasArn = lexBotAliasArn;
    this.mediaFilesBucketName = mediaFilesBucketName;
    this.welcomeAudioFileName = welcomeAudioFileName;
    this.goodbyeAudioFileName = goodbyeAudioFileName;
    this.fallbackAudioFileName = fallbackAudioFileName;
    this.subsequentAudioFileName = subsequentAudioFileName;
    this.continuationAudioFileName = continuationAudioFileName;
    this.businessContextForOpenAI = businessContextForOpenAI;
    this.intents = intents;
  }

  static fromJson(json: any): VirtualAssistantConfiguration {
    const intents = json.intents.map((intentJson: any) => {
      return VirtualAssistantIntent.fromJson(intentJson);
    });
    return new VirtualAssistantConfiguration(json.goHighLevelAPIKey, 
      json.lexBotAliasArn, 
      json.mediaFilesBucketName, 
      json.welcomeAudioFileName, 
      json.goodbyeAudioFileName, 
      json.fallbackAudioFileName, 
      json.subsequentAudioFileName,
      json.continuationAudioFileName,
      json.businessContextForOpenAI,
      intents);
  }
}