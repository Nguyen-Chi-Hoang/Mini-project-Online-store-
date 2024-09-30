const managerService = require('../../services/manage/managerSerevice');

//login
const loginManager = async (req, res) => {
    try {
       await managerService.loginManager(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
};

//create Manager
const registerManager = async (req, res) => {
    try {
        await managerService.createManager(req, res);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

module.exports = {
    loginManager,
    registerManager
}