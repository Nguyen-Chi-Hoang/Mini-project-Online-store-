const Flashsale = require('../../models/Flashsale');
const Item = require('../../models/Item');
const Category = require('../../models/Category');
const flashsaleService = require('../../services/manage/flashsaleService');

const flashsalePageController = async (req, res) => {
    try {
        flashsaleService.flashsalePageController(req, res);
    } catch(err) {
        req.status(400).json({message: err.message});
    }
}

const renderCreateflashsalePageController = async (req, res) => {
    try {
        flashsaleService.renderCreateflashsalePageController(req, res);
    } catch(err) {
        req.status(400).json({message: err.message});
    }
}

const createflashsaleController = async (req, res) => {
    try {
        flashsaleService.createflashsaleController(req, res);
    } catch(err) {
        req.status(400).json({message: err.message});
    }
}

const renderUpdateflashsalePageController = async (req, res) => {
    try {
        flashsaleService.renderUpdateflashsalePageController(req, res);
    } catch(err) {
        req.status(400).json({message: err.message});
    }
}

const updateflashsaleController = async (req, res) => {
    try {
        flashsaleService.updateflashsaleController(req, res);
    } catch(err) {
        req.status(400).json({message: err.message});
    }
}

const deleteflashsaleController = async (req, res) => {
    try {
        flashsaleService.deleteflashsaleController(req, res);
    } catch(err) {
        req.status(400).json({message: err.message});
    }
}

module.exports = {
    flashsalePageController,
    renderCreateflashsalePageController,
    createflashsaleController,
    renderUpdateflashsalePageController,
    updateflashsaleController,
    deleteflashsaleController
}