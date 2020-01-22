const mongoose = require('mongoose');
let middlewares = require('../mongoMiddlewares/Middlewares');

let Schema = mongoose.Schema;

let orderDetailSchema = new Schema({
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Orders'
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Products',
        required: [true, "El color es requerido"]
    },
    price: Number,
    qty: Number,
    status: {
        type: Boolean,
        default: true
    }

});

orderDetailSchema.post('save', async function (createdOrderDetail) {
    await middlewares.updateStock(createdOrderDetail.productId, -createdOrderDetail.qty);
});

module.exports = mongoose.model('OrderDetails', orderDetailSchema);