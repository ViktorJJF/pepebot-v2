const Type = require('../models/Types.js');
const dateTools = require("../tools/dateTools.js")
const list = (req, res) => {
    Type.find().exec((err, payload) => {
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
    let type = new Type({
        name: body.name,
        description: body.description,
        status: body.status,
        userId: "123Brus",
    });

    type.save((err, payload) => {
        if (err) {
            if (err.name === 'MongoError' && err.code === 11000) {
                return res.status(400).json({
                    ok: false,
                    message: "El nombre ya estaba registrado",
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
            message: "Tipo de producto creado con éxito",
            payload
        });
    });
}
const update = (req, res) => {
    let id = req.params.id;
    let body = req.body;
    Type.findByIdAndUpdate(id, body, {
        new: true
    }, (err, payload) => {
        if (err) {
            if (err.name === 'MongoError' && err.code === 11000) {
                return res.status(400).json({
                    ok: false,
                    message: "El nombre ya estaba registrado",
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
            message: "Tipo de producto actualizado con éxito",
            payload
        });
    });
}
const deletes = (req, res) => {
    let id = req.params.id;
    let body = req.body;
    Type.findByIdAndRemove(id, (err, payload) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: "Algo salió mal",
                err
            });
        }
        res.json({
            ok: true,
            message: "Tipo de producto eliminado con éxito",
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