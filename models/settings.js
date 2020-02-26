var mongoose = require('mongoose');

// Comment Model
var settingsSchema =new mongoose.Schema({
    
    post_limit : {
       type: String
    },
   
   });
 
 
   
 const Settings = mongoose.model('settings',/*collection name*/ settingsSchema)
  module.exports = Settings;