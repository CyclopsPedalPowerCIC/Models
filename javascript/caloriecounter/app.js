//
//Coded by Woody from Cyclops Pedal Power CIC 
//Dec 2017
//
//
//objects to build:
//bar chart DONE!
//"volume" bar for bike?
//data stream object (allows for multiple sources) DONE!
//data collection object write to file?
//
		
		//a.document.write("<div id='mydiv'>test</div>");  //this overwrite the file source
		//a.document.getElementById("mydiv");

document.write('<script type="text/javascript" src="'+ "ESPdata.js"+ '"></script>'); //includes the getdata code
document.write('<script type="text/javascript" src="'+ "bars.js"+ '"></script>'); //includes the barchart code...
document.write('<script type="text/javascript" src="'+ "level.js"+ '"></script>'); //includes the barchart code...
		
		
	//var chartpos=[0,0,512,512];
var chartpos=[10,10,320,320];	
		
var renderer = PIXI.autoDetectRenderer(512,512,{
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
var apple;
var testtext = new PIXI.Text('Basic text in pixi');
	
	var thing = new PIXI.Graphics();

function setup() {
	logo = new PIXI.Sprite(
		PIXI.loader.resources["logo"].texture
	);
	apple = new PIXI.Sprite(
		PIXI.loader.resources["apple"].texture
	);

	stage.addChild(logo);
	stage.addChild(apple);
	stage.addChild(testtext);
	apple.scale.set(0.15,0.15);
	apple.x=renderer.width/2-apple.width;
	apple.y=renderer.height/2-apple.height;
	console.log("testing");
	
	//testing mask code


stage.addChild(thing);
thing.position.x = renderer.width / 3;
thing.position.y = renderer.height/3;
thing.lineStyle(0);
apple.mask = thing;

	thing.beginFill(RGB2HTML(0,255,2));
	thing.moveTo(18,25);
	thing.arc(18,25,60,0,3*Math.PI/2,false);
	thing.moveTo(18,25);
	thing.endFill();

	
	
		
	bikeInputs=new ESPdata("http://192.168.0.62/Data");
	bike3=new recordData(bikeInputs,2,8);
	loadingLoop();
}	

level=0;



//var bike3;

function loadingLoop() {
	
	
	
	testtext.setText("Loading... "+ String((new Date())-bikeInputs.timer));
	//console.log(bikeInputs.initialised());
	if (!bikeInputs.initialised()){
		
		requestAnimationFrame(loadingLoop); //restart this loop 
		//do nothing while it loads the first datapoints
		//testtext.setText("Loading...");
		bikeInputs.request();
		
	}
	else {
		bikeInputs.detect(); //gets a list of sensors from initial data
		Chart1=new barGraph(bikeInputs.numsens,chartpos);
		//setupMeter([10,10,50,150]);
		Chart1.update([0,1,2,3,4,5,6,7,8,9,10,11],10)
		requestAnimationFrame(animationLoop); //start the main animation loop
		counter=1;
		a=window.open("./calorie.html");
		bike3.next();
		
	}
	
	renderer.render(stage);
	
	
}



function animationLoop() {
	//console.log(bike3.total);
	requestAnimationFrame(animationLoop);
	bikeInputs.request();
	logo.scale.set(0.5,0.5);
	logo.x=renderer.width/2;
	logo.y=renderer.height/2;
	logo.anchor.set(0.5,0.5);
	
	logo.rotation +=(bikeInputs.data(2)-bikeInputs.data(3))/10000.0;
	logo.pivot.set(200,0);
	
	level+=0.01;
	
	thing.clear();
	thing.beginFill(RGB2HTML(0,255,2));
	thing.moveTo(18,25);
	thing.arc(18,25,60,0,level,false);
	thing.moveTo(18,25);
	thing.endFill();
	
	//values=bikeInputs.dataArray();
	values=bike3.dataArray[0];	
	
	Chart1.update(values,30);
	
	//Chart1.changeBars(bikeInputs.numsens,chartpos,values,30);
	//Chart1.detailBars(bikeInputs.numsens,chartpos,values,bikeInputs.namesens);
	
	testtext.setText("ping: "+ String(bikeInputs.lasttimer)+"\n"+
	String((new Date())-bikeInputs.timer+bikeInputs.timer2)+
	"\ncounter: "+ String(bike3.currentPoint)+
	"\ntotalE: "+ String(bike3.totalE)
	
	
	);
	
	
	
	
	
	renderer.render(stage);
	
}






