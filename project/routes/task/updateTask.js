var Task = require('models/task').Task,
    TaskError = require('models/task').TaskError,
    HttpError = require('error').HttpError;

exports.post = function(req, res, next){
    if(!req.session.user) return next();

    var taskId = req.param('taskId');

    req.body.lastEditor = req.user.username;

    Task.updateTask(taskId, req.body, function(err, task){
        if(err){
            if( err instanceof TaskError){
                return next(new HttpError(500, err.message));
            } else {
                return next(err);
            }
        }
        res.send(task);
    });
};