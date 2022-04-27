const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
mongoose.connect('mongodb+srv://tstilson:oeftGhUuQm47g7Qs@cluster0.nbqzb.mongodb.net/InsulinCalc?retryWrites=true&w=majority');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "please include your first name..."]},
    lastName: {
        type: String,
        required: [true, "please include your last name"]
    },
    email: {
        type: String,
        required: [true, "please include your email"]},
    encryptedPassword: {
        type: String,
        required: [true, "please include a password..."]},
    targetBS: {
        type: Number,
        required: [true, "please include your target Blood Sugar"]},
    InsulinCR: {
        type: String,
        required: [true, "please include your insulin to car ratio"]},
    CarbF: {
        type: Number,
        requited: [true, "please include your Carb Factor"]},
    doseUnit: {
        type: Number,
        required: [true, "please include the amount of your unit dosage"]},
});
userSchema.methods.setEncryptedPassword = function(myPlainPassword) {
    let promise = new Promise((resolve, reject)=> {
        bcrypt.hash(myPlainPassword, 12).then((hash) => {
            this.encryptedPassword = hash;
            resolve();
        });
    });
    return promise;
};

userSchema.methods.verifyPassword = function(myPlainPassword){
    let promise = new Promise((resolve, reject) => {
        bcrypt.compare(myPlainPassword, this.encryptedPassword).then(result => {
            resolve(result);
        });
    });
    return promise;
};

const Profile = mongoose.model('Profile', userSchema);

module.exports = {
    Profile:Profile
}
