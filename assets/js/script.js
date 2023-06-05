const gameState = ["titleScreen"];
var robotStorage = {};
var player = { wins: 0, losses: 0, draws: 0 };
var currentMatch;

function saveData() {
  localStorage.setItem("robotStorage", JSON.stringify(robotStorage));
  localStorage.setItem("player", JSON.stringify(player));
  console.log(localStorage);
}

function loadData() {
  if (localStorage.robotStorage) {
    robotStorage = JSON.parse(localStorage.getItem("robotStorage"));
  }
  if (localStorage.player) {
  player = JSON.parse(localStorage.getItem("player"));
  }
}

class RobotOpp {
  constructor() {
    this.name = randomRobot();
    this.nameString = this.name.join(" ");
    this.image = `https://robohash.org/${this.nameString}`;
    new Image().src = this.image; //preload the image
    this.wins = 0;
    this.losses = 0;
    this.draws = 0;
    robotStorage[this.nameString] = this;
    return this;
  }
}

function drawHistoricRobots() {
  $("#historicRobots").empty();
    var matchmakingEl = `<option` 
    +` class="button is-justify-content-space-between w-100"`
    +` data-robot="matchmaking"`
    +`>find opponent</option>`
  $("#historicRobots").append(matchmakingEl);
  for (var i in robotStorage) {
    let robot =
      `<option class="button is-justify-content-space-between w-100"` +
      `data-robot="${robotStorage[i].nameString}">` +
      `${robotStorage[i].nameString}` +
      ` W: ${robotStorage[i].wins}` +
      ` L: ${robotStorage[i].losses}` +
      ` D: ${robotStorage[i].draws} </option>`;
    $("#historicRobots").append(robot);
  }
}

function drawGameState() {
  for (i in gameState) {
    var gameStateElements = $(`.${gameState[i]}`); //declare a group of elements with all of the classes in the gameState array
    $.each(gameStateElements, (elem) => {
      $(gameStateElements[elem]).addClass("hidden"); //then hide them all
    });
  }
  $(`.${gameState.at(-1)}`).removeClass("hidden"); //then only show the current game state elements, the last one in the gameState array
  if (gameState.at(-1) == "playing") {
    $("#cpuImage").attr("src", currentMatch.opp.image);
    $("#cpuNameRecord").text(currentMatch.opp.nameString);
    $("#cpuRecord").text(
      ` W: ${currentMatch.opp.wins} L: ${currentMatch.opp.losses} D: ${currentMatch.opp.draws}`
    );
  }
  $("#robotsOnline").text(`Robots online: ${howManyRobots()}`); //show how many opps there might be
  $("#playerRecord").text(
    `W: ${player.wins} L: ${player.losses} D: ${player.draws}`
  );
  drawHistoricRobots();
}

async function rpsRequest(playerMove) {
  return {
    async: true,
    crossDomain: true,
    url: `https://rock-paper-scissors7.p.rapidapi.com/?choice=${playerMove}`,
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "64cfafa8dbmsh4b77b2988b4bddep15f639jsn621283b6b4c6",
      "X-RapidAPI-Host": "rock-paper-scissors7.p.rapidapi.com",
    },
  };
}

class GameMatch {
  constructor(...robotOpp) {
    this.matchPoints = 0;
    this.playerPoints = 0;
    this.robotPoints = 0;
    this.opp = robotOpp == 'matchmaking'
    ? new RobotOpp()
    : robotStorage[robotOpp] 
    
  }
  playMatch(matchData) {
    this.scoreMatch(matchData);
    saveData();
    drawGameState();
  }
  scoreMatch(matchData) {
    $("#matchInfo").text(`${this.opp.name[0]} plays ${matchData.ai.name}!`);
    $("#matchResult").text(`${matchData.result}`);
    console.log(matchData.result);
    if (this.playerPoints >=! 2 && this.robotPoints >=! 2) {
      if (matchData.result.includes("lose")) {
        this.robotPoints++;
      } else if (matchData.result.includes("win")) {
        this.playerPoints++;
      }
      console.log(
        this.playerPoints + " " + this.robotPoints
      );
    } else if (this.playerPoints > this.robotPoints) {
      player.wins++;
      this.opp.losses++;
      this.endMatch('win');
    } else {
      this.opp.wins++;
      player.losses++;
      this.endMatch('lose');
    }
  }
  endMatch(cond) {
    $('endGameText').text = `You ${cond}!`
    gameState.push('endMatch')
    drawGameState()
    $("#startButton").on("click", findMatch);
    $("#rematchButton").on("click", findMatch, {robotOpp:this.opp.name});
  }
}

function findMatch(opp = false) {
  function startMatch() {
    gameState.push("playing");
    drawGameState();
  }
  gameState.push("matchmaking");
  drawGameState();
  currentMatch = new GameMatch(opp);
  console.log(opp);
  setTimeout(startMatch, Math.random() * 2000 + 2000);
}

$("#playerButtons").on("click", async (event) => {
  settings = await rpsRequest($(event.target).data("move"));
  $.ajax(settings).done(function (response) {
    currentMatch.playMatch(response);
  });
});

$("#challengeButton").on("click", () => {
  newOpp = $("#historicRobots").find(":selected").data("robot");
  console.log(newOpp);
  findMatch(newOpp);
});



function init() {
  loadData();
  drawGameState();
}

$().ready(init);
