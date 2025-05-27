const { param, body } = require("express-validator");

exports.updateStatusValidator = [
  param("orderId")
    .notEmpty().withMessage("orderId este obligatoriu")
    .isMongoId().withMessage("orderId trebuie să fie un ID valid"),
  body("status")
    .notEmpty().withMessage("status este obligatoriu")
    .isIn(["pending","completed","cancelled"])
    .withMessage("status trebuie să fie unul din: pending, completed, cancelled")
];
