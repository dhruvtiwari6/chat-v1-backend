const ApiError = require('../utils/apiError.js')
const ApiResponse = require('../utils/apiResponse.js')
const { user } = require('../model/user.model.js')
const validator = require('validator')



const generateAccessRefereshToken = async (userId) => {
    const loggedInUser = await user.findById(userId);

    if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
        throw new ApiError(500, 'Token secrets are not set');
    }


    const accessToken = loggedInUser.generateAccessToken();
    console.log("access-token-generated");
    const refreshToken = loggedInUser.generateRefreshToken();

    loggedInUser.refreshToken = refreshToken;
    await loggedInUser.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
}

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        console.log(req.body);


        if (!email || !password) {
            throw new ApiError(400, "Email and password are required");
        }

        const foundUser = await user.findOne({ email });
        if (!foundUser) {
            throw new ApiError(400, 'Invalid email or password');
        }

        console.log("foundUser : ", foundUser)


        const isValid = await foundUser.isPasswordCorrect(password);
        console.log(isValid);



        if (!isValid) {
            throw new ApiError(400, 'Invalid user credentials');
        }

        const { accessToken, refreshToken } = await generateAccessRefereshToken(foundUser._id);
        console.log("access-token", accessToken);
        console.log("refresh-token", refreshToken);

        const options = {
            httpOnly: true,
            secure: true, // Use secure: true in production for HTTPS
            // other cookie options as needed
        };

        const loggedInUser = foundUser.toObject();
        delete loggedInUser.password;

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));

    } catch (error) {
        next(error)
    }
};

const registerUser = async (req, res, next) => {
    try {

        const { name, email, password } = req.body;
        console.log(req.body);

        if ([name, email, password].some(field => field?.trim() === "")) {
            throw new ApiError(400, "all field are required ")
        }

        const ExistedUser = await user.findOne({ email });


        if (ExistedUser) {
            throw new ApiError(400, "user already exist")
        }

        if (!validator.isEmail(email)) {
            throw new ApiError(400, 'email is not valid');
        }

        //   if(!validator.isStrongPassword(password)) {
        //       throw new ApiError(400 , 'password must be strong');

        //   }


        const newUser = await user.create({
            name,
            email,
            password
        })


        if (!newUser) {
            throw new ApiError(500, 'internal server error');
        }

        const { accessToken, refreshToken } = await generateAccessRefereshToken(newUser._id);
        // console.log("access-token" , accessToken);
        // console.log("refresh-token", refreshToken);

        const options = {
            httpOnly: true,
            secure: true, // Use secure: true in production for HTTPS
            // other cookie options as needed
        };


        const loggedInUser = newUser.toObject();
        delete loggedInUser.password;

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, loggedInUser, "User registered and logged in successfully"));


    } catch (error) {
        next(error);
    }

}

const logoutUser = async (req, res, next) => {
    try {
        res.clearCookie("accessToken", { httpOnly: true, secure: true });
        res.clearCookie("refreshToken", { httpOnly: true, secure: true });

        return res.status(200)
            .json(new ApiResponse(200, null, "User logged out successfully"));
    } catch (error) {
        next(error);
    }
};

const allUsers = async (req, res, next) => {
    try {
        const keyword = await req.query.search ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } }
            ]
        } : {};

        if (!keyword) {
            throw new ApiError(400, "invalid username");
        }

        const users = await user.find({
            ...keyword,
            _id: { $ne: req.userId }
        }).select("-password");

        return res.status(200).json(new ApiResponse(200, users, "users with the given username are find"));
    } catch (error) {
        console.log("error in searching the user : ", error)
    }
}

module.exports = { registerUser, loginUser, logoutUser, allUsers };