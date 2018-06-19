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



var stage = new PIXI.Container();

var testtext = new PIXI.Text('Basic text in pixi');

//var espurl = "http://192.168.0.62/Data";
var espurl = "http://192.168.0.140";


var renderer = PIXI.autoDetectRenderer(1324,812,{
	transparent: true,
	resolution: 1
});

document.getElementById("display").appendChild(renderer.view);


//could use window.innerHeight and window.innerWidth

//PIXI.loader.load(setup);






var position=[0,0,0,0];

var bikesV=[5,10];


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
	
	
	var texture2 = new PIXI.RenderTexture(renderer, 100, 500);
	var graphics2 = new PIXI.Graphics();
	graphics2.beginFill(0x000000);
	graphics2.drawRect(0, 0, 20, 900);
	graphics2.endFill();
	texture2.render(graphics2);
	block2=new PIXI.Sprite(texture2);
	stage.addChild(block2);
	
    var texture3 = new PIXI.RenderTexture(renderer, 100, 500);
	var graphics3 = new PIXI.Graphics();
	graphics3.beginFill(0x000000);
	graphics3.drawRect(0, 0, 20, 500);
	graphics3.endFill();
	texture3.render(graphics3);
	block3=new PIXI.Sprite(texture3);
	stage.addChild(block3);
		
	
	loadingLoop();
}	


function loadingLoop() {
	
	
		

	
    position[0]=700;
    position[1]=150;
	
	block.position.set(position[0],position[1],200,0);
	
	block2.position.set(900,0000,200,0);
	
	block3.position.set(600,0000,200,0);
	
	
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
		//a=window.open("./PPbird-newLib/src/index.html");
		bike3.next();	
	}
	
	renderer.render(stage);
	
}
function animationLoop() {
	
	bikesV[0]=parseInt(bikeInputs.data(2)[0]);
	bikesV[1]=parseInt(bikeInputs.data(3)[0]); //get the inputs from the bikes
	
	//console.log(bikesV[0]);
	//console.log(bikesV[1]);
	
	position[0]=position[0]+bikesV[0]/5;
	position[0]=position[0]-bikesV[1]/5;

	if(position[0]<500){testtext.setText(
	"Player one wins!!");
	testtext.x=650;
	testtext.y=400;
	}
	
	if(position[0]>900){testtext.setText(
	"Player two wins!!");
	testtext.x=650;
	testtext.y=200;
	}
	if(position[0]<500){testtext.setText(
	"Player one wins!!");
	testtext.width=400;
	testtext.height=400
	}
	
	if(position[0]>900){testtext.setText(
	"Player two wins!!");
	testtext.width=400;
	testtext.height=400;
	}
	if(position[0]>900){testtext.setText("Player two wins!!");}
//	if (position[0]>1000){position[0]=0;}
//	if (position[1]>500){position[1]=0;}
	
	
	
	block.position.set(position[0],position[1]);
	
	//console.log("go!");
	
	requestAnimationFrame(animationLoop);
	
	bikeInputs.request();
	
	renderer.render(stage);
	
}