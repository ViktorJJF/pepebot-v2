const Product = require('../models/Products.js');
const list = (req, res) => {
    Product.find({
        status: true
    }).sort({
        model: 'desc'
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
    let product = new Product({
        model: body.model,
        typeId: body.typeId,
        brandId: body.brandId,
        colorId: body.colorId,
        stock: body.stock,
        price: body.price,
        description: body.description,
        userId: "123Brus",
    });

    product.save((err, payload) => {
        if (err) {
            if (err.name === 'MongoError' && err.code === 11000) {
                return res.status(400).json({
                    ok: false,
                    message: "El modelo ya estaba registrado",
                    err
                });
            }
            return res.status(400).json({
                ok: false,
                message: "Algo salió mal",
                err
            });
        }
        res.json({
            ok: true,
            message: "Modelo creado con éxito",
            payload
        });
    });
}
const update = (req, res) => {
    const filter = {
        _id: req.params.id
    };
    const update = req.body;
    Product.findOneAndUpdate(filter, update, {
        new: true
    }, (err, payload) => {
        if (err) {
            if (err.name === 'MongoError' && err.code === 11000) {
                return res.status(400).json({
                    ok: false,
                    message: "El modelo ya estaba registrado",
                    err
                });
            }
            return res.status(400).json({
                ok: false,
                message: "Algo salió mal",
                err
            });
        }
        res.json({
            ok: true,
            message: "Modelo actualizado con éxito",
            payload
        });
    });
}
const deletes = (req, res) => {
    let id = req.params.id;
    Product.findByIdAndUpdate(id, {
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
            message: "Producto eliminado con éxito",
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