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
	let tower;
	if (isPlacingTower) {
		towersPositions.forEach((t) => {
			if (mouse.cellPosition.x === t.x && mouse.cellPosition.y === t.y) {
				isOnBase = true;
			}
			tower = {
				x: mouse.cellPosition.x,
				y: mouse.cellPosition.y,
				upgradeLevel: 0,
				name: selectedPlacingTower.name,
				range: selectedPlacingTower.range,
			};
			tower['type'] = selectedPlacingTower.type;
		});
		if (!isOnBase) {
			console.log('test');
			cash -= selectedPlacingTower?.cost;
			updateTextFields();
			towersPositions.push(tower);
			selectedTower = tower;
			isPlacingTower = false;
		}
	} else {
		let clickedTower = false;
		towersPositions
			.filter((t) => t.type !== 'base')
			.forEach((t) => {
				if (mouse.cellPosition.x === t.x && mouse.cellPosition.y === t.y) {
					clickedTower = true;
					selectedTower = t;
				}
			});

		if (!clickedTower) {
			selectedTower = null;
		}
		isPlacingTower = false;
	}

	e.stopPropagation();
	e.preventDefault();

	// TODO: select placed towers
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
