import express from 'express'
import cors from 'cors'

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

const players = []

class Player {
  constructor(id) {
    this.id = id
  }

  assignMokepon(mokepon) {
    this.mokepon = mokepon
  }

  updateMokeponPosition(x, y) {
    this.x = x
    this.y = y
  }

  assignAttacks(attacks) {
    this.attacks = attacks
  }
}

class Mokepon {
  constructor(name) {
    this.name = name
  }
}

app.get('/join', (req, res) => {
  const id = `${Math.random()}`
  const player = new Player(id)
  players.push(player)
  res.send({ id })
})

app.post('/mokepon/:playerId', (req, res) => {
  const playerId = req.params.playerId || ''
  const mokeponName = req.body.mokeponName || ''
  const playerIndex = players.findIndex(player => player.id === playerId)

  if (playerIndex >= 0) {
    const mokepon = new Mokepon(mokeponName)
    players[playerIndex].assignMokepon(mokepon)
  }

  res.end()
})

app.post('/mokepon/:playerId/position', (req, res) => {
  const playerId = req.params.playerId || ''
  const { x, y } = req.body || {}
  const playerIndex = players.findIndex(player => player.id === playerId)

  if (playerIndex >= 0) players[playerIndex].updateMokeponPosition(x, y)

  const enemies = players.filter(player => player.id !== playerId)

  res.send({ enemies })
})

app.post('/mokepon/:playerId/attacks', (req, res) => {
  const playerId = req.params.playerId || ''
  const attacks = req.body.attacks || []
  const playerIndex = players.findIndex(player => player.id === playerId)

  if (playerIndex >= 0) {
    players[playerIndex].assignAttacks(attacks)
  }

  res.end()
})

app.get('/mokepon/:playerId/attacks', (req, res) => {
  const playerId = req.params.playerId || ''
  const player = players.find(player => player.id === playerId)

  if (player) {
    res.send({
      attacks: player.attacks || []
    })
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
