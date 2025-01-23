'use strict'

let playerPetAttack = ''
let enemyPetAttack = ''
let playerPetLives = 3
let enemyPetLives = 3

// Cached DOM elements
const selectPetSection = document.querySelector('#select-pet')
const petCardContainer = document.querySelector('#pet-card-container')
const selectAttackSection = document.querySelector('#select-attack')
const playerPetNameSpan = document.querySelector('#player-pet-name') // span to display player's pet name
const enemyPetNameSpan = document.querySelector('#enemy-pet-name') // span to display enemy's pet name
const playerPetLivesSpan = document.querySelector('#player-pet-lives')
const enemyPetLivesSpan = document.querySelector('#enemy-pet-lives')
const playerPetInfoContainer = document.querySelector('#player-pet-info')
const enemyPetInfoContainer = document.querySelector('#enemy-pet-info')
const attacks = document.querySelectorAll('.attack-button')
const playerAttackSection = document.querySelector('#player-attacks')
const enemyAttackSection = document.querySelector('#enemy-attacks')
const combatResultParagraph = document.querySelector('#combat-result')
const resultModal = document.querySelector('#result-modal')
const gameResultContainer = document.querySelector('#game-result-container')
const footer = document.querySelector('footer')

const pets = [
  {
    id: 'hipodoge',
    name: 'Hipodoge',
    type: 'Water💧',
    imageSrc: './assets/images/mokepons_mokepon_hipodoge_attack.webp',
    imageAlt: 'Mokepon Hipodoge'
  },
  {
    id: 'capipepo',
    name: 'Capipepo',
    type: 'Grass🌱',
    imageSrc: './assets/images/mokepons_mokepon_capipepo_attack.webp',
    imageAlt: 'Mokepon Capipepo'
  },
  {
    id: 'ratigueya',
    name: 'Ratigueya',
    type: 'Fire🔥',
    imageSrc: './assets/images/mokepons_mokepon_ratigueya_attack.webp',
    imageAlt: 'Mokepon Ratigueya'
  }
]

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

  // Ensure the event listeners are added only once to avoid multiple event listeners
  addAttackEventListeners()
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
  } else {
    // TODO: Show a message to the player to select a pet
    alert('Please select a pet')
  }
}

function selectEnemyPet() {
  const randomIndex = getRandomNumber(0, pets.length - 1)
  const selectedEnemyPet = pets[randomIndex].name
  const enemyPetImage = document.createElement('img')
  enemyPetImage.src = pets[randomIndex].imageSrc
  enemyPetImage.alt = pets[randomIndex].imageAlt
  enemyPetImage.classList.add('mokepon-image')
  enemyPetInfoContainer.appendChild(enemyPetImage)
  enemyPetNameSpan.textContent = selectedEnemyPet

  selectAttackSection.classList.remove('hidden')
  selectPetSection.classList.add('hidden')
  footer.classList.add('hidden')
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
  footer.classList.remove('hidden')
  selectAttackSection.classList.add('hidden')
  gameResultContainer.lastChild.remove()
  resultModal.classList.add('hidden')
}

startGame()
