const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError.js'); 
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
     
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        return next(error);
    }
});

userSchema.methods.isPasswordCorrect = async function(password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        return false;
    }
};

userSchema.methods.generateAccessToken = function() {
    try {
        return jwt.sign(
            {
                _id: this._id,
                email: this.email,
                name: this.name,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
            }
        );
    } catch (error) {
        throw new ApiError(500, "Error in generating access token");
    }
};

userSchema.methods.generateRefreshToken = function() {
    try {
        return jwt.sign(
            {
                _id: this._id,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
            }
        );
    } catch (error) {
        throw new ApiError(500, "Error in generating refresh token");
    }
};

const user = mongoose.model('user', userSchema);

module.exports = { user };
