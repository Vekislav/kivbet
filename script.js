// Countdown to May 5, 2025
const daysElement = document.querySelector('#days .number');
const hoursElement = document.querySelector('#hours .number');
const minutesElement = document.querySelector('#minutes .number');
const secondsElement = document.querySelector('#seconds .number');

const targetDate = new Date('May 5, 2025 00:00:00').getTime();

function animateNumberChange(from, to, element) {
  let current = from;
  const increment = to > from ? 1 : -1;
  
  function updateNumber() {
    if (current === to) return;
    current += increment;
    element.innerHTML = String(current).padStart(2, '0');
  }

  const interval = setInterval(updateNumber, 50);
  setTimeout(() => clearInterval(interval), Math.abs(to - from) * 50);
}

function updateCountdown() {
  const now = new Date().getTime();
  const timeRemaining = targetDate - now;

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  // Animate number changes
  animateNumberChange(parseInt(daysElement.innerHTML), days, daysElement);
  animateNumberChange(parseInt(hoursElement.innerHTML), hours, hoursElement);
  animateNumberChange(parseInt(minutesElement.innerHTML), minutes, minutesElement);
  animateNumberChange(parseInt(secondsElement.innerHTML), seconds, secondsElement);

  if (timeRemaining < 0) {
    clearInterval(countdownInterval);
    document.getElementById('countdown').innerHTML = "Countdown Ended";
  }
}

const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();
