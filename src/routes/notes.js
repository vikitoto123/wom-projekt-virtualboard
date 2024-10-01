const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authorize = require('../middleware/auth')

const prisma = new PrismaClient()


router.get('/', authorize, async (req, res) => {
    console.log("notes / GET")
    try {
        const notes = await prisma.notes.findMany({
            where: {
                authorId: req.userData.sub
            }
        })
        res.send({msg: `Notes for user ${req.userData.name}`, notes: notes})
    } catch (error) {
        console.log(error)
        res.status(500).send({msg: "Error"})
    }

})

router.post('/', authorize, async (req, res) => {
    console.log(req.body)

    try {
        const newNote = await prisma.notes.create({
            data: {
                authorId: req.userData.sub,
                note: req.body.note
            }
        })

        res.send({msg: "New note created!"})
    } catch (error) {
        console.log(error.message)
        res.status(500).send({msg: "ERROR"})
    }
    
})

router.put('/:id', async (req, res) => {
    console.log(req.body)

    const updateNote = await prisma.notes.update({
        where: {
          id: req.params.id,
        },
        data: {
          note: req.body.note,
        },
      })

    res.send({msg: `note ${req.params.id} updated`})
})

module.exports = router

