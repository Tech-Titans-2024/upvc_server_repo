const express = require('express');
const route = express.Router();
const Order = require('../models/Order');

// API to fetch product-wise report from confirmed orders
route.get('/product-report', async (req, res) => {
    try {
        // Fetch all confirmed orders
        const confirmedOrders = await Order.find({});

        // Aggregate product-wise data
        const productReport = {};

        confirmedOrders.forEach((order) => {
            order.product.forEach((item) => {
                const productKey = `${item.brand}-${item.product}-${item.type}-${item.variant}`;

                if (!productReport[productKey]) {
                    productReport[productKey] = {
                        brand: item.brand,
                        product: item.product,
                        type: item.type,
                        variant: item.variant,
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
        res.status(500).json({ message: 'Error fetching product report', error: err });
    }
});

module.exports = route;