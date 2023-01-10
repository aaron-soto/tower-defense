function getMousePos(evt, raw = false) {
	let rect = canvas.getBoundingClientRect();

	if (raw) {
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top,
		};
	} else {
		return {
			x: Math.floor((evt.clientX - rect.left) / cellSize) + 1,
			y: Math.floor((evt.clientY - rect.top) / cellSize + 1),
		};
	}
}

function updateTextFields() {
	if (roundTime <= 10) {
		timeEl.style.color = '#b13e53';
	}

	cashEl.innerText = cash;
	waveEl.innerText = wave;
	towerList.forEach((tower) => {
		document.getElementById(tower.costEl).innerText = tower.cost;
	});

	towerList.forEach((tower) => {
		if (cash < tower.cost) {
			document.getElementById(tower.buyBtn).classList.add('is-locked');
		} else {
			document.getElementById(tower.buyBtn).classList.remove('is-locked');
		}
	});
}

function drawGrid() {
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

function drawPlacementCircle(tower) {
	ctx.save();
	if (tower.x === mouse.cellPosition.x && tower.y === mouse.cellPosition.y) {
		ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
		ctx.strokeStyle = 'red';
	} else {
		ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
		ctx.strokeStyle = 'black';
	}
	ctx.beginPath();
	ctx.arc(
		cellSize * (mouse.cellPosition.x - 1) + cellSize / 2,
		cellSize * (mouse.cellPosition.y - 1) + cellSize / 2,
		cellSize * selectedPlacingTower?.range, // Range
		0,
		2 * Math.PI
	);
	ctx.strokeStyle = '#94b0c2';
	ctx.lineWidth = 3;
	ctx.stroke();
	ctx.fill();
	ctx.restore();
}

function drawPlacementCell(tower) {
	ctx.save();
	if (tower.x === mouse.cellPosition.x && tower.y === mouse.cellPosition.y) {
		ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
		ctx.strokeStyle = 'red';
	} else {
		ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
		ctx.strokeStyle = 'black';
	}
	ctx.fillRect(
		cellSize * (mouse.cellPosition.x - 1),
		cellSize * (mouse.cellPosition.y - 1),
		cellSize,
		cellSize
	);
	ctx.restore();
}

// Canvas helpers
function resetFrame() {
	ctx.save();
	ctx.fillStyle = '#f1f1f1';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.restore();
}

function drawTowers() {
	towersPositions
		.filter((tower) => tower.type !== 'base')
		.forEach((tower) => {
			ctx.save();
			ctx.fillStyle = '#41a6f6';
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
					cellSize * selectedPlacingTower?.range, // Range
					0,
					2 * Math.PI
				);
				ctx.strokeStyle = '#94b0c2';
				ctx.lineWidth = 3;
				ctx.stroke();
				ctx.fill();
				ctx.restore();
			}
		});
}
