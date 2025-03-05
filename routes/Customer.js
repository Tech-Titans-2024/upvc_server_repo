const express = require('express');
const route = express.Router();
const Order = require('../models/Order')


route.get('/CustomerDetails', async(req, res)=>{
    try{
        const fetchCustomer = await Order.find();
        console.log(fetchCustomer)
        res.json(fetchCustomer)

    }
    catch(error){
        console.log(error)
    }
})
module.exports = route;