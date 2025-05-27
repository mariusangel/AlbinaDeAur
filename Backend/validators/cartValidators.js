// backend/validators/cartValidators.js
const { body, param } = require('express-validator');

exports.addToCartValidator = [
  body('productId')
    .notEmpty().withMessage('productId este obligatoriu')
    .isMongoId().withMessage('productId trebuie să fie un ID valid'),
  body('quantity')
    .notEmpty().withMessage('quantity este obligatoriu')
    .isInt({ min: 1 }).withMessage('quantity trebuie să fie un întreg >= 1')
];

exports.updateCartItemValidator = [
  param('itemId')
    .notEmpty().withMessage('itemId este obligatoriu')
    .isMongoId().withMessage('itemId trebuie să fie un ID valid'),
  body('quantity')
    .notEmpty().withMessage('quantity este obligatoriu')
    .isInt({ min: 1 }).withMessage('quantity trebuie să fie un întreg >= 1')
];
