const express = require("express");
const router = express.Router();
const voucherController = require('../../src/controllers/manage/voucherController');
const Cart = require('../../src/models/Cart');
const Voucher = require("../../src/models/Voucher");

//voucher page
router.get('/voucher', voucherController.voucherPage);

//create-voucher page
router.get(`/voucher/new`, (req, res) => res.render('manage/voucher/create_voucher', {managerId: req.params.managerId}));

//crate a voucher
router.post(`/voucher/new`, voucherController.createVoucher);

//update-voucher page
router.get(`/voucher/:voucherId/update`, voucherController.renderUpdateVoucherPage);

//update a voucher
router.post(`/voucher/:voucherId/update`, voucherController.updateVoucher);

//delete voucher
router.post('/voucher/:voucherId/delete', voucherController.deleteVoucherController);

//route to page that displays all cart that using the voucher
router.get('/voucher/:voucherId/carts', async (req, res) => {
    try {
        const voucherId = req.params.voucherId;
        const voucher = await Voucher.findOne({_id: voucherId});
        // Find all carts that used the voucher
        const carts = await Cart.find({ voucherId, isPay: true, applyVoucher: true }); // Assuming you have a Cart model and a voucherId field
        res.render('manage/voucher/voucherCarts', { carts, voucher_name: voucher.code });
      } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
      }
})

module.exports = router;