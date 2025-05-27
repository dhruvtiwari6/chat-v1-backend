const express = require('express')
const {registerUser, loginUser, logoutUser, allUsers} = require('../controllers/user.controller.js')
const router = express.Router();
const Verify_jwt = require('../middleware/authMiddleware.js')
const ApiResponse = require('../utils/apiResponse.js')

router.route('/getUser').get(Verify_jwt, (req, res)=> {
    const userId = req.userId;
    return res.status(200).json(new ApiResponse(200, userId , "user Verified"))
});
router.route('/').get(Verify_jwt , allUsers);
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(logoutUser);


module.exports = {router};