import {NextResponse} from 'next/server'; // for client request
import OPENAI from 'openai';

const systemPrompt = `You are a flashcard creator, you take in text and create multiple flashcards from it. Make sure to create exactly 10 flashcards.
Both front and back should be one sentence long.
You should return in the following JSON format:
{
  "flashcards":[
    {
      "front": "Front of the card",
      "back": "Back of the card"
    }
  ]
}`

export async function POST(req) {
    // creates a new OPENAI client instance 
    // extracts the text data from the request body
    const openai = OPENAI();
    const data = await req.text();
    
    // create a chat completion request to the OpenAI API
    const completion = await openai.chat.completions.create({
        messages: [
           {role: 'system', content: systemPrompt}, // instruct AI how to create flashcards
           {role: 'user', content: data}, // a user message containing the input text from the request body
        ],
        model: 'gpt-4o', // specific model
        response_format: 'json_object' // the format of my output
    })

    // parse the JSON content from the API response
    const flashcards = JSON.parse(completion.choices[0].message.content);
    
    // send the flashcards back to the client as a JSON response
    return NextResponse.json(flashcards.flashcards); 
}