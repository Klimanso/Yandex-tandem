var Task = require('./../../models/task').Task,
    TaskError = require('./../../models/task').TaskError,
    HttpError = require('./../../error').HttpError,
    Comment = require('./../../models/comment').Comment;

exports.get = function(req, res, next){
    if(!req.session.user) return next();

    var taskId = req.param('taskId');

    Comment.find({taskId: taskId}, function(err, comments){
        if(err){
            return next(new HttpError(403, err.message));
        } else {
            Task.findById( taskId, function(err, task) {
                if(err){
                    return next(err);
                }
                res.send({
                    task: task,
                    comments: comments
                });
            });
        }
    });
};