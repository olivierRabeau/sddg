/*------------------------------------------ variables -------------------------------------------*/

let computer = true; 

let playerTurn = 0;
let one = 0;
let two = 1;

let firstMove = 0;

let enable = false;
let disable = true;

let localState = {
  globalOne:'',
  globalTwo:'',
  roundOne:'',
  roundTwo:'',
  firstMove:0,
  playerTurn:0,
  computer:true
};

let resume = true;

let modalWrapper = document.querySelector('#modal-wrapper');
let yesButton = document.querySelector('#yes-btn');
let noButton = document.querySelector('#no-btn');
let dice = document.querySelector('#dice');
let rollButton = document.querySelector('#roll-btn');
let newGameButton = document.querySelector('#new-game-btn');
let holdButton = document.querySelector('#hold-btn');
let roundScores = [document.querySelector('#rs-one'), document.querySelector('#rs-two')];
let globalScores = [document.querySelector('#gs-one'), document.querySelector('#gs-two')];
let playerTurns = [document.querySelector('#player-one-turn'), document.querySelector('#player-two-turn')];
let winWindow = document.querySelector('#win-window');
let winText = document.querySelector('#win-text');
let sound = document.querySelector('audio');

let firstToPlay = {
  ckbox:document.querySelector(id = '#first-to-play-checkbox'),
  label:document.querySelector(id = '#first-to-play-text')
};

let opponent = {
  ckbox:document.querySelector(id = '#opponent-checkbox'),
  label:document.querySelector(id = '#opponent-text')
};

let startButton = document.querySelector('#start-btn');

let homeScreen = document.querySelector('#homeScreen');


/*--------------------------------------- player choices -----------------------------------------*/

function opponentHandler(){
  opponent.label.textContent = (opponent.ckbox.checked == true ? 'computer' : 'human player');
  computer = (opponent.ckbox.checked == true ? true : false);
}

function firstToPlayHandler(){
  firstToPlay.label.textContent = (firstToPlay.ckbox.checked == true ? 'I will . . .' : 'Opponent will . . .');
  firstMove = (firstToPlay.ckbox.checked == true ? 0 : 1);
  playerTurn = (firstToPlay.ckbox.checked == true ? 0 : 1);
  if(computer == true && playerTurn == 1) clickOnButtons(disable);
}

function startBtnHandler(){
  homeScreen.className = homeScreen.className.replace("d-flex", "d-none")
  if (localStorage.getItem('state') != null) displayModal();
  else {
    setLocalState();
    upToPlayer(playerTurn);
    upToComputer();
  }
}

opponent.ckbox.addEventListener('change',opponentHandler);

firstToPlay.ckbox.addEventListener('change',firstToPlayHandler);

startButton.addEventListener('click', startBtnHandler);

/*----------------------------- 'access to localStorage' functions -------------------------------*/

function setLocalState(){
  localState.globalOne = globalScores[0].textContent;
  localState.globalTwo = globalScores[1].textContent;
  localState.roundOne = roundScores[0].textContent;
  localState.roundTwo = roundScores[1].textContent;
  localState.firstMove = firstMove;
  localState.playerTurn = playerTurn;
  localState.computer = computer;
  localStorage.setItem('state', JSON.stringify(localState));
}

function getLocalState(){
    localState = {...JSON.parse(localStorage.getItem('state'))}
    globalScores[0].textContent = localState.globalOne;
    globalScores[1].textContent = localState.globalTwo;
    roundScores[0].textContent = localState.roundOne;
    roundScores[1].textContent = localState.roundTwo;
    firstMove = localState.firstMove;
    playerTurn = localState.playerTurn;
    computer = localState.computer;
}

/*---------------------------------- 'display' functions ------------------------------------*/

/* set buttons state : enable / disable - when computer plays, buttons are disabled */
function clickOnButtons(state){
  rollButton.disabled = state;
  holdButton.disabled = state;
}

/* shows who has just won the game */
function displayWinner(){
  winText.textContent = (playerTurn == 0 ? 'YOU WIN' : 'OPPONENT WIN');
  winWindow.className = winWindow.className.replace("d-none", "d-flex");
  winText.className = winText.className.replace("d-none", "d-flex");
  let timer = setTimeout(()=>{
    winWindow.className = winWindow.className.replace("d-flex", "d-none");
    winText.className = winText.className.replace("d-flex", "d-none");
    return ()=>clearTimeout(timer);
  },2000);
}

