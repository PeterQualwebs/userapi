const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  let bearerToken;
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    bearerToken = bearer[1];

    if (bearer[0] !== "Bearer") {
      return res.status(401).json({ message: "bearer not understood" });
    }

    //verify if this token was from us or not
    jwt.verify(bearerToken, "c42f173100b5a1cc5a4ca2a5", (err, decoded) => {
      if (err) {
        sails.log("verification error", err);
        if (err.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({ message: "Session timed out, please login again" });
        } else {
          return res
            .status(401)
            .json({ message: "Error authenticating, please login again" });
        }
      }

      User.findOne(decoded.id).exec(function callback(error, user) {
        if (error) {
          return res.status(401).json(err);
        }

        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }
        req.user = user;
        next();
      });
    });
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
};
