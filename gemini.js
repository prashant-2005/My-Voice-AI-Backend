import dotenv from "dotenv"
dotenv.config()
import axios from "axios";

const geminiResponse = async (command,assistantName,userName) => {
  try {
    const apiUrl = process.env.GEMINI_API_URL;

    const prompt = `You are a virtual assistant.your name is ${assistantName} created by ${userName}.
    
    you are not Google. you will now behave like a voice-enabled assistant.
    
    your task is to understand the user's natural language input and respond with a Json object like this:

    {
    "type": "general" | "google-search" |  "youtube-search" | "youtube-play" | "get-time" | "get-date" | "get-day" | "get-month" | "calculator-open" | "instagram-open" | "facebook-open" | "weather-show" | "github-open" | "linkedin-open" ,

    "userInput": "<orginal user input >" {only remove you user name from userinput if exists} and agar kisi ne google ya youtube pe kuch search karne ko bola hai to userInput me only bo search baala text jaye,
    
    "response":"<a short spoken response to read out loud to the user>"

    }

    Instructions:
    -"type":determine the intent of the user.
    -"userinput": original sentence the user spoke.
    -"response": A short voice-friendly reply, e.g., "sure ,playing it now", "Here's what i found", "Today  is tuesday",etc.

    Type meanings:
    -"general": if it's a factual or informational question.aur agar koi esa question puchta hai jiska answer tume pata ho uska bhi general category me rakho bas short answer dena
    -"google-search": if user wants to search something on Google.
    -"youtube-search":if user wants to search something on Youtube.
    -"youtube-play":if user wants to directly play a video or song.
    -"calculator-open":if user wants to open a calculator .
    -"instagram-open":if user wants to open instagram .
    -"github-open":if user wants to open github .
    -"linkedin-open":if user wants to open linkdin .
    -"get-time":if user asks for current time 
    -"get-date":if user asks for today's date
    -"get-day" :if user asks what day it is  
    -"get-month":if user asks for current month 
    -"weather-show":if user wants to know weather

    Important:
    -Use ${userName} agar koi puche tume kisne banaya
    -only respond with the JSON Object, nothing else.
    
    

    now your userInput - ${command}
    
    `;

    const result = await axios.post(
      process.env.GEMINI_API_URL,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return result.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.log(error);
  }
};

export default geminiResponse;
