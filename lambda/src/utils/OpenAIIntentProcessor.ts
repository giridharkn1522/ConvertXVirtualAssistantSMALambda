import { ChatOpenAI } from "langchain/chat_models";
import { LLMChain } from "langchain/chains";
import { VirtualAssistantConfiguration } from "../models/VirtualAssistantConfiguration";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "langchain/prompts";

export class OpenAIIntentProcessor {
  openAIAPIKey: string;

  constructor(openAIAPIKey: string) {
    this.openAIAPIKey = openAIAPIKey;
  }

  generateIntentMatchStringList(config: VirtualAssistantConfiguration): string {
    let intentMatchStringList = '';
    config.intents.forEach((intent) => {
      intentMatchStringList += `"${intent.matchString}", `;
    });
    intentMatchStringList += `or "FallbackIntent" if there is no match.`;
    return intentMatchStringList;
  }

  async lookupIntentUsingOpenAI(config: VirtualAssistantConfiguration, request: string): Promise<string> {
    const systemTemplate = `${config.businessContextForOpenAI}. Map user's input exactly to one of these intent strings: ${this.generateIntentMatchStringList(config)}`;
    
    //'You are a virtual assistant to the Pitt Meadows Dental care. Map user\'s input to one of these intents: "Yes", "No", "Dental Emergency", "Request Appointment", "Clinic Details", or "Leave a message". If it does not map to one of these, then choose "Fallback"';
      const systemMessagePrompt = SystemMessagePromptTemplate.fromTemplate(systemTemplate);
      const humanTemplate = "{text}";
      const humanMessagePrompt = HumanMessagePromptTemplate.fromTemplate(humanTemplate);
      
      const chatPrompt = ChatPromptTemplate.fromPromptMessages([
        systemMessagePrompt,
        humanMessagePrompt
      ]);
      
      console.log(`lookupIntentUsingOpenAI - formattedChatPrompt = ${JSON.stringify(chatPrompt)}`);
      
      const chat = new ChatOpenAI({
        temperature: 0,
      });
      
      const chain = new LLMChain({
        llm: chat,
        prompt: chatPrompt,
      });
      
      const result = await chain.call({
        text: request,
      });
      console.log(`lookupIntentUsingOpenAI - result = ${JSON.stringify(result)}`);
      
      return result.text??'Fallback';
    }
}