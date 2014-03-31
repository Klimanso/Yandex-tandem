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
    assignedUsers: {
        type: [String],
        required: true
    },
    creator: {
        type: String,
        required: true
    }
});

schema.statics.newProject = function( name, userId, callback){
    var Project = this;

    async.waterfall([
        function(callback){
            var project = new Project({
                name: name,
                creator: userId,
                assignedUsers: [userId]
            });
            project.save( function(err){
                if (err) {
                    if(err.code === 11000 || err.code === 11001){
                        callback(new ProjError("Список дел с названием уже существует"));
                    } else {
                        callback(err);
                    }
                } else {
                    callback(null, project);
                }
            });
        }
    ],callback);
};

schema.statics.deleteProject = function( projectId, callback){
    var Project = this;

    async.waterfall([
        function(callback){
            Project.findByIdAndRemove(projectId, callback)
        },
        function(project, callback){
            if(project){
                callback(null, project);
            } else {
                callback(new ProjError('Список дел не был найден'))
            }
        }
    ],callback);
};

schema.statics.assignProject = function(projectId, toUserId, callback){
    var Project = this;

    async.waterfall([
        function(callback){
            Project.findById(projectId, callback)
        },
        function(project, callback){
            if(project){
                var userExist = project.assignedUsers.indexOf(toUserId) !== -1;

                if(!userExist){
                    project.assignedUsers.push(toUserId);
                }

                project.save(callback(null, project));
            } else {
                callback(new ProjError('Список дел не был найден'));
            }
        }
    ],callback);
};

schema.statics.unassignProject = function(projectId, userId, callback){
    var Project = this;

    async.waterfall([
        function(callback){
            Project.findById(projectId, callback)
        },
        function(project, callback){
            if(project){
                var userExist = project.assignedUsers.indexOf(userId) !== -1;

                if(userExist){
                    project.assignedUsers.pop(userId);
                }

                project.save(callback(null, project));
            } else {
                callback(new ProjError('Список дел не был найден'));
            }
        }
    ],callback);
};

exports.Project = mongoose.model('Project', schema);

function ProjError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, ProjError);

    this.message = message;
}

util.inherits(ProjError, Error);

ProjError.prototype.name = 'ProjError';
exports.ProjError = ProjError;

