import express from "express";
import cors from "cors";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(cors());
app.use(express.json());

const players = [];
let cpuMokepons = []; // Array to store CPU Mokepons
const CPU_COUNT = 3; // Number of CPU Mokepons to create

class Player {
  constructor(id) {
    this.id = id;
    // Store positions as normalized values (percentages of the map size)
    this.xPercent = undefined;
    this.yPercent = undefined;
    this.mokepon = null;
    this.attacks = [];
    this.isCPU = false; // Flag to identify CPU players
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
    this.type = getMokeponType(name); // Add type to CPU mokepons
  }
}

// Helper function to get mokepon type based on name
function getMokeponType(name) {
  switch (name) {
    case "Hipodoge":
    case "Pydos":
      return "💧";
    case "Capipepo":
    case "Tucapalma":
      return "🌱";
    case "Ratigueya":
    case "Langostelvis":
      return "🔥";
    default:
      return "💧";
  }
}

// Function to generate CPU Mokepons
function generateCPUMokepons() {
  // Clear existing CPU players
  cpuMokepons = [];

  // Available mokepon names
  const mokeponNames = [
    "Hipodoge",
    "Capipepo",
    "Ratigueya",
    "Pydos",
    "Tucapalma",
    "Langostelvis",
  ];

  // Shuffle the array to pick random mokepons
  const shuffled = [...mokeponNames].sort(() => 0.5 - Math.random());
  const selectedNames = shuffled.slice(0, CPU_COUNT);

  // Create CPU players with selected mokepons
  for (let i = 0; i < CPU_COUNT; i++) {
    const cpuId = `cpu-${i}-${Date.now()}`;
    const cpuPlayer = new Player(cpuId);

    // Mark as CPU
    cpuPlayer.isCPU = true;

    // Assign a mokepon
    const mokepon = new Mokepon(selectedNames[i]);
    cpuPlayer.assignMokepon(mokepon);

    // Set position (evenly distributed across the map)
    // We divide the map into segments to ensure they're separated
    const segment = 100 / (CPU_COUNT + 1);
    cpuPlayer.xPercent = 20 + segment * i + (Math.random() * 10 - 5); // Add some randomness within segment
    cpuPlayer.yPercent = 30 + Math.random() * 40; // Random Y between 30% and 70%

    // Store attacks (standard set plus an extra attack of the same type)
    const attacks = [];
    for (let j = 0; j < 3; j++) {
      attacks.push(mokepon.type);
    }

    // Add two different attacks based on type
    if (mokepon.type === "💧") {
      attacks.push("🔥", "🌱");
    } else if (mokepon.type === "🔥") {
      attacks.push("💧", "🌱");
    } else {
      attacks.push("💧", "🔥");
    }

    cpuPlayer.assignAttacks(attacks);

    // Initialize availableAttacks with a copy of all attacks
    cpuPlayer.availableAttacks = [...attacks];

    // Flag to track if extra attack was added for type advantage
    cpuPlayer.extraAttackAdded = false;

    // Add to arrays
    cpuMokepons.push(cpuPlayer);
    players.push(cpuPlayer);
    console.log(cpuMokepons);
  }
}

// Generate initial CPU Mokepons
generateCPUMokepons();

// Function to check if there are any human players
function areHumanPlayersActive() {
  return players.some((player) => !player.isCPU);
}

// Check and regenerate CPU Mokepons if needed
function checkAndRegenerateCPUs() {
  if (!areHumanPlayersActive() && cpuMokepons.length > 0) {
    console.log("No human players left. Regenerating CPU Mokepons.");

    // Remove existing CPU players from players array
    const humanPlayers = players.filter((player) => !player.isCPU);
    players.length = 0;
    players.push(...humanPlayers);

    // Generate new CPU Mokepons
    generateCPUMokepons();
  }
}

app.get("/join", (req, res) => {
  const id = `${Math.random()}`;
  const player = new Player(id);
  players.push(player);
  console.log(`A new player ${id} has joined. Total: ${players.length}`);

  // If there are no CPU Mokepons, generate them
  if (cpuMokepons.length === 0) {
    generateCPUMokepons();
  }

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

    // Check if we need to regenerate CPU Mokepons
    checkAndRegenerateCPUs();

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

  // Filter to include both human and CPU players as enemies
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
    const responseData = {
      attacks: player.isCPU ? player.attackList || [] : player.attacks || [],
      isCPU: player.isCPU || false,
    };
    res.send(responseData);
  } else {
    res.send({ attacks: [], isCPU: false });
  }
});

