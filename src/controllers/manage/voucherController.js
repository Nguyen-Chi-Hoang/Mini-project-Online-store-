const voucherservice = require("../../services/manage/voucherService");

const voucherPage = async (req,res) => {
    try {
        voucherservice.voucherPage(req, res);
    } catch(err) {
        req.status(400).json({message:err.message});
    }
}

const createVoucher = async (req, res) => {
    try {
        voucherservice.createVoucher(req, res);
    } catch(err) {
        req.status(400).json({message:err.message});
    }
}

const renderUpdateVoucherPage = async (req, res) => {
    try {
        voucherservice.renderUpdateVoucherPage(req, res);
    } catch(err) {
        req.status(400).json({message:err.message});
    }
}

const updateVoucher = async (req, res) => {
    try {
        voucherservice.updateVoucher(req, res);
    } catch (error) {
        req.status(400).json({message:err.message});
    }
}

const deleteVoucherController = async (req, res) => {
    try {
        voucherservice.deleteVoucherService(req, res);
    } catch (error) {
        req.status(400).json({message:err.message});
    }
}

module.exports = {
    voucherPage,
    createVoucher,
    updateVoucher,
    renderUpdateVoucherPage,
    deleteVoucherController
}