const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { authSchema } = require('../helpers/validationSchema');

// @desc signup a user
// @route /v1/auth/signup
// @access public

const signUp = asyncHandler(async (req, res) => {

    const result = await authSchema.validateAsync(req.body);

    const userAvailable = await User.findOne({ email: result.email });

    if (userAvailable) {
        res.status(400);
        throw new Error("User Already Exists");
    }
    // hash password
    const hashedPassword = await bcrypt.hash(result.password, 10);

    const user = await User.create({
        username: result.username,
        email: result.email,
        password: hashedPassword
    })
    // Generate an access token using JWT
    const accessToken = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

    // Exclude the password field from the user data
    user.password = undefined;
    if (user) {
        res.status(201).json({
            status: true,
            content: {
                data: user,
                meta: {
                    access_token: accessToken,
                }
            }
        });
    }
    else {
        res.status(400).json({ message: "User Data Not Valid" });
    }

    res.json({ message: "User Created Successfully" });
});

// @desc signin a user
// @route /v1/auth/signin
// @access public
const signIn = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("All Fields are Mandatory");
    }

    const user = await User.findOne({ email });

    if (!user) {
        res.status(400);
        throw new Error("User DoesNot Exist.Please Register");
    }

    // compare password with hashed password

    if (user && (await bcrypt.compare(password, user.password))) {

        const accessToken = jwt.sign({
            user: {
                username: user.username,
                email: user.email,
                id: user.id,
            },
        }, process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "10m" }
        )
        res.status(200).json({ accessToken });
    }
    else {
        res.status(401);
        throw new Error("Email or Password not valid");
    }
});


// @desc get Details of user
// @route /v1/auth/signin
// @access public

const getMe = asyncHandler(async (req, res) => {
    // The user information is attached to the request object when the user is authenticated.
    // You can access it using req.user.
    const user = req.user;
    console.log(user);


    const userData = {
        id: user.id,
        name: user.username,
        email: user.email,
        createdAt: user.created_at
    };

    return res.status(200).json({
        status: true,
        content: {
            data: userData,
        },
    });
});


module.exports = { signUp, signIn, getMe };