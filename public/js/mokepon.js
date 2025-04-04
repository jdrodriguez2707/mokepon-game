"use strict";

// Define the server URL based on the current window location
// This allows the code to work in both local and production environments
const SERVER_URL = window.location.origin + "/";

// Cached DOM elements
const selectPetSection = document.querySelector("#select-pet");
const petCardContainer = document.querySelector("#pet-card-container");

const errorMessageModal = document.querySelector("#error-modal");
const errorMessage = document.querySelector("#error-message");
const btnCloseErrorModal = document.querySelector("#close-error-modal-btn");

const mapSection = document.querySelector("#map-section");
const map = document.querySelector("#map");
const canvas = map.getContext("2d");
const mapBackground = new Image();
mapBackground.src = "../assets/images/mokemap.png";
let renderMapInterval;

const selectAttackSection = document.querySelector("#select-attack");
const roundNumberSpan = document.querySelector("#round-number");
const playerPetNameSpan = document.querySelector("#player-pet-name"); // span to display player's pet name
const enemyPetNameSpan = document.querySelector("#enemy-pet-name"); // span to display enemy's pet name
const playerPetLivesSpan = document.querySelector("#player-pet-lives");
const enemyPetLivesSpan = document.querySelector("#enemy-pet-lives");
const playerPetInfoContainer = document.querySelector("#player-pet-info");
const enemyPetInfoContainer = document.querySelector("#enemy-pet-info");
const attackButtonContainer = document.querySelector(
  "#attack-buttons-container"
);
const playerAttackSection = document.querySelector("#player-attacks");
const enemyAttackSection = document.querySelector("#enemy-attacks");
const combatResultParagraph = document.querySelector("#combat-result");

const resultModal = document.querySelector("#result-modal");
const gameResultContainer = document.querySelector("#game-result-container");

const footer = document.querySelector("footer");

class Mokepon {
  // Default size for the pets
  static get DEFAULT_SIZE() {
    return 80;
  }

  // Base speed for the pets to move on the map
  static get BASE_SPEED() {
    return 7;
  }

  constructor(name, inputId, type, imageSrc, imageAlt, mapImage, attacks) {
    this.name = name;
    this.inputId = inputId;
    this.type = type;
    this.imageSrc = imageSrc;
    this.imageAlt = imageAlt;
    this.mapImage = new Image();
    this.mapImage.src = mapImage;
    this.width = Mokepon.DEFAULT_SIZE;
    this.height = Mokepon.DEFAULT_SIZE;
    this.x = 0;
    this.y = 0;
    this.speedX = 0;
    this.speedY = 0;
    this.attacks = attacks;
    this.isCPU = false; // Newly added property to identify CPU Mokepons
  }

  renderPet() {
    // Draw the Mokepon image
    canvas.drawImage(this.mapImage, this.x, this.y, this.width, this.height);

    // If this is a CPU Mokepon, add a label above it
    if (this.isCPU) {
      // Set text style for the CPU label
      canvas.font = `${Math.max(12, this.width / 6)}px Arial`; // Scale font based on Mokepon size
      canvas.fillStyle = "red";
      canvas.textAlign = "center";

      // Draw a background for better readability
      const text = "CPU";
      const textWidth = canvas.measureText(text).width;
      const padding = 4;

      canvas.fillStyle = "rgba(0, 0, 0, 0.6)";
      canvas.fillRect(
        this.x + this.width / 2 - textWidth / 2 - padding,
        this.y - 20,
        textWidth + padding * 2,
        20
      );

      // Draw the "CPU" text
      canvas.fillStyle = "white";
      canvas.fillText(text, this.x + this.width / 2, this.y - 5);
    }
  }

  // Method to clone an instance
  clone() {
    const clone = new Mokepon(
      this.name,
      this.inputId,
      this.type,
      this.imageSrc,
      this.imageAlt,
      this.mapImage.src,
      [...this.attacks]
    );

    clone.x = this.x;
    clone.y = this.y;
    clone.speedX = this.speedX;
    clone.speedY = this.speedY;

    return clone;
  }
}

