const express  =require('express');
const messageRouter = express.Router();
const Verify_jwt = require('../middleware/authMiddleware.js')
const {sendMessage, fetchAllmessages} = require('../controllers/message.Controller.js')


messageRouter.route('/').post(Verify_jwt, sendMessage);
messageRouter.route('/:chatId').get(Verify_jwt, fetchAllmessages);

module.exports = messageRouter;