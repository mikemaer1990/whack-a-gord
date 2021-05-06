// Select DOM elements
const holes = document.querySelectorAll(".hole");
const scoreBoard = document.querySelector(".score");
const moles = document.querySelectorAll(".mole");
const gameTimeDisplay = document.querySelector(".time");
const startGameButton = document.querySelector(".startGameButton");
const leaderboard = document.querySelector(".leaderboard");
// Get leaderboard data from localStorage or create empty array
let currentLeaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
// Import audio files
const one = new Audio("./one.mp3");
const two = new Audio("./two.mp3");
const three = new Audio("./three.mp3");
const four = new Audio("./four.mp3");

// Initiate variables for keeping track of game state and time
let prevHole, gameTime, timeUp, timer, playAudio, prevAudio, username;
let gameIsRunning;
let score = 0;

// Random number generator
function randomInterval(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

// Random hole generator
function randomHole(holes) {
    // Get a random index within our holes array length
    const randomIndex = Math.floor(Math.random() * holes.length);
    // Select a hole with that index
    const hole = holes[randomIndex];
    // If the current hole is the same as the previous hole - run function again
    if (hole === prevHole) {
        return randomHole(holes);
    }
    // Set the previous hole value to thi hole
    prevHole = hole;
    // Return the hole
    return hole;
}

// Pop the mole up
function molePopUp() {
    // Generate a random time and hole div
    const time = randomInterval(200, 1000);
    const hole = randomHole(holes);
    // Pop the molue up on the selected hole
    hole.classList.add("up");
    // Based on the random time
    // Remove the up class from the mole - and if time is not up
    // Keep running the function
    setTimeout(() => {
        hole.classList.remove("up");
        if (!timeUp) molePopUp();
        // Stop our timer if the time is up
        if (timeUp) gameOver();
    }, time);
}

// Start game function
function startGame() {
    if (gameIsRunning) return;
    gameIsRunning = true;
    // Set the game time
    gameTime = 30000;
    // Update the game time display
    gameTimeDisplay.innerText = gameTime / 1000 + "s";
    // Set the score to 0
    score = 0;
    // Update the score display
    scoreBoard.textContent = 0;
    // Set timeup to false
    timeUp = false;
    // Start popping up moles
    molePopUp();
    // Set time up to true once gametime is over
    setTimeout(() => (timeUp = true), gameTime);
    // Run the game timer
    gameTimer();
}

// Keep track of the time on the board
function gameTimer() {
    // Stored in a variable to be cleared when game is over
    timer = setInterval(() => {
        gameTime -= 1000;
        // Display updated time every second
        gameTimeDisplay.innerText = gameTime / 1000 + "s";
    }, 1000);
}

// Function to handle audio clips
function playAudioClip() {
    // If audio is already playing, stop it and reset the time
    if (playAudio) {
        playAudio.pause();
        playAudio.currentTime = 0;
    }
    // Array of audio clips to be randomized
    const audioArray = [one, two, three, four];
    // Get a random audio index
    let audioIndex = randomInterval(0, 4);
    // Keep getting a new index until we have a new one
    while (audioIndex === prevAudio) {
        audioIndex = randomInterval(0, 4);
    }
    // Store the current audio clip in a variable
    playAudio = audioArray[audioIndex];
    // Store the current index
    prevAudio = audioIndex;
    // Make sure the audio clip is at 0
    playAudio.currentTime = 0;
    // Play the audio clip
    playAudio.play();
}

// Detect mole hits
function hitMole(e) {
    // Prevent hacks - non genuine clicks - late clicks
    if (!e.isTrusted || !this.parentElement.classList.contains("up")) return;
    // Remove the up class
    this.parentElement.classList.remove("up");
    // Play audio
    playAudioClip();
    // Increment score
    score++;
    // Update scoreboard
    scoreBoard.textContent = score;
}

// Populate our leaderboard with live data
function populateLeaderboard(data) {
    // Set our leaderboard html to be the first 10 items of our sorted leaderboard list
    leaderboard.innerHTML = data
        .slice(0, 10)
        .map((player) => {
            return `
                <p>
                    #${data.indexOf(player) + 1} |  ${player.username} |  ${player.score}
                </p>
            `;
        })
        .join("");
}

// Function to run when game is over
function gameOver() {
    // Make sure the user enters a name
    while (!username) username = prompt("Enter your username");
    // Update our storage with user's data
    databaseUpdate(username, score);
    // Clear the timer interval
    clearInterval(timer);
    // Set gamerunning boolean to false
    gameIsRunning = false;
    // Ensure the clock is set to 0s not 1s in some cases
    gameTimeDisplay.innerText = "0s";
}

// Add new entries to our database
function databaseUpdate(name, score) {
    // Create our data object
    var data = {
        username: name,
        score: score,
    };
    // URL to sheets api
    var url = "https://sheet2api.com/v1/Ag4tde5nRMSL/whack/Sheet1";
    // Api call for POST
    fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
        .then((response) => response.json())
        .then((data) => {
            // After updating database - get the updated database for display purposes
            databaseRetreive();
        })
        // Catch any errors
        .catch((error) => {
            console.error("Error:", error);
        });
}

// Retreive leaderboard info
function databaseRetreive() {
    // Grab 100 entries
    var query_params = new URLSearchParams({
        limit: 100,
    });
    // Api url for GET
    var url =
        "https://sheet2api.com/v1/Ag4tde5nRMSL/whack/Sheet1?" + query_params;
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            // Sort by highest score
            data.sort((a, b) => {
                return a.score < b.score ? 1 : -1;
            });
            // Update the leaderboard with our data
            populateLeaderboard(data);
        })
        // Catch any errors
        .catch((error) => {
            console.error("Error:", error);
        });
}

// Retreive database info intially to populate leaderboard
databaseRetreive();

// Event listeners
startGameButton.addEventListener("click", startGame);
moles.forEach((mole) => mole.addEventListener("click", hitMole));
moles.forEach((mole) => mole.addEventListener("touchstart", hitMole));