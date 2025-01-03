'use strict'

function selectPlayerPet() {
  alert("Player's pet selected")
}

const btnSelectPlayerPet = document.querySelector('#btn-select-pet')
btnSelectPlayerPet.addEventListener('click', selectPlayerPet)