const playerPets = [
  new Mokepon(
    "Hipodoge",
    "hipodoge",
    "💧",
    "../assets/images/mokepons_mokepon_hipodoge_attack.webp",
    "Mokepon Hipodoge",
    "../assets/images/hipodoge_head.png",
    ["💧", "💧", "💧", "🔥", "🌱"]
  ),
  new Mokepon(
    "Capipepo",
    "capipepo",
    "🌱",
    "../assets/images/mokepons_mokepon_capipepo_attack.webp",
    "Mokepon Capipepo",
    "../assets/images/capipepo_head.png",
    ["🌱", "🌱", "🌱", "🔥", "💧"]
  ),
  new Mokepon(
    "Ratigueya",
    "ratigueya",
    "🔥",
    "../assets/images/mokepons_mokepon_ratigueya_attack.webp",
    "Mokepon Ratigueya",
    "../assets/images/ratigueya_head.png",
    ["🔥", "🔥", "🔥", "💧", "🌱"]
  ),
  new Mokepon(
    "Pydos",
    "pydos",
    "💧",
    "../assets/images/mokepons_mokepon_pydos_attack.webp",
    "Mokepon Pydos",
    "../assets/images/pydos_head.webp",
    ["💧", "💧", "💧", "🌱", "🔥"]
  ),
  new Mokepon(
    "Tucapalma",
    "tucapalma",
    "🌱",
    "../assets/images/mokepons_mokepon_tucapalma_attack.webp",
    "Mokepon Tucapalma",
    "../assets/images/tucapalma_head.webp",
    ["🌱", "🌱", "🌱", "💧", "🔥"]
  ),
  new Mokepon(
    "Langostelvis",
    "langostelvis",
    "🔥",
    "../assets/images/mokepons_mokepon_langostelvis_attack.webp",
    "Mokepon Langostelvis",
    "../assets/images/langostelvis_head.webp",
    ["🔥", "🔥", "🔥", "🌱", "💧"]
  ),
];

let enemyPets = [];

const combatRules = {
  "🔥": "🌱", // Left beats right
  "💧": "🔥",
  "🌱": "💧",
};

let roundNumber = 1;
let playerId = "";
let enemyId = "";
let selectedPlayerPet = "";
// let selectedEnemyPet = ''
let playerPetAttack = "";
let enemyPetAttack = "";
const playerPetAvailableAttacks = [];
const enemyPetAvailableAttacks = [];
let getAttackInterval;
let playerAttacks = []; // The attacks that the player has selected to attack the enemy
let enemyAttacks = []; // The attacks that the enemy has selected to attack the player
let attackButtons = [];
let playerPetLives = 3;
let enemyPetLives = 3;

function initializeGameUI() {
  playerPets.forEach((pet) => {
    const input = document.createElement("input");
    input.classList.add("hidden");
    input.type = "radio";
    input.id = pet.inputId;
    input.name = "pet";

    const label = document.createElement("label");
    label.classList.add("pet-card");
    label.setAttribute("for", pet.inputId);

    const img = document.createElement("img");
    img.src = pet.imageSrc;
    img.alt = pet.imageAlt;

    label.textContent = pet.name;
    label.appendChild(img);

    petCardContainer.appendChild(input);
    petCardContainer.appendChild(label);
  });

  const btnSelectPlayerPet = document.querySelector("#btn-select-pet");
  btnSelectPlayerPet.addEventListener("click", selectPlayerPet);

  const showInstructionsBtn = document.querySelector("#instructions");
  showInstructionsBtn.addEventListener("click", showInstructions);

  // To close the error modal that appears when the player doesn't select a pet
  btnCloseErrorModal.addEventListener("click", () => {
    errorMessage.textContent = "";
    errorMessageModal.classList.add("hidden");
  });

  // Replace page reload detection with a more reliable method
  setupPageUnloadHandler();

  // Connect to the server to join the game
  joinGame();
}

// Function to handle page unload/reload events
function setupPageUnloadHandler() {
  // Using 'pagehide' which is more reliable for detecting page unloads
  window.addEventListener("pagehide", () => {
    if (playerId) {
      // Use Navigator.sendBeacon for reliable delivery during page unload
      try {
        const url = `${SERVER_URL}player/${playerId}`;
        navigator.sendBeacon(url);
        console.log("Player removal request sent via Beacon API");
      } catch (e) {
        console.error("Error sending beacon:", e);
      }
    }
  });

  // Also use 'beforeunload' as a backup
  window.addEventListener("beforeunload", () => {
    if (playerId) {
      try {
        // Use fetch with keepalive flag which helps the request survive page unload
        fetch(`${SERVER_URL}player/${playerId}`, {
          method: "DELETE",
          keepalive: true,
          headers: {
            "Content-Type": "application/json",
          },
        }).catch((e) =>
          console.log("Expected error during unload, can be ignored")
        );
      } catch (e) {
        // We expect this might fail during unload, but it's a backup attempt
        console.log("Expected error during unload:", e);
      }
    }
  });
}

async function joinGame() {
  try {
    const response = await fetch(`${SERVER_URL}join`);
    if (!response.ok) {
      throw new Error("Failed to join the game!😢");
    }
    const data = await response.json();
    playerId = data.id;
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    return null;
  }
}

