var mongoose = require("mongoose");

var adminSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
	type: String,
    required: true
  },
  username: {
	type: String,
	unique: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  contact: {
    type: Number
  },
  password: {
    type: String,
    required: true
  },
  date: {
	type: String,
	default: new Date().toLocaleString()
},
  profileimage: {
	type : String
}

});

const Admin = mongoose.model(
  "Admin",
  adminSchema,
  "admins" /*<=collection name*/
);
module.exports = Admin;
