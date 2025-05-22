const express = require('express');
const route = express.Router();
const Quotation = require('../models/Quotation');
const Order = require('../models/Order');

// ------------------------------------------------------------------------------------------------------- //

// To find Quotation and Confirmed Orders

route.post('/quotationsDetails', async (req, res) => {

    const { selectedStatus } = req.body;

    try {

        if (selectedStatus === 'Confirmed') {
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

// API to fetch product-wise report from confirmed orders

route.get('/product-report', async (req, res) => {

    try {
        const confirmedOrders = await Order.find({});
        const productReport = {};

        confirmedOrders.forEach((order) => {
            order.product.forEach((item) => {
                const productKey = `${item.brand}-${item.product}-${item.type}-${item.variant}-${item.subVariant}`;
                if (!productReport[productKey]) {
                    productReport[productKey] = {
                        brand: item.brand, product: item.product, type: item.type, variant: item.variant,
                        subVariant: item.subVariant, totalQuantity: 0, totalSales: 0,
                    }
                }
                productReport[productKey].totalQuantity += item.quantity;
                productReport[productKey].totalSales += item.totalcost;
            });
        });

        const reportArray = Object.keys(productReport).map((key) => ({ ...productReport[key] }));
        res.status(200).json(reportArray);
    } 
    catch (err) {
        console.error('Error fetching product report:', err);
        res.status(500).json({ message: 'Error fetching product report', error: err });
    }
})

// ------------------------------------------------------------------------------------------------------- //

// API to fetch sales-wise report from confirmed orders

route.get('/sales-report', async (req, res) => {

    try {
        const confirmedOrders = await Order.find({});
        const salesReport = {};
        confirmedOrders.forEach((order) => {
            const salesKey = `${order.sales_person}-${order.date}`;
            if (!salesReport[salesKey]) {
                salesReport[salesKey] = {
                    sales_person: order.sales_person,
                    date: order.date, totalOrders: 0,
                    totalSales: 0,
                }
            }
            salesReport[salesKey].totalOrders += 1;
            salesReport[salesKey].totalSales += order.gTotal;
        })

        const reportArray = Object.keys(salesReport).map((key) => ({ ...salesReport[key] }))
        res.status(200).json(reportArray);
    } 
    catch (err) {
        console.error('Error fetching sales report:', err);
        res.status(500).json({ message: 'Error fetching sales report', error: err });
    }
})

// ------------------------------------------------------------------------------------------------------- //

// API to fetch confirmed orders

route.get('/confirmed-orders', async (req, res) => {

    try {

        const confirmedOrders = await Order.find({ status: 'confirmed' });
        const formattedOrders = confirmedOrders.map(order => ({
            orderId: order._id, date: order.date, 
            customerName: order.cus_name,
            totalQuantity: order.product.reduce((sum, item) => sum + item.quantity, 0),
            totalSales: order.product.reduce((sum, item) => sum + item.totalcost, 0),
        }))
        res.status(200).json(formattedOrders);
    } 
    catch (err) {
        console.error('Error fetching confirmed orders:', err);
        res.status(500).json({ message: 'Error fetching confirmed orders', error: err });
    }
})

// ------------------------------------------------------------------------------------------------------- //

route.post('/editsaveqtn', async (req, res) => {
    const { position, formData, quotationNo } = req.body;

    try {
        const quotation = await Quotation.findOne({ quotation_no: quotationNo });

        if (!quotation) {
            return res.status(404).json({ message: "Quotation not found." });
        }

        // Update the product at the given position
        quotation.product[position] = formData;

        // Recalculate netTotal from all products
        const netTotal = quotation.product.reduce(
            (acc, item) => acc + (parseFloat(item.totalcost) || 0),
            0
        );

        // Initialize tax values
        let cgst = 0, sgst = 0, igst = 0;

        // Tax calculation based on state
        if (quotation.cus_state === 'Tamil Nadu') {
            // Intra-state: CGST + SGST
            cgst = parseFloat((netTotal * 9 / 100).toFixed(2));
            sgst = parseFloat((netTotal * 9 / 100).toFixed(2));
            igst = 0;
        } else {
            // Other states: Custom logic - CGST + IGST
            cgst = parseFloat((netTotal * 9 / 100).toFixed(2));
            igst = parseFloat((netTotal * 9 / 100).toFixed(2));
            sgst = 0;
        }

        const tp_cost = parseFloat(quotation.tp_cost || 0);
        const gTotal = parseFloat((netTotal + cgst + sgst + igst + tp_cost).toFixed(2));

        // Save updated totals
        quotation.netTotal = netTotal;
        quotation.cgst = cgst;
        quotation.sgst = sgst;
        quotation.igst = igst;
        quotation.gTotal = gTotal;

        await quotation.save();

        return res.json({
            message: "Product updated and quotation totals recalculated successfully",
            updatedProduct: quotation.product[position],
            updatedQuotation: quotation
        });

    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "An error occurred while updating the product." });
    }
});



// ------------------------------------------------------------------------------------------------------- //

route.post('/deleteQuotation', async (req, res) => {

    const { deleteId } = req.body;

    try {
        const deleteQuotation = await Quotation.findOneAndDelete({ quotation_no: deleteId });
        if (deleteQuotation) { res.status(200).json({ message: "Quotation successfully deleted" }) } 
        else { res.status(404).json({ message: "Quotation not found or invalid" }) }
    } 
    catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "An error occurred while deleting the quotation." });
    }
})

