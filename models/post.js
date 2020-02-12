var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
// Post model
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
},
comments: [{
	type: ObjectId,
	ref: 'comments'/*the colection i'm linking to*/
}]

});


    const    Post = mongoose.model('posts',/*collection name */ postSchema);
      module.exports = Post;
     
