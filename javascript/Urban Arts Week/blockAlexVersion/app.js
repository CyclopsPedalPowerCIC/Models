//
//Coded by Woody from Cyclops Pedal Power CIC 
//Dec 2017
//
//
//
//
//

		
		//a.document.write("<div id='mydiv'>test</div>");  //this overwrite the file source
		//a.document.getElementById("mydiv");

document.write('<script type="text/javascript" src="'+ "ESPdata.js"+ '"></script>'); //includes the getdata code

		
var renderer = PIXI.autoDetectRenderer(window.innerWidth,window.innerHeight,{
	transparent: true,
	resolution: 1
});
//could use window.innerHeight and window.innerWidth

//PIXI.loader.load(setup);




document.getElementById("display").appendChild(renderer.view);





var stage = new PIXI.Container();

var testtext = new PIXI.Text('Basic text in pixi');

//var espurl = "http://192.168.0.62/Data";
var espurl = "http://192.168.0.140";


var position=[0,0,0,0];
var bikesV=[0,0];


setup();
	
function setup() {
	
	stage.addChild(testtext);
	bikeInputs=new ESPdata(espurl+"/Data");
	bike3=new recordData(bikeInputs,2,8);
	bike4=new recordData(bikeInputs,3,8);
	console.log("setup");
	
	var texture = new PIXI.RenderTexture(renderer, 100, 100);
	var graphics = new PIXI.Graphics();
	graphics.beginFill(0xFF3000);
	graphics.drawRect(0, 0, 100, 100);
	graphics.endFill();
	texture.render(graphics);
	block=new PIXI.Sprite(texture);
	stage.addChild(block);
	
	var texture2 = new PIXI.RenderTexture(renderer, 100,window.innerHeight );
	var graphics2 = new PIXI.Graphics();
	graphics2.beginFill(0x000000);
	graphics2.drawRect(0, 0, 20, window.innerHeight);
	graphics2.endFill();
	texture2.render(graphics2);
	block2=new PIXI.Sprite(texture2);
	stage.addChild(block2);
	
	loadingLoop();
}	


function loadingLoop() {
	 position[0]=0;
	 position[1]=250;
	block.position.set(position[0],position[1]);
	block2.position.set(745,0)
	
	console.log("loading");
	testtext.setText("Loading... "+ String((new Date())-bikeInputs.timer));
	if (!bikeInputs.initialised()){
		
		requestAnimationFrame(loadingLoop); //restart this loop 
		bikeInputs.request();
		
	}
	else {
		bikeInputs.detect(); //gets a list of sensors from initial data
		requestAnimationFrame(animationLoop); //start the main animation loop
		testtext.setText("");
		
		bike3.next();	
	}
	
	renderer.render(stage);
	
}
function animationLoop() {
	
	bikesV[0]=parseInt(bikeInputs.data(2)[0]);
	bikesV[1]=parseInt(bikeInputs.data(3)[0]); //get the inputs from the bikes
	
	//console.log(bikesV[0]);
	//console.log(bikesV[1]);
	
	//position[1]=position[1]+bikesV[0]/10-1;
	position[0]=position[0]+bikesV[1]/10-1.5;

	if(position[0]>800){testtext.setText(
	"well done you win!!");
	testtext.width=600;
	testtext.height=300}
	
	if (position[0]<0){position[0]=0;}
	if (position[0]>window.innerWidth){position[0]=0;}
	if (position[1]>window.innerHeight){position[1]=0;}
	
	block.position.set(position[0],position[1],position[2],position[3]);
	
	//console.log("go!");
	
	requestAnimationFrame(animationLoop);
	
	bikeInputs.request();
	
	renderer.render(stage);
	
}