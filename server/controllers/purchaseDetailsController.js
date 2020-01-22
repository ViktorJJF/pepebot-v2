const PurchaseDetail = require('../models/PurchaseDetails.js');
const Product = require('../models/Products.js');
const list = (req, res) => {
    let purchaseId = req.query.purchaseId;
    PurchaseDetail.find({
        purchaseId,
        status: true
    }).exec((err, payload) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        res.json({
            ok: true,
            payload
        })
    });
}
const create = (req, res) => {
    let body = req.body;
    let purchaseDetail = new PurchaseDetail({
        purchaseId: body.purchaseId,
        productId: body.productId,
        purchasePrice: body.purchasePrice,
        qty: body.qty,
    });

    purchaseDetail.save((err, payload) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            payload
        });
    });
}
const update = (req, res) => {
    let id = req.params.id;
    let body = req.body;
    PurchaseDetail.findByIdAndUpdate(id, body, {
        new: true
    }, (err, payload) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            payload
        });
    });
}
const deletes = (req, res) => {
    let id = req.params.id;
    let body = req.body;
    Product.findOne({
        _id: body.productId
    }, (err, product) => {
        if (err) {
            return console.log(err);
        }
        product.update({
                stock: product.stock - body.qty
            }, ).then((newStock) => {})
            .catch((err) => {
                console.log(err);
            });
    });

    PurchaseDetail.findByIdAndRemove(id, (err, payload) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            payload
        });
    });
}

module.exports = {
    list,
    create,
    update,
    deletes
}