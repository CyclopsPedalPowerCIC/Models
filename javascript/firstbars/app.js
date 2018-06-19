//
//Coded by Woody from Cyclops Pedal Power CIC 
//Dec 2017
//
//
//
//
//


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
var counter=0; //when counter = 0 html[0] most recently updated data 
var html = ["",""];
var espurl = "http://192.168.0.62/Data";
var timer;
var timelimit = 3000; //time after which to give up on an esp reponse and try again
var lasttimer=0;

	
var numsens=2;
var namesens=["",""];//array to store names of each sensor
	
function setup() {
	logo = new PIXI.Sprite(
		PIXI.loader.resources["logo"].texture
	);
	
	stage.addChild(logo);
	stage.addChild(testtext);
	
	console.log("testing");
	
	html[0]=undefined;
	loadData(espurl,0);
	loadingLoop();
}	


function loadingLoop() {
	
	
	
	testtext.setText("Loading... "+ String((new Date())-timer));
	
	if (html[0]==undefined || html[0]==" "){
		requestAnimationFrame(loadingLoop); //restart this loop 
		//do nothing while it loads the first datapoints
		//testtext.setText("Loading...");
		if ((new Date())-timer>timelimit){loadData(espurl,0);}
		
	}
	else {
		detectSensors(); //gets a list of sensors from initial data
		setupBars(numsens,chartpos);
		changeBars(numsens,chartpos,[0,1,2,3,4,5,6,7,8,9,10,11],10)
		requestAnimationFrame(animationLoop); //start the main animation loop
		counter=1;
	}
	
	renderer.render(stage);
	
	
}



function animationLoop() {
	
	requestAnimationFrame(animationLoop);
	nextData();
	logo.scale.set(0.5,0.5);
	logo.x=renderer.width/2;
	logo.y=renderer.height/2;
	logo.anchor.set(0.5,0.5);
	
	logo.rotation +=(getData(namesens[2])-getData(namesens[3]))/10000.0;
	logo.pivot.set(200,0);
	
	var values=["",""];
	for (i=0;i<numsens;i++){
		values[i]=getData(namesens[i]);
	}
	changeBars(numsens,chartpos,values,40);
	detailBars(numsens,chartpos,values,namesens);
	testtext.setText("ping: "+ String(lasttimer)+"\n"+
	String((new Date())-timer)+"\n"+getData("Sensor3 = ")+"\n"+
	String(numsens)+namesens[numsens-1]);
	//namesens[numsens-1]);
	
	
	renderer.render(stage);
	
}

var bars=["",""];
var bardet=["",""];
//var chartpos=[0,0,512,512];
var chartpos=[10,10,320,320];

function setupBars(number,chartDims){
	var i;
	var padding=0.1; //percentage of white space around bars
	
	var texture = new PIXI.RenderTexture(renderer, 10, 10);
	var graphics = new PIXI.Graphics();
	graphics.beginFill(0xFF3000);
	graphics.drawRect(0, 0, 10, 10);
	graphics.endFill();
	texture.render(graphics);
	
	for (i=0;i<number;i++){
		bars[i]= new PIXI.Sprite(texture); 
		bardet[i]=new PIXI.Text(' ');
		stage.addChild(bars[i]);
		stage.addChild(bardet[i]);
		//console.log(i);	
		bars[i].position.set(chartDims[0]+chartDims[2]*(i/number+1/number*padding),(chartDims[3]*0.9+chartDims[1]))
		bars[i].width=(chartDims[2]/number*(1.0-2.0*padding))
		bars[i].height=(chartDims[3]*0.1);
	}

	
}

function changeBars(number,chartDims, heights, max){
	var padding=0.1;
	for (i=0;i<number;i++){
		heights[i]=Math.min(heights[i], max);	
		bars[i].position.set(chartDims[0]+chartDims[2]*(i/number+1/number*padding),(chartDims[3]*(1-heights[i]/max-0.01)+chartDims[1]))
		bars[i].width=(chartDims[2]/number*(1.0-2.0*padding))
		bars[i].height=(chartDims[3]*(heights[i]/max+0.01));
	}	
}



function detailBars(number,chartDims, heights, names){
	var padding=0.1;
	var tempstr;
	for (i=0;i<number;i++){
		//bardet[i].setText(String(chartDims[2]/number*(1)));
		if (heights[i]<10) {
		tempstr=heights[i].toFixed(2);
		}
		else if (heights[i]<100) {
		tempstr=heights[i].toFixed(1);
		} //if it's over 100 will not be evenly spaced
		else {
		tempstr=heights[i].toFixed(0);
		}
		bardet[i].setText(names[i]+tempstr);
		
		bardet[i].rotation=3.14*3/2;
		bardet[i].position.set(chartDims[0]+chartDims[2]*(i/number+0/number*padding),(chartDims[3]*(1.0)+chartDims[1]))
		bardet[i].height=(chartDims[2]/number*(1.0-0*padding))
		bardet[i].width=(chartDims[3]*(0.8));
	}	
}




function detectSensors(){
	var tempc;
	var currentpos=0;
	var endpos=0;
	var senscount=0; 
	//automatically run through the html string and extract all sensors given
	//and their names, names are stored to namesens array
	
	if (html[counter]!=undefined){
		tempc=counter;
	}
	else if (html[(counter+1)%2]!=undefined){
		tempc=((counter+1)%2);
	}
	
	while ((currentpos=html[tempc].substring(endpos).search(/[\d\.]{1,}\n/))>1){
	currentpos+=endpos;
	namesens[senscount]=html[tempc].substring(endpos,currentpos);
	senscount++;
	endpos=currentpos+1+html[tempc].substring(currentpos).search(/\n/);
	}
	numsens=senscount;
	return senscount;
}

function getData(name){ //gets data alroady downloaded data string
	var tempc;
	var rString;
	var loc;
	//find the most recent data for number
	if (html[counter]!=undefined){
		tempc=counter;
	}
	else if (html[(counter+1)%2]!=undefined){
		tempc=((counter+1)%2);
	}
	
	loc=(html[tempc]).indexOf(name)+name.length;
	rString = (html[tempc]).substr(loc,5).match(/[\d\.]{1,}/); //removes non numeric elements
	
	return rString;
}

function nextData(){
	if (html[(counter+1)%2]!=undefined){
		//checks that the other html has loaded so that a valid html still exists
		
		loadData(espurl,counter);
		counter=(counter+1)%2; //increment counter
	}
	else if ((new Date())-timer>timelimit){
		counter=(counter+1)%2; //it failed last time so reset counter and try again
		loadData(espurl,counter);
		counter=(counter+1)%2; //increment counter
	}
}

function loadData(theURL,i)
{
	html[i]=undefined;
	$.get(theURL, function(response){
	html[i]=response;
});
	lasttimer=(new Date())-timer;
	timer=new Date();
}
