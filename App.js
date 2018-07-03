const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const expressValidator = require('express-validator');

const app = express();
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json());
app.use(expressValidator());
app.use(cors());


//variables used to access amazon cloud bucket
const BUCKET_NAME = 'barter-image-bucket';
const IAM_USER_KEY = 'AKIAJIYJ2K33UMOAUALQ';
const IAM_USER_SECRET = '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';

var s3 = new AWS.S3({
 accessKeyId: IAM_USER_KEY,
 secretAccessKey: IAM_USER_SECRET,
 Bucket: BUCKET_NAME
})

// Adding the uploaded photos to our Amazon S3  bucket
var imageUpload = multer({
 storage: multerS3({
   s3: s3,
   bucket: 'barter-image-bucket',
   metadata: function (req, file, cb) {
     cb(null, Object.assign({}, req.body))
   }
 })
});

const Schema = mongoose.Schema;

const DB_USER = 'admin';
const DB_PASSWORD = '9323Kenzie';
const DB_URI = 'ds219191.mlab.com:19191';
const dbName = 'barter-mac';



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
        timestamp: Number,
        description: String,
    }],
})


const User = mongoose.model('User', userSchema)

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
                res.send(err);
            }
            newUser.password = hash;
            
            newUser.save((err) => {
                if (err) {
                    console.log(err)
                    res.send(JSON.stringify({'message': 'Username is already taken'}));
                }else {
                    res.send(JSON.stringify({'message': 'you were successful'}));
                }
            })
        });
    })
})

app.post('/login', (req, response) => {
    let username = req.body.username;
    let password = req.body.password;

    User.find({userName:username}, 'userName password', function(err, docs){
        if(err) {response.send(err)}
        if (docs.length === 0) {
            response.send(JSON.stringify({'message': 'Wrong username or password'}))
        } else {
            bcrypt.compare(password, docs[0].password, (err, result) => {
                if(err) response.send(err);    
                if(result) {
                    jwt.sign({password: docs[0].password}, 'secretkey', (err, token) => {
                        if(err) {response.send(err);
                        } else {
                            response.send(JSON.stringify({'token': token, 'success': true}));
                        }
                    })
                }
            })
        }
    })
});

app.post('/upload', imageUpload.single('myFile'), (req, res) => {

    // Need to grab username, description, file location, file original name

    const userSubmitting = req.body.user;
    const imageLocation = req.file.location;
    const imageDescription = req.body.description;
    const imageName = req.file.originalname.replace(/\.[^/.]+$/, "");
    console.log(userSubmitting, imageLocation, imageDescription, imageName);


    User.findOneAndUpdate({userName: userSubmitting}, {$push: {"items": {
        itemName: imageName,
        imageURL: imageLocation,
        timestamp: Date.now(),
        description: imageDescription 
    }}}, {safe: true, upsert: true, new: true}, function(err, model) {
        console.log(err);
    })

    // Book.findOneAndUpdate({ "_id": bookId }, { "$set": { "name": name, "genre": genre, "author": author, "similar": similar}}).exec(function(err, book){
    //     if(err) {
    //         console.log(err);
    //         res.status(500).send(err);
    //     } else {
    //              res.status(200).send(book);
    //     }
    //  });



    res.send();
})

app.listen(process.env.PORT || 5000, () => {
    console.log("Express server listening");
});