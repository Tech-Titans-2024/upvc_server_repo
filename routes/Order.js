const express = require('express');
const route = express.Router();
const Quotation = require('../models/Quotation');
const Order = require('../models/Order');

// ------------------------------------------------------------------------------------------------------- //

// To find Quotation and Confirmed Orders

route.post('/quotationsDetails', async (req, res) => {

    const {selectedStatus} = req.body;

    try {

        if (selectedStatus === 'Confirmed') {
            const quotations = await Order.find();
            res.json(quotations);
        }
        else {
            const orderqtns = await Order.find({}, 'quotation_no');
            const excludedQuotationNos = orderqtns.map(order => order.quotation_no);
            const quotations = await Quotation.find({
                quotation_no: {$nin: excludedQuotationNos}
            })
            res.json(quotations);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error: 'An error occurred while Fetching Quotations.'});
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

// API to fetch product-wise report from confirmed orders
route.get('/product-report', async (req, res) => {
    try {
        // Fetch all confirmed orders
        const confirmedOrders = await Order.find({});

        // Aggregate product-wise data
        const productReport = {};

        confirmedOrders.forEach((order) => {
            order.product.forEach((item) => {
                const productKey = `${item.brand}-${item.product}-${item.type}-${item.variant}-${item.subVariant}`;

                if (!productReport[productKey]) {
                    productReport[productKey] = {
                        brand: item.brand,
                        product: item.product,
                        type: item.type,
                        variant: item.variant,
                        subVariant: item.subVariant,
                        totalQuantity: 0,
                        totalSales: 0,
                    };
                }

                productReport[productKey].totalQuantity += item.quantity;
                productReport[productKey].totalSales += item.totalcost;
            });
        });

        // Convert the report object to an array
        const reportArray = Object.keys(productReport).map((key) => ({
            ...productReport[key],
        }));

        res.status(200).json(reportArray);
    } catch (err) {
        console.error('Error fetching product report:', err);
        res.status(500).json({message: 'Error fetching product report', error: err});
    }
});

module.exports = route;

// API to fetch sales-wise report from confirmed orders
route.get('/sales-report', async (req, res) => {
    try {
        // Fetch all confirmed orders
        const confirmedOrders = await Order.find({});

        // Aggregate sales-wise data
        const salesReport = {};

        confirmedOrders.forEach((order) => {
            const salesKey = `${order.sales_person}-${order.date}`;

            if (!salesReport[salesKey]) {
                salesReport[salesKey] = {
                    sales_person: order.sales_person,
                    date: order.date,
                    totalOrders: 0,
                    totalSales: 0,
                };
            }

            salesReport[salesKey].totalOrders += 1;
            salesReport[salesKey].totalSales += order.gTotal; // Use gTotal (grand total) for sales
        });

        // Convert the report object to an array
        const reportArray = Object.keys(salesReport).map((key) => ({
            ...salesReport[key],
        }));

        res.status(200).json(reportArray);
    } catch (err) {
        console.error('Error fetching sales report:', err);
        res.status(500).json({message: 'Error fetching sales report', error: err});
    }
});

module.exports = route;

// API to fetch confirmed orders
route.get('/confirmed-orders', async (req, res) => {
    try {
        // Fetch all confirmed orders
        const confirmedOrders = await Order.find({status: 'confirmed'});

        // Format the orders for the report
        const formattedOrders = confirmedOrders.map(order => ({
            orderId: order._id,
            date: order.date, // Ensure this is in YYYY-MM-DD format
            customerName: order.cus_name,
            totalQuantity: order.product.reduce((sum, item) => sum + item.quantity, 0),
            totalSales: order.product.reduce((sum, item) => sum + item.totalcost, 0),
        }));

        res.status(200).json(formattedOrders);
    } catch (err) {
        console.error('Error fetching confirmed orders:', err);
        res.status(500).json({message: 'Error fetching confirmed orders', error: err});
    }
});

///-----------------------------------


route.post('/editsaveqtn', async (req, res) => {
    // const {formData, quotationNo, position} = req.body;
    try {
        const {position, formData,quotationNo} = req.body; 

        const updatedQuotation = await Quotation.findOneAndUpdate(
            {
                quotation_no: quotationNo
            },
            {
                $set: {[`product.${position}`]: formData}
            },
            {new: true} // Returns the updated document
        );

        if (updatedQuotation) {
            // console.log("Updated Product:", updatedQuotation.product[position]);
            res.json({message: "Product updated successfully", updatedProduct: updatedQuotation.product[position]});
        } else {
            // console.log("Quotation not found or position is invalid.");
            res.status(404).json({message: "Quotation not found or invalid position."});
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({message: "An error occurred while updating the product."});
    }


})


//----------------------------------


route.post('/deleteQuotation', async (req,res)=>{
    const {deleteId}=req.body;
    console.log("ID",deleteId)
    try{
        const deleteQuotation=await Quotation.findOneAndDelete({quotation_no:deleteId})
        if(deleteQuotation){
            res.status(200).json({message:"Quotation successfully"})
            console.log("SUCCES");
            
        }
        else{
            res.status(404).json({message: "Quotation not found or invalid"});
        }
        
    }
    catch (err) {
        console.error("Error:", err);
        res.status(500).json({message: "An error occurred while delete the Quotation."});
    }
})
module.exports = route;