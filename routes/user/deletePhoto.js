var User = require('models/user').User,
    HttpError = require('error').HttpError,
    Formidable = require('formidable');

exports.post = function(req, res, next){
    if(!req.session.user) return next();

    User.updateInformation(req.session.user, {photo: ' '}, function(err, user){
        if(err){
            if( err instanceof AuthError){
                return next(new HttpError(500, err.message));
            } else {
                return next(err);
            }
        }
        res.send(user.photo);
    });
};