const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const Schema = mongoose.Schema;

const DB_USER = 'admin';
const DB_PASSWORD = '9323Kenzie';
const DB_URI = 'ds219191.mlab.com:19191';
const dbName = 'barter-mac';

const app = express();
app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json());

mongoose.connect(`mongodb://${DB_USER}:${DB_PASSWORD}@${DB_URI}/${dbName}`);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to the database');
});

const userSchema = new Schema({
    userName: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    items: [{
        itemName: String,
        imageURL: String,
        description: String,
    }]
})


const User = mongoose.model('User', userSchema)

app.get('/', (req, res) => {
    res.send('hello');
})

app.post('/register', (req, res) => {
    const inputUsername = req.body.username;
    const inputPassword = req.body.password;

    let newUser = new User({
        userName: inputUsername, 
        password: inputPassword
    })

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            if(err) {
                req.send(err);
            }
            newUser.password = hash;
            newUser.save((err) => {
                if (err) {
                    console.log(err)

                    res.send({
                        message: 'Username is already taken'
                    });
                }else {
                    res.send({message: 'you were successful'});
                }
            })
        });
    })
})

app.post('/login', (req, res) => {
    console.log(req.body);
    res.send({'name': 'ashton'});
});

app.listen(process.env.PORT || 5000, () => {
    console.log("Express server listening");
});