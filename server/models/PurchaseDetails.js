const mongoose = require('mongoose');
let middlewares = require('../mongoMiddlewares/Middlewares');

let Schema = mongoose.Schema;

let purchaseDetailSchema = new Schema({
    purchaseId: {
        type: Schema.Types.ObjectId,
        ref: 'Purchases'
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Products',
        required: [true, "El color es requerido"]
    },
    purchasePrice: Number,
    qty: Number,
    status: {
        type: Boolean,
        default: true
    }

});

purchaseDetailSchema.post('save', async function (createdPurchaseDetail) {
    await middlewares.updateStock(createdPurchaseDetail.productId, createdPurchaseDetail.qty);
});

module.exports = mongoose.model('PurchaseDetails', purchaseDetailSchema);