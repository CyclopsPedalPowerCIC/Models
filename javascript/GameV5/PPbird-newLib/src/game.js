/*
 * author:yu_dong_han ## hotmail.com
 * date:2014-2-12
 * 
 * */
 //to do list
 //cycle powered starting: above a certain level for 2 seconds
 //br chart by the side
 // 
var W = window.screen.width;
var H = window.screen.height;
var WIDTH = 500;//总宽
var HEIGHT = 600;//总高
// if (W / H >= 5 / 6) {
// 	HEIGHT = H;
// 	WIDTH = 5 / 6 * H;
// }
// else {
// 	WIDTH = W;
// 	HEIGHT = 6 / 5 * W;
// }
var GROUNDHEIGHT = 100;//地面高度
var SKYHEIGHT = HEIGHT - GROUNDHEIGHT;//天空部分高度

var PILEWIDTH = 40;//管子宽度
var PILEGAP = WIDTH - PILEWIDTH - 150;//两个管子之间的距离

var PILESPEED = 50; //added by woody to slow down piles to bird ratio...
var SPEEDFACTOR = 0.1; //speeds/slows everything up

var BIRDLEFT = 100;//初始鸟距离左侧
var BIRDINTSPEED = 0*1;
var BIRDDOWNRATE = 0.4;

var GROUNDSPEED = 2;//地面速度
/*---------------------------*/
var PILES = [];

var initialGap=300;
var PILEPAIRGAP = initialGap;//上下管子之间的距离
var MINPILESHOW = 10;//管子漏出高度
/*---------------------------*/

var Stopanimate = false;//是否停止动画
var Begin = false;//是否开始
var Die = false;//是否死
var Score = 0;//分数
var HiScore = Score;
var Pileindex = 0;//记录管子出现个数
var assets = {};
var renderer = new PIXI.WebGLRenderer(WIDTH, HEIGHT);
document.body.appendChild(renderer.view);

var stage = new PIXI.Container();


stage.interactive = true;
stage.buttonMode = true;
stage.on('mousedown', gameBegin);
stage.on('tap', gameBegin);
PIXI.loader.add('texture.json').load(onAssetsLoaded);
function onAssetsLoaded () {
	assets.bg = PIXI.Sprite.fromImage("bg.png");
	assets.bg.position.x = 0;
	assets.bg.position.y = 0;
	assets.pileGroup = new PIXI.Container();
	var fg_texture = PIXI.Texture.fromImage("run_bg.png");
	assets.fg = new PIXI.extras.TilingSprite(fg_texture, WIDTH, GROUNDHEIGHT);
	assets.fg.position.x = 0;
	assets.fg.position.y = SKYHEIGHT;

	var bird_texture_array = [
		PIXI.Texture.fromImage("bike.png"),
		PIXI.Texture.fromImage("bird2.png")
	]
	assets.bird = new PIXI.extras.MovieClip(bird_texture_array);
	assets.bird.animationSpeed = 0.1;
	assets.bird.play();
	assets.bird.anchor.x = 0.5;
	assets.bird.anchor.y = 0.5;
	assets.bird.width  = 60;
	assets.bird.height = 48;
	assets.bird.speedY = BIRDINTSPEED;
	assets.bird.rate = BIRDDOWNRATE;
	assets.bird.position.x = BIRDLEFT;
	assets.bird.position.y = 200;
	assets.score = new PIXI.Text(String(Score), {fill:'white'});
	assets.score.position.x = 250;
	assets.score.position.y = 20;

	assets.hand = new PIXI.Sprite.fromImage("hand.png");
	assets.hand.width = 60;
	assets.hand.height = 70;
	assets.hand.position.x = 75;
	assets.hand.position.y = 240;
	assets.hand.visible = true;

	assets.dialog = setDialog();
	for (key in assets) {
		stage.addChild(assets[key]);
	}
	askClicker();
	animate();
}