// ------------------------------------------------------------------------------------------------------- //

route.post('/getqoutationcost', async (req, res) => {

    const { quotationNo } = req.body;

    if (!quotationNo) { return res.status(400).json({ error: "Quotation number is required" }) }

    try {
        const getcost = await Quotation.findOne({ quotation_no: quotationNo });
        if (!getcost) { return res.status(404).json({ error: "Quotation not found" })  }
        res.status(200).json(getcost);
    } 
    catch (e) {
        console.error("Error fetching cost:", e);
        res.status(500).json({ error: "Internal server error" });
    }
})

// ------------------------------------------------------------------------------------------------------- //

// To View the Details in Order Processing

route.post('/viewQtn', async (req, res) => {
    const { qtnId } = req.body;
    try { const qtnData = await Quotation.findOne({ quotation_no: qtnId }); res.json(qtnData) }
    catch (err) { }
})



// delete

route.post('/deleteProduct', async (req, res) => {
    try {
        let { quotation_no, index } = req.body;

        quotation_no = Number(quotation_no);
        index = parseInt(index);

        if (isNaN(quotation_no) || isNaN(index)) {
            return res.status(400).json({ message: 'Invalid quotation_no or index' });
        }

        const quotation = await Quotation.findOne({ quotation_no });

        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }

        if (index < 0 || index >= quotation.product.length) {
            return res.status(400).json({ message: 'Invalid product index' });
        }

        // Remove the product from the array
        quotation.product.splice(index, 1);

        // Recalculate netTotal
        const netTotal = quotation.product.reduce(
            (acc, prod) => acc + (prod.totalcost || 0),
            0
        );

        // Default tax values
        let cgst = 0, sgst = 0, igst = 0;

        // Recalculate taxes based on state
        if (quotation.cus_state === 'Tamil Nadu') {
            cgst = parseFloat((netTotal * 9) / 100);
            sgst = parseFloat((netTotal * 9) / 100);
        } else {
            cgst = parseFloat((netTotal * 9) / 100);
            igst = parseFloat((netTotal * 9) / 100);
        }

        // If no products, reset tp_cost
        let tp_cost = quotation.product.length === 0 ? 0 : quotation.tp_cost || 0;

        // Recalculate grand total
        const gTotal = parseFloat(netTotal + cgst + sgst + igst + tp_cost);

        // Update values in document
        quotation.netTotal = netTotal;
        quotation.cgst = cgst;
        quotation.sgst = sgst;
        quotation.igst = igst;
        quotation.tp_cost = tp_cost;
        quotation.gTotal = gTotal;

        await quotation.save();

        return res.status(200).json({
            message: 'Product deleted and totals updated successfully',
            updatedQuotation: quotation,
        });

    } catch (err) {
        console.error('Error deleting product:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = route;