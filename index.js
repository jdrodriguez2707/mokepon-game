import express from 'express'
import cors from 'cors'

const app = express()
const port = 3000

app.use(express.static('public'))
app.use(cors())
app.use(express.json())

const players = []

class Player {
  constructor(id) {
    this.id = id
    this.x = undefined
    this.y = undefined
    this.mokepon = null
    this.attacks = []
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

  // Check if the player is too close to another player
  isTooCloseToPlayer(otherPlayer, safeDistance) {
    if (!this.x || !this.y || !otherPlayer.x || !otherPlayer.y) {
      return false
    }

    // Calculate the distance between the two players
    // Using the Euclidean distance formula
    const distance = Math.sqrt(
      Math.pow(this.x - otherPlayer.x, 2) + Math.pow(this.y - otherPlayer.y, 2)
    )

    return distance < safeDistance
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
  console.log(`A new player ${id} has joined. Total: ${players.length}`)
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

// Modify the DELETE endpoint to also work with GET requests (for beacon API)
app.get('/player/:playerId', (req, res) => {
  handlePlayerRemoval(req.params.playerId, res)
})

// DELETE endpoint for intentional player removal (manual restart or reload)
app.delete('/player/:playerId', (req, res) => {
  handlePlayerRemoval(req.params.playerId, res)
})

// Helper function for player removal logic
function handlePlayerRemoval(playerId, res) {
  if (!playerId) {
    res.status(400).send({ success: false, message: 'Invalid player ID' })
    return
  }

  const playerIndex = players.findIndex(player => player.id === playerId)

  if (playerIndex >= 0) {
    console.log(`Removing player ${playerId}`)
    players.splice(playerIndex, 1)

    // Only send a response if the connection is still alive
    if (res && !res.headersSent) {
      res
        .status(200)
        .send({ success: true, message: 'Player removed successfully' })
    }
  } else {
    if (res && !res.headersSent) {
      res.status(404).send({ success: false, message: 'Player not found' })
    }
  }
}

app.get('/mokepon/:playerId/safePosition', (req, res) => {
  const playerId = req.params.playerId || ''
  const { width, height, mapWidth, mapHeight } = req.query

  const petWidth = parseInt(width) || 80
  const petHeight = parseInt(height) || 80
  const maxX = parseInt(mapWidth) || 700
  const maxY = parseInt(mapHeight) || 500

  // Safe distance is the sum of the width and height of the pet plus a margin
  const safeDistance = petWidth + petHeight + 20

  // Try to find a safe position for the player (20 attempts max)
  let safePosition = false
  let attempts = 0
  let x, y

  while (!safePosition && attempts < 20) {
    // Generate random coordinates
    x = Math.floor(Math.random() * (maxX - petWidth))
    y = Math.floor(Math.random() * (maxY - petHeight))

    // Check if the position is safe
    safePosition = true
    for (const player of players) {
      if (
        player.id !== playerId &&
        player.x !== undefined &&
        player.y !== undefined
      ) {
        const thisPlayer = new Player(playerId)
        thisPlayer.x = x
        thisPlayer.y = y

        if (thisPlayer.isTooCloseToPlayer(player, safeDistance)) {
          safePosition = false
          break
        }
      }
    }
    attempts++
  }

  res.send({ x, y, safe: safePosition })
})

app.post('/mokepon/:playerId/position', (req, res) => {
  const playerId = req.params.playerId || ''
  const { x, y } = req.body || {}
  const playerIndex = players.findIndex(player => player.id === playerId)

  if (playerIndex >= 0) players[playerIndex].updateMokeponPosition(x, y)

  // Filter out players that are not mokepons or don't have coordinates
  const enemies = players.filter(
    player =>
      player.id !== playerId &&
      player.mokepon &&
      player.x !== undefined &&
      player.y !== undefined
  )

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
  } else {
    res.send({ attacks: [] })
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
