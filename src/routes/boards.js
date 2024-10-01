const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authorize = require('../middleware/auth')

const prisma = new PrismaClient()


router.get('/', authorize, async (req, res) => {
    console.log("boards / GET")
    try {
        const boards = await prisma.boards.findMany({
            where: {
                authorId: req.userData.sub
            }
        })
        res.send({msg: `Boards for user ${req.userData.name}`, boards: boards})
    } catch (error) {
        console.log(error)
        res.status(500).send({msg: "Error"})
    }

})

router.post('/', authorize, async (req, res) => {
    console.log(req.body)

    try {
        const newBoard = await prisma.boards.create({
            data: {
                authorId: req.userData.sub,
                title: req.body.title,
                content: req.body.content
            }
        })

        res.send({msg: "New board created!"})
    } catch (error) {
        console.log(error.message)
        res.status(500).send({msg: "ERROR"})
    }
    
})

router.put('/:id', async (req, res) => {
    console.log(req.body)

    const updateBoard = await prisma.boards.update({
        where: {
          id: req.params.id,
        },
        data: {
            board: req.body.note,
        },
      })

    res.send({msg: `board ${req.params.id} updated`})
})

module.exports = router