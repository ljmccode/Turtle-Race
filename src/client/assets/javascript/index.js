// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE/EDIT

// The store will hold all information needed globally
let store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		await getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#track-container', html)
			})

		await getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racer-container', html)
			})
	} catch(error) {                  
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', event => {
		const { target } = event
		let parent = event.target.parentElement

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		}

		if(target.matches('.track-info')) {
			handleSelectTrack(parent)
		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
		}

		if (target.matches('.racer-info')) {
			handleSelectPodRacer(parent)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
			let track_name = target.getAttribute("track-name")
			// start race
			handleCreateRace(track_name)
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate()
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace(track_name) {
	// get player_id and track_id from the store
	let { player_id, track_id } = store;
	// render starting UI
	renderAt('#race', renderRaceStartView(track_name))
	
	// invoke the API call to create the race, then save the result
	const race = await createRace(player_id, track_id);
	
	// update the store with the race id
	store.race_id = race.ID - 1
	let { race_id } = store
	
	// The race has been created, now start the countdown
	// call the async function runCountdown
	await runCountdown();

	// TODO - call the async function startRace
	await startRace(race_id);
	console.log("Race has been started");

	// TODO - call the async function runRace
	await runRace(race_id);
}

function runRace(raceID) {
	return new Promise(resolve => {
	
		// TODO - if the race info status property is "in-progress", update the leaderboard by calling:
		const progress = async () => {
			try {
				const raceInfo = await getRace(raceID)
				console.log("Race Info", raceInfo)
				console.log("Positions: ", raceInfo.positions)
				if (raceInfo.status === 'in-progress') {
					renderAt('#leaderBoard', raceProgress(raceInfo.positions))
				}	
				if (raceInfo.status === 'finished') {
					clearInterval(raceInterval);
					renderAt('#race', resultsView(raceInfo.positions))
					resolve(raceInfo)
				}
			} catch (error) {
				console.log("There was an error getting race info: ", error)
				clearInterval(raceInterval);
			}
		}

		// TODO - use Javascript's built in setInterval method to get race info every 500ms
		const raceInterval = setInterval(progress, 500);

	/* 
		TODO - if the race info status property is "finished", run the following:

		clearInterval(raceInterval) // to stop the interval from repeating
		renderAt('#race', resultsView(res.positions)) // to render the results view
		reslove(res) // resolve the promise
	*/
	})
	// remember to add error handling for the Promise
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(500)
		let timer = 3

		return new Promise(resolve => {
			// TODO - use Javascript's built in setInterval method to count down once per second
			
				// run this DOM manipulation to decrement the countdown for the user
			const decrement = () => {
				document.getElementById('big-numbers').innerHTML = --timer
				// TODO - if the countdown is done, clear the interval, resolve the promise, and return
				if (timer === 0) {
					clearInterval(countdown)
					return resolve()
				}
			}
			const countdown = setInterval(decrement, 1000)
		})
	} catch(error) {
		console.log(error);
	}
}

function handleSelectPodRacer(target) {
	console.log("selected a pod", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// save the selected racer to the store
	store.player_id = target.id
}

function handleSelectTrack(target) {
	let track_name = target.getAttribute("name")

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// save the selected track id to the store
	store.track_id = target.id;

	const sumbit_button = document.getElementById('submit-create-race');
	sumbit_button.setAttribute('track-name', track_name);
}

function handleAccelerate() {
	console.log("accelerate button clicked")
	// TODO - Invoke the API call to accelerate
	accelerate(store.race_id)
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card podracer" id="${id}">
			<h3 class="racer-info">${driver_name}</h3>
			<p class="racer-info">Top Speed: ${top_speed}</p>
			<p class="racer-info">Acceleration: ${acceleration}</p>
			<p class="racer-info">Handling: ${handling}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')
	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track

	return `
		<li id="${id}" class="card track" name="${name}">
			<h3 class="track-info">${name}</h3>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	return `
		<header>
			<h1>Race: ${track}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	let userPlayer = positions.find(e => e.id === parseInt(store.player_id))
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints 

function getTracks() {
	// GET request to `${SERVER}/api/tracks`
	return fetch(`${SERVER}/api/tracks`)
			.then(response => response.json())
			.catch(error => console.log('There was an error getting the tracks', error))
}

function getRacers() {
	// GET request to `${SERVER}/api/cars`
	return fetch(`${SERVER}/api/cars`)
			.then(response => response.json())
			.catch(error => console.log('There was an error getting the racers', error))
}

function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }
	
	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
	})
	.then(res => res.json())
	.catch(err => console.log("Problem with createRace request::", err))
}

function getRace(id) {
	// GET request to `${SERVER}/api/races/${id}`
	console.log(`${SERVER}/api/races/${id}`)
	return fetch(`${SERVER}/api/races/${id}`)
		.then((response) => response.json())
		.catch((error) => console.log('There was an error getting the race', error))
}

function startRace(id) {
	console.log("Race ID", id)
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	// .then(res => res.json())
	.catch(err => console.log("Problem with getRace request::", err))
}

function accelerate(id) {
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	return fetch(`${SERVER}/api/races/${id}/accelerate`, {
		method: 'POST',
			...defaultFetchOpts(),
	})
	.catch(err => console.log("Problem with getRace request::", err))
}
