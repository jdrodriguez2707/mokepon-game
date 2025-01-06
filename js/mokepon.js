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
  selectedPet
    ? (playerPetSpan.textContent = selectedPet)
    : alert('Please select a pet')
}

startGame()
