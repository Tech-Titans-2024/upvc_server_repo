const express = require('express');
const route = express.Router();
const Product = require('../models/Product');

// ------------------------------------------------------------------------------------------------------- //

// To Fetch Price List Data

route.get('/pricelistdata', async (req, res) => {
    try {
        const priceData = await Product.find();
        res.json(priceData);
    } 
    catch (err) { res.json("Error in Find Pricelist Data : ", err) }
})

// ------------------------------------------------------------------------------------------------------- //

// To Update Price List Data

route.put('/updateprice', async (req, res) => {

    const { changedData, price_id } = req.body;

    try {
        const updatedPrice = await Product.findOneAndUpdate(
            { price_id: price_id },
            { price: changedData.price },
        )
        if (updatedPrice) { res.json({ message: "Price Updated Successfully", updatedPrice }) } 
        else { res.status(404).json({ message: "Price ID not found" }) }
    } 
    catch (err) {
        console.error("Error : ", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ------------------------------------------------------------------------------------------------------- //

// To Delete Price List Data

route.put('/deleteprice', async (req, res) => {

    const { DeleteId } = req.body;

    try {
        const destroyPrice = await Product.deleteOne({ price_id: DeleteId })
        if (destroyPrice) { res.json({ "message": "Success" }) }
    } 
    catch (err) { res.json({ "message": "Delete Failed" }) }
})

module.exports = route;