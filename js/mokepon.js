'use strict'

// Flag to check if the event listener of the attacks has been added
let attackBtnEventListenerAdded = false

let playerPetAttack = ''
let enemyPetAttack = ''
let playerPetLives = 3
let enemyPetLives = 3

function startGame() {
  const btnSelectPlayerPet = document.querySelector('#btn-select-pet')
  btnSelectPlayerPet.addEventListener('click', selectPlayerPet)
}

function selectPlayerPet() {
  const petOptions = document.querySelectorAll('input[name="pet"]')
  let selectedPlayerPet = null
  // span to display player's pet name
  const playerPetNameSpan = document.querySelector('#player-pet-name')

  for (const pet of petOptions) {
    if (pet.checked) {
      // get the text content of the label associated with the selected pet
      selectedPlayerPet = document.querySelector(
        `label[for="${pet.id}"]`
      ).textContent
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

  // span to display enemy's pet name
  const enemyPetNameSpan = document.querySelector('#enemy-pet-name')
  enemyPetNameSpan.textContent = selectedEnemyPet

  // Check if the event listener of the attacks has been added to avoid adding it multiple times
  if (!attackBtnEventListenerAdded) {
    selectPlayerPetAttack()
    attackBtnEventListenerAdded = true
  }
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function selectPlayerPetAttack() {
  const attacks = document.querySelectorAll('#select-attack button')
  for (const attack of attacks) {
    attack.addEventListener('click', () => {
      playerPetAttack = attack.textContent
      selectEnemyPetAttack(attacks)
    })
  }
}

function selectEnemyPetAttack(attacks) {
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
  const resultMessagesSection = document.querySelector('#result-messages')
  const resultMessage = document.createElement('p')
  resultMessage.textContent = `Your pet attacked with ${playerPetAttack.toUpperCase()}. The enemy's pet attacked with ${enemyPetAttack.toUpperCase()} - ${combatResult}`
  resultMessagesSection.appendChild(resultMessage)
}

function updatePetLives() {
  const playerPetLivesSpan = document.querySelector('#player-pet-lives')
  const enemyPetLivesSpan = document.querySelector('#enemy-pet-lives')

  playerPetLivesSpan.textContent = playerPetLives
  enemyPetLivesSpan.textContent = enemyPetLives
}

function checkLives() {
  if (playerPetLives === 0) {
    createFinalMessage('You lost the game☹️')
  } else if (enemyPetLives === 0) {
    createFinalMessage('You won the game!🎉')
  }
}

function createFinalMessage(finalMessage) {
  const resultMessagesSection = document.querySelector('#result-messages')
  const resultMessage = document.createElement('p')
  resultMessage.textContent = finalMessage
  resultMessagesSection.appendChild(resultMessage)
}

startGame()
