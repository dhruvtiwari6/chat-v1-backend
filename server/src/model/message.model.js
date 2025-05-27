const mongoose = require('mongoose');


const messageSchema = new mongoose.Schema(

    {
        sender : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "user"
        }, 

        content :{
            type: String,
            trim : true
        },

        Chat : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "chat"
        }

    },
    {
        timestamps : true
    }
)

const message = mongoose.model('message' , messageSchema);

module.exports = message;