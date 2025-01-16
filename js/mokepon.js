'use strict'

let playerPetAttack = ''
let enemyPetAttack = ''
let playerPetLives = 3
let enemyPetLives = 3

// Cached DOM elements
const selectPetSection = document.querySelector('#select-pet')
const petOptions = document.querySelectorAll('input[name="pet"]')
const selectAttackSection = document.querySelector('#select-attack')
const playerPetNameSpan = document.querySelector('#player-pet-name') // span to display player's pet name
const enemyPetNameSpan = document.querySelector('#enemy-pet-name') // span to display enemy's pet name
const playerPetLivesSpan = document.querySelector('#player-pet-lives')
const enemyPetLivesSpan = document.querySelector('#enemy-pet-lives')
const attacks = document.querySelectorAll('#select-attack button')
const resultMessagesSection = document.querySelector('#result-messages')
const restartSection = document.querySelector('#restart')

function startGame() {
  // Hide the attack and restart sections at the beginning to avoid distracting the player
  selectAttackSection.classList.add('hidden')
  restartSection.classList.add('hidden')

  const btnSelectPlayerPet = document.querySelector('#btn-select-pet')
  btnSelectPlayerPet.addEventListener('click', selectPlayerPet)

  // Add event listeners to the attack buttons so the player can select an attack
  addAttackEventListeners()
}

function selectPlayerPet() {
  let selectedPlayerPet = null

  for (const pet of petOptions) {
    if (pet.checked) {
      // get the text content of the label associated with the selected pet
      selectedPlayerPet = document
        .querySelector(`label[for="${pet.id}"]`)
        .textContent.trim()
      break
    }
  }

  if (selectedPlayerPet) {
    playerPetNameSpan.textContent = selectedPlayerPet
    selectEnemyPet()
  } else {
    alert('Please select a pet')
  }
}

function selectEnemyPet() {
  const pets = document.querySelectorAll('label')
  const randomIndex = getRandomNumber(0, pets.length - 1)
  const selectedEnemyPet = pets[randomIndex].textContent
  enemyPetNameSpan.textContent = selectedEnemyPet

  selectAttackSection.classList.remove('hidden')
  selectPetSection.classList.add('hidden')
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function addAttackEventListeners() {
  for (const attack of attacks) {
    attack.addEventListener('click', () => {
      playerPetAttack = attack.textContent
      selectEnemyPetAttack()
    })
  }
}

function selectEnemyPetAttack() {
  const randomIndex = getRandomNumber(0, attacks.length - 1)
  enemyPetAttack = attacks[randomIndex].textContent
  combat()
}

function combat() {
  const combatRules = {
    'Fire🔥': 'Grass🌱', // Fire beats Grass
    'Water💧': 'Fire🔥', // Water beats Fire
    'Grass🌱': 'Water💧' // Grass beats Water
  }

  if (playerPetAttack === enemyPetAttack) {
    createCombatResultMessage('It was a tie!🫱🏼‍🫲🏼')
  } else if (combatRules[playerPetAttack] === enemyPetAttack) {
    createCombatResultMessage('You win!🏆')
    enemyPetLives--
    updatePetLives()
  } else {
    createCombatResultMessage('You lose!☹️')
    playerPetLives--
    updatePetLives()
  }

  checkLives()
}

function createCombatResultMessage(combatResult) {
  const resultMessage = document.createElement('p')
  resultMessage.textContent = `Your pet attacked with ${playerPetAttack.toUpperCase()}. The enemy's pet attacked with ${enemyPetAttack.toUpperCase()} - ${combatResult}`
  resultMessagesSection.appendChild(resultMessage)
}

function updatePetLives() {
  playerPetLivesSpan.textContent = playerPetLives
  enemyPetLivesSpan.textContent = enemyPetLives
}

function checkLives() {
  if (playerPetLives === 0) {
    createFinalMessage('You lost the game☹️')
  } else if (enemyPetLives === 0) {
    createFinalMessage('You won the game!🎉')
  }

  if (playerPetLives === 0 || enemyPetLives === 0) endGame()
}

function createFinalMessage(finalMessage) {
  const resultMessage = document.createElement('p')
  resultMessage.textContent = finalMessage
  resultMessagesSection.appendChild(resultMessage)
}

function endGame() {
  // Disable the attack buttons to avoid attacking again
  attacks.forEach(attack => (attack.disabled = true))

  const btnRestartGame = document.querySelector('#btn-restart-game')
  btnRestartGame.addEventListener('click', restartGame)

  // Show the restart section
  restartSection.classList.remove('hidden')
}

function restartGame() {
  playerPetAttack = ''
  enemyPetAttack = ''
  playerPetLives = 3
  enemyPetLives = 3

  playerPetNameSpan.textContent = ''
  enemyPetNameSpan.textContent = ''
  playerPetLivesSpan.textContent = playerPetLives
  enemyPetLivesSpan.textContent = enemyPetLives
  resultMessagesSection.textContent = ''

  for (const pet of petOptions) {
    if (pet.checked) {
      pet.checked = false
      break
    }
  }

  attacks.forEach(attack => (attack.disabled = false))

  selectPetSection.classList.remove('hidden')
  selectAttackSection.classList.add('hidden')
  restartSection.classList.add('hidden')
}

startGame()
