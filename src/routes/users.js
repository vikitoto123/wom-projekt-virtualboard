const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const authorize = require('../middleware/auth')
const auth = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany()
        res.send({ msg: "User GET", users: users })
    } catch (error) {
        res.status(500).send({ msg: "Error", errormsg: error.message })
    }
})

// Sign Up
router.post('/', async (req, res) => {
    console.log(req.body)
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    try {
        const newUser = await prisma.user.create({
            data: {
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword
            }
        })

        res.send({
            msg: "New user created!",
            status: 0
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).send({
            msg: "Sign Up Failed",
            status: 1
        })
    }

})

// Login to Website
router.post('/login', async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { email: req.body.email }
    })

    if (!user) {
        console.log("Login failed")
        return res.status(401).send({ msg: "Authentication failed" })
    }

    const match = await bcrypt.compare(req.body.password, user.password)

    if (!match || !user) {
        console.log("Login failed")
        return res.status(401).send({ msg: "Authentication failed" })
    }
    console.log(process.env.JWT_SECRET)
    const token = await jwt.sign({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role
        // TODO Tillägg vilka boards man har access till, och i databasen
    }, process.env.JWT_SECRET, { expiresIn: '30d' })

    res.send({ msg: "Login OK", jwt: token })
})

// Update user
router.put('/:id', authorize, async (req, res) => {
    try {
        const updateUser = await prisma.user.update({
            where: {
                id: req.params.id
            },
            data: {
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword
            }
        })
        res.send({ msg: `User ${req.params.id} updated` })
    } catch (error) {
        res.status(500).send({ msg: "Update error", errormsg: error.message })
    }
})

router.get('/profile', authorize, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.userData.sub
            }
        })
        res.send({ msg: `Hej ${user.name}!` })
    } catch (error) {
        console.log(error)
        res.status(500).send({ msg: "Error" })
    }
})


module.exports = router