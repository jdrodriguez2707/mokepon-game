'use strict'

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
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

startGame()
