const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        quotation_no: { type: String, required: true },
        sales_person: { type: String },
        cus_name: { type: String },
        cus_address: { type: String },
        cus_contact: { type: String },
        cus_state: { type: String },
        date: { type: String },
        netTotal: { type: Number },
        cgst: { type: Number },
        sgst: { type: Number },
        igst: { type: Number },
        tp_cost: { type: Number },
        gTotal: { type: Number },
        product: [
            {
                brand: { type: String },
                product: { type: String },
                type: { type: String },
                variant: { type: String },
                mesh: { type: String },
                frame: { type: String },
                lock: { type: String },
                width: { type: Number },
                height: { type: Number },
                feet: { type: Number },
                area: { type: Number },
                price: { type: Number },
                quantity: { type: Number },
                totalqtyprice: { type: Number },
                glass: { type: String },
                thickness: { type: String },
                color: { type: String },
                adcost: { type: Number },
                floor: { type: String, default: '' },
                totalcost: { type: Number },
                image: { type: String }
            }
        ]
    }, { strict: false });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;