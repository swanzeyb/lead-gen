import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
})

export default class LLM {
  static async guessMake(title: string, options?: string[]) {
    try {
      const answer = await openai.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: `
        Be fast and brief. I'm looking at this car: "${title}"
  
        Of these options, which one is the correct make? Use the closest matching one:
        ${options?.join(', ')}
        
        Put your answer here:
        {
          "make": answer_here
        }
        `,
          },
        ],
        model: 'gpt-3.5-turbo',
      })

      return JSON.parse(answer.choices[0].message.content!).make
    } catch (e) {
      throw new Error('Error guessing make', { cause: e })
    }
  }

  static async guessModel(title: string, options?: string[]) {
    try {
      const answer = await openai.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: `
        Be fast and brief. I'm looking at this car: "${title}"
  
        Of these options, which one is the correct model? Use the closest matching one:
        ${options?.join(', ')}
        
        Put your answer here:
        {
          "model": answer_here
        }
        `,
          },
        ],
        model: 'gpt-3.5-turbo',
      })

      return JSON.parse(answer.choices[0].message.content!).model
    } catch (e) {
      throw new Error('Error guessing model', { cause: e })
    }
  }
}
