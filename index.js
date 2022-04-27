const express = require('express')
const app = express()
const port = process.env.PORT || 1234
const cors = require('cors')
const model = require('./model')
const Profile = model.Profile;

const session = require('express-session');
const passport = require('passport');
const passportLocal = require('passport-local');

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}))
app.use(cors())

app.use(session({ secret: 'hlaf87sy4tliaeruhfd8c9', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new passportLocal.Strategy({
    usernameField: 'email',
    passwordField: 'plainPassword'
}, function (email, plainPassword, done){
    Profile.findOne({
        email: email
    }).then(function (user){
        if (user) {
            user.verifyPassword(plainPassword).then(function(result) {
                if (result){
                    done(null, user);
                } else {
                    done(null, false);
                }
            });
        } else {
            done(null, false);
        }
    }).catch(function (err){
        done(err);
    });
}));

passport.serializeUser(function (user, done){
    done(null, user._id);
});

passport.deserializeUser(function (userId, done){
    Profile.findOne({ _id: userId}).then(function(user){
        done(null, user);
    }).catch(function(err){
        done(err);
    });
});

app.post('/session', passport.authenticate('local'), function(req,res){
    res.sendStatus(201);
});

app.get('/session', function(req,res) {
    if(req.user){
        res.json(req.user);
    } else {
        res.sendStatus(401);
    }
});


app.delete('/session', function (req, res) {
    req.logout();
    res.sendStatus(204);
});


app.get('/users', (req, res) => {
    Profile.find().then((Profiles) => {
        res.send(Profiles);
    });
});

app.get('/users/:userID', (req, res) =>{
    Profile.findOne({
        _id: req.params.userId
    }).then((profile) => {
        res.json(profile)
    });
});

app.get('/users/:email', (req, res) => {
    Profile.findOne({
        email: req.params.email
    }).then((profile) => {
        console.log("server profile: ", profile);
        res.json(profile)
    }).catch((error) => {
        console.log(error);
    });
});

app.post('/users', (req, res) => {
    console.log("raw request body: ", req.body);

    const profile = new Profile({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        targetBS: req.body.targetBS,
        InsulinCR: req.body.InsulinCR,
        CarbF: req.body.CarbF,
        doseUnit: req.body.doseUnit
    });
    profile.setEncryptedPassword(req.body.password).then(function(){
        Profile.findOne({
            email: req.body.email
        }).then((Usr) => {
            console.log(Usr);
            if(Usr){
                res.status(422).json("email already taken");
            }
            else {
                profile.save().then(() => {
                    res.status(201).send("created");
                }).catch((error)=> {
                    console.error("error occurred while creating a pet", error);
                    if(error.errors){
                        let errorMessages = {};
                        for (let e in error.errors){
                            errorMessages[e] = error.errors[e].message;
                        }
                        res.status(422).json(errorMessages);
                    } else{
                        res.status(500).send("server error");
                    }
                });
            }
        });
        
    });
});

app.put('/users/:userId', (req, res) => {
    const profile = new Profile({
        _id: req.params.userId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        targetBS: req.body.targetBS,
        InsulinCR: req.body.InsulinCR,
        CarbF: req.body.CarbF,
        doseUnit: req.body.doseUnit
    });
    Profile.updateOne({_id: req.params.userId}, profile).then(() => {
        res.status(201).send("profile successfully updated");
    }).catch((error) => {
        res.status(400).json({
            error:error,
        });
    });
});

app.delete('/users/:userId', (req, res) => {
    Profile.findOne({
        _id: req.params.userId
    }).then((profile) => {
        if (profile) {
            Profile.deleteOne({
                _id: req.params.userId
            }).then(() => {
                res.sendStatus(204);
            });
        } else {
            res.sendStatus(404);
        }
    }).catch(error => {
        console.log("Db queary failed: ", error);
        res.sendStatus(400);
    });
});

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
})
