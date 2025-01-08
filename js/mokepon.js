'use strict'

// Check if the event listener of the attacks has been added to avoid adding it multiple times
let attackBtnEventListenerAdded = false

function startGame() {
  const btnSelectPlayerPet = document.querySelector('#btn-select-pet')
  btnSelectPlayerPet.addEventListener('click', selectPlayerPet)
}

function selectPlayerPet() {
  const petOptions = document.querySelectorAll('input[name="pet"]')
  let selectedPet = null
  // span to display player's pet name
  const playerPetSpan = document.querySelector('#player-pet-name')

  for (const pet of petOptions) {
    if (pet.checked) {
      // get the text content of the label associated with the selected pet
      selectedPet = document.querySelector(`label[for="${pet.id}"]`).textContent
      break
    }
  }

  if (selectedPet) {
    playerPetSpan.textContent = selectedPet
    selectEnemyPet()
  } else {
    alert('Please select a pet')
  }
}

function selectEnemyPet() {
  const pets = document.querySelectorAll('label')
  const randomIndex = getRandomNumber(0, pets.length - 1)
  const enemyPet = pets[randomIndex].textContent

  // span to display enemy's pet name
  const enemyPetSpan = document.querySelector('#enemy-pet-name')
  enemyPetSpan.textContent = enemyPet

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
      alert(`You selected ${attack.textContent}`)
      selectEnemyPetAttack(attacks)
    })
  }
}

function selectEnemyPetAttack(attacks) {
  const randomIndex = getRandomNumber(0, attacks.length - 1)
  alert(`Enemy selected ${attacks[randomIndex].textContent}`)
}

startGame()
