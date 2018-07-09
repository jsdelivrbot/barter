const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    items: [{
        itemName: String,
        imageURL: String,
        timestamp: Number,
        description: String,
    }],
})

module.exports = User = mongoose.model('User', userSchema);