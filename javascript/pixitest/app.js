// all taken from:
// https://www.youtube.com/watch?v=zhybw6rE_QU

PIXI.utils.sayHello();

var renderer = PIXI.autoDetectRenderer(512,512,{
	transparent: true,
	resolution: 1
});

document.getElementById("display").appendChild(renderer.view);

var stage = new PIXI.Container();

PIXI.loader
	.add("logo","images/profile picture.jpg")
	.load(setup);
	
var logo;
var testtext = new PIXI.Text('Basic text in pixi');
var counter=0;
var html
var xmlhttp;
var temp1=7;
loadData("http://192.168.0.62/RawDataOnly");
	
	
function setup() {
	logo = new PIXI.Sprite(
		PIXI.loader.resources["logo"].texture
	);
	
	stage.addChild(logo);
	stage.addChild(testtext);
	
	animationLoop();
	
	
}	

function animationLoop() {
	
	requestAnimationFrame(animationLoop);
	
	logo.scale.set(0.5,0.5);
	logo.x=renderer.width/2;
	logo.y=renderer.height/2;
	logo.anchor.set(0.5,0.5);
	
	logo.rotation += 0.01;
	logo.pivot.set(200,0);
	counter++;
	if (xmlhttp==undefined){xmlhttp="Loading..."}
	testtext.setText(xmlhttp+" Hello? " +String(temp1));
	
	renderer.render(stage);
	
}


function loadData(theURL)
{
	
	$.get(theURL, function(response){
	//alert("Data: " + html);
	xmlhttp=response;
});
}
