const express = require('express')
const app = express()
const flash = require('connect-flash')
const mongoose = require('mongoose')
const helmet = require('helmet')
const path = require('path')
const exphbs = require('express-handlebars')
const homeRoutes = require('./routes/home')
const cardRoutes = require('./routes/card')
const coursesRoutes = require('./routes/courses')
const addRoutes = require('./routes/add')
const ordersRoutes = require('./routes/orders')
const authRoutes = require('./routes/auth')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const varMiddleware = require('./middleware/variables')
const keys = require('./keys')
const userMiddleware = require('./middleware/user')
const csrf = require('csurf') 
const errorHandler = require('./middleware/error')
const profileRoutes = require('./routes/profile')
const fileMiddleware = require('./middleware/file')
const compression = require('compression')

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    runtimeOptions: {
        allowProtoMethodsByDefault: true,
        allowProtoPropertiesByDefault: true
    },
    helpers: require('./utils/hbs-helpers')
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')
app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({
    extended: true
}))

const store = new MongoStore({
    collection: 'sessions',
    uri: keys.MONGODB_URI,

})

app.use(session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
}))
app.use(fileMiddleware.single('avatar'))
app.use(csrf())
app.use(flash())
app.use(userMiddleware)
app.use(varMiddleware)
app.use(helmet.crossOriginResourcePolicy({policy: 'cross-origin'}))
app.use(compression())
app.use('/', homeRoutes)
app.use('/courses', coursesRoutes)
app.use('/add', addRoutes)
app.use('/card', cardRoutes)
app.use('/orders', ordersRoutes)
app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)
app.use(errorHandler)

const PORT = process.env.PORT || 3000
async function start() {

    try {
        await mongoose.connect(keys.MONGODB_URI, {
            useNewUrlParser : true
        })
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    } catch(e) {
        console.log(e)
    }

}
start()





