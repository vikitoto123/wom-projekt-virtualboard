module.exports = (req, res, next) => {
    if (req.params.name != 'Fredde') {
        return res.send("You're not welcome")
    }
    next()
}