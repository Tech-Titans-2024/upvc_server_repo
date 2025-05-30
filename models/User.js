const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
{
	username : { type: String, required: true },
	password : { type: String, required: true },
	number   : { type: Number, required: true },
	name     : { type: String, required: true },
	address  : { type: String, required: true }
})

const User = mongoose.model('User', userSchema);

module.exports = User;