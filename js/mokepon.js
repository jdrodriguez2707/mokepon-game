'use strict'

function startGame() {
  const btnSelectPlayerPet = document.querySelector('#btn-select-pet')
  btnSelectPlayerPet.addEventListener('click', selectPlayerPet)
}

function selectPlayerPet() {
  const petOptions = document.querySelectorAll('input[name="pet"]')
  let selectedPet = null
  for (const pet of petOptions) {
    if (pet.checked) {
      selectedPet = document.querySelector(`label[for="${pet.id}"]`).textContent
      break
    }
  }
  alert(
    selectedPet
      ? `Player's pet selected: ${selectedPet}`
      : 'Please select a pet'
  )
}

startGame()
