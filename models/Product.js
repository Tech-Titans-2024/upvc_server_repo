const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
{
    brand       : { type: String, required: true },
    pro_id      : { type: Number, required: true },
    product     : { type: String, required: true },
    type_id     : { type: Number },
    type        : { type: String },
    variant_id  : { type: Number, required: true },
    variant     : { type: String, required: true },
    price_id    : { type: Number, required: true },
    width       : { type: Number, required: true },
    height      : { type: Number, required: true },
    price       : { type: Number, required: true },
    image       : { type: String, required: true },
})

const Product = mongoose.model('Product', productSchema);

module.exports = Product;