'use strict'

// Cached DOM elements
const selectPetSection = document.querySelector('#select-pet')
const petCardContainer = document.querySelector('#pet-card-container')
const selectAttackSection = document.querySelector('#select-attack')
const roundNumberSpan = document.querySelector('#round-number')
const playerPetNameSpan = document.querySelector('#player-pet-name') // span to display player's pet name
const enemyPetNameSpan = document.querySelector('#enemy-pet-name') // span to display enemy's pet name
const playerPetLivesSpan = document.querySelector('#player-pet-lives')
const enemyPetLivesSpan = document.querySelector('#enemy-pet-lives')
const playerPetInfoContainer = document.querySelector('#player-pet-info')
const enemyPetInfoContainer = document.querySelector('#enemy-pet-info')
const attackButtonContainer = document.querySelector(
  '#attack-buttons-container'
)
const playerAttackSection = document.querySelector('#player-attacks')
const enemyAttackSection = document.querySelector('#enemy-attacks')
const combatResultParagraph = document.querySelector('#combat-result')
const resultModal = document.querySelector('#result-modal')
const gameResultContainer = document.querySelector('#game-result-container')
const footer = document.querySelector('footer')

class Mokepon {
  constructor(name, id, imageSrc, imageAlt, attacks) {
    this.name = name
    this.id = id
    this.imageSrc = imageSrc
    this.imageAlt = imageAlt
    this.attacks = attacks
  }
}

const pets = [
  new Mokepon(
    'Hipodoge',
    'hipodoge',
    './assets/images/mokepons_mokepon_hipodoge_attack.webp',
    'Mokepon Hipodoge',
    ['💧', '💧', '💧', '🔥', '🌱']
  ),
  new Mokepon(
    'Capipepo',
    'capipepo',
    './assets/images/mokepons_mokepon_capipepo_attack.webp',
    'Mokepon Capipepo',
    ['🌱', '🌱', '🌱', '🔥', '💧']
  ),
  new Mokepon(
    'Ratigueya',
    'ratigueya',
    './assets/images/mokepons_mokepon_ratigueya_attack.webp',
    'Mokepon Ratigueya',
    ['🔥', '🔥', '🔥', '💧', '🌱']
  )
]

const combatRules = {
  '🔥': '🌱', // Left beats right
  '💧': '🔥',
  '🌱': '💧'
}

let roundNumber = 1
let playerPetAttack = ''
const enemyAttacks = [] // To save enemy's attacks to select one randomly
let enemyPetAttack = ''
let playerPetLives = 3
let enemyPetLives = 3

function startGame() {
  pets.forEach(pet => {
    const input = document.createElement('input')
    input.classList.add('hidden')
    input.type = 'radio'
    input.id = pet.id
    input.name = 'pet'

    const label = document.createElement('label')
    label.classList.add('pet-card')
    label.setAttribute('for', pet.id)

    const img = document.createElement('img')
    img.src = pet.imageSrc
    img.alt = pet.imageAlt

    label.textContent = pet.name
    label.appendChild(img)

    petCardContainer.appendChild(input)
    petCardContainer.appendChild(label)
  })

  // Hide the attack and restart sections at the beginning to avoid distracting the player
  selectAttackSection.classList.add('hidden')
  resultModal.classList.add('hidden')

  const btnSelectPlayerPet = document.querySelector('#btn-select-pet')
  btnSelectPlayerPet.addEventListener('click', selectPlayerPet)
}

function selectPlayerPet() {
  const petOptions = document.querySelectorAll('input[name="pet"]')
  let selectedPlayerPet = ''
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
    extractPlayerAttacks(selectedPlayerPet)
  } else {
    // TODO: Show a message to the player to select a pet
    alert('Please select a pet')
  }
}

