const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// ------------------------------------------------------------------------------------------------------- //

require('dotenv').config();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL, methods: ['GET', 'POST', 'PUT', 'DELETE'], credentials: true, }))
app.use(express.json({ limit: '10mb' }));

// ------------------------------------------------------------------------------------------------------- //

// Table Imports 

const User = require('./models/User');
const Product = require('./models/Product');

// ------------------------------------------------------------------------------------------------------- //

// Route Imports 

const Login = require('./routes/Login');
const Quotation = require('./routes/Quotation');
const PriceList = require('./routes/PriceList');
const Order = require('./routes/Order');
const Customer = require('./routes/Customer');
const Sales = require('./routes/SalesExecutive');
const Manage = require('./routes/Manage');

// ------------------------------------------------------------------------------------------------------- //

// Route Usage

app.use('/api', Login);
app.use('/api', Quotation);
app.use('/api', PriceList);
app.use('/api', Customer);
app.use('/api', Sales);
app.use('/api', Order);
app.use('/api', Manage);

// ------------------------------------------------------------------------------------------------------- //

// Db Connection Check

const dbURI = process.env.DATABASE_URL;

if (!dbURI) { console.error('MongoDB URI is not defined in .env file!'); process.exit(1) }

mongoose.connect(dbURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB:', err));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => { console.log(`Server is running on port ${PORT}`) })

// ------------------------------------------------------------------------------------------------------- //
