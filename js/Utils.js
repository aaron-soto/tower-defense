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
	timeEl.innerText = roundTime;
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
