const store = {
    track_id: undefined,
    player_id: undefined,
    race_id: undefined
};

document.addEventListener("DOMContentLoaded", function () {
    onPageLoad();
    setupClickHandlers();
});

async function onPageLoad() {
    try {
        await getTracks()
            .then(tracks => {
                const html = renderTrackCards(tracks);
                renderAt("#track-container", html);
            });

        await getRacers()
            .then((racers) => {
                const html = renderRacers(racers);
                renderAt("#racer-container", html);
            });
    } catch (error) {
        console.log("Problem getting tracks and racers:", error.message);
    }
}

function setupClickHandlers() {
    document.addEventListener("click", event => {
        const { target } = event;
        const parent = event.target.parentElement;

        // Race track form field
        if (target.matches(".card.track")) {
            handleSelectTrack(target);
        }

        if (target.matches(".track-info")) {
            handleSelectTrack(parent);
        }

        // Racer form field
        if (target.matches(".card.turtle-racer")) {
            handleSelectRacer(target);
        }

        if (target.matches(".racer-info")) {
            handleSelectRacer(parent);
        }

        // Submit create race form
        if (target.matches("#submit-create-race")) {
            event.preventDefault();
            const track_name = target.getAttribute("track-name");
            handleCreateRace(track_name);
        }

        // Handle acceleration click
        if (target.matches("#gas-peddle")) {
            handleAccelerate();
        }
    }, false);
}

async function delay(ms) {
    try {
        return await new Promise(resolve => setTimeout(resolve, ms));
    } catch (error) {
        console.log(error);
    }
}

async function handleCreateRace(track_name) {
    const { player_id, track_id } = store;
    renderAt("#race", renderRaceStartView(track_name));

    try {
        const race = await createRace(player_id, track_id);
        // Take ID created from createRace and updates store with value
        store.race_id = race.ID - 1;
        const { race_id } = store;

        // Start game countdown once race created
        await runCountdown();

        // Start race after countdown
        await startRace(race_id);

        await runRace(race_id);
    } catch (error) {
        console.log(error);
    }
	
}

function runRace(raceID) {
    return new Promise(resolve => {

        const progress = async () => {
            try {
                const raceInfo = await getRace(raceID);
                if (raceInfo.status === "in-progress") {
                    renderAt("#leaderBoard", raceProgress(raceInfo.positions));
                }
                if (raceInfo.status === "finished") {
                    clearInterval(raceInterval);
                    renderAt("#race", resultsView(raceInfo.positions));
                    document.querySelector(".race-track").innerHTML = "";
                    resolve(raceInfo);
                }
            } catch (error) {
                console.log("There was an error getting race info: ", error);
                clearInterval(raceInterval);
            }
        };
        // Get race info every 500ms
        const raceInterval = setInterval(progress, 500);
    });
}

async function runCountdown() {
    try {
        // wait for the DOM to load
        await delay(500);
        document.getElementById("directions").style.display = "block";
        let timer = 3;

        return new Promise(resolve => {
            const decrement = () => {
                document.getElementById("big-numbers").innerHTML = --timer;
                if (timer === 0) {
                    clearInterval(countdown);
                    document.getElementById("directions").style.display = "none";
                    return resolve();
                }
            };
            const countdown = setInterval(decrement, 1000);
        });
    } catch (error) {
        console.log(error);
    }
}

// Saves selected racer to store
function handleSelectRacer(target) {
    const selected = document.querySelector("#racers .selected");

    if (selected) {
        selected.classList.remove("selected");
    }
    target.classList.add("selected");
    store.player_id = target.id;
}

// Saves selected track to store
function handleSelectTrack(target) {
    const track_name = target.getAttribute("name");
    const selected = document.querySelector("#tracks .selected");

    if (selected) {
        selected.classList.remove("selected");
    }
    target.classList.add("selected");
    store.track_id = target.id;

    const sumbit_button = document.getElementById("submit-create-race");
    sumbit_button.setAttribute("track-name", track_name);
}

function handleAccelerate() {
    accelerate(store.race_id);
}

// HTML VIEWS ------------------------------------------------
function renderRacers(racers) {
    if (!racers.length) {
        return `
			<h4>Loading Racers...</4>
		`;
    }

    const results = racers.map(renderRacerCard).join("");

    return `
		<ul id="racers">
			${results}
		</ul>
	`;
}

