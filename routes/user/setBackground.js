var User = require('./../../models/user').User,
    HttpError = require('./../../error').HttpError;

exports.post = function(req, res, next){
    if(!req.session.user) return next();

    var fileName = req.body.fileName;
    User.updateInformation(req.session.user, { background: '/images/backgrounds/' + fileName }, function(err, user){
        if(err){
            if( err instanceof AuthError){
                return next(new HttpError(500, err.message));
            } else {
                return next(err);
            }
        }
        res.send(user.background);
    });
};