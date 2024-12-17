// Constants and initial setup
const balanceElement = document.getElementById('balance');
let balance = parseInt(localStorage.getItem('balance')) || 1000;
balanceElement.textContent = balance;

const betInput = document.getElementById('bet-input');
const betBtn = document.getElementById('bet-btn');
const hitBtn = document.getElementById('hit-btn');
const standBtn = document.getElementById('stand-btn');
const doubleBtn = document.getElementById('double-btn');
const splitBtn = document.getElementById('split-btn');
const dealerCards = document.getElementById('dealer-cards');
const playerCards = document.getElementById('player-cards');

let playerHands = []; // Array to hold multiple player hands after a split
let dealerHand = [];
let currentBet = 0;
let currentHandIndex = 0; // Index of the current hand being played
let gameInProgress = false; // Track whether the game is in progress

// Card values and suits
function getCard() {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const value = values[Math.floor(Math.random() * values.length)];
  const suit = suits[Math.floor(Math.random() * suits.length)];
  return { value, suit };
}

// Card value calculation
function getCardValue(card) {
  if (['J', 'Q', 'K'].includes(card.value)) {
    return 10;
  } else if (card.value === 'A') {
    return 11;
  } else {
    return parseInt(card.value);
  }
}

// Render card on the screen
function renderCard(card, area) {
  const cardDiv = document.createElement('div');
  cardDiv.className = 'card';
  cardDiv.textContent = `${card.value}${card.suit}`;
  area.appendChild(cardDiv);
  return cardDiv;
}

// Render multiple player hands
function renderPlayerHands() {
  playerCards.innerHTML = ''; // Clear previous hands
  playerHands[currentHandIndex].forEach(card => renderCard(card, playerCards));
}

// Calculate hand score
function calculateScore(hand) {
  let score = hand.reduce((total, card) => total + getCardValue(card), 0);
  let aceCount = hand.filter(card => card.value === 'A').length;

  // Adjust for Aces if necessary
  while (score > 21 && aceCount > 0) {
    score -= 10; // Treat Ace as 1 instead of 11
    aceCount--;
  }

  return score;
}

// Deal initial cards to player and dealer
function dealInitialCards() {
  playerHands = [[getCard(), getCard()]]; // Initialize with one hand of two cards
  dealerHand.push(getCard(), getCard());

  playerHands[0].forEach(card => renderCard(card, playerCards));
  dealerHand.forEach(card => renderCard(card, dealerCards));
  updateSplitButtonState(); // Update the state of the split button

  // Enable double only after initial cards are dealt and before any action
  doubleBtn.disabled = false;
}

// Reset the game state
function resetGame() {
  playerHands = [];
  dealerHand = [];
  playerCards.innerHTML = '';
  dealerCards.innerHTML = '';
  currentHandIndex = 0;
  gameInProgress = false; // End the game
  updateSplitButtonState(); // Update the split button when resetting
  doubleBtn.disabled = true; // Disable the double button when resetting
}

// Update balance after round
function updateBalance() {
  balanceElement.textContent = balance;
  localStorage.setItem('balance', balance);
}

// Handle betting
betBtn.addEventListener('click', () => {
  const betAmount = parseInt(betInput.value);
  if (betAmount > 0 && betAmount <= balance) {
    currentBet = betAmount;
    balance -= betAmount;
    updateBalance();
    resetGame();
    dealInitialCards();
    gameInProgress = true; // Game starts after the bet
  } else {
    alert('Invalid bet amount.');
  }
});

// Player hits (draws a card)
hitBtn.addEventListener('click', () => {
  if (!gameInProgress) return; // Prevent action if no game is in progress
  if (playerHands[currentHandIndex]) {
    const newCard = getCard();
    playerHands[currentHandIndex].push(newCard);
    renderPlayerHands();

    const playerScore = calculateScore(playerHands[currentHandIndex]);
    if (playerScore > 21) {
      setCardsOutline('bust');
      gameInProgress = false; // End the game after bust
      doubleBtn.disabled = true; // Disable double button after bust
    }
  }
});