function selectPlayerPet() {
  const petOptions = document.querySelectorAll('input[name="pet"]');

  let playerPetImage = null;

  for (const pet of petOptions) {
    if (pet.checked) {
      // get the label associated with the selected pet
      const petLabel = document.querySelector(`label[for="${pet.id}"]`);
      // selectedPlayerPet = petLabel.textContent.trim()
      selectedPlayerPet = playerPets.find(
        (pet) => pet.name === petLabel.textContent.trim()
      );

      // remove the checked attribute to avoid selecting the same pet again
      pet.checked = false;

      // get the image associated with the selected pet to display it in the attack section
      playerPetImage = petLabel.querySelector("img").cloneNode(true);
      break;
    }
  }

  if (selectedPlayerPet) {
    // Post mokepon info to the server
    postMokeponInfo(selectedPlayerPet);

    // Prepare mokepon info to display in the attack section
    playerPetImage.classList.add("mokepon-image");
    playerPetInfoContainer.appendChild(playerPetImage);
    playerPetNameSpan.textContent = selectedPlayerPet.name;

    showMap();
  } else {
    errorMessage.textContent =
      "Por favor elige un mokepon para iniciar el juego 🐾";
    errorMessageModal.classList.remove("hidden");
  }
}

function showInstructions() {
  const instructionsDialog = document.querySelector("#instructions-dialog");
  instructionsDialog.classList.remove("hidden");
  const closeInstructions = document.querySelector("#close-instructions");
  closeInstructions.addEventListener("click", () => {
    instructionsDialog.classList.add("hidden");
  });
}

