playBtn.addEventListener('click', play);

pauseBtn.addEventListener('click', handlePause);

screenshotBtn.addEventListener('click', () => {
	let image = canvas.toDataURL('image/jpeg');
	const link = document.createElement('a');
	link.href = image;
	link.download = 'TowerDefense' + new Date();
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
});

// List of towers at bottom
towerList.forEach((tower) => {
	document
		.getElementById(tower.buyBtn)
		.addEventListener('click', () => selectTowerToPlace(tower.name));
});

// on click
canvas.addEventListener('click', (e) => {
	let isOnBase = false;
	let tempTower;
	if (isPlacingTower) {
		game.towers.forEach((t) => {
			if (mouse.cellPosition.x === t.x && mouse.cellPosition.y === t.y) {
				isOnBase = true;
			}
			tempTower = new Tower(
				mouse.cellPosition.x,
				mouse.cellPosition.y,
				'tower',
				selectedPlacingTower.name,
				selectedPlacingTower.range
			);
		});
		if (!isOnBase) {
			cash -= selectedPlacingTower?.cost;
			updateTextFields();
			game.towers.push(tempTower);
			selectedTower = tempTower;
			isPlacingTower = false;
		}
	} else {
		let didClickTower = false;
		game.towers
			.filter((t) => t.type !== TowerTypes.Base)
			.forEach((t) => {
				if (mouse.cellPosition.x === t.x && mouse.cellPosition.y === t.y) {
					didClickTower = true;
					selectedTower = t;
					console.log(t.id);
				}
			});

		if (!didClickTower) {
			selectedTower = null;
		}

		isPlacingTower = false;
	}

	e.stopPropagation();
	e.preventDefault();
});

canvas.addEventListener('mousemove', (evt) => {
	mouse.rawPosition = getMousePos(evt, true);
	mouse.cellPosition = getMousePos(evt);
});

// Cancel placement
document.addEventListener('keydown', (e) => {
	switch (e.key) {
		case 'Escape':
			isPlacingTower = false;
			break;
	}
});

document.addEventListener(
	'contextmenu',
	(e) => {
		e.preventDefault();
		if (isPlacingTower) {
			isPlacingTower = false;
		}
	},
	false
);
