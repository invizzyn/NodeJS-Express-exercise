const { Router } = require('express')
const Order = require('../Models/order')
const router = Router()
const auth = require('../middleware/auth')
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({
      'user.userId': req.user._id,
    }).populate('user.userId')

    res.render('orders', {
      isOrders: true,
      title: 'Заказы',
      orders: orders.map((o) => {
        return {
          ...o._doc,
          price: o.courses.reduce((total, c) => {
            return (total += c.count * c.course.price)
          }, 0),
        }
      }),
    })
  } catch (error) {
    console.log(error)
  }
})

router.post('/', auth, async (req, res) => {
  try {
    const user = await req.user.populate('cart.items.courseId')

    const courses = user.cart.items.map((i) => ({
      count: i.count,
      course: { ...i.courseId._doc },
    }))

    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user,
      },
      courses,
    })

    await order.save()
    await req.user.clearCart()

    res.redirect('/orders')
  } catch (error) {
    console.log(error)
  }
})

module.exports = router
