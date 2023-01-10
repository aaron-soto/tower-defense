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
const healthEl = document.getElementById('health');

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
let health = 100;
let waveTime = 50;
let roundTime = 50;
let cash = 300;
let isPlacingTower = false;
let enemyCount = 2;

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

const TowerTypes = {
	Base: 'base',
	Tower: 'tower',
};

const Colors = {
	Red: '#b13e53',
	Blue: '#38b764',
};

function createID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (Math.random() * 16) | 0,
			v = c == 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

class Bullet {
	constructor(x, y, enemiesInRange, shootSpeed) {
		this.x = x;
		this.y = y;
		this.id = createID();
		this.radius = 5;
		this.target = enemiesInRange[0];
		this.shootSpeed = shootSpeed;
	}

	draw() {
		ctx.save();
		ctx.beginPath();
		ctx.fillStyle = 'red';
		ctx.arc(
			this.x * cellSize - cellSize / 2,
			this.y * cellSize - cellSize / 2,
			this.radius,
			0,
			2 * Math.PI
		);
		ctx.fill();
		ctx.restore();
	}

	update() {
		const angle = Math.atan2(
			this.target.y - this.y * cellSize + cellSize / 2,
			this.target.x - this.x * cellSize + cellSize / 2
		);

		let velocity = {
			x: Math.cos(angle) * this.shootSpeed,
			y: Math.sin(angle) * this.shootSpeed,
		};

		this.x = this.x + velocity.x;
		this.y = this.y + velocity.y;
	}
}

class Tower {
	constructor(x, y, type, name = null, range = null) {
		this.x = x;
		this.y = y;
		this.type = type;
		this.name = name;
		this.range = range;
		this.sinceLastShot = 0;
		this.shootSpeed = 0.1;
		this.enemiesInRange = [];
		this.bullets = [];
		this.id = createID();
		if (type === TowerTypes.Base) {
			this.upgradeLevel = null;
		} else {
			this.upgradeLevel = 0;
		}
	}

	handleShooting() {
		if (this.enemiesInRange.length > 0) {
			let target = this.enemiesInRange[0];

			if (this.sinceLastShot >= 120) {
				this.bullets.push(
					new Bullet(this.x, this.y, this.enemiesInRange, this.shootSpeed)
				);
				this.sinceLastShot = 0;
			} else {
				this.sinceLastShot++;
				return;
			}
		}
		this.bullets.forEach((b) => {
			if (
				b.x * cellSize + cellSize / 2 >= b.target.x + b.radius &&
				b.y * cellSize + cellSize / 2 >= b.target.y + b.radius
			) {
				// TODO: On Hit remove bullet and hurt enemy
				// this.bullets = this.bullets.filter((bullet) => bullet.id !== b.id);
				// enemies = game.enemies.filter((e) => e.id !== b.target.id);
			}
		});
	}

	trackEnemies() {
		if (this.type === TowerTypes.Tower) {
			function checkCircleCollision(x1, y1, r1, x2, y2, r2) {
				var a = x1 - x2;
				var b = y1 - y2;
				var c = a * a + b * b;
				var radii = r1 + r2;
				return radii * radii >= c;
			}

			enemies.forEach((enemy) => {
				let collision = checkCircleCollision(
					enemy.x,
					enemy.y,
					enemy.radius,
					this.x * cellSize,
					this.y * cellSize,
					this.range * cellSize
				);

				if (collision) {
					const index = this.enemiesInRange.findIndex((e) => e.id === enemy.id);

					if (index === -1) {
						this.enemiesInRange.push(enemy);
					}
				} else {
					this.enemiesInRange = this.enemiesInRange.filter(
						(e) => e.id !== enemy.id
					);
				}
			});
		}
	}
}

class Game {
	constructor() {
		let enemyBase = new Tower(0, startRowEnemies, TowerTypes.Base, 'enemy');
		let playerBase = new Tower(
			cols * cellSize - cellSize,
			startRowBase,
			TowerTypes.Base,
			'player'
		);
		this.towers = [enemyBase, playerBase];
	}

	drawGrid() {
		ctx.save();
		ctx.beginPath();
		ctx.lineWidth = 0.25;
		ctx.strokeStyle = '#b0b0b0';
		for (let x = 0; x < cols; x += 1) {
			ctx.moveTo(x * cellSize + 0.5, 0);
			ctx.lineTo(x * cellSize + 0.5, canvas.height);
		}
		for (let y = 0; y < rows; y += 1) {
			ctx.moveTo(0, y * cellSize + 0.5);
			ctx.lineTo(canvas.width, y * cellSize + 0.5);
		}
		ctx.stroke();
		ctx.restore();
	}

