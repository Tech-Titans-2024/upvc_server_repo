const express = require('express');
const route = express.Router();
const User = require('../models/User');
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

    try {
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

// To fetch Price and Image

route.post('/pricelist', async (req, res) => {

    const { height, width, selectedProduct, selectedType, selectedVariant, brand } = req.body;
    console.log(height, width, selectedProduct, selectedType, selectedVariant, brand)

    try {

        const category_data = await Product.findOne({
            variant: selectedVariant, width: width, height: height,
            brand: brand, product: selectedProduct, type: selectedType
        })

        if (category_data) { const { price, image } = category_data; res.json({ data: price, image: image  }) }
        else {
            const defaultPrice = 399;
            const defaultImage = '';
            res.json({ data: defaultPrice, image: defaultImage });
        }
        console.log(category_data)
    }
    catch (error) {
        console.error('Error fetching Price List:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// ------------------------------------------------------------------------------------------------------- //

// To Fetch Sales Man Details

route.get('/salesManDetails', async (req, res) => {

    try {
        const salesPerData = await User.find({});
        if (salesPerData && salesPerData.length > 0) { res.json(salesPerData) } 
        else { res.json({ "Message": "Not Found" })}
    } 
    catch (err) {
        console.error(err);
        res.status(500).json({ "Message": "An error occurred", "Error": err.message });
    }
})

// ------------------------------------------------------------------------------------------------------- //

module.exports = route;