const express = require('express');
const route = express.Router();
const Product = require('../models/Product');

// ------------------------------------------------------------------------------------------------------- //

// Fetch Types of Doors and Windows

route.get('/doorTypes', async (req, res) => {

    try {
        const productTypes = await Product.find({ product: 'Door' }, 'type');
        const uniqueProductTypes = [...new Set(productTypes.map((type) => type.type))];
        res.json(uniqueProductTypes);
    }
    catch (error) {
        console.error("Error fetching Door Types : ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

route.get('/windowTypes', async (req, res) => {

    try {
        const productTypes = await Product.find({ product: 'Window' }, 'type');
        const uniqueProductTypes = [...new Set(productTypes.map((type) => type.type))];
        res.json(uniqueProductTypes);
    }
    catch (error) {
        console.error("Error fetching Window Types : ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

// ------------------------------------------------------------------------------------------------------- //

// Fetch Varients for Door, Window

route.post('/variantTypes', async (req, res) => {

    const { selected_type, selected_category } = req.body;

    try 
    {
        let uniqueProductVariants = [];
        if (selected_category === 'Door') {
            const varientTypes = await Product.find({ type: selected_type }, 'variant');
            uniqueProductVariants = [...new Set(varientTypes.map((variant) => variant.variant))];
        }
        else if (selected_category === 'Window') {
            const varientTypes = await Product.find({ type: selected_type }, 'variant');
            uniqueProductVariants = [...new Set(varientTypes.map((variant) => variant.variant))];
        }
        res.json(uniqueProductVariants);
    }
    catch (error) {
        console.error("Error fetching Varient Types: ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

// ------------------------------------------------------------------------------------------------------- //

// Fetch Varients for Louvers

route.get('/louverVariants', async (req, res) => {

    try {
        const productVariants = await Product.find({ product: 'Louver' }, 'variant');
        const uniqueProductVariants = [...new Set(productVariants.map((variant) => variant.variant))];
        res.json(uniqueProductVariants);
    }
    catch (error) {
        console.error("Error fetching Louver Types : ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

// ------------------------------------------------------------------------------------------------------- //

module.exports = route;