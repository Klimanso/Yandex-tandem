var User = require('./../../models/user').User,
    AuthError = require('./../../models/user').AuthError,
    HttpError = require('./../../error').HttpError;

exports.post = function(req, res, next){
    if(!req.session.user) return next();

    var upsertData = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        age: req.body.age
    };

    User.updateInformation(req.session.user, upsertData, function(err, user){
        if(err){
            if( err instanceof AuthError){
                return next(new HttpError(500, err.message));
            } else {
                return next(err);
            }
        }
        res.send({});
    });
};