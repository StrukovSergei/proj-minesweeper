'use strict'

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

var startTime
var timerInterval

function startTimer() {
    startTime = new Date().getTime()
    timerInterval = setInterval(updateTimer, 1000)
}


function updateTimer() {
    var currentTime = new Date().getTime()
    var elapsedTime = Math.floor((currentTime - startTime) / 1000)

    var timerElement = document.getElementById('timer')
    timerElement.textContent = `Played Time :${elapsedTime}`
}


function stopTimer() {
    clearInterval(timerInterval)
}

