const { chat } = require('../model/chat.model.js');
const ApiError = require('../utils/apiError.js');
const ApiResponse = require('../utils/apiResponse.js');
const { user } = require('../model/user.model.js');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const accessChat = async (req, res, next) => {
    try {
        const { chattingUserId } = req.body;

        // Check if chattingUserId is provided in the request body
        if (!chattingUserId) {
            throw new ApiError(400, 'userId param not sent with request');
        }

        // Find existing chat between the two users (excluding group chats)
        let existingChat = await chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.userId } } },
                { users: { $elemMatch: { $eq: chattingUserId } } }
            ]
        });

        if (existingChat.length  > 0) {
            existingChat = await chat.findById(existingChat[0]._id)
                .populate("users", "-password")
                .populate("latestMessage");
            
            existingChat = await user.populate(existingChat, {
                path: "latestMessage.sender",
                select: 'name email'
            });

            return res.status(200).json(new ApiResponse(200, existingChat, "success"));
        } else {
            // If no chat exists, create a new one
            const chatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [req.userId, chattingUserId]
            };

            const newChat = await chat.create(chatData);
            const fullChat = await chat.findById(newChat._id).populate("users", "-password");

            return res.status(200).json(new ApiResponse(200, fullChat, "success"));
        }

    } catch (err) {
        console.log("Error accessing chat:", err);
        next(err); // Ensure the error is passed to the next middleware
    }
}

const fetchChats = async (req, res, next) => {
   try{
    let fetch = await  chat.find(
        {
            users : {$elemMatch : {$eq : req.userId}}
        }
    ).populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .sort({updatedAt : -1})
   
    fetch = await user.populate(fetch, {
      path: "latestMessage.sender",
       select: 'name email'
    })
    

    return res.status(200).json(new ApiResponse(200, fetch , "finded chats"));

   }catch(err){
     console.log("fetch chats error: ",err);
   }
}


const createGroupChat = async (req, res, next) => {
    let users = JSON.parse(req.body.users);
    users.map(users => console.log(users));
    console.log(req.body.name);


    if (users.length < 2) {
        return next(new ApiError(400, "More than 2 users are required"));
    }
    
    // Convert user IDs to ObjectId
    users = users.map(usersId => mongoose.Types.ObjectId.createFromHexString(usersId));

    users.push(req.userId); // Ensure req.userId is also an ObjectId

    try {
        const groupChat = await chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.userId
        });

        const fullGroupChat = await chat.findById(groupChat._id)
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        return res.status(200).json(new ApiResponse(200, fullGroupChat, "Group chat created successfully"));
    } catch (error) {
        console.error("Error creating group chat:", error);
        next(error);
    }
}

const renameGroup = async(req, res, next) => {
    const {chatId, chatName} = req.body;
    const updatedChat= await chat.findByIdAndUpdate(chatId , {chatName} , {new : true}).populate("users" , "-password")
                                                                                       .populate("groupAdmin" , "-password");

    if(!updatedChat){
        throw new ApiError(500, "internal server error");
    }
     
    return res.status(200).json(new ApiResponse(200, updatedChat ,"group renamed"));

} 

const AddGroup = async(req, res, next) => {
    const {chatId , userId} = req.body;
try {
    
        const added = await chat.findByIdAndUpdate(chatId, 
            {
                $push : {users: userId},
            },
            {
                new : true
            }
        ).populate("users" , "-password")
         .populate("groupAdmin", "-password")
    
         if(!added){
            throw new ApiError(400, "chat not found");
         }
    
         return res.status(200).json(new ApiResponse(200, added , "user added"));
} catch (error) {
    console.log("error in aadded group : " , error)
}
}

const removeFromGroup = async(req, res, next) => {
   try {
     const {chatId , userId} = req.body;
     console.log(req.body);
 
     const removed =await chat.findByIdAndUpdate(chatId, 
         {
             $pull : {users: userId},
         },
         {
             new : true
         }
     ).populate("users" , "-password")
      .populate("groupAdmin", "-password")
 
      if(!removed){
         throw new ApiError(400, "chat not found");
      }
 
      return res.status(200).json(new ApiResponse(200, removed , "user removed"));
   } catch (error) {
    console.log("error in removed group : " , error)

   }
}
module.exports = {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    AddGroup,
    removeFromGroup
};
