import express from "express";
import cors from "cors";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(cors());
app.use(express.json());

const players = [];

class Player {
  constructor(id) {
    this.id = id;
    // Store positions as normalized values (percentages of the map size)
    this.xPercent = undefined;
    this.yPercent = undefined;
    this.mokepon = null;
    this.attacks = [];
  }

  assignMokepon(mokepon) {
    this.mokepon = mokepon;
  }

  // Update to store normalized position
  updateMokeponPosition(xPercent, yPercent) {
    this.xPercent = xPercent;
    this.yPercent = yPercent;
  }

  assignAttacks(attacks) {
    this.attacks = attacks;
  }

  // Modified to work with percentage-based positions
  isTooCloseToPlayer(otherPlayer, safeDistancePercent) {
    if (
      this.xPercent === undefined ||
      this.yPercent === undefined ||
      otherPlayer.xPercent === undefined ||
      otherPlayer.yPercent === undefined
    ) {
      return false;
    }

    // Calculate distance using percentage values
    const distance = Math.sqrt(
      Math.pow(this.xPercent - otherPlayer.xPercent, 2) +
        Math.pow(this.yPercent - otherPlayer.yPercent, 2)
    );

    return distance < safeDistancePercent;
  }
}

class Mokepon {
  constructor(name) {
    this.name = name;
  }
}

app.get("/join", (req, res) => {
  const id = `${Math.random()}`;
  const player = new Player(id);
  players.push(player);
  console.log(`A new player ${id} has joined. Total: ${players.length}`);
  res.send({ id });
});

app.post("/mokepon/:playerId", (req, res) => {
  const playerId = req.params.playerId || "";
  const mokeponName = req.body.mokeponName || "";
  const playerIndex = players.findIndex((player) => player.id === playerId);

  if (playerIndex >= 0) {
    const mokepon = new Mokepon(mokeponName);
    players[playerIndex].assignMokepon(mokepon);
  }

  res.end();
});

// Modify the DELETE endpoint to also work with GET requests (for beacon API)
app.get("/player/:playerId", (req, res) => {
  handlePlayerRemoval(req.params.playerId, res);
});

// DELETE endpoint for intentional player removal (manual restart or reload)
app.delete("/player/:playerId", (req, res) => {
  handlePlayerRemoval(req.params.playerId, res);
});

// Helper function for player removal logic
function handlePlayerRemoval(playerId, res) {
  if (!playerId) {
    res.status(400).send({ success: false, message: "Invalid player ID" });
    return;
  }

  const playerIndex = players.findIndex((player) => player.id === playerId);

  if (playerIndex >= 0) {
    console.log(`Removing player ${playerId}`);
    players.splice(playerIndex, 1);

    // Only send a response if the connection is still alive
    if (res && !res.headersSent) {
      res
        .status(200)
        .send({ success: true, message: "Player removed successfully" });
    }
  } else {
    if (res && !res.headersSent) {
      res.status(404).send({ success: false, message: "Player not found" });
    }
  }
}

app.get("/mokepon/:playerId/safePosition", (req, res) => {
  const playerId = req.params.playerId || "";

  // Safe distance as a percentage of the map
  const safeDistancePercent = 10; // 10% of the map

  // Try to find a safe position for the player (20 attempts max)
  let safePosition = false;
  let attempts = 0;
  let xPercent, yPercent;

  while (!safePosition && attempts < 20) {
    // Generate random normalized coordinates (0-95% to leave room at edges)
    xPercent = Math.random() * 95;
    yPercent = Math.random() * 95;

    // Check if the position is safe
    safePosition = true;
    for (const player of players) {
      if (
        player.id !== playerId &&
        player.xPercent !== undefined &&
        player.yPercent !== undefined
      ) {
        const thisPlayer = new Player(playerId);
        thisPlayer.xPercent = xPercent;
        thisPlayer.yPercent = yPercent;

        if (thisPlayer.isTooCloseToPlayer(player, safeDistancePercent)) {
          safePosition = false;
          break;
        }
      }
    }
    attempts++;
  }

  res.send({ xPercent, yPercent, safe: safePosition });
});

app.post("/mokepon/:playerId/position", (req, res) => {
  const playerId = req.params.playerId || "";
  const { xPercent, yPercent } = req.body || {};
  const playerIndex = players.findIndex((player) => player.id === playerId);

  if (playerIndex >= 0) {
    players[playerIndex].updateMokeponPosition(xPercent, yPercent);
  }

  // Filter out players that are not mokepons or don't have coordinates
  const enemies = players.filter(
    (player) =>
      player.id !== playerId &&
      player.mokepon &&
      player.xPercent !== undefined &&
      player.yPercent !== undefined
  );

  res.send({ enemies });
});

app.post("/mokepon/:playerId/attacks", (req, res) => {
  const playerId = req.params.playerId || "";
  const attacks = req.body.attacks || [];
  const playerIndex = players.findIndex((player) => player.id === playerId);

  if (playerIndex >= 0) {
    players[playerIndex].assignAttacks(attacks);
  }

  res.end();
});

app.get("/mokepon/:playerId/attacks", (req, res) => {
  const playerId = req.params.playerId || "";
  const player = players.find((player) => player.id === playerId);

  if (player) {
    res.send({
      attacks: player.attacks || [],
    });
  } else {
    res.send({ attacks: [] });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