function gameBegin() {
	if(!Begin){
		setTimeout(function(){
		Begin = true;
		PILEPAIRGAP = initialGap;  //reset the pair gap
		assets.hand.visible = false;
		assets.score.text = '0';
		addNewPile();/*---加第一个管子-->*/
		assets.bird.speedY = BIRDINTSPEED;
		},10);
		
	}
	
}

function askClicker(){  //didn't work well in animate loop, so put here instead.
	
	
	opener.controlInputs.request();
	console.log(opener.controlInputs.html[opener.controlInputs.counter]);
	if (opener.controlInputs.html[opener.controlInputs.counter]=="Yes"){
	if (Die==true){reStart(); /*opener.controlInputs.html[opener.controlInputs.counter]="No";*/} 
	else {gameBegin();}
	}
	setTimeout(function(){askClicker();},300);
}

function animate() {
	
	if(Stopanimate){
		return;
	}
	
	requestAnimationFrame(animate);
	
	assets.fg.tilePosition.x -= GROUNDSPEED;
	var bird = assets.bird;
	
	
	
	if(Begin){
		
			opener.bikeInputs.request();
			var accel1=(opener.bikeInputs.data(2));
			var accel2=(opener.bikeInputs.data(4));
			
			//var accel=Math.max(accel1,accel2);
			var accel=(accel1-accel2);
			
			console.log(accel);
			bird.position.y -= bird.speedY;
			//bird.position.y = accel;
			//bird.speedY -= bird.rate;
			//bird.speedY += ((accel-15)/20)*SPEEDFACTOR;
			bird.speedY += ((accel-0)/20)*SPEEDFACTOR;
			
			if(bird.speedY > -3){
				if(bird.rotation < -Math.PI/8){
					bird.rotation = -Math.PI/8
					
					
				}
				else{
					bird.rotation -= Math.PI/180;
					
					
				}
				
			}
			else{
				if(bird.rotation > Math.PI/2){
					bird.rotation = Math.PI/2
					
				}
				else{
					bird.rotation += Math.PI/120;
				}
			
				
			}
			if (!Die){bird.rotation = -bird.speedY/PILESPEED;}//replaces rotation code above to make bike turn "correctly"
			
	}
	//else if(opener.getData(opener.namesens[2])>15){  //failed attempt a cycle base start...
	//	gameBegin(); 
	//	opener.nextData();
	//		}
		
	if(Die){
		bird.position.y += 10;
		bird.rotation += Math.PI/4;
		if(bird.rotation > Math.PI/2 && bird.position.y > SKYHEIGHT - bird.height/2){
			showDialog()
			Stopanimate = true;
		}
	}
	else{
	   if((bird.position.y + bird.height/2) > SKYHEIGHT){
	   		//hit();
			bird.position.y= SKYHEIGHT-bird.height/2;
			bird.speedY=0;
	   }
	   
	   if((bird.position.y) < 0){
	   		hit();
	   }
	   
	   for (var i = 0; i < PILES.length; i++){	
			PILES[i].pile.position.x -= PILESPEED*SPEEDFACTOR;
			PILES[i].pile2.position.x -= PILESPEED*SPEEDFACTOR;
			
			if(i == PILES.length - 1 && PILES[i].pile.position.x <= PILEGAP){
				addNewPile()
			}
			
			if(PILES[i].pile.position.x == BIRDLEFT){
				pass()
			}
			
			if(PILES[i].pile.position.x + PILEWIDTH/2 >=BIRDLEFT - bird.width/2 && PILES[i].pile.position.x - PILEWIDTH/2 <=BIRDLEFT + bird.width/2){
				if((bird.position.y-bird.height/2) < PILES[i].upper || (bird.position.y + bird.height/4) > PILES[i].lower){
					hit()
				}
				else if( (bird.position.y + bird.height/2) > PILES[i].lower){
					bird.position.y =PILES[i].lower-bird.height/2;
					bird.speedY=0;
					}
			}
		}
	}
    renderer.render(stage);
}

