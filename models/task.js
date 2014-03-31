var crypto = require('crypto'),
    mongoose = require('./../libs/mongoose'),
    Schema = mongoose.Schema,
    util = require('util'),
    async = require('async');

var schema = new Schema({
    name: {
        type: String,
        required: true
    },
    projectId: {
        type: String,
        required: true
    },
    userId:{
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    readyState: {
        type: Boolean,
        required: true,
        default: false
    },
    created: {
        type: Date,
        default: Date.now
    },
    term: {
        type: Date,
        required: false
    },
    lastEditor: {
        type: String,
        required: false
    }
});


schema.statics.newTask = function( data, callback){
    var Task = this;

    async.waterfall([
        function(callback){
            var task = new Task({
                name: data.name,
                projectId: data.projectId,
                description: data.description,
                term: data.term,
                userId: data.userId
            });
            task.save( function(err, task){
                if (err) {
                    callback(err);
                } else {
                    callback(null, task);
                }
            });
        }
    ],callback);
};

schema.statics.deleteTask = function( taskId, callback){
    var Task = this;

    async.waterfall([
        function(callback){
            Task.findByIdAndRemove(taskId, callback)
        },
        function(task, callback){
            if(task){
                callback(null, task);
            } else {
                callback(new TaskError('Задача не была найдена'))
            }
        }
    ],callback);
};

schema.statics.updateTask = function(taskId, data, callback){
    var Task = this;

    async.waterfall([
        function(callback){
            Task.findByIdAndUpdate(taskId, data, callback);
        },
        function(task, callback){
            if(task){
                callback(null, task);
            } else {
                callback(new TaskError('Задание не было найдено'));
            }
        }
    ],callback);
};

schema.statics.getTasks = function( projectId, callback){
    var Task = this;

    async.waterfall([
        function(callback){
            Task.find({ projectId: projectId }, callback);
        },
        function(tasks, callback){
            if(tasks){
                callback(null, tasks);
            } else {
                callback(new TaskError('Ошибка поиска задач'))
            }
        }
    ],callback);
};

schema.statics.deleteAllofProject = function( projectId, callback){
    var Task = this;

    async.waterfall([
        function(callback){
            Task.remove({ projectId: projectId }, callback);
        },
        function(tasks, callback){
            callback(null, tasks);
        }
    ],callback);
};

exports.Task = mongoose.model('Task', schema);

function TaskError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, TaskError);

    this.message = message;
}

util.inherits(TaskError, Error);

TaskError.prototype.name = 'TaskError';
exports.TaskError = TaskError;

