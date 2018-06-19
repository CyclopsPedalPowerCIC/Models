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
	.add("logo","images/P1030257.JPG")
	.load(setup);
	
var logo;
var testtext = new PIXI.Text('Basic text in pixi');
	
	var thing = new PIXI.Graphics();

function setup() {
	logo = new PIXI.Sprite(
		PIXI.loader.resources["logo"].texture
	);
	
	stage.addChild(logo);
	stage.addChild(testtext);
	
	console.log("testing");
	
	//testing mask code


stage.addChild(thing);
thing.position.x = renderer.width / 3;
thing.position.y = renderer.height/3;
thing.lineStyle(0);
logo.mask = thing;
	thing.beginFill(RGB2HTML(0,255,2));
	//thing.arc(0, 0, 100, 0, Math.PI);
	//thing.arc(0, 0, 100, Math.PI, 3/2*Math.PI);
	//thing.moveTo(0,0);
	//thing.lineTo(50,0);
	//thing.lineTo(50,50);
	//thing.arcTo(50,0,50,50,50);
	//thing.lineTo(0,0);
	//thing.drawCircle(0,0,60);
	//drawPie(thing,0,0,60,0,level);
	thing.moveTo(0,0);
	thing.arc(0,0,60,0,3*Math.PI/2,false);
	thing.moveTo(0,0);
	//thing.drawCircle(50,50,60);
	//thing.moveTo(0, 0);
	//thing.lineTo(45, 0);
	//thing.arcTo(60, 0, 60, 15, 15);
	//thing.lineTo(60, 60);
	//thing.lineTo(0, 60);
	thing.endFill();
	//////////
	
	
		
	bikeInputs=new ESPdata("http://192.168.0.62/Data");
	bike3=new recordData(bikeInputs,2,8);
	loadingLoop();
}	

level=0;//Math.PI/2;



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
		//a=window.open("./PPbird-newLib/src/index.html");
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
	thing.moveTo(0,0);
	thing.arc(0,0,60,0,level,false);
	thing.moveTo(0,0);
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