/* hides or shows faces */
function displayDice(face = 0){
  let diceFaces = document.querySelectorAll('.dice');
  let number = 0;
  diceFaces.forEach(function show(){ 
    if (number != face) diceFaces[number].className = diceFaces[number].className.replace('d-block','d-none');
    else diceFaces[number].className = diceFaces[number].className.replace('d-none','d-block');
    number++;
  })
}

function displayModal(){
  modalWrapper.className = modalWrapper.className.replace('d-none','d-block');
}

/*---------------------------------- 'click events' functions ------------------------------------*/

/* throw the dice */
function rollADice(){
  sound.volume = 1;
  sound.play();
  let waitSoundEnd = setTimeout(() => {
    let face = Math.floor(Math.random()*6);
    displayDice(face);
    if (face != 0) {
      roundScores[playerTurn].textContent = String(Number(roundScores[playerTurn].textContent) + (face+1))
      setLocalState();
    } 
    else {
      roundScores[playerTurn].textContent = String(face);
      if (computer == true && playerTurn == 1) clickOnButtons(disable);
      turnOver();
    }
  }, 2500);  
  return () => clearTimeout(waitSoundEnd);
}

/* save round score */
function keepScore(){
  if (Number(roundScores[playerTurn].textContent) != 0) {
    let total = Number(globalScores[playerTurn].textContent) + Number(roundScores[playerTurn].textContent);    
    if (total >= 100) {
        globalScores[playerTurn].textContent = String(100);
        clickOnButtons(disable);
        displayWinner();
    }
    else {
      globalScores[playerTurn].textContent = String(total);
    }
    roundScores[playerTurn].textContent = String(0);
    turnOver();
  }
}

/* start a new game */
function newGame(){
  clickOnButtons(enable);
  displayDice(6) /* all faces are hidden */
  globalScores[0].textContent = String(0);
  globalScores[1].textContent = String(0);
  roundScores[0].textContent = String(0);
  roundScores[1].textContent = String(0);
  playerTurn = firstMove;
  firstMove = (firstMove == 0 ? 1 : 0);
  turnOver();
}

/*------------------------- 'prevent high frequency clicks' function -----------------------------*/

/* prevent player to click too many times in a short period */
function debounce(callback,delay){
  var timer;
  return function(){
    var args = arguments;
    var context = this;
    clearTimeout(timer);
    timer = setTimeout(function(){
      callback.apply(context, args);
    },delay);
  }
}

/*------------------------------------- linked click events --------------------------------------*/

rollButton.addEventListener('click',debounce(rollADice,500));

holdButton.addEventListener('click',keepScore);

newGameButton.addEventListener('click',newGame);

yesButton.addEventListener('click',()=>{
  resume = true;
  modalWrapper.className = modalWrapper.className.replace('d-block','d-none');
  getLocalState();
  upToPlayer(playerTurn);
  upToComputer();
});

noButton.addEventListener('click',()=>{
  resume = false;
  modalWrapper.className = modalWrapper.className.replace('d-block','d-none');
  setLocalState();
  upToPlayer(playerTurn);
  upToComputer();
});

/*----------------------------------- 'whose turn' functions -------------------------------------*/

function upToPlayer(playerPosition){
  let displayA = (playerPosition == 0 ? 'd-inline' : 'd-none');
  let displayB = (playerPosition == 0 ? 'd-none' : 'd-inline');
  playerTurns[0].className = playerTurns[0].className.replace(displayB, displayA);
  playerTurns[1].className = playerTurns[1].className.replace(displayA, displayB);
}

function turnOver(){
  if (parseInt(globalScores[0].textContent) < 100 && parseInt(globalScores[1].textContent) < 100) {
    clickOnButtons(enable);
    playerTurn = (playerTurn == 0 ? 1 : 0);
    if (playerTurn == 1) {
      upToPlayer(two);
      if(computer == true) clickOnButtons(disable);
      upToComputer();
    }
    else{
      upToPlayer(one);
    }
    setLocalState();
  }
}

/*---------------------------------- 'computer plays' function -----------------------------------*/

function upToComputer(){
  if(computer == true && playerTurn == 1){
    rollADice();
    let timer = setTimeout(()=>{
      (Math.floor(Math.random() * 5) > 0) ? upToComputer() : keepScore();
      setLocalState();
      return () => clearTimeout(timer);
    },3000)
  }
}






