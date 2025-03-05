const express = require('express');
const route = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Quotation = require('../models/Quotation');

// ------------------------------------------------------------------------------------------------------- //

// Fetch Types of Doors and Windows

route.get('/doorTypes', async (req, res) => {

    try {
        const productTypes = await Product.find({product: 'Door'}, 'type');
        const uniqueProductTypes = [...new Set(productTypes.map((type) => type.type))];
        res.json(uniqueProductTypes);
    }
    catch (error) {
        console.error("Error fetching Door Types : ", error);
        res.status(500).json({message: 'Internal Server Error'});
    }
})

route.get('/windowTypes', async (req, res) => {

    try {
        const productTypes = await Product.find({product: 'Window'}, 'type');
        const uniqueProductTypes = [...new Set(productTypes.map((type) => type.type))];
        res.json(uniqueProductTypes);
    }
    catch (error) {
        console.error("Error fetching Window Types : ", error);
        res.status(500).json({message: 'Internal Server Error'});
    }
})

// ------------------------------------------------------------------------------------------------------- //

// Fetch Varients for Door, Window

route.post('/variantTypes', async (req, res) => {

    const {selected_type, selected_category} = req.body;

    try {
        let uniqueProductVariants = [];
        if (selected_category === 'Door') {
            const varientTypes = await Product.find({type: selected_type}, 'variant');
            uniqueProductVariants = [...new Set(varientTypes.map((variant) => variant.variant))];
        }
        else if (selected_category === 'Window') {
            const varientTypes = await Product.find({type: selected_type}, 'variant');
            uniqueProductVariants = [...new Set(varientTypes.map((variant) => variant.variant))];
        }
        res.json(uniqueProductVariants);
    }
    catch (error) {
        console.error("Error fetching Varient Types: ", error);
        res.status(500).json({message: 'Internal Server Error'});
    }
})

// ------------------------------------------------------------------------------------------------------- //

// Fetch Varients for Louvers

route.get('/louverVariants', async (req, res) => {

    try {
        const productVariants = await Product.find({product: 'Louver'}, 'variant');
        const uniqueProductVariants = [...new Set(productVariants.map((variant) => variant.variant))];
        res.json(uniqueProductVariants);
    }
    catch (error) {
        console.error("Error fetching Louver Types : ", error);
        res.status(500).json({message: 'Internal Server Error'});
    }
})

// ------------------------------------------------------------------------------------------------------- //

// To fetch Price and Image

route.post('/pricelist', async (req, res) => {

    const {height, width, selectedProduct, selectedType, selectedVariant, brand} = req.body;

    try {
        const category_data = await Product.findOne({
            variant: selectedVariant, width: width, height: height,
            brand: brand, product: selectedProduct, type: selectedType
        })
        if (category_data) {const {price, image} = category_data; res.json({data: price, image: image})}
        else {const defaultPrice = 399; const defaultImage = ''; res.json({data: defaultPrice, image: defaultImage})}
    }
    catch (error) {
        console.error('Error fetching Price List:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

// ------------------------------------------------------------------------------------------------------- //

// To Fetch Sales Man Details

route.get('/salesManDetails', async (req, res) => {

    try {
        const salesPerData = await User.find({});
        if (salesPerData && salesPerData.length > 0) {res.json(salesPerData)}
        else {res.json({"Message": "Not Found"})}
    }
    catch (err) {
        console.error(err);
        res.status(500).json({"Message": "An error occurred", "Error": err.message});
    }
})

// ------------------------------------------------------------------------------------------------------- //

// To Save Quotation

route.post('/quotationSave', async (req, res) => {

    const {data} = req.body;

    try {

        const {customer, savedData} = data
        const newQuotation = new Quotation({
            quotation_no: customer.quotationNo, sales_person: customer.salesPerson,
            cus_name: customer.cusName, cus_address: customer.cusAddress,
            cus_contact: customer.cusContact, cus_state: customer.cusState, date: customer.date,
            netTotal: customer.netTotal, cgst: customer.cgst, sgst: customer.sgst,
            igst: customer.igst, tp_cost: customer.tpcost, gTotal: customer.gTotal,
            product: savedData.map(item => ({
                brand: item.brand, product: item.product, type: item.type,
                variant: item.variant, mesh: item.mesh, frame: item.frame,
                lock: item.lock, width: item.width, height: item.height,
                feet: item.feet, area: item.area, price: item.price,
                quantity: item.quantity, totalqtyprice: item.totalqtyprice,
                glass: item.glass, thickness: item.thickness, color: item.color,
                adcost: item.adcost, totalcost: item.totalcost, image: item.image
            }))
        })
        await newQuotation.save();
        res.status(200).json({message: "Quotation saved successfully", quotation: newQuotation})
    }
    catch (error) {
        console.error("Error saving quotation:", error);
        res.status(500).json({message: "Internal server error", error});
    }
})

// ------------------------------------------------------------------------------------------------------- //

// Quotation No

route.get('/quotationNo', async (req, res) => {

    try {

        const result = await Quotation.aggregate([
            {$group: {_id: null, maxQuotationNo: {$max: "$quotation_no"}}},
            {$project: {_id: 0, maxQuotationNo: 1}}
        ])
        if (result.length > 0) {res.json(result[0].maxQuotationNo)}
        else {res.json("Q_0")}
    }
    catch (err) {
        console.error("Error fetching max quotation number:", err);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = route;