// Add endpoint for CPU to select a random attack
app.get("/mokepon/:playerId/cpu-attack", (req, res) => {
  const playerId = req.params.playerId || "";
  const cpuPlayer = players.find(
    (player) => player.id === playerId && player.isCPU
  );

  if (cpuPlayer && cpuPlayer.attacks && cpuPlayer.attacks.length > 0) {
    // Initialize available attacks for this round if needed
    if (
      !cpuPlayer.availableAttacks ||
      cpuPlayer.availableAttacks.length === 0
    ) {
      // Create a copy of the attacks array to avoid modifying the original
      cpuPlayer.availableAttacks = [...cpuPlayer.attacks];
      console.log(
        `Resetting available attacks for CPU ${playerId}:`,
        cpuPlayer.availableAttacks
      );
    }

    // If no attack list exists, create it
    if (!cpuPlayer.attackList) {
      cpuPlayer.attackList = [];
    }

    // Pick a random attack from available attacks
    const randomIndex = Math.floor(
      Math.random() * cpuPlayer.availableAttacks.length
    );
    const attack = cpuPlayer.availableAttacks[randomIndex];

    // Remove the selected attack from available attacks for this round
    cpuPlayer.availableAttacks.splice(randomIndex, 1);
    console.log(
      `CPU ${playerId} using attack ${attack}. Remaining attacks:`,
      cpuPlayer.availableAttacks
    );

    // Add to CPU's attack list
    cpuPlayer.attackList.push(attack);

    res.send({
      attack,
      allAttacks: cpuPlayer.attackList,
      remainingAttacks: cpuPlayer.availableAttacks,
    });
  } else {
    res.status(404).send({ error: "CPU player not found or has no attacks" });
  }
});

// Add new endpoint to reset CPU's available attacks for a new round
app.post("/mokepon/:playerId/reset-attacks", (req, res) => {
  const playerId = req.params.playerId || "";
  const cpuPlayer = players.find(
    (player) => player.id === playerId && player.isCPU
  );

  if (cpuPlayer) {
    // Reset available attacks to full list including extra attack if it was added
    cpuPlayer.availableAttacks = [...cpuPlayer.attacks];
    console.log(
      `Reset available attacks for CPU ${playerId}:`,
      cpuPlayer.availableAttacks
    );

    // Clear the attack list for the new round
    cpuPlayer.attackList = [];

    res.status(200).send({
      success: true,
      message: "CPU attacks reset successfully",
      availableAttacks: cpuPlayer.availableAttacks,
    });
  } else {
    res.status(404).send({
      success: false,
      error: "CPU player not found",
    });
  }
});

// Add endpoint for checking CPU advantage and adding extra attack if needed
app.post("/mokepon/:playerId/check-advantage", (req, res) => {
  const playerId = req.params.playerId || "";
  const { playerMokeponType } = req.body || {};
  const cpuPlayer = players.find(
    (player) => player.id === playerId && player.isCPU
  );

  if (cpuPlayer && cpuPlayer.mokepon && playerMokeponType) {
    // Check if CPU has advantage over player
    const cpuType = cpuPlayer.mokepon.type;
    const hasAdvantage = combatRules[cpuType] === playerMokeponType;

    if (hasAdvantage) {
      console.log(
        `CPU ${playerId} has advantage! Adding extra attack of type ${cpuType}`
      );

      // Add an extra attack of the same type as the CPU mokepon
      if (!cpuPlayer.extraAttackAdded) {
        cpuPlayer.attacks.push(cpuType);
        cpuPlayer.availableAttacks.push(cpuType);
        cpuPlayer.extraAttackAdded = true;
      }

      res.send({
        success: true,
        hasAdvantage: true,
        attacks: cpuPlayer.attacks,
        availableAttacks: cpuPlayer.availableAttacks,
      });
    } else {
      res.send({ success: true, hasAdvantage: false });
    }
  } else {
    res.status(404).send({
      success: false,
      error: "CPU player not found or missing mokepon/player type",
    });
  }
});

// Helper function to determine combat advantage
const combatRules = {
  "💧": "🔥", // Water beats fire
  "🔥": "🌱", // Fire beats plant
  "🌱": "💧", // Plant beats water
};

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
