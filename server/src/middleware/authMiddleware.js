const ApiError = require("../utils/apiError");
const jwt = require('jsonwebtoken');
const { user } = require("../model/user.model");
const ApiResponse = require('../utils/apiResponse.js');

const Verify_jwt = async (req, res, next) => {
    try {
        console.log("cookies : ", req.cookies);

        const token = req.cookies?.accessToken || req.headers['Authorization']?.replace("Bearer ", "") || req.headers['authorization']?.replace("Bearer ", "");

        console.log("token : ", token);
        if (!token) {
            throw new ApiError(401, 'Unauthorized request: No token provided');
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user_id = decoded._id;

        const userFind = await user.findById(user_id).select("-password");
        if (!userFind) {
            throw new ApiError(401, "No user found");
        }

        // Attach the user information to the request object
        req.userId = userFind._id;

        console.log('verified');

        next();
    } catch (err) {
        console.error("JWT verification error:", err);
        next(new ApiError(401, "Unauthorized or not token provided"));                 // Pass the error to the next middleware
                // When you call next() with an error (e.g., next(err)),
                // Express bypasses all non-error middleware (those with (req, res, next)),
                // It keeps searching for the next error-handling middleware (err, req, res, next).
    }
}

module.exports = Verify_jwt;
