let advTime = true;
let showAdv;
let interval;
if(window.YaGames){
	YaGames.init({
		adv: {
			onAdvClose: wasShown => {
				console.log("ws: " + wasShown);
				if(!wasShown){
					clearInterval(interval);
					advTime = true;
				}
			}
		}
	}).then(ysdk => {
		showAdv = () => {
			ysdk.adv.showFullscreenAdv({
				callbacks: {
					onClose: function() {
						advTime = false;
						interval = setTimeout(()=>{
							advTime = true;
						}, 250000);
					}
				}
			});
		};
	});
}
function params(data) {
	ym(55146370, 'params', data);
}
let pds = document.querySelector('.pds');
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
	pds.innerText = "Добро пожаловать в Сапёр! Правила сапёра просты: нужно обнаружить все бомбы на поле." +
		" Нажав на поле, вы увидите цифры. Каждая цифра обозначает количество бомб вокруг неё. Анализируя эти цифры, вам нужно определить место нахождения всех бомб." +
		" Короткое нажатие - открыть клетку с цифрой, долгое нажатие - поставить флажок на бомбу. Удачной игры!"
}else{
	pds.innerText = "Добро пожаловать в Сапёр! Правила сапёра просты: нужно обнаружить все бомбы на поле." +
		"Нажав на поле, вы увидите цифры. Каждая цифра обозначает количество бомб вокруг неё. Анализируя эти цифры, вам нужно определить место нахождения всех бомб. " +
		"Левая кнопка мыши - открыть клетку с цифрой. " +
		"Правая кнопка мыши - поставить флажок на бомбу. Удачной игры!"
}
let size = 10;
let bombFrequency = 0.2;
let tileSize = 50;
const board = document.querySelectorAll('.board')[0];
let bombsleft = document.querySelector('.bombs');
let tiles;
let width = 10, height = 10;
let countMoves = 0;
let flags;
const restartBtn = document.querySelectorAll('.game')[0];
const endscreen = document.querySelectorAll('.endscreen')[0];

const boardWidth = document.getElementById('boardWidth');
const boardHeight = document.getElementById('boardHeight');
const difficultyBtns = document.querySelectorAll('.difficulty');

let bombs = [];
let numbers = [];
let numberColors = ['#3498db', '#2ecc71', '#e74c3c', '#9b59b6', '#f1c40f', '#1abc9c', '#34495e', '#7f8c8d',];

let gameOver = false;
window.onresize = resize;
function resize() {
	if(window.innerWidth < 450){
		boardWidth.max = "15";
	} else if(window.innerWidth > 450 &&window.innerWidth < 700){
		boardWidth.max = "20";
	}else if(window.innerWidth > 700 && window.innerWidth < 1024){
		boardWidth.max = "30";
	}else{
		boardWidth.max = "40";
	}
}
resize();

