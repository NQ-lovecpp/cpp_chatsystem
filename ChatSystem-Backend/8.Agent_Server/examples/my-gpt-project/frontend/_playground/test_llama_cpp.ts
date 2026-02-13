import OpenAI from 'openai';

const client = new OpenAI({
    baseURL: "http://127.0.0.1:8080/v1",
});

// const answer = await client.responses.create({
//     model: 'gpt-5',
//     input: 'Who is the current president of France?',
// });

// console.log(answer.output_text);


// const completion = await client.chat.completions.create({
//     model: 'gpt-5',
//     messages: [
//         {
//             role: 'user',
//             content: 'Write a one-sentence bedtime story about a unicorn.'
//         }
//     ]
// });

// console.log(completion.choices[0].message.content);

import { styleText } from 'node:util';
import { Agent, OpenAIChatCompletionsModel, run , OpenAIResponsesModel} from '@openai/agents';

const ASSISTANT_PREFIX = styleText(['bgGreen', 'black'], 'Assistant');
const THINKING_PREFIX = styleText(['bgGray', 'black'], 'Thought');

async function main() {
  const agent = new Agent({
    name: 'Agent',
    model: new OpenAIResponsesModel(client as any, 'ggml-org/gpt-oss-20b-GGUF'),
    modelSettings: {
      reasoning: { effort: 'high', summary: 'auto' },
      text: { verbosity: 'high' },
    },
  });

  const result = await run(agent, 'Write a one-sentence bedtime story about a unicorn.');

  for (const item of result.newItems) {
    if (item.type === 'reasoning_item') {
      for (const entry of item.rawItem.content) {
        if (entry.type === 'input_text') {
          console.log(`${THINKING_PREFIX}: ${entry.text}`);
        }
      }
    }
  }

  console.log(`${ASSISTANT_PREFIX}: ${result.finalOutput}`);
}

main().catch(console.error);