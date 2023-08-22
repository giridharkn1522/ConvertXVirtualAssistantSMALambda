import { VirtualAssistantConfiguration } from "../../models/VirtualAssistantConfiguration";

const openAIAPIKey: string = 'openAIAPIKey';

export function generateIntentMatchStringList(config: VirtualAssistantConfiguration): string {
  let intentMatchStringList = '';
  config.intents.forEach((intent) => {
    intentMatchStringList += `"${intent.matchString}", `;
  });
  intentMatchStringList += `or "FallbackIntent" if there is no match.`;
  return intentMatchStringList;
}

export function lookupIntentUsingOpenAI(config: string, mainRequest: string): Promise<string> {
  console.log('In mock OpenAIIntentProcessor.lookupIntentUsingOpenAI');
  return Promise.resolve(mainRequest);
}

export default jest.fn(() => {
  return {
    OpenAIIntentProcessor: jest.fn().mockImplementation(() => {
      return {
        openAIAPIKey: openAIAPIKey,
        generateIntentMatchStringList: generateIntentMatchStringList,
        lookupIntentUsingOpenAI: lookupIntentUsingOpenAI
      };
    })
  };
});