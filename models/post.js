var mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
 post_id : {
    type: Number,
    required: true
 },
 title : {
 	type: String,
 	required: true
 },
 post: {
    type : String,
    required: true
}

});


const Post = mongoose.model('Post', postSchema, 'posts'/*<=collection name*/);
module.exports = Post
