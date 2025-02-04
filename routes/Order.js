const express = require('express');
const route = express.Router();
const Quotation = require('../models/Quotation');
const Order = require('../models/Order');

// ------------------------------------------------------------------------------------------------------- //

// To find Quotation and Confirmed Orders

route.post('/quotationsDetails', async (req, res) => {

    const { selectedStatus } = req.body;

    try {
        
        if(selectedStatus === 'Confirmed') {
            const quotations = await Order.find();
            res.json(quotations);
        }
        else {
            const orderqtns = await Order.find({}, 'quotation_no');
            const excludedQuotationNos = orderqtns.map(order => order.quotation_no);
            const quotations = await Quotation.find({
                quotation_no: { $nin: excludedQuotationNos }
            })
            res.json(quotations);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while Fetching Quotations.' });
    }
})

// ------------------------------------------------------------------------------------------------------- //

// Order Save

route.post('/orderConfirm', async (req, res) => {

    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).send('Order Confirmed successfully');
    } 
    catch (error) {
        res.status(500).send('Error confirming order');
    }
})

// ------------------------------------------------------------------------------------------------------- //


module.exports = route;