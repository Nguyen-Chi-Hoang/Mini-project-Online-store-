//mongodb UserVerification model
const UserVerification = require("../models/UserVerification");
const User = require("../models/User");
const Manager = require("../models/Manager");

//email hander
const nodemailer = require("nodemailer");

//env variables
require("dotenv").config();

//nodemailer stuff
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    },
});

//send verification email
async function sendVerificationEmail(_id, email, db) {
    //mail options
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verify your email",
        html: `<p>Verify your email address to complete the signup and login into your account .</p>
        <p>This lin kexpires in 6 hours</b>.</p><p>Press <a href= ${"http://localhost:5000/verify/" + _id + "/" + db.collection.name}>here</a> to proceed. </p>`,
    };
    const newVerification = new UserVerification({
        userId: _id,
        createdAt: Date.now(),
    });
    newVerification
    .save()
    .then(await transporter.sendMail(mailOptions))
};

//verify email
async function verifyEmail(data, db) {
    let userId = data;
    let database = db === "managers" ? Manager : User;
    
    UserVerification
        .find({userId})
        .then((result) => {
            if(result.length>0) {
                database.updateOne({_id: userId}, {verified: true})
                .then(() => {
                    UserVerification
                        .deleteOne({userId})
                        .then(() => {
                            console.log("email verified!");
                        })
                        .catch(error => {
                            console.log(error);
                        })
                })
                .catch(error => {
                    console.log(error);
                })
            } else {
                //user verification record doesn't exist
                let message = "Account record doesn't exist or has been verified already. Please sign up or log in.";
                console.log(message);
            }
        })
        .catch((error) => {
            console.log(error);
            let message = "An error occured while checking for existing user verification record";
            console.log(message);
        })
}

module.exports = {
    sendVerificationEmail,
    verifyEmail
};