const Order = require('../models/Orders.js');
const list = (req, res) => {
    Order.find({
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
const countByDate = (req, res) => {
    Order.aggregate([{
        $match: {
            status: true
        }
    }, {
        $group: {
            _id: {
                $month: '$createdAt'
            },
            count: {
                $sum: 1
            }
        }
    }], function (err, result) {
        if (err) {
            next(err);
        } else {
            res.json({
                ok: true,
                payload: result
            })
        }
    });
}
const count = (req, res) => {
    Order.count({
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
    let order = new Order({
        userId: body.userId,
    });

    order.save((err, payload) => {
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
    Order.findByIdAndUpdate(id, body, {
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
    Order.findOneAndUpdate({
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
    count,
    countByDate
}