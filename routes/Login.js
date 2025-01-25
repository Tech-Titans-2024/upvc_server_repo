const express = require('express');
const route = express.Router();
const User = require('../models/User');

// ------------------------------------------------------------------------------------------------------- //

// To Login 

route.post('/login', async (req, res) => {

    const { username, password } = req.body;

    try 
    {
        const user = await User.findOne({ username });
        if (user) 
        {
            if (user.password === password) { return res.json({ success: true, message: "Login Successful" }) }
            else { return res.json({ success: false, message: "Invalid Password" }) }
        }
        else {
            return res.json({ success: false, message: "User Not Found" });
        }
    }
    catch (error) {
        console.error('Error during Login:', error);
        res.status(500).json({ message: "Internal Server Error." });
    }
})

module.exports = route;