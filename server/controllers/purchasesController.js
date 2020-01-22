const Purchase = require('../models/Purchases.js');
const PurchaseDetail = require('../models/PurchaseDetails.js');
const Product = require('../models/Products.js');
const list = (req, res) => {
    Purchase.find({
        status: true
    }).sort({
        'createdAt': 'desc'
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
const count = (req, res) => {
    Purchase.count({
        status: true
    }).exec((err, count) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        res.json({
            ok: true,
            payload: count
        })
    });
}
const create = (req, res) => {
    let body = req.body;
    let purchase = new Purchase({
        userId: body.userId,
    });

    purchase.save((err, payload) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: "Algo salió mal",
                err
            });
        }
        res.json({
            ok: true,
            message: "Venta creada con éxito",
            payload
        });
    });
}
const update = (req, res) => {
    let id = req.params.id;
    let body = req.body;
    Purchase.findByIdAndUpdate(id, body, {
        new: true
    }, (err, payload) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: "Algo salió mal",
                err
            });
        }
        res.json({
            ok: true,
            message: "Venta actualizada con éxito",
            payload
        });
    });
}
const deletes = (req, res) => {
    let id = req.params.id;
    Purchase.findOneAndUpdate({
        _id: id
    }, {
        status: false
    }, (err, payload) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: "Algo salió mal",
                err
            });
        }
        res.json({
            ok: true,
            message: "Venta eliminada con éxito",
            payload
        });
    });
}

module.exports = {
    list,
    create,
    update,
    deletes,
    count
}