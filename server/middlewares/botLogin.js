let loginState = (req, res, next) => {
  let token = req.query.token ? req.query.token : req.get("token");

  jwt.verify(token, process.env.SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        err
      });
    }
    req.usuario = decoded.usuario;
    next();
  });
};

module.exports = {
  loginState
};
