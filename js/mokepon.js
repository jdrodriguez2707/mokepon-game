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
const playerPetInfoContainer = document.querySelector('#player-pet-info')
const enemyPetInfoContainer = document.querySelector('#enemy-pet-info')
const attacks = document.querySelectorAll('#select-attack button')
const playerAttackSection = document.querySelector('#player-attacks')
const enemyAttackSection = document.querySelector('#enemy-attacks')
const combatResultParagraph = document.querySelector('#combat-result')
const resultMessagesSection = document.querySelector('#result-messages')
const resultModal = document.querySelector('#result-modal')
const gameResultContainer = document.querySelector('#game-result-container')

function startGame() {
  // Hide the attack and restart sections at the beginning to avoid distracting the player
  selectAttackSection.classList.add('hidden')
  resultModal.classList.add('hidden')

  const btnSelectPlayerPet = document.querySelector('#btn-select-pet')
  btnSelectPlayerPet.addEventListener('click', selectPlayerPet)

  // Add event listeners to the attack buttons so the player can select an attack
  addAttackEventListeners()
}

function selectPlayerPet() {
  let selectedPlayerPet = null
  let playerPetImage = null

  for (const pet of petOptions) {
    if (pet.checked) {
      // get the label associated with the selected pet
      const petLabel = document.querySelector(`label[for="${pet.id}"]`)
      selectedPlayerPet = petLabel.textContent.trim()

      // remove the checked attribute to avoid selecting the same pet again
      pet.checked = false

      // get the image associated with the selected pet to display it in the attack section
      playerPetImage = petLabel.querySelector('img').cloneNode(true)
      break
    }
  }

  if (selectedPlayerPet) {
    playerPetImage.classList.add('mokepon-image')
    playerPetInfoContainer.appendChild(playerPetImage)
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
  const enemyPetImage = pets[randomIndex].querySelector('img').cloneNode(true)
  enemyPetImage.classList.add('mokepon-image')
  enemyPetInfoContainer.appendChild(enemyPetImage)
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
    createCombatResultMessage("It's a tie!🫱🏼‍🫲🏼")
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
  combatResultParagraph.textContent = combatResult

  const playerAttackMessage = document.createElement('p')
  playerAttackMessage.textContent = playerPetAttack
  playerAttackSection.appendChild(playerAttackMessage)

  const enemyAttackMessage = document.createElement('p')
  enemyAttackMessage.textContent = enemyPetAttack
  enemyAttackSection.appendChild(enemyAttackMessage)
}

function updatePetLives() {
  playerPetLivesSpan.textContent = '❤️'.repeat(playerPetLives)
  enemyPetLivesSpan.textContent = '❤️'.repeat(enemyPetLives)

  if (playerPetLives === 0) {
    playerPetLivesSpan.textContent = '😢'
  } else if (enemyPetLives === 0) {
    enemyPetLivesSpan.textContent = '😢'
  }
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
  gameResultContainer.appendChild(resultMessage)
}

function endGame() {
  // Disable the attack buttons to avoid attacking again
  attacks.forEach(attack => {
    attack.disabled = true
    attack.classList.add('disabled')
  })

  const btnRestartGame = document.querySelector('#btn-restart-game')
  btnRestartGame.addEventListener('click', restartGame)

  // Show the restart section
  resultModal.classList.remove('hidden')
}

function restartGame() {
  playerPetAttack = ''
  enemyPetAttack = ''
  playerPetLives = 3
  enemyPetLives = 3

  playerPetInfoContainer.lastChild.remove()
  enemyPetInfoContainer.lastChild.remove()
  playerPetNameSpan.textContent = ''
  enemyPetNameSpan.textContent = ''
  playerPetLivesSpan.textContent = '❤️'.repeat(playerPetLives)
  enemyPetLivesSpan.textContent = '❤️'.repeat(enemyPetLives)
  combatResultParagraph.textContent = 'Good luck! 😎'

  attacks.forEach(attack => {
    attack.disabled = false
    attack.classList.remove('disabled')
  })

  playerAttackSection.textContent = ''
  enemyAttackSection.textContent = ''

  selectPetSection.classList.remove('hidden')
  selectAttackSection.classList.add('hidden')
  gameResultContainer.lastChild.remove()
  resultModal.classList.add('hidden')
}

startGame()
