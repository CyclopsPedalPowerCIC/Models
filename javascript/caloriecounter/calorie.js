
//
//actual calories burned vs measured: http://mccraw.co.uk/powertap-meter-convert-watts-calories-burned/
//


document.write('<script type="text/javascript" src="'+ "bars.js"+ '"></script>'); //includes the barchart code...

//document.write('window.onresize = function (event){    	console.log("resized)}');
var W = window.innerWidth;
var H = window.innerHeight;


		
var renderer = PIXI.autoDetectRenderer(W/2,H,{
	transparent: true,
	resolution: 1
});

var addEvent = function(object, type, callback) {
    if (object == null || typeof(object) == 'undefined') return;
    if (object.addEventListener) {
        object.addEventListener(type, callback, false);
    } else if (object.attachEvent) {
        object.attachEvent("on" + type, callback);
    } else {
        object["on"+type] = callback;
    }
};

addEvent(window, "resize", function(event) {
  console.log('resized');
   W = window.innerWidth;
   H = window.innerHeight;
});

document.getElementById("display").appendChild(renderer.view);

var stage = new PIXI.Container();

PIXI.loader
	//.add("apple","images/P1030257.JPG")
	.add("logo","images/profile picture.jpg")
	.add("apple","images/apple.jpg")
	.load(setup);
	

var logo;
var food=["",""]; //array of food items
var pie = new PIXI.Graphics();
var level=3*Math.PI/2;

function setup() {
	logo = new PIXI.Sprite(
		PIXI.loader.resources["logo"].texture
	);
	food[0] = new PIXI.Sprite(
		PIXI.loader.resources["apple"].texture
	);
	
	stage.addChild(food[0]);
	food[0].scale.set(W/food[0].width/6);
	animationLoop();
	
	
	stage.addChild(pie);
	pie.position.x = 0;
	pie.position.y = 0;
	pie.lineStyle(0);
	food[0].mask = pie;
	pie.clear();
	pie.beginFill("0xffff00");
	pie.moveTo(food[0].x-W/2,food[0].y-H/2);
	pie.arc(food[0].x-W/2,food[0].y-H/2,food[0].width/2,0,level,false);
	pie.moveTo(food[0].x-W/2,food[0].y-H/2);
	pie.endFill();
	
}



function animationLoop() {
	//console.log(bike3.total);
	requestAnimationFrame(animationLoop);
	
	
	food[0].x=W*2/8;
	food[0].y=H*1/4
	level=(level+0.05)%(2*Math.PI);
	pie.clear();
	pie.beginFill("0xffff00");
	pie.moveTo(food[0].width/2+food[0].x,food[0].width/2+food[0].y);
	pie.arc(food[0].width/2+food[0].x,food[0].width/2+food[0].y,food[0].width/2,0,level,false);
	pie.moveTo(food[0].width/2+food[0].x,food[0].width/2+food[0].y);
	pie.endFill();
	
	renderer.render(stage);
}