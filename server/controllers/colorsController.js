const Color = require('../models/Colors.js');
//real time pusher
const Pusher = require('pusher');
var pusher = new Pusher({
    appId: '876313',
    key: 'cc4e375af7e721dc4468',
    secret: '0cf84638c4d6a7dcc093',
    cluster: 'us2',
    encrypted: true
});

const list = (req, res) => {
    Color.find().exec((err, payload) => {
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
    let color = new Color({
        name: body.name,
        description: body.description,
        status: body.status,
        userId: "123Brus",
    });

    color.save((err, payload) => {
        if (err) {
            if (err.name === 'MongoError' && err.code === 11000) {
                return res.status(400).json({
                    ok: false,
                    message: "El color estaba registrado",
                    err
                });
            }
            return res.status(400).json({
                ok: false,
                message: "Algo salió mal",
                err
            });
        }
        //realtime
        console.log("se pusheara un nuevo color");
        pusher.trigger('colors', 'color_added', {
            color: payload
        });

        res.json({
            ok: true,
            message: "Color de producto creado con éxito",
            payload
        });
    });
}
const update = (req, res) => {
    let id = req.params.id;
    let body = req.body;
    Color.findByIdAndUpdate(id, body, {
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
    Color.findByIdAndRemove(id, (err, payload) => {
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