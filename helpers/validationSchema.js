const Joi = require('joi');

const authSchema = Joi.object({

    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),

    email: Joi.string().email().lowercase().required(),

    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
});

module.exports = { authSchema };