async function postMokeponInfo(mokepon) {
  try {
    const response = await fetch(`${SERVER_URL}mokepon/${playerId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mokeponName: mokepon.name,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to post mokepon info!😢");
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Add utility functions for coordinate conversion
function pixelToPercent(pixelX, pixelY, mapWidth, mapHeight) {
  return {
    xPercent: (pixelX / mapWidth) * 100,
    yPercent: (pixelY / mapHeight) * 100,
  };
}

function percentToPixel(xPercent, yPercent, mapWidth, mapHeight) {
  return {
    x: (xPercent * mapWidth) / 100,
    y: (yPercent * mapHeight) / 100,
  };
}

async function showMap() {
  // Resize map for responsiveness
  resizeCanvas();

  // Resize map when the window is resized
  window.addEventListener("resize", () => {
    if (!mapSection.classList.contains("hidden")) {
      resizeCanvas();
      renderCanvas();
    }
  });

  // Get a safe position from the server (now in percentages)
  try {
    const response = await fetch(
      `${SERVER_URL}mokepon/${playerId}/safePosition`
    );
    const data = await response.json();

    if (data.safe) {
      // Convert from percentage to pixel coordinates
      const pixelCoords = percentToPixel(
        data.xPercent,
        data.yPercent,
        map.width,
        map.height
      );
      selectedPlayerPet.x = pixelCoords.x;
      selectedPlayerPet.y = pixelCoords.y;

      // Store the percentage values for reference
      selectedPlayerPet.xPercent = data.xPercent;
      selectedPlayerPet.yPercent = data.yPercent;
    } else {
      // Use a random position if the server doesn't provide a safe one
      selectedPlayerPet.x = getRandomNumber(
        0,
        map.width - selectedPlayerPet.width
      );
      selectedPlayerPet.y = getRandomNumber(
        0,
        map.height - selectedPlayerPet.height
      );

      // Calculate and store percentage values
      const percentCoords = pixelToPercent(
        selectedPlayerPet.x,
        selectedPlayerPet.y,
        map.width,
        map.height
      );
      selectedPlayerPet.xPercent = percentCoords.xPercent;
      selectedPlayerPet.yPercent = percentCoords.yPercent;
    }
  } catch (error) {
    console.error("Error to get a safe position:", error);
    // Use random position as fallback
    selectedPlayerPet.x = getRandomNumber(
      0,
      map.width - selectedPlayerPet.width
    );
    selectedPlayerPet.y = getRandomNumber(
      0,
      map.height - selectedPlayerPet.height
    );

    // Calculate and store percentage values
    const percentCoords = pixelToPercent(
      selectedPlayerPet.x,
      selectedPlayerPet.y,
      map.width,
      map.height
    );
    selectedPlayerPet.xPercent = percentCoords.xPercent;
    selectedPlayerPet.yPercent = percentCoords.yPercent;
  }

  renderMapInterval = setInterval(renderCanvas, 30);
  setUpPetMovementEvents();

  mapSection.classList.remove("hidden");
  selectPetSection.classList.add("hidden");
  footer.classList.add("hidden");
}

function resizeCanvas() {
  const aspectRatio = mapBackground.width / mapBackground.height;
  const maxWidth = 700; // Set the maximum width for the canvas
  map.width = Math.min(window.innerWidth * 0.8, maxWidth);
  map.height = map.width / aspectRatio;

  // When resizing, we need to maintain the percentage position
  if (selectedPlayerPet && selectedPlayerPet.xPercent !== undefined) {
    const pixelCoords = percentToPixel(
      selectedPlayerPet.xPercent,
      selectedPlayerPet.yPercent,
      map.width,
      map.height
    );
    selectedPlayerPet.x = pixelCoords.x;
    selectedPlayerPet.y = pixelCoords.y;
  }

  // Adjust pet sizes based on the new canvas size
  const scaleFactor = map.width / maxWidth;

  if (selectedPlayerPet) {
    resizePets(selectedPlayerPet, scaleFactor);
  }

  // Also resize enemy pets
  enemyPets.forEach((enemy) => {
    if (enemy && enemy.xPercent !== undefined) {
      const pixelCoords = percentToPixel(
        enemy.xPercent,
        enemy.yPercent,
        map.width,
        map.height
      );
      enemy.x = pixelCoords.x;
      enemy.y = pixelCoords.y;

      resizePets(enemy, scaleFactor);
    }
  });

  // Adjust pet speeds based on the new canvas size
  adjustPetSpeed(scaleFactor);
}

function resizePets(pet, scaleFactor) {
  pet.width = Mokepon.DEFAULT_SIZE * scaleFactor;
  pet.height = Mokepon.DEFAULT_SIZE * scaleFactor;
}

function resizePetPositions(positionScaleFactor) {
  selectedPlayerPet.x *= positionScaleFactor;
  selectedPlayerPet.y *= positionScaleFactor;
}

function adjustPetSpeed(scaleFactor) {
  selectedPlayerPet.adjustedSpeedX = Mokepon.BASE_SPEED * scaleFactor;
  selectedPlayerPet.adjustedSpeedY = Mokepon.BASE_SPEED * scaleFactor;
}

function renderCanvas() {
  // Update the pet's position on the map based on the speed
  selectedPlayerPet.x += selectedPlayerPet.speedX;
  selectedPlayerPet.y += selectedPlayerPet.speedY;

  // Update percentage position
  const percentCoords = pixelToPercent(
    selectedPlayerPet.x,
    selectedPlayerPet.y,
    map.width,
    map.height
  );
  selectedPlayerPet.xPercent = percentCoords.xPercent;
  selectedPlayerPet.yPercent = percentCoords.yPercent;

  // Clear the canvas before drawing the pet to avoid leaving a trail
  canvas.clearRect(0, 0, map.width, map.height);

  // Draw the map background and the pets
  canvas.drawImage(mapBackground, 0, 0, map.width, map.height);
  selectedPlayerPet.renderPet();

  // Send mokepon position to the server (now in percentages)
  sendMokeponPosition();

  checkMapBoundaries();

  enemyPets.forEach((enemy) => {
    if (enemy) {
      // Make sure enemy is properly sized for this client's canvas
      resizePets(enemy, map.width / 700);

      // CPU Mokepons don't move, so we don't need to update their positions
      enemy.renderPet();

      // Only check for collisions if the enemy isn't new (to avoid immediate collisions)
      checkCollision(enemy);
    }
  });
}

async function sendMokeponPosition() {
  try {
    const response = await fetch(`${SERVER_URL}mokepon/${playerId}/position`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        xPercent: selectedPlayerPet.xPercent,
        yPercent: selectedPlayerPet.yPercent,
      }),
    });

    const { enemies } = await response.json();

    // Keep track of current enemies
    const previousEnemies = [...enemyPets].filter(Boolean);

    // To update the current enemies or create new ones
    const updatedEnemies = [];

    enemies.forEach((enemy) => {
      if (!enemy.mokepon) return;

      const mokeponName = enemy.mokepon.name || "";
      const existingEnemyIndex = previousEnemies.findIndex(
        (prev) => prev.id === enemy.id
      );

      let enemyPet;

      // If it exists, update its properties
      if (existingEnemyIndex >= 0) {
        enemyPet = previousEnemies[existingEnemyIndex];

        // Store normalized position
        enemyPet.xPercent = enemy.xPercent;
        enemyPet.yPercent = enemy.yPercent;

        // Convert to pixels for this client's canvas
        const pixelCoords = percentToPixel(
          enemy.xPercent,
          enemy.yPercent,
          map.width,
          map.height
        );
        enemyPet.x = pixelCoords.x;
        enemyPet.y = pixelCoords.y;

        // Store CPU status
        enemyPet.isCPU = enemy.isCPU;

        enemyPet.isNew = false; // It's not new anymore
      } else {
        // If it's new, create a new instance
        enemyPet = playerPets.find((pet) => pet.name === mokeponName)?.clone();

        if (enemyPet) {
          enemyPet.id = enemy.id;

          // Store CPU status and set the isCPU property on the Mokepon
          enemyPet.isCPU = enemy.isCPU;

          // Store normalized position
          enemyPet.xPercent = enemy.xPercent;
          enemyPet.yPercent = enemy.yPercent;

          // Convert to pixels for this client's canvas
          const pixelCoords = percentToPixel(
            enemy.xPercent,
            enemy.yPercent,
            map.width,
            map.height
          );
          enemyPet.x = pixelCoords.x;
          enemyPet.y = pixelCoords.y;

          enemyPet.isNew = true;

          // Clear the state after 1 second
          setTimeout(() => {
            if (enemyPet && enemyPets.includes(enemyPet)) {
              enemyPet.isNew = false;
            }
          }, 1000);
        }
      }

      if (enemyPet) {
        // Ensure proper size for this client's canvas
        resizePets(enemyPet, map.width / 700);
        updatedEnemies.push(enemyPet);
      }
    });

    // Update the enemy list
    enemyPets = updatedEnemies;

    if (!response.ok) {
      throw new Error("Failed to send mokepon position!😢");
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

function checkMapBoundaries() {
  // Map limits (in pixels)
  const upMap = 0;
  const downMap = map.height - selectedPlayerPet.height;
  const leftMap = 0;
  const rightMap = map.width - selectedPlayerPet.width;

  // Player edges (in pixels)
  const upPlayer = selectedPlayerPet.y;
  const leftPlayer = selectedPlayerPet.x;

  // Apply boundaries
  if (upPlayer < upMap) {
    selectedPlayerPet.y = upMap;
  }

  if (upPlayer > downMap) {
    selectedPlayerPet.y = downMap;
  }

  if (leftPlayer < leftMap) {
    selectedPlayerPet.x = leftMap;
  }

  if (leftPlayer > rightMap) {
    selectedPlayerPet.x = rightMap;
  }

  // Update percentage position after boundary check
  const percentCoords = pixelToPercent(
    selectedPlayerPet.x,
    selectedPlayerPet.y,
    map.width,
    map.height
  );
  selectedPlayerPet.xPercent = percentCoords.xPercent;
  selectedPlayerPet.yPercent = percentCoords.yPercent;
}

function checkCollision(enemyPet) {
  // Skip collision check for newly added enemies
  if (enemyPet.isNew) {
    return;
  }

  const playerPetDownSide = selectedPlayerPet.y + selectedPlayerPet.height;
  const playerPetUpSide = selectedPlayerPet.y;
  const playerPetRightSide = selectedPlayerPet.x + selectedPlayerPet.width;
  const playerPetLeftSide = selectedPlayerPet.x;

  const enemyPetDownSide = enemyPet.y + enemyPet.height;
  const enemyPetUpSide = enemyPet.y;
  const enemyPetRightSide = enemyPet.x + enemyPet.width;
  const enemyPetLeftSide = enemyPet.x;

  if (
    playerPetDownSide < enemyPetUpSide ||
    playerPetUpSide > enemyPetDownSide ||
    playerPetRightSide < enemyPetLeftSide ||
    playerPetLeftSide > enemyPetRightSide
  ) {
    // No collision detected!
    return;
  }

  // Collision detected!
  stopMovement();
  clearInterval(renderMapInterval);
  showEnemyPetInfo(enemyPet);
  extractPlayerAttacks();

  // Check and boost stronger pet - this works for both human players
  checkAndBoostStrongerPet(enemyPet);

  enemyId = enemyPet.id; // Save the enemy ID to send the right attack to the server

  // Check if enemy is CPU (ID starts with 'cpu-')
  if (enemyId.startsWith("cpu-")) {
    // Check if CPU has type advantage to give them an extra attack
    checkCPUAdvantage(enemyPet);
  }

  setupPlayerAttackButtons();
  selectAttackSection.classList.remove("hidden");
  mapSection.classList.add("hidden");
}

// Function to check if CPU has type advantage and give extra attack
async function checkCPUAdvantage(enemyPet) {
  try {
    // Send request to check advantage and potentially add extra attack
    const response = await fetch(
      `${SERVER_URL}mokepon/${enemyId}/check-advantage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerMokeponType: selectedPlayerPet.type,
        }),
      }
    );
  } catch (error) {
    console.error("Error checking CPU advantage:", error);
  }
}

