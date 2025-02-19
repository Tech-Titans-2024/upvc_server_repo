const express = require('express');
const route = express.Router();
const Product = require('../models/Product');

module.exports = route;

route.get('/pricelistdata', async (req, res) => {
    try {
        const priceData = await Product.find();
        res.json(priceData);
    } catch (err) {
        res.json("Error");
    }
})

//-----------------------------

route.put('/updateprice', async (req, res) => {
    const { changedData, price_id } = req.body;

    try {
        const updatedPrice = await Product.findOneAndUpdate(
            { price_id: price_id },
            { price: changedData.price },
            // { new: true }                    
        );
        if (updatedPrice) {
            res.json({ message: "Price Updated Successfully", updatedPrice });
        } else {
            res.status(404).json({ message: "Price ID not found" });
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
//-------------------

route.put('/deleteprice', async (req, res) => {
    const { DeleteId } = req.body;
    // console.log(DeleteId)
    try {
        const destroyPrice = await Product.deleteOne({ price_id: DeleteId })
        if (destroyPrice) {
            res.json({ "message": "success" })
        }
    } catch (err) {
        res.json({ "message": "Delete Failed" })
    }
})