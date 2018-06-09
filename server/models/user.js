const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

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

UserSchema.methods.removeToken = function (token) {
    var user = this;
    return user.update({
        $pull: {
            tokens: { token }
        }
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

UserSchema.statics.findByCredentials = function(email, password) {

    var User = this;

    return User.findOne({email}).then( (user) => {
        
        if(!user) {
            return Promise.reject();
        }

        return bcrypt.compare(password,user.password).then( (res) => {
            if(res === true) {
                return user;
            }
            return Promise.reject("User not found");
        });
    });

};

UserSchema.pre('save', function(next){
    var user = this;
    if(user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err,hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

var User = mongoose.model('Users', UserSchema);

module.exports = {
    User
};