function setUpPetMovementEvents() {
  const movementButtons = document.querySelectorAll(".movement-btn");

  // Object to track which buttons are pressed
  const keysPressed = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  // Interval to move the pet continuously
  let movementInterval = null;

  // Function to process movement based on pressed keys
  function processMovement() {
    if (keysPressed.up) movePet("up");
    if (keysPressed.down) movePet("down");
    if (keysPressed.left) movePet("left");
    if (keysPressed.right) movePet("right");
  }

  // Start continuous movement
  function startContinuousMovement() {
    if (!movementInterval) {
      movementInterval = setInterval(processMovement, 30);
    }
  }

  // Stop movement if no keys are pressed
  function checkStopMovement() {
    if (
      !keysPressed.up &&
      !keysPressed.down &&
      !keysPressed.left &&
      !keysPressed.right
    ) {
      clearInterval(movementInterval);
      movementInterval = null;
      stopMovement();
    }
  }

  // Configure touch events for the buttons
  for (const button of movementButtons) {
    // Get the direction from the button's class name
    const direction = button.className.match(/movement-btn--(\w+)/)[1];

    // Start movement when the button is pressed
    button.addEventListener("touchstart", (e) => {
      if (e.cancelable) {
        e.preventDefault(); // Prevent default touch behavior
      }
      keysPressed[direction] = true;
      startContinuousMovement();
    });

    // Stop movement when the button is released
    button.addEventListener("touchend", () => {
      keysPressed[direction] = false;
      checkStopMovement();
    });

    // Stop movement when the touch is canceled
    button.addEventListener("touchcancel", () => {
      keysPressed[direction] = false;
      checkStopMovement();
    });

    // Mouse events for desktop users
    button.addEventListener("mousedown", () => {
      keysPressed[direction] = true;
      startContinuousMovement();
    });

    button.addEventListener("mouseup", () => {
      keysPressed[direction] = false;
      checkStopMovement();
    });

    button.addEventListener("mouseleave", () => {
      keysPressed[direction] = false;
      checkStopMovement();
    });
  }

  // Keyboard events for desktop users
  window.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowUp":
        keysPressed.up = true;
        break;
      case "ArrowDown":
        keysPressed.down = true;
        break;
      case "ArrowLeft":
        keysPressed.left = true;
        break;
      case "ArrowRight":
        keysPressed.right = true;
        break;
    }
    startContinuousMovement();
  });

  window.addEventListener("keyup", (event) => {
    switch (event.key) {
      case "ArrowUp":
        keysPressed.up = false;
        break;
      case "ArrowDown":
        keysPressed.down = false;
        break;
      case "ArrowLeft":
        keysPressed.left = false;
        break;
      case "ArrowRight":
        keysPressed.right = false;
        break;
    }
    checkStopMovement();
  });
}

