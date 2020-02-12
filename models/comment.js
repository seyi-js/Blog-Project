var mongoose = require('mongoose');

// Comment Model
var commentSchema =new mongoose.Schema({
    comment_id : {
       type: Number,
       // required: true
    },
    comment : {
       type: String
    },
   
   });
 
 
   
 const Comment = mongoose.model('comments',/*collection name*/ commentSchema)
  module.exports = Comment;