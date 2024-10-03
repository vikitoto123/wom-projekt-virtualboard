const express = require('express')
const cors = require('cors')
const checkName = require('./middleware/check-name')
require('dotenv').config()

const PORT = process.env.PORT || 8080

const app = express()
app.use(cors({
}))

app.get('/', (req, res) => {
    console.log(req.myVar)
    res.send("<h1>Hello!! cors?</h1>")
})

app.use(express.json())

const boardsRouter = require('./routes/boards')
app.use('/boards', boardsRouter)

const usersRouter = require('./routes/users')
app.use('/users', usersRouter)


app.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT}`)
})

