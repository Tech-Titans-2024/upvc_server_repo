const express = require('express');
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');

const route = express.Router();

// Route to check if type_id exists
route.get('/check-typeid/:typeId', async (req, res) => {
    const { typeId } = req.params;
    try {
        const category = await Product.find({ type_id: typeId });
        res.json({ exists: category.length > 0 });
    } catch (error) {
        console.error('Error checking Type ID:', error);
        res.status(500).json({ message: 'Failed to check Type ID.', error: error.message });
    }
});

// Serve uploaded images
route.use('/product_images', express.static(path.join(__dirname, '..', 'product_images')));

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'product_images'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + file.originalname;
        cb(null, uniqueSuffix);
    },
});

// Multer instance with file type validation
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);
        if (extName && mimeType) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    },
});

// Route to handle image uploads for all products with the same type_id
route.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const { type_id } = req.body;
        if (!type_id) {
            return res.status(400).json({ message: 'Type ID is required.' });
        }

        const products = await Product.find({ type_id });
        if (products.length === 0) {
            return res.status(400).json({ message: 'Invalid Type ID. No products found.' });
        }

        const imagePath = `/product_images/${req.file.filename}`;

        await Product.updateMany({ type_id }, { $set: { image: imagePath } });

        res.status(200).json({
            message: 'Image uploaded and applied to all matching products!',
            imagePath,
            affectedProducts: products.length,
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Failed to upload file.', error: error.message });
    }
});

module.exports = route;
