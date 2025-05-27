const Verify_jwt = require('../middleware/authMiddleware.js')
const errorHandler = require('../utils/errorHandler.js')
const {accessChat, fetchChats, createGroupChat , renameGroup, AddGroup, removeFromGroup} = require('../controllers/chat.controller.js');

const express = require('express');
const chatRouter = express.Router();

chatRouter.route('/').get(Verify_jwt, fetchChats);
chatRouter.route('/').post(Verify_jwt , accessChat);
chatRouter.route('/group').post(Verify_jwt,createGroupChat);
chatRouter.route('/groupRename').put(Verify_jwt ,renameGroup);
chatRouter.route('/groupRemove').put(Verify_jwt ,removeFromGroup);
chatRouter.route('/groupAdd').put(Verify_jwt , AddGroup);


module.exports = chatRouter;




