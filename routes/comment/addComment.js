var Comment = require('models/comment').Comment,
    User = require('models/user').User,
    CommentError = require('models/comment').CommentError,
    HttpError = require('error').HttpError;

exports.post = function(req, res, next){
    if(!req.session.user) return next();

    var text = req.body.text,
        taskId = req.body.taskId,
        userId = req.session.user;

    User.findById(userId, function(err, user){
        if(err){
            next(err);
        } else {
            Comment.addComment(user.username, taskId, text, function(err, comment){
                if(err){
                    return next(err);
                }
                res.send(comment);
            });
        }
    });
};