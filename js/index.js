const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
let timerId;

// Buttons
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const screenshotBtn = document.getElementById('screenshot-btn');

// Screens
const mainMenu = document.getElementById('main-menu');
const gameBar = document.getElementById('game-bar');
const gameStatsBar = document.getElementById('game-stats-bar');
const towersBar = document.getElementById('towers');
const towerStats = document.getElementById('tower-stats');

const towerNameEl = document.getElementById('tower-name');
const towerRangeEl = document.getElementById('tower-range');
const towerDamageEl = document.getElementById('tower-damage');
const towerFiringRateEl = document.getElementById('tower-firing-rate');

// Text elements
const timeEl = document.getElementById('time');
const cashEl = document.getElementById('cash');
const waveEl = document.getElementById('wave');

const dpi = window.devicePixelRatio;
const cellSize = 50;
const rows = 12;
const cols = 20;
let gameStarted = false;
let gamePaused = false;
let startRowEnemies = Math.floor(Math.random() * rows + 1);
let startRowBase = Math.floor(Math.random() * rows + 1);
let wave = 1;

// User variables
let waveTime = 30;
let roundTime = 30;
let cash = 300;
let isPlacingTower = false;

let selectedTowerRange;
let selectedTowerCost;
let selectedPlacingTower;
let selectedTower;

let mouse = {
	rawPosition: {
		x: null,
		y: null,
	},
	cellPosition: {
		x: null,
		y: null,
	},
};

canvas.width = cellSize * cols;
canvas.height = cellSize * rows;

const towerList = [
	{
		name: 'laser',
		cost: 25,
		buyBtn: 'buy-laser',
		costEl: 'cost-laser',
		type: 'tower',
		range: 2,
	},
	{
		name: 'sniper',
		cost: 25,
		buyBtn: 'buy-sniper',
		costEl: 'cost-sniper',
		type: 'tower',
		range: 4,
	},
	{
		name: 'gatlin',
		cost: 50,
		buyBtn: 'buy-gatlin',
		costEl: 'cost-gatlin',
		type: 'tower',
		range: 2,
	},
	{
		name: 'tesla',
		cost: 100,
		buyBtn: 'buy-tesla',
		costEl: 'cost-tesla',
		type: 'tower',
		range: 3,
	},
	{
		name: 'cannon',
		cost: 75,
		buyBtn: 'buy-cannon',
		costEl: 'cost-cannon',
		type: 'tower',
		range: 3,
	},
	{
		name: 'missile',
		cost: 75,
		buyBtn: 'buy-missile',
		costEl: 'cost-missile',
		type: 'tower',
		range: 2,
	},
	{
		name: 'bomb',
		cost: 150,
		buyBtn: 'buy-bomb',
		costEl: 'cost-bomb',
		type: 'tower',
		range: 2,
	},
	{
		name: 'nuke',
		cost: 200,
		buyBtn: 'buy-nuke',
		costEl: 'cost-nuke',
		type: 'tower',
		range: 2,
	},
];

let towersPositions = [
	{
		x: 1,
		y: startRowEnemies,
		type: 'base',
		upgradeLevel: null,
		name: null,
		range: null,
	},
	{
		x: cols,
		y: startRowBase,
		type: 'base',
		upgradeLevel: null,
		name: null,
		range: null,
	},
];

class Enemy {
	constructor() {
		this.x = 0 + cellSize / 2;
		this.y = startRowEnemies * cellSize - cellSize / 2;
		this.speed = 1;
	}

	draw() {
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 5;
		ctx.fillStyle = 'red';
		ctx.beginPath();
		ctx.arc(this.x, this.y, 6, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fill();
	}

	update() {
		let target = { x: cols * cellSize + cellSize / 2, y: startRowBase };
		let dx = target.x - this.x;
		let dy = target.y - this.y;

		let distance = Math.sqrt(dx * dx + dy * dy);
		let moves = distance / this.speed;
		let xUnits = (target.x - this.x) / moves;
		let yUnits = (target.y - this.y) / moves;

		this.x += xUnits;
		this.y += yUnits;
	}
}

let enemy1 = new Enemy();

function play() {
	if (!gameStarted) {
		mainMenu.style.display = 'none';
		gameBar.style.display = 'flex';
		gameStatsBar.style.display = 'flex';
		towersBar.style.display = 'grid';

		updateTextFields();

		timerId = setInterval(function () {
			timeEl.innerText = roundTime;
			roundTime -= 1;
		}, 1000);

		enemy1.draw();

		animate();
	}
}

function animate(timestamp) {
	if (!gamePaused) {
		resetFrame();
		tick();
	} else {
		// Pause Menu
		console.log('game paused');
	}
	requestAnimationFrame(animate);
}

function tick() {
	updateTextFields();
	drawBases();
	drawTowers();
	drawGrid();

	if (roundTime === 0) {
		wave += 1;
		waveTime += 5;
		roundTime = waveTime;
		timeEl.style.color = '#f4f4f4';
		updateTextFields();
	}

	if (selectedTower !== null && selectedTower !== undefined) {
		console.log(selectedTower);
		towerNameEl.innerText = selectedTower.name;
		towerRangeEl.innerText = selectedTower.range;
		// TODO: Updated below values
		towerDamageEl.innerText = 10;
		towerFiringRateEl.innerText = 10;
		towerStats.style.display = 'block';
	} else {
		towerStats.style.display = 'none';
	}

	if (isPlacingTower) {
		towersPositions.forEach((tower) => {
			// Color red if invalid spot grey if valid
			drawPlacementCell(tower);
			drawPlacementCircle(tower);
		});
	}

	enemy1.update();
	enemy1.draw();
}

function handlePause() {
	if (gamePaused) {
		gamePaused = false;
		timerId = setInterval(function () {
			timeEl.innerText = roundTime;
			roundTime -= 1;
		}, 1000);
		pauseBtn.innerText = 'Pause';
	} else {
		gamePaused = true;
		clearInterval(timerId);
		pauseBtn.innerText = 'Resume';
	}
}

function drawBases() {
	ctx.save();
	ctx.fillStyle = '#b13e53';
	ctx.fillRect(0, cellSize * startRowEnemies - cellSize, cellSize, cellSize);

	ctx.fillStyle = '#38b764';
	ctx.fillRect(
		cols * cellSize - cellSize,
		cellSize * startRowBase - cellSize,
		cellSize,
		cellSize
	);
	ctx.restore();
}

function selectTowerToPlace(towerName) {
	towerList.forEach((tower) => {
		if (towerName === tower.name && cash >= tower.cost) {
			selectedTower = null;
			selectedPlacingTower = tower;
			updateTextFields();
			isPlacingTower = true;
		}
	});
}
