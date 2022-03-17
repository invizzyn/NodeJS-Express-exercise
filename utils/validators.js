const { body } = require('express-validator')
const User = require('../Models/user')

exports.registerValidators = [
  body('email', 'Введите корректный email')
    .isEmail()
    .custom(async (value, req) => {
      try {
        const user = await User.findOne({ email: value })
        if (user) {
          return Promise.reject('Такой email уже зарегистрирован')
        }
      } catch (error) {
        console.log(error)
      }
    })
    .normalizeEmail(),

  body('password', 'Пароль должен быть длиннее 6 символов')
    .isLength({ min: 6, max: 56 })
    .isAlphanumeric()
    .trim(),

  body('confirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Пароли должны совпадать!')
      }
      return true
    })
    .trim(),

  body('name', 'В имени должно быть минимум 3 символа')
    .isLength({ min: 3 })
    .trim(),
]

exports.loginValidators = [
  body('email', 'Введите корректный email').isEmail().normalizeEmail(),

  body('password').isAlphanumeric().trim(),
]

exports.resetValidators = [
  body('email', 'Введите корректный email').isEmail().normalizeEmail(),
]

exports.courseValidators = [
  body('title', 'Минимальная длина названия - 3 символа').isLength({ min: 3 }),
  body('price', 'Введите корректное число').isNumeric(),
  body('image', 'Введите корректный URL картинки').isURL(),
]