function movePet(direction) {
  // Use the adjusted speed
  const speedX = selectedPlayerPet.adjustedSpeedX;
  const speedY = selectedPlayerPet.adjustedSpeedY;
  switch (direction) {
    case "up":
    case "ArrowUp":
      selectedPlayerPet.speedY = -speedY;
      break;
    case "down":
    case "ArrowDown":
      selectedPlayerPet.speedY = speedY;
      break;
    case "left":
    case "ArrowLeft":
      selectedPlayerPet.speedX = -speedX;
      break;
    case "right":
    case "ArrowRight":
      selectedPlayerPet.speedX = speedX;
      break;
  }
}

function stopMovement() {
  if (selectedPlayerPet) {
    selectedPlayerPet.speedX = 0;
    selectedPlayerPet.speedY = 0;
  }
}

function showEnemyPetInfo(enemyPet) {
  const enemyPetImage = document.createElement("img");
  enemyPetImage.src = enemyPet.imageSrc;
  enemyPetImage.alt = enemyPet.imageAlt;
  enemyPetImage.classList.add("mokepon-image");

  enemyPetInfoContainer.appendChild(enemyPetImage);
  enemyPetNameSpan.textContent = enemyPet.name;
}

function extractPlayerAttacks() {
  playerPetAvailableAttacks.push(...selectedPlayerPet.attacks);
}

function checkAndBoostStrongerPet(enemyPet) {
  if (combatRules[selectedPlayerPet.type] === enemyPet.type) {
    playerPetAvailableAttacks.push(
      selectedPlayerPet.attacks[selectedPlayerPet.attacks.length - 1]
    );
  }
}

