var crypto = require('crypto'),
    mongoose = require('libs/mongoose'),
    Schema = mongoose.Schema,
    util = require('util'),
    async = require('async');

var schema = new Schema({
    taskId: {
        type: String,
        required: true
    },
    userName:{
        type: String,
        required: true
    },
    text: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});

schema.statics.addComment = function( username, taskId, text, callback){
    var Comment = this;

    async.waterfall([
        function(callback){
            var comment = new Comment({
                taskId: taskId,
                userName: username,
                text: text
            });
            comment.save( function(err){
                if (err) {
                    callback(err);
                } else {
                    callback(null, comment);
                }
            });
        }
    ],callback);
};

exports.Comment = mongoose.model('Comment', schema);

function CommentError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, CommentError);

    this.message = message;
}

util.inherits(CommentError, Error);

CommentError.prototype.name = 'CommentError';
exports.CommentError = CommentError;
