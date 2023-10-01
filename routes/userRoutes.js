const express = require("express");
const { signUp, signIn, getMe } = require("../controllers/userController");
const validateToken = require("../middlewares/validateTokenHandler");

const router = express.Router();

router.post('/signup', signUp);

router.post('/signin', signIn);

router.get('/me', validateToken, getMe);

module.exports = router;