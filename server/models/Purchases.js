const mongoose = require('mongoose');
const PurchaseDetail = require('../models/PurchaseDetails');
const Product = require('../models/Products.js');

const middlewares = require('../mongoMiddlewares/Middlewares');

let Schema = mongoose.Schema;

let purchasesSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

purchasesSchema.post('findOneAndUpdate', async function () {
    // deleting on cascade and updating stock
    let purchaseId = this._conditions._id;
    PurchaseDetail.find({
        purchaseId
    }, (err, purchaseDetail) => {
        purchaseDetail.forEach(detail => {
            Product.findOne({
                _id: detail.productId
            }, async (err, product) => {
                if (err) {
                    return console.log(err);
                }
                await middlewares.updateStock(product._id, -detail.qty);
            });
        });
    });
    PurchaseDetail.updateMany({
        purchaseId: purchaseId
    }, {
        $set: {
            status: false
        }
    }, function (err, deletedCount) {
        if (err) {
            return console.log(err);
        }
    });

});

module.exports = mongoose.model('Purchases', purchasesSchema);