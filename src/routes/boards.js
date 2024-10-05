const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authorize = require('../middleware/auth')

const prisma = new PrismaClient()

// Get Boards for specific user
router.get('/', authorize, async (req, res) => {
    try {
        const boards = await prisma.boards.findMany({
            //where: { authorId: req.userData.sub },  Tog bårt, eftersom man kunde endast se boards en själv har lagat
            include: {
                cards: { 
                    select: {
                        id: true,
                        title: true,
                        content: true
                    }
                }
            }
        });

        res.send({
            msg: `Boards for user ${req.userData.name || req.userData.sub}`,
            boards: boards.map(board => ({
                id: board.id,
                title: board.title,
                description: board.content,
                cards: board.cards 
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ msg: "ERROR" });
    }
});

// Create BoardCard
router.post('/:boardId/cards', authorize, async (req, res) => {
    const boardId = req.params.boardId; 
    const { title, content } = req.body; 

    try {
        const newCard = await prisma.cards.create({
            data: {
                title: title,
                content: content,
                boardId: boardId, 
            },
        });
        res.status(201).send(newCard);
    } catch (error) {
        console.error(error); 
        res.status(500).send({ msg: "ERROR" });
    }
});

// Update Board
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

    res.send({ msg: `board ${req.params.id} updated` })
})

// Delete Board
router.delete('/:id', async (req, res) => {

    try {
        const deleteBoard = await prisma.boards.delete({
            where: {
                id: req.params.id
            }
        })
        res.send({ msg: `Board ${req.params.id} deleted` })
    } catch (error) {
        res.status(500).send({ msg: "Deletetion Failed", errormsg: error.message })
    }   


})

module.exports = router