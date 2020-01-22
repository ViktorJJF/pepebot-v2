const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let productSchema = new Schema({
    model: {
        type: String,
        required: [true, "El nombre del modelo es requerido"],
    },
    typeId: {
        type: Schema.Types.ObjectId,
        ref: 'Types'
    },
    brandId: {
        type: Schema.Types.ObjectId,
        ref: 'Brands'
    },
    colorId: {
        type: Schema.Types.ObjectId,
        ref: 'Colors'
    },
    stock: Number,
    minStock: {
        type: Number,
        default: 5
    },
    purchasePrice: {
        type: Number,
        default: 0
    },
    price: Number,
    description: String,
    status: {
        type: Boolean,
        default: true
    },
    userId: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});


module.exports = mongoose.model('Products', productSchema);