function setDialog() {
	var dialogScore = new PIXI.Text(String(Score));
	dialogScore.position.x = -25;
	dialogScore.position.y = -70;
	
	var dialogHiScore = new PIXI.Text(HiScore);
	dialogHiScore.position.x=-25;
	dialogHiScore.position.y=-30;
	
	var restartBtn = new PIXI.Sprite.fromImage("again2.png");
	restartBtn.position.x = -50;
	restartBtn.position.y= 35;
	restartBtn.width = 99;
	restartBtn.height = 28;
	restartBtn.interactive = true;
	restartBtn.buttonMode = true;
	restartBtn.on('click', reStart);
	restartBtn.on('tap', reStart);
	var dialog = new PIXI.Sprite.fromImage("popup.png")
	dialog.visible = false;
	dialog.width = 300;
	dialog.height = 200;
	dialog.anchor.x = 0.5;
	dialog.anchor.y = 0.5;
	dialog.position.x = WIDTH/2;
	dialog.position.y = HEIGHT/2;
		
	dialog.addChildAt(dialogScore, 0);
	dialog.addChildAt(dialogHiScore, 1);
	dialog.addChildAt(restartBtn, 2);
	return dialog;
}

function reStart() {
	Begin = false;
	Die = false;
	assets.hand.visible = true;
	Stopanimate = false;
	assets.bird.rotation = 0;
	assets.dialog.visible = false;
	Pileindex = 0;//记录管子出现个数
	Score = 0;//分数
	assets.pileGroup.children = []
	PILES = [];
	assets.bird.position.x = BIRDLEFT;
	assets.bird.position.y = 200;
	animate();
}

function hit(){
	Die = true
}

function pass(){
	Score ++;
	assets.score.text = Score;
}

function addNewPile(){
	var pile = new PIXI.Sprite.fromImage("pile.png");
	var pile2 = new PIXI.Sprite.fromImage("pile2.png");
	var pilepair = {};
	
	PILEPAIRGAP=Math.max(PILEPAIRGAP-15,180);
	
	PILEGAP=Math.max(PILEGAP-2,100);
	
	
	pile.width = pile2.width = PILEWIDTH;
	pile.height = pile2.height = 500;
	pile.anchor.x = pile2.anchor.x = 0.5;
	pile.anchor.y = pile2.anchor.y = 0.5;
	pile.rotation = Math.PI;
	
	/*------------取得管子的上下限---------------*/
	pile.position.max = SKYHEIGHT - MINPILESHOW - PILEPAIRGAP - pile.height/2;
	pile.position.min = -(pile.height/2 -MINPILESHOW);
	
	pile.position.y = Math.floor(Math.random()*(pile.position.max-pile.position.min+1)+pile.position.min)
	
	pile2.position.y = pile.height + pile.position.y + PILEPAIRGAP;
	/*---------------------------*/	
	pile.position.x = pile2.position.x = 600;
	
	pilepair.upper = pile.position.y + pile.height/2;
	pilepair.lower = pilepair.upper + PILEPAIRGAP;
	pilepair.pile = pile;
	pilepair.pile2 = pile2;
	
	assets.pileGroup.addChild(pile);
	assets.pileGroup.addChild(pile2);
	/*---------------------------*/
	Pileindex++;
	if(Pileindex > 3){
		PILES.shift();
	}
	
	PILES.push(pilepair);
	/*---------------------------*/
}
function showDialog(){
	var storeHi = localStorage.getItem('ppbird_hiscore');
	
	if(storeHi > HiScore){
		HiScore = storeHi;
	}
	
	if(Score > HiScore){
		HiScore = Score;
		localStorage.setItem('ppbird_hiscore', HiScore);
	}
	
	assets.dialog.getChildAt(0).text = String(Score);
	assets.dialog.getChildAt(1).text = HiScore;
	assets.dialog.visible = true;
}