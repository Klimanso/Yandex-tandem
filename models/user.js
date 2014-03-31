var crypto = require('crypto'),
    mongoose = require('libs/mongoose'),
    Schema = mongoose.Schema,
    util = require('util'),
    async = require('async');

var schema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    age: {
        type: Number,
        required: false
    },
    photo: {
        type: String,
        required: false,
        default: ''
    },
    background: {
        type: String,
        required: false,
        default: '/images/backgrounds/wall1.jpg'
    },
    hashedPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

schema.methods.encryptPassword = function(password){
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
}

schema.virtual('password')
    .set(function(password){
            this._plainPassword = password;
            this.salt = Math.random() + '';
            this.hashedPassword = this.encryptPassword(password);
        })
    .get(function(){
        return this._plainPassword;
    });

schema.methods.checkPassword = function(password){
    return this.encryptPassword(password) == this.hashedPassword;
};

schema.statics.authorize = function( username, email, password, callback){
    var User = this;

    async.waterfall([
        function(callback){
            username ? User.findOne({username: username}, callback) :
                User.findOne({email: email}, callback);
        },
        function(user, callback){
            if(user) {
                if( user.checkPassword(password)){
                    callback(null, user);
                } else {
                    callback(new AuthError("Пароль неверен"));
                }
            } else {
                callback(new AuthError("Имя пользователя или пароль неверны"));
            }
        }
    ],callback);
};

schema.statics.updateInformation = function(id, data, callback){
    var User = this;

    async.waterfall([
        function(callback){
            User.findById(id, callback);
        },
        function(user, callback){
            user.username = data.username ? data.username : user.username;
            user.email = data.email ? data.email : user.email;
            user.age = data.age ? data.age : user.age;
            if(data.password && data.password !== '')
                user.password = data.password;
            user.photo = data.photo ? data.photo : user.photo;
            user.background  = data.background ? data.background : user.background;

            user.save(function(err, user){
                if(err) {
                    if(err.code === 11000 || err.code === 11001){
                        callback(new AuthError("Пользователем с данным логином или email существует"));
                    } else {
                        callback(err);
                    }
                } else {
                    callback(null, user);
                }
            });
        }
    ],callback);
};

schema.statics.registration = function( username, email, password, callback){
    var User = this;

    async.waterfall([
        function(callback){
            var user = new User({
                username: username,
                email: email,
                password: password
            });
            user.save( function(err){
                if (err) {
                    if(err.code === 11000 || err.code === 11001){
                        callback(new AuthError("Пользователем с данным логином или email существует"));
                    } else {
                        callback(err);
                    }
                } else {
                    callback(null, user);
                }
            });
        }
    ],callback);
};

schema.statics.search = function( username, email, callback){
    var User = this;

    async.waterfall([
        function(callback){
            username ? User.findOne({username: username}, callback) :
                User.findOne({email: email}, callback);
        },
        function(user, callback){
            if(user) {
                callback(null, user);
            } else {
                callback(new AuthError("Такого пользователя не существует"));
            }
        }
    ],callback);
};

exports.User = mongoose.model('User', schema);

function AuthError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, AuthError);

    this.message = message;
}

util.inherits(AuthError, Error);

AuthError.prototype.name = 'AuthError';
exports.AuthError = AuthError;