const emailverifyService = require('../services/emailverifyService');

const verifyE = async (req, res) => {
    try {
        await emailverifyService.verifyEmail(req.params.userId, req.params.db);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

const sendMessage = async (req, res) => {
    try {
        await emailverifyService.sendVerificationEmail(req.body);
    } catch(err) {
        res.send({message: err.message});
    }
}

module.exports = {
    verifyE,
    sendMessage
};
//router.get("/verify/:userId", (req, res) =>