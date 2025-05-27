const ApiError = require('../utils/apiError.js');
const ApiResponse = require('../utils/apiResponse.js');
const message = require('../model/message.model.js')
const {user} = require('../model/user.model.js')
const {chat} = require('../model/chat.model.js')

const sendMessage = async(req, res, next) => {
    try {
        const {content, chatId} = req.body;
        
        if(!content || !chatId) {
            console.log("invalid data passed into request");
            return ApiError(400, "invalid data passed into request")
        }
    
        let newMessage = await  message.create({
            sender : req.userId,
            content : content,
            Chat : chatId
        });

               newMessage = await newMessage.populate("sender", "name");
        
        // Populate chat field
        newMessage = await newMessage.populate({
            path: 'Chat',
            populate: {
                path: 'users',
                select: 'name email'
            }
        });



       await chat.findByIdAndUpdate(req.body.chatId , {
        latestMessage: newMessage,
       })

       return res.status(200).json(new ApiResponse(200 , newMessage));


       

    } catch (error) {
        return next(new ApiError(500, `Server Error: ${error.message}`));
    }
}


const fetchAllmessages = async(req, res, next) => {
    try {

        console.log(req.params.chatId);
        
       const messages =await message.find({Chat : req.params.chatId}).populate("sender", "name email").populate("Chat");
       return res.status(200).json(new ApiResponse(200 , messages, "find all messages"))


    } catch (error) {
         return next(new ApiError(500, `Server Error: ${error.message}`));
    
    }
}


module.exports = {sendMessage, fetchAllmessages};