function selectEnemyPet() {
  const randomIndex = getRandomNumber(0, pets.length - 1)
  const selectedEnemyPet = pets[randomIndex]
  const enemyPetImage = document.createElement('img')
  enemyPetImage.src = pets[randomIndex].imageSrc
  enemyPetImage.alt = pets[randomIndex].imageAlt
  enemyPetImage.classList.add('mokepon-image')
  enemyPetInfoContainer.appendChild(enemyPetImage)
  enemyPetNameSpan.textContent = selectedEnemyPet.name

  // Extract attacks from the selected enemy pet
  enemyAttacks.push(...selectedEnemyPet.attacks)

  selectAttackSection.classList.remove('hidden')
  selectPetSection.classList.add('hidden')
  footer.classList.add('hidden')
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function extractPlayerAttacks(selectedPet) {
  // Extract attacks from the selected player pet
  const playerPet = pets.find(pet => pet.name === selectedPet)
  const attacks = playerPet.attacks

  setupPlayerAttackButtons(attacks)
}

function setupPlayerAttackButtons(attacks) {
  for (const attack of attacks) {
    const attackButton = document.createElement('button')
    attackButton.classList.add('attack-button')
    attackButton.textContent = attack

    attackButton.addEventListener('click', () => {
      attackButton.disabled = true
      attackButton.classList.add('disabled')
      playerPetAttack = attack
      selectEnemyPetAttack()
    })

    attackButtonContainer.appendChild(attackButton)
  }
}

function selectEnemyPetAttack() {
  const randomIndex = getRandomNumber(0, enemyAttacks.length - 1)
  enemyPetAttack = enemyAttacks[randomIndex]
  combat()
}

function combat() {
  if (playerPetAttack === enemyPetAttack) {
    createCombatMessages("It's a tie!🫱🏼‍🫲🏼")
  } else if (combatRules[playerPetAttack] === enemyPetAttack) {
    createCombatMessages('You win!🏆')
    enemyPetLives--
    updatePetLives()
  } else {
    createCombatMessages('You lose!☹️')
    playerPetLives--
    updatePetLives()
  }

  checkLives()
}

function createCombatMessages(combatResult) {
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
  // Save all attack buttons to check if the round is over and enable them again for the next round if there are lives left
  const attackButtons = document.querySelectorAll('.attack-button')

  if (playerPetLives === 0) {
    createFinalMessage('You lost the game☹️')
  } else if (enemyPetLives === 0) {
    createFinalMessage('You won the game!🎉')
  } else if (isRoundOver(attackButtons)) {
    // Prepare next round
    setTimeout(() => {
      for (const attackButton of attackButtons) {
        attackButton.disabled = false
        attackButton.classList.remove('disabled')
      }

      roundNumberSpan.textContent = ++roundNumber
      combatResultParagraph.textContent = 'Good luck! 😎'
    }, 1000)
  }

  if (playerPetLives === 0 || enemyPetLives === 0) endGame()
}

function isRoundOver(attackButtons) {
  return Array.from(attackButtons).every(attackButton => attackButton.disabled)
}

function createFinalMessage(finalMessage) {
  const resultMessage = document.createElement('p')
  resultMessage.textContent = finalMessage
  gameResultContainer.appendChild(resultMessage)
}

function endGame() {
  const btnRestartGame = document.querySelector('#btn-restart-game')
  btnRestartGame.addEventListener('click', restartGame)

  // Show the restart section
  resultModal.classList.remove('hidden')
}

function restartGame() {
  roundNumber = 1
  playerPetAttack = ''
  enemyPetAttack = ''
  playerPetLives = 3
  enemyPetLives = 3

  roundNumberSpan.textContent = roundNumber
  playerPetInfoContainer.lastChild.remove()
  enemyPetInfoContainer.lastChild.remove()
  playerPetNameSpan.textContent = ''
  enemyPetNameSpan.textContent = ''
  playerPetLivesSpan.textContent = '❤️'.repeat(playerPetLives)
  enemyPetLivesSpan.textContent = '❤️'.repeat(enemyPetLives)
  combatResultParagraph.textContent = 'Good luck! 😎'

  attackButtonContainer.textContent = ''
  playerAttackSection.textContent = ''
  enemyAttackSection.textContent = ''
  enemyAttacks.length = 0

  selectPetSection.classList.remove('hidden')
  footer.classList.remove('hidden')
  selectAttackSection.classList.add('hidden')
  gameResultContainer.lastChild.remove()
  resultModal.classList.add('hidden')
}

startGame()
