"use strict";

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
  constructor(
    name,
    id,
    type,
    imageSrc,
    imageAlt,
    mapImage,
    attacks,
    x = 10,
    y = 30
  ) {
    this.name = name;
    this.id = id;
    this.type = type;
    this.imageSrc = imageSrc;
    this.imageAlt = imageAlt;
    this.mapImage = new Image();
    this.mapImage.src = mapImage;
    this.x = x;
    this.y = y;
    this.width = 80;
    this.height = 80;
    this.speedX = 0;
    this.speedY = 0;
    this.attacks = attacks;
  }

  renderPet() {
    canvas.drawImage(this.mapImage, this.x, this.y, this.width, this.height);
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
    ["💧", "💧", "💧", "🔥", "🌱"],
    10,
    30
  ),
  new Mokepon(
    "Capipepo",
    "capipepo",
    "🌱",
    "../assets/images/mokepons_mokepon_capipepo_attack.webp",
    "Mokepon Capipepo",
    "../assets/images/capipepo_head.png",
    ["🌱", "🌱", "🌱", "🔥", "💧"],
    50,
    100
  ),
  new Mokepon(
    "Ratigueya",
    "ratigueya",
    "🔥",
    "../assets/images/mokepons_mokepon_ratigueya_attack.webp",
    "Mokepon Ratigueya",
    "../assets/images/ratigueya_head.png",
    ["🔥", "🔥", "🔥", "💧", "🌱"],
    100,
    231
  ),
  // TODO: Create map images for the following pets
  new Mokepon(
    "Pydos",
    "pydos",
    "💧",
    "../assets/images/mokepons_mokepon_pydos_attack.webp",
    "Mokepon Pydos",
    "../assets/images/mokepons_mokepon_pydos_attack.webp",
    ["💧", "💧", "💧", "🌱", "🔥"],
    200,
    300
  ),
  new Mokepon(
    "Tucapalma",
    "tucapalma",
    "🌱",
    "../assets/images/mokepons_mokepon_tucapalma_attack.webp",
    "Mokepon Tucapalma",
    "../assets/images/mokepons_mokepon_tucapalma_attack.webp",
    ["🌱", "🌱", "🌱", "💧", "🔥"],
    400,
    200
  ),
  new Mokepon(
    "Langostelvis",
    "langostelvis",
    "🔥",
    "../assets/images/mokepons_mokepon_langostelvis_attack.webp",
    "Mokepon Langostelvis",
    "../assets/images/mokepons_mokepon_langostelvis_attack.webp",
    ["🔥", "🔥", "🔥", "🌱", "💧"],
    500,
    100
  ),
];

const enemyPets = [
  new Mokepon(
    "Hipodoge",
    "hipodoge",
    "💧",
    "../assets/images/mokepons_mokepon_hipodoge_attack.webp",
    "Mokepon Hipodoge",
    "../assets/images/hipodoge_head.png",
    ["💧", "💧", "💧", "🔥", "🌱"],
    51,
    89
  ),
  new Mokepon(
    "Capipepo",
    "capipepo",
    "🌱",
    "../assets/images/mokepons_mokepon_capipepo_attack.webp",
    "Mokepon Capipepo",
    "../assets/images/capipepo_head.png",
    ["🌱", "🌱", "🌱", "🔥", "💧"],
    100,
    200
  ),
  new Mokepon(
    "Ratigueya",
    "ratigueya",
    "🔥",
    "../assets/images/mokepons_mokepon_ratigueya_attack.webp",
    "Mokepon Ratigueya",
    "../assets/images/ratigueya_head.png",
    ["🔥", "🔥", "🔥", "💧", "🌱"],
    145,
    123
  ),
  // TODO: Create map images for the following pets
  new Mokepon(
    "Pydos",
    "pydos",
    "💧",
    "../assets/images/mokepons_mokepon_pydos_attack.webp",
    "Mokepon Pydos",
    "../assets/images/mokepons_mokepon_pydos_attack.webp",
    ["💧", "💧", "💧", "🌱", "🔥"],
    200,
    300
  ),
  new Mokepon(
    "Tucapalma",
    "tucapalma",
    "🌱",
    "../assets/images/mokepons_mokepon_tucapalma_attack.webp",
    "Mokepon Tucapalma",
    "../assets/images/mokepons_mokepon_tucapalma_attack.webp",
    ["🌱", "🌱", "🌱", "💧", "🔥"],
    468,
    99
  ),
  new Mokepon(
    "Langostelvis",
    "langostelvis",
    "🔥",
    "../assets/images/mokepons_mokepon_langostelvis_attack.webp",
    "Mokepon Langostelvis",
    "../assets/images/mokepons_mokepon_langostelvis_attack.webp",
    ["🔥", "🔥", "🔥", "🌱", "💧"],
    535,
    121
  ),
];

const combatRules = {
  "🔥": "🌱", // Left beats right
  "💧": "🔥",
  "🌱": "💧",
};

