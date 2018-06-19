document.write('<script type="text/javascript" src="'+ "bars.js"+ '"></script>'); //includes the barchart code...


var W = window.screen.width;
var H = window.screen.height;

		
var renderer = PIXI.autoDetectRenderer(W/2,H,{
	transparent: true,
	resolution: 1
});

document.getElementById("display").appendChild(renderer.view);

var stage = new PIXI.Container();

PIXI.loader
	//.add("logo","images/profile picture.jpg")P1030257.JPG
	.add("logo","images/profile picture.jpg")
	.add("apple","images/apple.jpg")
	.load(setup);
	

var logo;
var food=["",""]; //array of food items

function setup() {
	logo = new PIXI.Sprite(
		PIXI.loader.resources["logo"].texture
	);
	apple = new PIXI.Sprite(
		PIXI.loader.resources["apple"].texture
	);
	
	
	
}



function animationLoop() {
	//console.log(bike3.total);
	requestAnimationFrame(animationLoop);
	
	
	renderer.render(stage);
}