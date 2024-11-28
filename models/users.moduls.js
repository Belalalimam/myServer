const mongoose = require('mongoose')
const validator =  require('validator')
const userRoles = require('../utils/usersRoles')


const usersSchema = new mongoose.Schema({
    name:{
        type: String,
        // require: true
    },
    age:{
        type: Number,
        // require: true
    },
    email:{
        type: String,
        require: true,
        unique: true,
        validate: [validator.isEmail,  'lease enter a valid email'] 
    },
    password:{
      type: String,
      require: true,
    },
    token:{
      type: String,
    },
    role:{
      type: String,
      enum:[userRoles.ADMIN,  userRoles.USER,  userRoles.MODERATOR],
      default: userRoles.USER
    }, 
    avatar:{
      type: String,
      // default: 'uploads/mypng.jpg'
    },
    likedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Products'
    }]
})

module.exports = mongoose.model('Users',  usersSchema)
 

