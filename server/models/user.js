const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        required: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        require: true,
        minlength:6
    },
    tokens: [
        {
            access: {
                type: String,
                require: true
            },
            token: {
                type:String,
                require: true
            }
        }
    ]
});

UserSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject,['_id','email']);
};

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access},'abc123').toString();
    user.tokens.push({
        access,
        token
    });

    return user.save().then( () => {
        return token;
    },(e) => {
        console.log('ERROR:',e);
    });
};

UserSchema.statics.findByToken = function(token){
    var User = this;
    var decoded = undefined;

    try {
        decoded = jwt.verify(token,'abc123');
    } catch(e) {
        // return new Promisse((resolve,reject) => {
        //     reject();
        // });
        return Promise.reject();
    }

    return User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

var User = mongoose.model('Users', UserSchema);

module.exports = {
    User
};