function setupPlayerAttackButtons() {
  for (const attack of playerPetAvailableAttacks) {
    const attackButton = document.createElement("button");
    attackButton.classList.add("attack-button");
    attackButton.textContent = attack;

    attackButton.addEventListener("click", () => {
      attackButton.disabled = true;
      attackButton.classList.add("clicked");
      playerAttacks.push(attack);
      sendMokeponAttacks();
    });

    attackButtonContainer.appendChild(attackButton);
  }
}

function sendMokeponAttacks() {
  // Deactivate the attack buttons after the player has selected an attack before sending the attacks to the server and before the enemy selects its attack
  attackButtons = document.querySelectorAll(".attack-button");
  attackButtons.forEach((attackButton) => {
    attackButton.disabled = true;
    attackButton.classList.add("disabled");
  });

  fetch(`${SERVER_URL}mokepon/${playerId}/attacks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      attacks: playerAttacks,
    }),
  })
    .then(() => {
      // Set interval to get enemy attack if it doesn't exist
      if (!getAttackInterval) {
        getAttackInterval = setInterval(getEnemyAttacks, 50);
      }
    })
    .catch((error) => {
      console.error("There was a problem to send the attack: ", error);
    });
}

async function getEnemyAttacks() {
  // Clear the previous interval if it exists
  clearInterval(getAttackInterval);
  getAttackInterval = null;

  try {
    const response = await fetch(`${SERVER_URL}mokepon/${enemyId}/attacks`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to get enemy attacks!😢");
    }

    // Check if this is a CPU enemy
    const isCPU = data.isCPU || false;
    enemyAttacks = data.attacks;

    // If it's a CPU and it hasn't selected an attack for this round yet
    if (isCPU && enemyAttacks.length < playerAttacks.length) {
      // Request a new CPU attack
      const cpuResponse = await fetch(
        `${SERVER_URL}mokepon/${enemyId}/cpu-attack`
      );
      const cpuData = await cpuResponse.json();

      if (cpuResponse.ok) {
        // Update our local copy of CPU attacks
        enemyAttacks = cpuData.allAttacks;
      }
    }

    // Check if both players have selected their attacks
    if (enemyAttacks.length === playerAttacks.length) {
      combat();
    } else {
      // Set the interval again if needed
      getAttackInterval = setInterval(getEnemyAttacks, 50);
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

function combat() {
  playerPetAttack = playerAttacks[playerAttacks.length - 1];
  enemyPetAttack = enemyAttacks[enemyAttacks.length - 1];

  if (playerPetAttack === enemyPetAttack) {
    createCombatMessages("¡Es un empate!🫱🏼‍🫲🏼");
  } else if (combatRules[playerPetAttack] === enemyPetAttack) {
    createCombatMessages("¡Ganaste!🏆");
    enemyPetLives--;
    updatePetLives();
  } else {
    createCombatMessages("Perdiste☹️");
    playerPetLives--;
    updatePetLives();
  }

  // Activate the attack buttons again
  attackButtons.forEach((attackButton) => {
    if (!attackButton.classList.contains("clicked")) {
      attackButton.disabled = false;
      attackButton.classList.remove("disabled");
    }
  });

  checkLives();
}

function createCombatMessages(combatResult) {
  combatResultParagraph.textContent = combatResult;

  const playerAttackMessage = document.createElement("p");
  playerAttackMessage.textContent = playerPetAttack;
  playerAttackSection.appendChild(playerAttackMessage);

  const enemyAttackMessage = document.createElement("p");
  enemyAttackMessage.textContent = enemyPetAttack;
  enemyAttackSection.appendChild(enemyAttackMessage);
}

function updatePetLives() {
  playerPetLivesSpan.textContent = "❤️".repeat(playerPetLives);
  enemyPetLivesSpan.textContent = "❤️".repeat(enemyPetLives);

  if (playerPetLives === 0) {
    playerPetLivesSpan.textContent = "😢";
  } else if (enemyPetLives === 0) {
    enemyPetLivesSpan.textContent = "😢";
  }
}

function checkLives() {
  if (playerPetLives === 0) {
    createFinalMessage("Perdiste ☹️");
  } else if (enemyPetLives === 0) {
    createFinalMessage("¡Ganaste el juego!🎉");
  }
  // Check if the round is over and enable attack buttons again for the next round if there are lives left
  else if (isRoundOver(attackButtons)) {
    // Disable any remaining attack button before preparing the next round
    const enabledButtons = Array.from(attackButtons).filter(
      (attackButton) => !attackButton.disabled
    );

    enabledButtons.forEach((button) => {
      button.disabled = true;
      button.classList.add("disabled");
    });

    // Prepare next round
    setTimeout(() => {
      // Reset all buttons for the next round
      for (const attackButton of attackButtons) {
        attackButton.disabled = false;
        attackButton.classList.remove("disabled");
        attackButton.classList.remove("clicked");
      }

      // Reset attacks for new round
      enemyAttacks.length = 0;
      playerAttacks.length = 0;

      // For CPU enemies, we need to explicitly reset their available attacks
      if (enemyId.startsWith("cpu-")) {
        // Tell the server to reset the CPU's attacks for the next round
        fetch(`${SERVER_URL}mokepon/${enemyId}/reset-attacks`, {
          method: "POST",
        }).catch((error) => {
          console.error("Error resetting CPU attacks:", error);
        });
      }

      roundNumberSpan.textContent = ++roundNumber;
      combatResultParagraph.textContent = "¡Buena suerte! 😎";
    }, 1000);
  }

  if (playerPetLives === 0 || enemyPetLives === 0) endGame();
}

function isRoundOver(attackButtons) {
  // New condition: If all player attack buttons are disabled (player used all attacks)
  const allPlayerButtonsDisabled = Array.from(attackButtons).every(
    (attackButton) => attackButton.disabled
  );

  // If the player has used all their attacks, the round is over
  // This happens regardless of whether the CPU has remaining attacks or not
  if (allPlayerButtonsDisabled) {
    return true;
  }

  // The other conditions remain the same
  return (
    enemyAttacks.length == 5 ||
    enemyAttacks.length == 10 ||
    enemyAttacks.length == 15
  );
}

function createFinalMessage(finalMessage) {
  const resultMessage = document.createElement("p");
  resultMessage.textContent = finalMessage;
  gameResultContainer.appendChild(resultMessage);

  // Show confetti if the player wins
  if (
    finalMessage.includes("won") ||
    finalMessage.includes("Ganaste el juego")
  ) {
    launchConfetti();
  }
}

function launchConfetti() {
  const duration = 3 * 1000;
  const end = Date.now() + duration;

  const colors = ["#ffc857", "#4b3f72", "#119da4", "#ffffff"];

  (function frame() {
    // Launch confetti on the left side of the screen
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    });
    // Launch confetti on the right side of the screen
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

function endGame() {
  const btnRestartGame = document.querySelector("#btn-restart-game");

  // Remove any previous event listeners to avoid multiple triggers
  btnRestartGame.removeEventListener("click", restartGame);
  btnRestartGame.addEventListener("click", restartGame);

  // Show the restart section
  resultModal.classList.remove("hidden");
}

function restartGame() {
  fetch(`${SERVER_URL}player/${playerId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      // Restart UI and game variables
      resetGameState();

      // Rejoin the game to get a new player ID
      joinGame();
    })
    .catch((error) => {
      console.error("Error deleting player:", error);
      // Continue with the game even if the player couldn't be deleted
      resetGameState();
      joinGame();
    });
}