// Player stands (ends their turn for the current hand)
standBtn.addEventListener('click', () => {
  if (!gameInProgress) return; // Prevent action if no game is in progress

  // Check if there are more hands to play after the current one
  if (currentHandIndex < playerHands.length - 1) {
    currentHandIndex++; // Move to the next hand
    renderPlayerHands();
  } else {
    // No more hands, so dealer plays
    const dealerScore = calculateScore(dealerHand);
    let playerScore = calculateScore(playerHands[currentHandIndex]);

    // Dealer's turn (draw until score is 17 or higher)
    while (dealerScore < 17) {
      const newCard = getCard();
      dealerHand.push(newCard);
      renderCard(newCard, dealerCards);
    }

    const finalDealerScore = calculateScore(dealerHand);
    const finalPlayerScore = calculateScore(playerHands[currentHandIndex]);

    // Determine the winner
    if (finalPlayerScore > 21) {
      setCardsOutline('dealer');
    } else if (finalDealerScore > 21 || finalPlayerScore > finalDealerScore) {
      setCardsOutline('player');
      balance += currentBet * 2; // Player wins, double the bet
    } else if (finalPlayerScore === finalDealerScore) {
      setCardsOutline('tie');
      balance += currentBet; // Tie, return the bet
    } else {
      setCardsOutline('dealer');
    }

    updateBalance();
    gameInProgress = false; // End game after stand
    doubleBtn.disabled = true; // Disable double button after stand
  }
});

// Double logic
doubleBtn.addEventListener('click', () => {
  if (!gameInProgress) return; // Prevent action if no game is in progress
  if (currentBet * 2 <= balance) {
    balance -= currentBet; // Deduct the bet again for doubling
    currentBet *= 2; // Double the bet
    const newCard = getCard(); // Draw one more card
    playerHands[currentHandIndex].push(newCard);
    renderPlayerHands();
    gameInProgress = false; // End the game after doubling
    doubleBtn.disabled = true; // Disable the double button after doubling
    const playerScore = calculateScore(playerHands[currentHandIndex]);
    if (playerScore > 21) {
      setCardsOutline('dealer');
    } else {
      setCardsOutline('player');
    }
    updateBalance();
  } else {
    alert("You don't have enough balance to double.");
  }
});

// Split logic: split a hand into two
splitBtn.addEventListener('click', () => {
  if (playerHands[0].length === 2 && getCardValue(playerHands[0][0]) === getCardValue(playerHands[0][1])) {
    // Split the first hand into two
    playerHands.push([playerHands[0].pop()]); // Move one card to the second hand
    const newCard1 = getCard();  // Deal a new card for the second hand
    const newCard2 = getCard();  // Deal a new card for the first hand

    playerHands[0].push(newCard1);  // Add the new card to the first hand
    playerHands[1].push(newCard2);  // Add the new card to the second hand

    renderPlayerHands(); // Render the two hands on the screen
    currentHandIndex = 0; // Start playing with the first hand
    updateSplitButtonState(); // Update the split button state
    doubleBtn.disabled = true; // Disable double button after split
  } else {
    alert("You can only split if you have two cards of the same value.");
  }
});

// Function to handle the outcome and set the card outlines
function setCardsOutline(winner) {
  const playerCardDivs = playerCards.querySelectorAll('.card');
  const dealerCardDivs = dealerCards.querySelectorAll('.card');

  if (winner === 'player') {
    playerCardDivs.forEach(card => card.style.border = '3px solid green');
    dealerCardDivs.forEach(card => card.style.border = '3px solid red');
  } else if (winner === 'dealer') {
    playerCardDivs.forEach(card => card.style.border = '3px solid red');
    dealerCardDivs.forEach(card => card.style.border = '3px solid green');
  } else if (winner === 'tie') {
    playerCardDivs.forEach(card => card.style.border = '3px solid gray');
    dealerCardDivs.forEach(card => card.style.border = '3px solid gray');
  } else {
    playerCardDivs.forEach(card => card.style.border = '3px solid red');
    dealerCardDivs.forEach(card => card.style.border = '3px solid red');
  }
}

// Function to update the split button state (enabled/disabled)
function updateSplitButtonState() {
  if (playerHands.length === 1 && playerHands[0].length === 2 && getCardValue(playerHands[0][0]) === getCardValue(playerHands[0][1])) {
    splitBtn.disabled = false;  // Enable the split button if possible
  } else {
    splitBtn.disabled = true;   // Disable the split button if not possible
  }
}

// Initialize game
updateBalance();
