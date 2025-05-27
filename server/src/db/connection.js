const { mongoose } = require("mongoose")

 const connectDB = async() => {
   try {
    console.log(process.env.MONGODB_URI);
    const connection_Instance = await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);
    console.log(`connection established ans host is : ${connection_Instance.connection.host}` )
   }catch (err) {
    console.log(`mongodb connection error : ${err}`)
   }
}


module.exports = {connectDB};