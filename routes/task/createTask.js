var Task = require('models/task').Task,
    TaskError = require('models/task').TaskError,
    HttpError = require('error').HttpError;

exports.post = function(req, res, next){
    if(!req.session.user) return next();

    var data = {
            name: req.body.name,
            projectId: req.body.projectId,
            description: req.body.description,
            term: req.body.term,
            userId: req.session.user
        };

    Task.newTask(data, function(err, task){
        if(err){
            return next(err);
        }
        res.send(task);
    });
};