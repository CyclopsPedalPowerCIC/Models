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

		
var renderer = PIXI.autoDetectRenderer(512,512,{
	transparent: true,
	resolution: 1
});


PIXI.loader
	//.add("logo","images/profile picture.jpg")P1030257.JPG
	//.add("logo","images/profile picture.jpg")
	//.add("apple","images/apple.jpg")
	.load(setup);




document.getElementById("display").appendChild(renderer.view);




var stage = new PIXI.Container();

var testtext = new PIXI.Text('Basic text in pixi');

//var espurl = "http://192.168.0.62/Data";
var espurl = "http://192.168.0.141";
setup();
	
function setup() {
	
	stage.addChild(testtext);
	bikeInputs=new ESPdata(espurl+"/Data");
	bike3=new recordData(bikeInputs,2,8);
	console.log("setup");
	loadingLoop();
}	


function loadingLoop() {
	console.log("loading");
	testtext.setText("Loading... "+ String((new Date())-bikeInputs.timer));
	if (!bikeInputs.initialised()){
		
		requestAnimationFrame(loadingLoop); //restart this loop 
		bikeInputs.request();
		
	}
	else {
		bikeInputs.detect(); //gets a list of sensors from initial data
		requestAnimationFrame(animationLoop); //start the main animation loop
	
		a=window.open("./PPbird-newLib/src/index.html");
		bike3.next();	
	}
	
	renderer.render(stage);
	
}

function animationLoop() {
	requestAnimationFrame(animationLoop);
	bikeInputs.request();
	
	
	//values=bikeInputs.dataArray();
	values=bike3.dataArray[0];	
	
	testtext.setText("ping: "+ String(bikeInputs.lasttimer)+"\n"+
	String((new Date())-bikeInputs.timer+bikeInputs.timer2)+
	"\ncounter: "+ String(bike3.currentPoint)+
	"\ntotalE: "+ String(bike3.totalE)	
	);
	renderer.render(stage);
	
}