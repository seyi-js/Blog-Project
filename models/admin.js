var mongoose = require('mongoose');

var adminSchema = new mongoose.Schema({
 username : {
 	type: String
 	// required: true
 },
 email: {
 	type: String
 },

 contact: {
 	type: String
 },
 password: {
    type : String
    // required: true
}

});


const Admin = mongoose.model('Admin', adminSchema, 'admins'/*<=collection name*/);
module.exports = Admin
