const express = require('express');
const route = express.Router();
const Product = require('../models/Product');
const User=require('../models/User')
route.get('/salespersons', async (req, res) => {
    try {
        const salesPerData = await User.find({

        })
        if (salesPerData) {
            res.json(salesPerData)
        }
        else {
            res.json({ "Message": "Not FOunt" })
        }
    } catch (err) {
        res.json({ "Message": "Not FOunt" })

    }
})


route.post("/salespersons", async (req, res) => {
    const { username, password, number, name, address } = req.body;

    // Validation
    if (!username || !password || !number || !name || !address) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // Create new salesperson
        const newUser = new User({
            username,
            password,
            number,
            name,
            address,
        });

        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add salesperson" });
    }
});



route.delete('/salespersons/:DeleteId', async (req, res) => {
    const { DeleteId } = req.params;
    
    try {
        const result = await User.findByIdAndDelete(DeleteId); // Assuming you're using Mongoose
        if (!result) {
            return res.status(404).json({ error: "Salesperson not found." });
        }
        res.status(200).json({ message: "Salesperson deleted successfully." });
    } catch (err) {
        console.error("ERROR ",err);
        res.status(500).json({ error: "Failed to delete salesperson." });
    }
});


route.put('/salespersons/:id', async (req, res) => {
    const { username,password, name, number, address } = req.body;

    // Validate fields
    if (!username ||!password || !name || !number || !address) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Ensure that you're using the correct model (e.g., SalesPerson)
        const updatedPerson = await User.findByIdAndUpdate(
            req.params.id, 
            { username,password,name, number, address }, 
            { new: true, runValidators: true } 
        );

        if (!updatedPerson) {
            return res.status(404).json({ error: "Salesperson not found" });
        }

        // Return the updated document
        res.status(200).json(updatedPerson);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update salesperson" });
    }
});
module.exports = route;