function resetGameState() {
  roundNumber = 1;
  selectedPlayerPet = "";
  playerPetAttack = "";
  enemyPetAttack = "";
  playerPetLives = 3;
  enemyPetLives = 3;

  roundNumberSpan.textContent = roundNumber;
  if (playerPetInfoContainer.lastChild) {
    playerPetInfoContainer.lastChild.remove();
  }
  if (enemyPetInfoContainer.lastChild) {
    enemyPetInfoContainer.lastChild.remove();
  }
  playerPetNameSpan.textContent = "";
  enemyPetNameSpan.textContent = "";
  playerPetLivesSpan.textContent = "❤️".repeat(playerPetLives);
  enemyPetLivesSpan.textContent = "❤️".repeat(enemyPetLives);
  combatResultParagraph.textContent = "¡Buena suerte! 😎";

  attackButtonContainer.textContent = "";
  playerAttackSection.textContent = "";
  enemyAttackSection.textContent = "";
  playerPetAvailableAttacks.length = 0;
  enemyPetAvailableAttacks.length = 0;
  playerAttacks = [];
  enemyAttacks = [];
  enemyPets = [];

  // Clean up any pending intervals
  if (getAttackInterval) {
    clearInterval(getAttackInterval);
    getAttackInterval = null;
  }
  if (renderMapInterval) {
    clearInterval(renderMapInterval);
    renderMapInterval = null;
  }

  selectPetSection.classList.remove("hidden");
  footer.classList.remove("hidden");
  selectAttackSection.classList.add("hidden");
  mapSection.classList.add("hidden");

  if (gameResultContainer.lastChild) {
    gameResultContainer.lastChild.remove();
  }
  resultModal.classList.add("hidden");
}

initializeGameUI();
