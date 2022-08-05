/*------------------------------------------ variables -------------------------------------------*/

let computer = true; 

let playerTurn = 0;
let one = 0;
let two = 1;

let firstMove = 0;

let enable = false;
let disable = true;

let localState = {
  'globalOne':'',
  'globalTwo':'',
  'roundOne':'',
  'roundTwo':'',
  'firstMove':'',
  'playerTurn':''
};

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
  computer == (opponent.ckbox.checked == true ? true : false);
}

function firstToPlayHandler(){
  firstToPlay.label.textContent = (firstToPlay.ckbox.checked == true ? 'I will . . .' : 'Opponent will . . .');
  firstMove = (firstToPlay.ckbox.checked == true ? 0 : 1);
  playerTurn = (firstToPlay.ckbox.checked == true ? 0 : 1);
  if(computer == true && playerTurn == 1) clickOnButtons(disable);
}

function startBtnHandler(){
  homeScreen.style.display = 'none';
  getLocalState();
  upToPlayer(playerTurn);
  play();
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
  localStorage.setItem('state', JSON.stringify(localState));
}

function getLocalState(){
  if (localStorage.getItem('state') != null) {
    localState = {...JSON.parse(localStorage.getItem('state'))}
    globalScores[0].textContent = localState.globalOne;
    globalScores[1].textContent = localState.globalTwo;
    roundScores[0].textContent = localState.roundOne;
    roundScores[1].textContent = localState.roundTwo;
    firstMove = localState.firstMove;
    playerTurn = localState.playerTurn;
  }
  else {
    setLocalState();
  }
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
  winWindow.style.display = 'flex';
  winText.style.display = 'flex'; 
  let timer = setTimeout(()=>{
    winWindow.style.display = 'none';    
    winText.style.display = 'none';  
    return ()=>clearTimeout(timer);
  },3000);
}

/* hides or shows faces */
function displayDice(face = 0){
  let diceFaces = document.querySelectorAll('.dice');
  let number = 0;
  diceFaces.forEach(function show(){ 
    diceFaces[number].style.display = (number == face ? 'block' : 'none');
    number++;
  })
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
      if (computer == true) clickOnButtons(disable);
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

/*----------------------------------- 'whose turn' functions -------------------------------------*/

function upToPlayer(playerPosition){
  playerTurns[0].style.display = (playerPosition == 0 ? 'inline' : 'none');
  playerTurns[1].style.display = (playerPosition == 0 ? 'none' : 'inline');
}

function turnOver(){
  clickOnButtons(enable);
  playerTurn = (playerTurn == 0 ? 1 : 0);
  if (playerTurn == 1) {
    upToPlayer(two);
    if(computer == true) clickOnButtons(disable);
    if(computer == true) play();
  }
  else{
    upToPlayer(one);
  }
  setLocalState()
}

/*---------------------------------- 'computer plays' function -----------------------------------*/

function play(){
  if(playerTurn == 1){
    rollADice();
    let timer = setTimeout(()=>{
      (Math.floor(Math.random() * 5) > 0) ? play() : keepScore();
      setLocalState();
      return () => clearTimeout(timer);
    },3000)
  }
}