let roundNumber = 1;
let selectedPlayerPet = "";
let selectedEnemyPet = "";
let playerPetAttack = "";
let enemyPetAttack = "";
const playerPetAvailableAttacks = [];
const enemyPetAvailableAttacks = []; // To save enemy's attacks to select one randomly
let playerPetLives = 3;
let enemyPetLives = 3;

function startGame() {
  playerPets.forEach((pet) => {
    const input = document.createElement("input");
    input.classList.add("hidden");
    input.type = "radio";
    input.id = pet.id;
    input.name = "pet";

    const label = document.createElement("label");
    label.classList.add("pet-card");
    label.setAttribute("for", pet.id);

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

  // To close the error modal that appears when the player doesn't select a pet
  btnCloseErrorModal.addEventListener("click", () => {
    errorMessage.textContent = "";
    errorMessageModal.classList.add("hidden");
  });
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
    playerPetImage.classList.add("mokepon-image");
    playerPetInfoContainer.appendChild(playerPetImage);
    playerPetNameSpan.textContent = selectedPlayerPet.name;
    selectEnemyPet();
    extractPlayerAttacks();
    checkAndBoostStrongerPet();
    setupPlayerAttackButtons();
  } else {
    errorMessage.textContent = "Please select a pet to start the game!🐾";
    errorMessageModal.classList.remove("hidden");
  }
}

function selectEnemyPet() {
  const randomIndex = getRandomNumber(0, enemyPets.length - 1);
  selectedEnemyPet = enemyPets[randomIndex];

  showMap();

  const enemyPetImage = document.createElement("img");
  enemyPetImage.src = enemyPets[randomIndex].imageSrc;
  enemyPetImage.alt = enemyPets[randomIndex].imageAlt;
  enemyPetImage.classList.add("mokepon-image");

  enemyPetInfoContainer.appendChild(enemyPetImage);
  enemyPetNameSpan.textContent = selectedEnemyPet.name;

  // Extract attacks from the selected enemy pet
  enemyPetAvailableAttacks.push(...selectedEnemyPet.attacks);

  // selectAttackSection.classList.remove('hidden')
  selectPetSection.classList.add("hidden");
  footer.classList.add("hidden");
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function showMap() {
  // Resize map for responsiveness
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  renderMapInterval = setInterval(renderCanvas, 50);
  setUpPetMovementEvents();
  mapSection.classList.remove("hidden");
}

function resizeCanvas() {
  const aspectRatio = mapBackground.width / mapBackground.height;
  const maxWidth = 700; // Set the maximum width for the canvas
  map.width = Math.min(window.innerWidth * 0.8, maxWidth);
  map.height = map.width / aspectRatio;
  renderCanvas();
}

function renderCanvas() {
  // Update the pet's position on the map based on the speed
  selectedPlayerPet.x += selectedPlayerPet.speedX;
  selectedPlayerPet.y += selectedPlayerPet.speedY;

  // Clear the canvas before drawing the pet to avoid leaving a trail
  canvas.clearRect(0, 0, map.width, map.height);

  // Draw the map background and the pets
  canvas.drawImage(mapBackground, 0, 0, map.width, map.height);
  selectedPlayerPet.renderPet();
  selectedEnemyPet.renderPet();

  if (selectedPlayerPet.speedX !== 0 || selectedPlayerPet.speedY !== 0)
    checkCollision();
}

function checkCollision() {
  const playerPetDownSide = selectedPlayerPet.y + selectedPlayerPet.height;
  const playerPetUpSide = selectedPlayerPet.y;
  const playerPetRightSide = selectedPlayerPet.x + selectedPlayerPet.width;
  const playerPetLeftSide = selectedPlayerPet.x;

  const enemyPetDownSide = selectedEnemyPet.y + selectedEnemyPet.height;
  const enemyPetUpSide = selectedEnemyPet.y;
  const enemyPetRightSide = selectedEnemyPet.x + selectedEnemyPet.width;
  const enemyPetLeftSide = selectedEnemyPet.x;

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
  selectAttackSection.classList.remove("hidden");
  mapSection.classList.add("hidden");
}

function setUpPetMovementEvents() {
  const movementButtons = document.querySelectorAll(".movement-btn");

  for (const button of movementButtons) {
    // Mouse events to move the pet
    button.addEventListener("mousedown", () => {
      movePet(button.id);
    });

    button.addEventListener("mouseup", () => {
      stopMovement(); // Stop the pet when the button is released
    });

    // Touch events to move the pet
    button.addEventListener("touchstart", () => {
      movePet(button.id);
    });

    button.addEventListener("touchend", () => {
      stopMovement();
    });
  }

  // Keyboard events to move the pet
  window.addEventListener("keydown", (event) => {
    movePet(event.key);
  });

  window.addEventListener("keyup", stopMovement);
}

function movePet(direction) {
  switch (direction) {
    case "up":
    case "ArrowUp":
      selectedPlayerPet.speedY = -8;
      break;
    case "down":
    case "ArrowDown":
      selectedPlayerPet.speedY = 8;
      break;
    case "left":
    case "ArrowLeft":
      selectedPlayerPet.speedX = -8;
      break;
    case "right":
    case "ArrowRight":
      selectedPlayerPet.speedX = 8;
      break;
  }
}

function stopMovement() {
  selectedPlayerPet.speedX = 0;
  selectedPlayerPet.speedY = 0;
}

function extractPlayerAttacks() {
  playerPetAvailableAttacks.push(...selectedPlayerPet.attacks);
}

function checkAndBoostStrongerPet() {
  if (combatRules[selectedPlayerPet.type] === selectedEnemyPet.type) {
    playerPetAvailableAttacks.push(
      selectedPlayerPet.attacks[selectedPlayerPet.attacks.length - 1]
    );
  } else if (combatRules[selectedEnemyPet.type] === selectedPlayerPet.type) {
    enemyPetAvailableAttacks.push(
      selectedEnemyPet.attacks[selectedEnemyPet.attacks.length - 1]
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
      attackButton.classList.add("disabled");
      playerPetAttack = attack;
      selectEnemyPetAttack();
    });

    attackButtonContainer.appendChild(attackButton);
  }
}

function selectEnemyPetAttack() {
  const randomIndex = getRandomNumber(0, enemyPetAvailableAttacks.length - 1);
  // Remove the selected attack from the available attacks to avoid selecting it again
  enemyPetAttack = enemyPetAvailableAttacks.splice(randomIndex, 1).join("");
  combat();
}

function combat() {
  if (playerPetAttack === enemyPetAttack) {
    createCombatMessages("It's a tie!🫱🏼‍🫲🏼");
  } else if (combatRules[playerPetAttack] === enemyPetAttack) {
    createCombatMessages("You win!🏆");
    enemyPetLives--;
    updatePetLives();
  } else {
    createCombatMessages("You lose!☹️");
    playerPetLives--;
    updatePetLives();
  }

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
  // Save all attack buttons to check if the round is over and enable them again for the next round if there are lives left
  const attackButtons = document.querySelectorAll(".attack-button");

  if (playerPetLives === 0) {
    createFinalMessage("You lost the game☹️");
  } else if (enemyPetLives === 0) {
    createFinalMessage("You won the game!🎉");
  } else if (isRoundOver(attackButtons)) {
    // Disable the attack button left before preparing the next round
    const attackButtonLeft = Array.from(attackButtons).find(
      (attackButton) => attackButton.disabled === false
    );

    if (attackButtonLeft) {
      attackButtonLeft.disabled = true;
      attackButtonLeft.classList.add("disabled");
    }

    // Prepare next round
    setTimeout(() => {
      for (const attackButton of attackButtons) {
        attackButton.disabled = false;
        attackButton.classList.remove("disabled");
      }

      enemyPetAvailableAttacks.length = 0;
      enemyPetAvailableAttacks.push(...selectedEnemyPet.attacks);

      roundNumberSpan.textContent = ++roundNumber;
      combatResultParagraph.textContent = "Good luck! 😎";
    }, 1000);
  }

  if (playerPetLives === 0 || enemyPetLives === 0) endGame();
}

function isRoundOver(attackButtons) {
  return (
    Array.from(attackButtons).every((attackButton) => attackButton.disabled) ||
    enemyPetAvailableAttacks.length === 0
  );
}

function createFinalMessage(finalMessage) {
  const resultMessage = document.createElement("p");
  resultMessage.textContent = finalMessage;
  gameResultContainer.appendChild(resultMessage);
}

function endGame() {
  const btnRestartGame = document.querySelector("#btn-restart-game");
  btnRestartGame.addEventListener("click", restartGame);

  // Show the restart section
  resultModal.classList.remove("hidden");
}

function restartGame() {
  roundNumber = 1;
  selectedPlayerPet = "";
  selectedEnemyPet = "";
  playerPetAttack = "";
  enemyPetAttack = "";
  playerPetLives = 3;
  enemyPetLives = 3;

  roundNumberSpan.textContent = roundNumber;
  playerPetInfoContainer.lastChild.remove();
  enemyPetInfoContainer.lastChild.remove();
  playerPetNameSpan.textContent = "";
  enemyPetNameSpan.textContent = "";
  playerPetLivesSpan.textContent = "❤️".repeat(playerPetLives);
  enemyPetLivesSpan.textContent = "❤️".repeat(enemyPetLives);
  combatResultParagraph.textContent = "Good luck! 😎";

  attackButtonContainer.textContent = "";
  playerAttackSection.textContent = "";
  enemyAttackSection.textContent = "";
  playerPetAvailableAttacks.length = 0;
  enemyPetAvailableAttacks.length = 0;

  selectPetSection.classList.remove("hidden");
  footer.classList.remove("hidden");
  selectAttackSection.classList.add("hidden");
  gameResultContainer.lastChild.remove();
  resultModal.classList.add("hidden");
}

startGame();
