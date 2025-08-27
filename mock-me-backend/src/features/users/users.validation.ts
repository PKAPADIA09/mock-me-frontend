import Joi from 'joi';

export const newUser = Joi.object( {
    firstName: Joi.string().required()
    , lastName: Joi.string().required()
    , email: Joi.string().required()
    , password: Joi.string().min( 8 ).optional()
} )

