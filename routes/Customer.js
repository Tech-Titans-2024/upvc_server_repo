const express = require('express');
const route = express.Router();
const Order = require('../models/Order');

// Fetch all customer details
route.get('/CustomerDetails', async (req, res) => {
  try {
    const fetchCustomer = await Order.find({}, { cus_name: 1, cus_contact: 1, cus_address: 1, _id: 1 });
    res.json(fetchCustomer);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error fetching customer details' });
  }
});

// Update customer details
route.put('/CustomerDetails/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { cus_name, cus_contact, cus_address } = req.body;
    const updatedCustomer = await Order.findByIdAndUpdate(
      id,
      { cus_name, cus_contact, cus_address },
      { new: true }
    );
    res.json(updatedCustomer);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error updating customer details' });
  }
});

// Delete customer details
route.delete('/CustomerDetails/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Order.findByIdAndDelete(id);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error deleting customer' });
  }
});

module.exports = route;