function clear() {
	gameOver = false;
	bombs = [];
	numbers = [];
	countMoves = 0;
	endscreen.innerHTML = '';
	endscreen.classList.remove('show');
	document.querySelectorAll('tr').forEach(tile => {
		tile.remove();
	});
	getField();
}
function getField() {
	if(window.YaGames && advTime && showAdv){
		showAdv();
	}
	for(let i = 0; i < height; i++){
		const tr = document.createElement('tr');
		board.appendChild(tr);
	}
	let trs = document.querySelectorAll('.board tr');
	trs.forEach((e)=>{
		for(let i = 0; i < width; i++){
			const tile = document.createElement('td');
			tile.classList.add('tile');
			e.appendChild(tile);
		}
	});

	tiles = document.querySelectorAll('.tile');
	/*
	document.documentElement.style.setProperty('--tileSize', `${tileSize}px`);
	document.documentElement.style.setProperty('--boardSize', `${boardSize * tileSize}px`);
	*/
	let x = 0;
	let y = 0;
	tiles.forEach((tile, i) => {
		tile.setAttribute('data-tile', `${x},${y}`);
		x++;
		if(x >= width){
			x = 0;
			y++;
		}
		tile.oncontextmenu = function(e) {
			e.preventDefault();
			flag(tile);
		};
		tile.ondblclick = function(e) {
			e.preventDefault();
			flag(tile);
		};
		tile.addEventListener('click', function(e) {
			clickTile(tile);
		});
	});
	bombsleft.innerText = "Количество мин неизвестно...";
}
function start(cord) {
	let x = 0;
	let y = 0;
	let xclick = Number(cord.split(',')[0]);
	let yclick = Number(cord.split(',')[1]);

	tiles.forEach((tile, i) => {
		let random_boolean = Math.random() < bombFrequency;
		if(xclick === x && yclick === y) random_boolean = false;
		if(cord)
		if(random_boolean){
			bombs.push({x: x, y: y});
			if(x > 0) numbers.push({x: x - 1, y: y});
			if(x < width - 1) numbers.push({x: x + 1, y: y});
			if(y > 0) numbers.push({x: x, y: y - 1});
			if(y < height - 1) numbers.push({x: x, y: y + 1});
			if(x > 0 && y > 0) numbers.push({x: x - 1, y: y - 1});
			if(x < width - 1 && y < height - 1) numbers.push({x: x + 1, y: y + 1});
			if(y > 0 && x < width - 1) numbers.push({x: x + 1, y: y - 1});
			if(x > 0 && y < height - 1) numbers.push({x: x - 1, y: y + 1});
		}
		x++;
		if(x >= width){
			x = 0;
			y++;
		}
	});
	bombsleft.innerText = "Мин осталось: " + bombs.length;
	flags = bombs.length;
	numbers.forEach(num => {
		let tile = document.querySelector('[data-tile="'+num.x+','+num.y+'"]');
		let dataNum = parseInt(tile.getAttribute('data-num'));
		if(!dataNum) dataNum = 0;
		tile.setAttribute('data-num', dataNum + 1);
	});
}
function flag(tile) {
	if(gameOver || tile.classList.contains('checkedTile') || countMoves === 0) return;
	countMoves++;
	if(tile.classList.contains('flaggedTile')){
		flags++;
	}else{
		flags--;
	}
	bombsleft.innerText = "Мин осталось: " + flags;
	tile.classList.toggle('flaggedTile');
}
function hasBomb(cord) {
	let x = Number(cord.split(',')[0]);
	let y = Number(cord.split(',')[1]);
	for(let i = 0; i < bombs.length; i++){
		if(bombs[i].x === x && bombs[i].y === y) return true;
	}
	return false;
}
function clickTile (tile){
	if(!pds.classList.contains('none')) pds.classList.add('none');
	if(gameOver || tile.classList.contains('checkedTile') || tile.classList.contains('flaggedTile')) return;
	let cord= tile.getAttribute('data-tile');
	if(countMoves === 0){
		start(cord);
	}
	countMoves++;
	if(hasBomb(cord)){
		endGame(tile);
	} else{
		let num = tile.getAttribute('data-num');
		if(num !== null){
			tile.classList.add('checkedTile');
			tile.innerHTML = num;
			tile.style.color = numberColors[num - 1];
			setTimeout(() => {
				checkVictory();
			}, 100);
			return;
		}
		checkTile(tile, cord);
	}
	tile.classList.add('checkedTile');
}
function checkTile(tile, cord) {
	let x = Number(cord.split(',')[0]);
	let y = Number(cord.split(',')[1]);
	setTimeout(() => {
		if(x > 0){
			let targetW = document.querySelectorAll(`[data-tile="${x - 1},${y}"`)[0];
			clickTile(targetW, `${x - 1},${y}`);
		}
		if(x < width - 1){
			let targetE = document.querySelectorAll(`[data-tile="${x + 1},${y}"`)[0];
			clickTile(targetE, `${x + 1},${y}`);
		}
		if(y > 0){
			let targetN = document.querySelectorAll(`[data-tile="${x},${y - 1}"]`)[0];
			clickTile(targetN, `${x},${y - 1}`);
		}
		if(y < height - 1){
			let targetS = document.querySelectorAll(`[data-tile="${x},${y + 1}"]`)[0];
			clickTile(targetS, `${x},${y + 1}`);
		}

		if(x > 0 && y > 0){
			let targetNW = document.querySelectorAll(`[data-tile="${x - 1},${y - 1}"`)[0];
			clickTile(targetNW, `${x - 1},${y - 1}`);
		}
		if(x < width - 1 && y < height - 1){
			let targetSE = document.querySelectorAll(`[data-tile="${x + 1},${y + 1}"`)[0];
			clickTile(targetSE, `${x + 1},${y + 1}`);
		}

		if(y > 0 && x < width - 1){
			let targetNE = document.querySelectorAll(`[data-tile="${x + 1},${y - 1}"]`)[0];
			clickTile(targetNE, `${x + 1},${y - 1}`);
		}
		if(x > 0 && y < height - 1){
			let targetSW = document.querySelectorAll(`[data-tile="${x - 1},${y + 1}"`)[0];
			clickTile(targetSW, `${x - 1},${y + 1}`);
		}
	}, 10);
}
const endGame = (tile) => {
	endscreen.innerHTML = "К сожалению, вы взорвались... Попробуйте снова!";
	endscreen.classList.add('show');
	gameOver = true;
	tiles.forEach(tile => {
		let cord = tile.getAttribute('data-tile');
		if(hasBomb(cord)){
			tile.classList.remove('flaggedTile');
			tile.classList.add('checkedTile', 'bomb');
		}
	});
};
const checkVictory = () => {
	let win = true;
	tiles.forEach(tile => {
		let cord = tile.getAttribute('data-tile');
		if(!tile.classList.contains('checkedTile') && !hasBomb(cord)) win = false;
	});
	if(win){
		endscreen.innerHTML = "<span>Поздравляем! Вы победили!</span>";
		endscreen.classList.add('show');
		gameOver = true;
	}
};
getField();
restartBtn.addEventListener('click', function(e) {
	e.preventDefault();
	clear();
});
boardWidth.addEventListener('change', function(e) {
	width = this.value;
	params({"Ширина": width});
	document.querySelector('.boardWidth').innerText = "Ширина: " + width;
	tileSize = 25;
	clear();
});
boardHeight.addEventListener('change', function(e) {
	height = this.value;
	params({"Высота": height});
	document.querySelector('.boardHeight').innerText = "Высота: " + height;
	clear();
});
difficultyBtns.forEach(btn => {
	btn.addEventListener('click', function() {
		bombFrequency = this.value;
		clear();
	});
});