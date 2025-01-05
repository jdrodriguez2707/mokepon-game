'use strict'

function startGame() {
  const btnSelectPlayerPet = document.querySelector('#btn-select-pet')
  btnSelectPlayerPet.addEventListener('click', selectPlayerPet)
}

function selectPlayerPet() {
  // alert("Player's pet selected")
  const hipodoge = document.querySelector('#hipodoge')
  const capipepo = document.querySelector('#capipepo')
  const ratigueya = document.querySelector('#ratigueya')

  if (hipodoge.checked) {
    alert("Player's pet selected: Hipodoge")
  } else if (capipepo.checked) {
    alert("Player's pet selected: Capipepo")
  } else if (ratigueya.checked) {
    alert("Player's pet selected: Ratigueya")
  } else {
    alert('Please select a pet')
  }
}

startGame()
