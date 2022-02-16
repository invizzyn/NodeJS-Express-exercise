const { Router } = require('express')
const Course = require('../Models/course')
const router = Router()
const auth = require('../middleware/auth')
const { courseValidators } = require('../utils/validators')
const {validationResult} = require('express-validator')

router.get('/', async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('userId', 'email name')
        res.render('courses', {
            title: 'Курсы',
            isCourses: true,
            userId: req.user ? req.user._id.toString() : null,
            courses
        })
    } catch (error) {
        console.log(error);
    }
    
})

router.get('/:id/edit', auth, async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/')
    }
    try {
       const course = await Course.findById(req.params.id)

        if (course.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/courses')
        }

        res.render('course-edit', {
            title: `Редактировать ${course.title}`,
            course
        }) 
    } catch (error) {
        console.log(error);
    }
    
})

router.post('/edit', auth, courseValidators, async (req, res) => {
    const errors = validationResult(req)
    const {id} = req.body
    if (!errors.isEmpty()) {
        return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
    }

    try {
        delete req.body.id
        const course = await Course.findById(id)
        if (course.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/courses')
        }
        Object.assign(course, req.body)
        await course.save()
        res.redirect('/courses')
    } catch (error) {
        console.log(error);
    }
    
})

router.post('/remove', auth, async (req, res) => {
    try {
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id
        })
        res.redirect('/courses')
    } catch (error) {
        console.log(error)
    }
})

router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
        res.render('course', {
            layout: 'empty',
            title: `Курс: ${course.title}`,
            course
        })
    } catch (error) {
        console.log(error);
    }
    
})

module.exports = router