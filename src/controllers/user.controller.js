import uploadOnCloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";
import moment from "moment"

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(400).json({
        message: "user not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return res.status(500).json({
      message: "Internal server error while getting current user",
      error: error.message,
    });
  }
};

import fs from "fs";
import geminiResponse from "../../gemini.js";

export const updateAssistant = async (req, res) => {
  let uploadedFilePath = null;
  
  try {
    console.log("=== UPDATE ASSISTANT DEBUG ===");
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);
    
    const { assistantName, imageURL } = req.body;
    
    if (!assistantName) {
      return res.status(400).json({ message: "Assistant name is required" });
    }

    let assistantImage;

    if (req.file && req.file.path) {
      uploadedFilePath = req.file.path; // Store for cleanup
      console.log("Uploading file to Cloudinary:", req.file.path);
      
      assistantImage = await uploadOnCloudinary(req.file.path);
      console.log("Cloudinary result:", assistantImage);
      
      if (!assistantImage) {
        return res.status(500).json({ message: "Cloudinary upload failed" });
      }
      
      // Clean up local file after successful upload
      try {
        fs.unlinkSync(uploadedFilePath);
        console.log("Local file cleaned up:", uploadedFilePath);
      } catch (cleanupError) {
        console.warn("Failed to cleanup file:", cleanupError.message);
      }
      
    } else if (imageURL) {
      assistantImage = imageURL;
    } else {
      return res.status(400).json({ message: "No image provided" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        assistantName,
        assistantImage,
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
    
  } catch (error) {
    console.error("=== FULL ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Clean up file if upload failed
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
        console.log("Cleaned up file after error:", uploadedFilePath);
      } catch (cleanupError) {
        console.warn("Failed to cleanup file after error:", cleanupError.message);
      }
    }
    
    return res.status(500).json({
      message: "updateAssistant error",
      error: error.message,
    });
  }
};

export const askToAssistant = async(req,res)=>{
  try {
    const {command} = req.body
    const user = await User.findById(req.userId);
    user.history.push(command)
    user.save()
    const userName = user.name
    const assistantName=user.assistantName
    const result = await geminiResponse(command,assistantName,userName)

    const jsonMatch = result.match(/{[\s\S]*}/)

    console.log("gemini api response", result);
    

    if(!jsonMatch){
      return res.status(400).json({response:"Sorry, i can't understand"})
    }

    const gemResult = JSON.parse(jsonMatch[0])
    const type = gemResult.type

    switch(type){
      case 'get-date':
        return res.json({
          type,
          userInput:gemResult.userInput,
          response:`current date is ${moment().format("YYYY-MM-DD")}`
        });

         case 'get-day':
        return res.json({
          type,
          userInput:gemResult.userInput,
          response:`today is ${moment().format("dddd")}`
        });

         case 'get-month':
        return res.json({
          type,
          userInput:gemResult.userInput,
          response:`current month is ${moment().format("MMMM")}`
        });

         case 'get-time':
        return res.json({
          type,
          userInput:gemResult.userInput,
          response:`current time is ${moment().format("hh:mmA")}`
        });
         case "general"  :
         case "google-search" :
         case "youtube-search" :
         case "youtube-play" :
         case "calculator-open" :
         case "instagram-open" :
         case "facebook-open" :
         case "weather-show" :
         case "github-open" :
         case "linkedin-open" :
          return res.json({
            type,
            userInput:gemResult.userInput,
            response:gemResult.response,

          })

          default:
            return res.status(400).json({response: "I didn't understand that command. "})

    }


  } catch (error) {
    return res.status(500).json({response: "ask assistant error"})
    
  }
}
