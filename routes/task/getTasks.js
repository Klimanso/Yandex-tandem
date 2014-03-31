var Task = require('models/task').Task,
    TaskError = require('models/task').TaskError,
    HttpError = require('error').HttpError;

exports.get = function(req, res, next){
    if(!req.session.user) return next();

    var projectId = req.param('projectId');

    Task.getTasks( projectId, function(err, tasks) {
        if(err){
            if( err instanceof TaskError){
                return next(new HttpError(403, err.message));
            } else {
                return next(err);
            }
        }
        res.send(tasks);
    });
};