function renderRacerCard(racer) {
    const { id, driver_name, top_speed, acceleration, handling } = racer;

    return `
		<li class="card turtle-racer" id="${id}">
			<h3 class="racer-info racer-name">${driver_name}</h3>
			<p class="racer-info">Top Speed: ${top_speed}</p>
			<p class="racer-info">Acceleration: ${acceleration}</p>
			<p class="racer-info">Handling: ${handling}</p>
		</li>
	`;
}

function renderTrackCards(tracks) {
    if (!tracks.length) {
        return `
			<h4>Loading Tracks...</4>
		`;
    }

    const results = tracks.map(renderTrackCard).join("");
    return `
		<ul id="tracks">
			${results}
		</ul>
	`;
}

function renderTrackCard(track) {
    const { id, name } = track;

    return `
		<li id="${id}" class="card track" name="${name}">
			<h3 class="track-info">${name}</h3>
		</li>
	`;
}

function renderCountdown(count) {
    return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`;
}

function renderRaceStartView(track) {
    return `
		<header>
			<h1>Race: ${track}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<div id="directions">
					<h2>Directions</h2>
					<p>Click the button as fast as you can to make your racer go faster!</p>
				</div>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`;
}

function resultsView(positions) {
    positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1);

    return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`;
}

function raceProgress(positions) {
	
    const userPlayer = positions.find(e => e.id === parseInt(store.player_id));
    userPlayer.driver_name += " (You)";
    const player_stats = [...positions];

    // If player finished, sort by finishing position
    // Otherwise, sort by segment position
    let finished = [];
    let inProgress = [];

    positions.forEach(p => {
        if (p.final_position != undefined) {
            finished.push(p);
        } else {
            inProgress.push(p);
        }
    });
    finished = finished.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1);
    inProgress = inProgress.sort((a, b) => (a.segment < b.segment) ? 1 : -1);
    const finalSort = finished.concat(inProgress);
    let count = 1;

    const results = finalSort.map(p => {
        return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`;
    }).join("");

    const raceTracks = player_stats.map(p => {
        const completetion = p.segment/201; 
        // Removes (You) label for names under track
        let player_name = "";
        if (p.driver_name === userPlayer.driver_name) {
            player_name = p.driver_name.split(" ")[0];
        } else {
            player_name = p.driver_name;
        }

        return `
		<div class="column">
            <div class="turtle" style="bottom:${completetion*25}vh">
                <img src="../assets/img/turtles.png" alt="turtle">
            </div>
            <div class="racer-stats">
                <div id="turtle-name">${player_name}</div>
                <div id="turtle-progress">${Math.round(completetion*100)}%</div>
            </div>
        </div>
		`;
    }).join("");

    return `
		<main>
			<h4>Leaderboard</h4>
			<section id="leaderBoard">
				<div class="results">
					${results}
				</div>
				<div class="race-track">
					${raceTracks}
				</div>	
			</section>
		</main>
	`;
}

function renderAt(element, html) {
    const node = document.querySelector(element);
    node.innerHTML = html;
}

// API CALLS ------------------------------------------------

const SERVER = "http://localhost:8000";

function defaultFetchOpts() {
    return {
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": SERVER,
        },
    };
}

function getTracks() {
    return fetch(`${SERVER}/api/tracks`)
        .then(response => response.json())
        .catch(err => console.log("There was an error getting the tracks", err));
}

function getRacers() {
    return fetch(`${SERVER}/api/cars`)
        .then(response => response.json())
        .catch(err => console.log("There was an error getting the racers", err));
}

function createRace(player_id, track_id) {
    player_id = parseInt(player_id);
    track_id = parseInt(track_id);
    const body = { player_id, track_id };

    return fetch(`${SERVER}/api/races`, {
        method: "POST",
        ...defaultFetchOpts(),
        dataType: "jsonp",
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .catch(err => console.log("Problem with createRace request:", err));
}

function getRace(id) {
    return fetch(`${SERVER}/api/races/${id}`)
        .then((response) => response.json())
        .catch((err) => console.log("There was an error getting the race:", err));
}

function startRace(id) {
    return fetch(`${SERVER}/api/races/${id}/start`, {
        method: "POST",
        ...defaultFetchOpts(),
    }).catch(err => console.log("Problem with getRace request:", err));
}

function accelerate(id) {
    return fetch(`${SERVER}/api/races/${id}/accelerate`, {
        method: "POST",
        ...defaultFetchOpts(),
    }).catch(err => console.log("Problem with getRace request:", err));
}
