const express = require('express');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const DB_USER = 'admin';
const DB_PASSWORD = '9323Kenzie';
const DB_URI = 'ds219191.mlab.com:19191';
const dbName = 'barter-mac';

const app = express();
mongoose.connect(`mongodb://${DB_USER}:${DB_PASSWORD}@${DB_URI}/${dbName}`);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to the database');
});

const userSchema = new Schema({
    userName: {type: String, required: true},
    password: {type: String, required: true},
    items: [{
        itemName: String,
        imageURL: String,
        description: String,
    }]
})

const User = mongoose.model('User', userSchema)

let user = new User({userName: 'Colin', password: 'password'})
user.save((err) => {
    if (err) {
        return handleError(err)
    }else {
        console.log('Successfully added user');
    }
})

app.get('/', (req, res) => {
    res.send('hello');
})

app.post('/login', (req, res) => {
    console.log(req.body)
    res.send('got it');
})

app.listen(process.env.PORT || 5000, () => {
    console.log("Express server listening");
});