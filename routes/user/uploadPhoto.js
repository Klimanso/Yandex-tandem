var User = require('./../../models/user').User,
    HttpError = require('./../../error').HttpError,
    Formidable = require('formidable');

exports.post = function(req, res, next){
    if(!req.session.user) return next();

    var form = new Formidable.IncomingForm();

    form.uploadDir = 'public/images/user-photos';

    form.parse(req, function(err, fields, files) {
        var path = files.userImage.path.replace(/\\/g, '/').replace('public/', '');
        User.updateInformation(req.session.user, {photo: path}, function(err, user){
            if(err){
                if( err instanceof AuthError){
                    return next(new HttpError(500, err.message));
                } else {
                    return next(err);
                }
            }
            res.send(user.photo);
        });
    });
};