const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const expressValidator = require('express-validator');

// const User = require('./models/User');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(expressValidator());
app.use(cors());


//variables used to access amazon cloud bucket
const BUCKET_NAME = 'barter-images';
const IAM_USER_KEY = 'AKIAIAIQOLFN765JL3CQ';
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
        bucket: 'barter-images',
        metadata: function (req, file, cb) {
            cb(null, Object.assign({}, req.body))
        }
    })
});

const DB_USER = 'admin';
const DB_PASSWORD = '9323Kenzie';
const DB_URI = 'ds219191.mlab.com:19191';
const dbName = 'barter-mac';

mongoose.connect(`mongodb://${DB_USER}:${DB_PASSWORD}@${DB_URI}/${dbName}`);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to the database');
});

const Schema = mongoose.Schema;


const userSchema = new Schema({
    userName: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    items: [{
        itemName: String,
        imageURL: String,
        timestamp: Number,
        description: String,
        comments: [{
            type: String
        }]
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
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            if (err) {
                res.send(err);
            } else {
                newUser.password = hash;

                newUser.save((err) => {
                    if (err) {
                        console.log(err)
                        res.send(JSON.stringify({ 'message': 'Username is already taken' }));
                    } else {
                        res.send(JSON.stringify({ 'message': 'you were successful' }));
                    }
                })
            }
        });
    })
})

app.post('/login', (req, response) => {
    let username = req.body.username;
    let password = req.body.password;

    User.find({ userName: username }, 'userName password', function (err, docs) {
        if (err) { response.send(err) }
        if (docs.length === 0) {
            response.send(JSON.stringify({ 'message': 'Wrong username or password' }))
        } else {
            bcrypt.compare(password, docs[0].password, (err, result) => {
                if (err) response.send(err);
                if (result) {
                    jwt.sign({ password: docs[0].password }, 'secretkey', (err, token) => {
                        if (err) { response.send(err);
                        } else {
                            response.send(JSON.stringify({ 'token': token, 'success': true }));
                        }
                    })
                }
            })
        }
    })
});

app.post('/upload', imageUpload.single('myFile'), (req, res) => {

    console.log(req.body.itemName);

    const userSubmitting = req.body.user;
    const imageLocation = req.file.location;
    const imageDescription = req.body.description;
    const imageName = req.file.originalname.replace(/\.[^/.]+$/, "");
    const itemName = req.body.itemName;


    User.findOneAndUpdate({ userName: userSubmitting }, {
        $push: {
            "items": {
                itemName,
                imageName: imageName,
                imageURL: imageLocation,
                timestamp: Date.now(),
                description: imageDescription
            }
        }
    }, { safe: true, upsert: true, new: true }, function (err, model) {
        console.log(err);
    })

    res.send();
})

app.get('/images', (req, res) => {

    User.find({}, 'userName items', (err, users) => {
        if (err) console.log(err);
        else { res.send(users); }
    })
})

app.post('/comment', (req, res) => {
    const itemsUser = req.body.itemsUser;
    const itemID = req.body.itemID;
    const comment = req.body.comment;

    User.findOne({
        userName: itemsUser,
        'items._id': req.body.itemID
    }).then((user) => {
        const item = user.items.find(((elem) => {
            return elem._id.toString() === itemID;
        }))
        item.comments.push(comment);
        user.save()
            .then(res.send(user))
    })
})

app.get('/', (req, res) => {
    res.send('hello');
})

app.listen(process.env.PORT || 5000, () => {
    console.log("Express server listening");
});
