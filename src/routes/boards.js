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
                        content: true,
                        xPosition: true,
                        yPosition: true
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
                cards: board.cards,
                xPosition: board.xPosition,
                yPosition: board.yPosition
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ msg: "ERROR" });
    }
});

// Create BoardCard POST
router.post('/:boardId/cards', authorize, async (req, res) => {
    const boardId = req.params.boardId; 
    const { title, content, xPosition, yPosition } = req.body; 

    try {
        const newCard = await prisma.cards.create({
            data: {
                title: title,
                content: content,
                boardId: boardId, 
                xPosition: xPosition,
                yPosition: yPosition
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

router.put('/:boardId/cards/:id', authorize, async (req, res) => {
    const { boardId, id: cardId } = req.params; 
    const { title, content, xPosition, yPosition } = req.body; // Include xPosition and yPosition

    console.log(`Updating card with ID: ${cardId} in board: ${boardId} with title: ${title}, content: ${content}, xPosition: ${xPosition}, yPosition: ${yPosition}`);

    try {
        const card = await prisma.cards.findUnique({
            where: { id: cardId },
            include: { board: true }, 
        });

        if (!card || card.boardId !== boardId) {
            return res.status(404).send({ msg: "Card not found in this board." });
        }

        const updatedCard = await prisma.cards.update({
            where: { id: cardId },
            data: { 
                title, 
                content, 
                xPosition: xPosition, 
                yPosition: yPosition  
            },
        });

        res.send(updatedCard);
    } catch (error) {
        console.error(error);
        res.status(500).send({ msg: "ERROR" });
    }
});




// Delete Board
router.delete('/:boardId/cards/:cardId', async (req, res) => {
    try {
        const { boardId, cardId } = req.params;

        const deleteCard = await prisma.cards.delete({
            where: {
                id: cardId,
            },
        });

        res.send({ msg: `Card ${cardId} deleted from board ${boardId}` });
    } catch (error) {
        res.status(500).send({ msg: "Deletion Failed", errormsg: error.message });
    }
});


// GET Cards for board
router.get('/:boardId/cards', authorize, async (req, res) => {
    const boardId = req.params.boardId; 

    try {
        const cards = await prisma.cards.findMany({
            where: { boardId: boardId }, 
            select: {
                id: true,
                title: true,
                content: true
            }
        });

        if (cards.length === 0) {
            return res.status(404).send({ msg: "No cards found for this board" });
        }

        res.send(cards);
    } catch (error) {
        console.error(error);
        res.status(500).send({ msg: "ERROR" });
    }
});

module.exports = router