	drawBases() {
		this.towers.forEach((tower) => {
			if (tower.type === TowerTypes.Base) {
				ctx.save();

				switch (tower.name) {
					case 'enemy':
						ctx.fillStyle = '#b13e53';
						break;
					case 'player':
						ctx.fillStyle = '#38b764';
				}

				ctx.fillRect(
					tower.x,
					tower.y * cellSize - cellSize,
					cellSize,
					cellSize
				);
				ctx.restore();
			}
		});
	}

	drawTowers() {
		this.towers.forEach((tower) => {
			if (tower.type === TowerTypes.Tower) {
				ctx.save();
				if (tower.name === 'sniper') {
					ctx.fillStyle = '#257179';
				} else if (tower.name === 'cannon') {
					ctx.fillStyle = '#333c57';
				} else if (tower.name === 'missile') {
					ctx.fillStyle = '#566c86';
				} else if (tower.name === 'gatlin') {
					ctx.fillStyle = '#ef7d57';
				} else if (tower.name === 'tesla') {
					ctx.fillStyle = '#5d275d';
				} else {
					ctx.fillStyle = '#41a6f6';
				}
				ctx.fillRect(
					(tower.x - 1) * cellSize,
					(tower.y - 1) * cellSize,
					cellSize,
					cellSize
				);
				ctx.restore();

				if (tower.x === selectedTower?.x && tower.y === selectedTower?.y) {
					ctx.save();
					ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
					ctx.strokeStyle = 'black';
					ctx.beginPath();
					ctx.arc(
						cellSize * (selectedTower.x - 1) + cellSize / 2,
						cellSize * (selectedTower.y - 1) + cellSize / 2,
						cellSize * selectedTower.range, // Range
						0,
						2 * Math.PI
					);
					ctx.strokeStyle = '#94b0c2';
					ctx.lineWidth = 3;
					ctx.stroke();
					ctx.fill();
					ctx.restore();
				}
			}
		});
	}
}

class Enemy {
	constructor() {
		this.x = 0 + cellSize / 2;
		this.y = startRowEnemies * cellSize - cellSize / 2;
		this.id = createID();
		this.speed = 0.5;
		this.radius = 6;
		this.enemiesInRange = [];
		// this.speed = 0.75;
	}

	draw() {
		ctx.strokeStyle = '#333c57';
		ctx.lineWidth = 5;
		ctx.fillStyle = '#b13e53';
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fill();
	}

	update() {
		let target = {
			x: cols * cellSize - cellSize / 2,
			y: startRowBase * cellSize - cellSize / 2,
		};
		const angle = Math.atan2(target.y - this.y, target.x - this.x);

		const velocity = {
			x: Math.cos(angle) * this.speed,
			y: Math.sin(angle) * this.speed,
		};

		this.x = this.x + velocity.x;
		this.y = this.y + velocity.y;

		if (
			this.x >= cols * cellSize - cellSize &&
			this.y >= startRowBase * cellSize - cellSize
		) {
			enemies.shift();
			health -= 5;
			healthEl.innerText = health;
			updateTextFields();
		}
	}
}

let enemy1 = new Enemy();
let enemies = [];

function spawnEnemies() {
	let enemyNum = 0;
	var t = setInterval((e) => {
		if (enemyNum <= enemyCount) {
			enemies.push(new Enemy());
			enemyNum++;
			// console.log(enemies);
		}
	}, 2000);
}

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

		spawnEnemies();

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

let game = new Game();

function tick() {
	updateTextFields();
	// drawBases();
	game.drawBases();
	game.drawTowers();
	game.drawGrid();

	game.towers.forEach((t) => {
		t.handleShooting();
		t.trackEnemies();

		t.bullets.forEach((b) => {
			b.draw();
			b.update();
		});
	});

	if (roundTime === 0) {
		wave += 1;
		waveTime += 5;
		roundTime = waveTime;
		timeEl.style.color = '#f4f4f4';
		spawnEnemies();
		updateTextFields();
	}

	if (selectedTower !== null && selectedTower !== undefined) {
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

	enemies.forEach((enemy) => {
		enemy.update();
	});
	enemies.forEach((enemy) => {
		enemy.draw();
	});
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

// function drawBases() {
// 	ctx.save();
// 	ctx.fillStyle = '#b13e53';
// 	ctx.fillRect(0, cellSize * startRowEnemies - cellSize, cellSize, cellSize);

// 	ctx.fillStyle = '#38b764';
// 	ctx.fillRect(
// 		cols * cellSize - cellSize,
// 		cellSize * startRowBase - cellSize,
// 		cellSize,
// 		cellSize
// 	);
// 	ctx.restore();
// }

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
