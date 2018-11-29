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
		

/*

things to add:

start/stop pause functions to keep track of the various timers and make sure they don't keep running, done in click function

 (and maybe also start/stop running functions?) to get the simulation ready and collect the results
 
 connect the button up appropriately (and also have clickable option for mouse onscreen?)
 
 order:
 
 loading until clicked
 running (plus optional pause)
 finished

*/

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

 var data = {
      name: "cliff",
      age: "34",
      name: "ted",
      age: "42",
      name: "bob",
      age: "12"
    }

var jsonData = JSON.stringify(data);

download(jsonData,'testtext.txt','JSON');

console.log("hello!");

document.write('<script type="text/javascript" src="'+ "ESPdata.js"+ '"></script>'); //includes the getdata code
document.write('<script type="text/javascript" src="'+ "bars.js"+ '"></script>'); //includes the barchart code...
document.write('<script type="text/javascript" src="'+ "level.js"+ '"></script>'); //includes the barchart code...	
document.write('<script type="text/javascript" src="'+ "lineplot2.js"+ '"></script>'); //includes the linechart code...		
document.write('<script type="text/javascript" src="'+ "csv.js"+ '"></script>'); //includes the csv parsing code...			
		

//////////////////setup data bits/////////



var _urlScenario=getParameter('Scenario','Scenario1.csv');
var _urlDump=getParameter('DumpIP','192.168.0.138');
var _urlBike=getParameter('BikeIP','192.168.0.139');
var _urlHouse=getParameter('HouseIP','192.168.0.140');

var scenarioTXT="hi";
$.get(window.location.href.split('index.html')[0]+"Scenarios/"+_urlScenario,{},function(response,stat){
	scenarioTXT=response;  //contains the text in the scenario file, for easy modification
},"text");

var devCategories=["lights","IT","kitchen","AV","security","other"];
var catPower=new Array(devCategories.length);

var deviceEnergy=new Array();
var gasNow;
var totalGas=0;
var appliances = new Array(1); //array to hold appliance data from the house	
var appliancesSC = new Array(1); //array to hold appliance data	from scenario file (name, id, power, socket,state)
//state= 0 off 1, on, 2, controlled
var lights = new Array(2);	
var lightsPower=[1,1,1,8,1,1,1,1,1,1];

var powerList=[[0],[0]];
var profiles=new Array();
profiles[0]=new Array(24);
var hoursPast=0;

var bikeList= [[0],[0]];
var bikeList2= [[0],[0]];

var DownloadedLines=0; //variable to store how many lines of data have been downloaded from the house
var scenString

var finishedText;


var powerText=new PIXI.Text('');   //displays the power while the simulation is running

var introText=new PIXI.Text('');   //displays the blurb at the beginning
var introText1=new PIXI.Text('');   //displays the blurb at the beginning
var introText2=new PIXI.Text('');   //displays the blurb at the beginning

var steps=0;
var Housetemperature=18;

var powerNow=1;
powerTimer=new Date();
totalE=0;
totalCatE=new Array(devCategories.length)
for (var i=0;i<devCategories.length;i++){totalCatE[i]=0;}

var timeRecur2=100;
var timeRecur=(new Date());


var sEnergy=new Array();
var fEnergy=new Array();


var powerUsed=new Array();
var powerMade=new Array();

var houseTimer=new Date().getTime();
var pausedTimer=new Date().getTime();
	//setup();	
	
var scRealT=0.1;
var scTime=24;


/////////////////////////////////////////		
		

PIXI.Sprite.prototype.bringToFront = function() {	if (this.parent) {		var parent = this.parent;		parent.removeChild(this);		parent.addChild(this);	}}
//http://www.html5gamedevs.com/topic/7507-how-to-move-the-sprite-to-the-top/
	
var WWidth=window.innerWidth-30;
var WHeight=window.innerHeight-30;
		
var renderer = PIXI.autoDetectRenderer(WWidth,WHeight,{
	transparent: true,
	resolution: 1
});

document.getElementById("display").appendChild(renderer.view);

var stage = new PIXI.Container();

PIXI.loader
	//.add("logo","images/profile picture.jpg")P1030257.JPG
	.add("logo","images/profile picture.png")
	.add("CO2","images/cloud.png")
	.add("sky","images/sky.png")
	.add("night","images/night sky.png")
	.add("moon","images/moon and stars.png")
	.add("hills","images/hills.png")
	.add("sun","images/sun.png")
	.add("thermInner","images/Thermometer1.png")
	.add("thermOuter","images/Thermometer2.png")
	.load(setup);
	
	var logo;
	
	
	//logo.position.set(WWidth-logo.width,0);

var CO2=new Array();
var CO2Mask=new Array();
var startT=new Date().getTime();
var pauseS=new Array(); //array to hold objects shown on the screen 
var loadingS=new Array();
var runningS=new Array();
var mode="Loading"


var finishedText=new PIXI.Text('');
var titleText=new PIXI.Text('Title');
var timeText=new PIXI.Text('Time');

var thermText=new PIXI.Text('20');
var runningCharts=new Array();
var barCharts=new Array();
var co2level=0;
var loadingText=new PIXI.Text('');
	
var tempData=[[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25],[200,210,200,180,210,310,600,800,850,820,900,880,850,840,860,950,1050,920,900,930,900,700,400,220]];
var bar1 =new Array(1);
var bar2 =new Array(1);


	var thermInner;
	var thermOuter;
	var thermMask;
	var logo;
	var sky;
	var hills;
	var sun;
	var moon;
	var night;
	var timeBackground;
	
 
var dayTime=0;
var sunmove=0;

	numberBars=24;
	numberCharts=6;

var barsData=new Array(); //an array of arrays of data, one for each bar chart

for (var i=0;i<numberCharts;i++){
	barsData[i]=new Array();
	for (var j=0;j<numberBars;j++){
	barsData[i][j]=0;
}
}

		
	
function click(){
	
	//console.log(pausedTimer);
	//console.log(houseTimer);
	
	if (mode=="Loading"){mode="Running"; houseTimer=new Date().getTime(); startRunning();}
	else if (mode=="Running"){mode="Paused"; pausedTimer=new Date().getTime();}
	else if (mode=="Paused"){mode="Running"; houseTimer+=new Date().getTime()-pausedTimer;}
	else if (mode=="Finished"){}
	
}	
	
function setDay(time){ //time is between 0 and 24
	
	var sunPos=((time-7)/24*2*Math.PI+Math.PI*2)%(Math.PI*2);  //0 sunPos=mid sunrise
	
	sun.position.set(WWidth-(WWidth/2-WWidth*Math.sin(sunPos-Math.PI/2)/2)-sun.width/2,WHeight/2-WHeight*Math.cos(sunPos-Math.PI/2)/2);
	moon.position.set(WWidth-(WWidth/2-WWidth*Math.sin(sunPos+Math.PI/2)/2)-sun.width/2,WHeight/2-WHeight*Math.cos(sunPos+Math.PI/2)/2);
		
	if (sunPos<Math.PI*0.1){night.alpha=1-(sunPos+0.1*Math.PI)/Math.PI*5;}
	else if (sunPos<Math.PI*0.9){night.alpha=0;}
	else if (sunPos<Math.PI*1.1){night.alpha=(sunPos-Math.PI*0.9)/Math.PI*5;}
	else if (sunPos<Math.PI*1.9) {night.alpha=1;}
	else {night.alpha=1-(sunPos-Math.PI*1.9)/Math.PI*5;}

}
	
function setup() {



	sky=new PIXI.Sprite(
		PIXI.loader.resources["sky"].texture
	);
	
	
	night=new PIXI.Sprite(
		PIXI.loader.resources["night"].texture
	);
	
	
	stage.addChild(sky);	
	sky.width=WWidth/1;
	sky.height=WHeight/1;
	sky.position.set(0,0);
	//sky.position.set(100,100);
	
	
	stage.addChild(night);	
	night.width=WWidth/1;
	night.height=WHeight/1;
	night.alpha=0.95;
	
		hills=new PIXI.Sprite(
		PIXI.loader.resources["hills"].texture
	);
	
	
	sun=new PIXI.Sprite(
		PIXI.loader.resources["sun"].texture
	);
		
		
	stage.addChild(sun);
	sun.width=WWidth/6;
	sun.height=WWidth/6;
	sun.position.set(WWidth-sun.width,0);	
	
	
	
	moon=new PIXI.Sprite(
		PIXI.loader.resources["moon"].texture
	);
		
		
	stage.addChild(moon);
	moon.width=WWidth/8;
	moon.height=WWidth/9;
	moon.position.set(WWidth-sun.width,0);	
	
	stage.addChild(hills);	
	hills.width=WWidth/1;
	hills.height=WHeight/1;
	hills.position.set(0,50);
	
	
	


	
	//data setup//
	
	bikeData=new ESPdata("http://"+_urlBike+"/Data");
	houseData=new ESPdata("http://"+_urlHouse+"/Status");
	dumpload=new ESPdata("http://"+_urlDump+"/Set");  //no data back, doesn't need to be loaded?
	
	houseData.requestNow();
	bikeData.requestNow();
	dumpload.requestNow();
	
	console.log("csv...");
	console.log(scenarioTXT);
	if (scenarioTXT=="hi"){scenString="Scenario file not found";}
	else {
		console.log("csvDone");
		scenarioTXT=CSVToArray(scenarioTXT, ',');
		scenString="Scenario file found: "+_urlScenario;
		}

	

	///////////////////////
	
	pauseS[0]=addBlock(stage,0xA0A0A0,[7.5*WWidth/18,WHeight/6,WWidth/18,2*WHeight/3]);
	pauseS[1]=addBlock(stage,0xA0A0A0,[9.5*WWidth/18,WHeight/6,WWidth/18,2*WHeight/3]);
	pauseS[2]=addBlock(stage,0xA0A0A0,[0,0,WWidth,WHeight]);
	//var ball=addCircle(stage,0xAAFF00,[9*WWidth/18,WHeight/6,WWidth/18]);	
	//
	pauseS[2].alpha=0.5;
	pauseS[0].visible=false;
	pauseS[1].visible=false;
	pauseS[2].visible=false;
	
	loadingS[0]=addBlock(stage,0xFF00FF,[0,0,WWidth,WHeight]);
	loadingS[1]=addBlock(stage,0xFFFF00,[0,WHeight/2,2*WWidth/3,WHeight/2]);
	loadingS[2]=addBlock(stage,0x00FF00,[0,0,2*WWidth/3,WHeight/2]);
	loadingS[3]=addBlock(stage,0xFF0000,[2*WWidth/3,0,WWidth/3,WHeight]);
	
	groupVisible(loadingS,0)
	
	console.log("hi");
	
	logo=new PIXI.Sprite(
		PIXI.loader.resources["logo"].texture
	);
	
		logo.interactive = true;
	logo.buttonMode = true;
	logo.on('mousedown', click);
	logo.on('tap', click);
	
	stage.addChild(logo);	

	logo.width=WWidth/10;
	logo.height=WHeight/5;
	logo.position.set(WWidth-logo.width,0);
	
				thermOuter=new PIXI.Sprite(
		PIXI.loader.resources["thermOuter"].texture
	);
	

	
	thermOuter.interactive = true;
	thermOuter.buttonMode = true;
	
	thermOuter.on('mousedown', clickTemperature);
	thermOuter.on('tap', clickTemperature);
	
	stage.addChild(thermOuter);	
	
	
	thermOuter.width=WHeight*0.2;
	thermOuter.height=WHeight*0.6;
	thermOuter.position.set(WWidth*0.6,WHeight*0.2);
	
		thermInner=new PIXI.Sprite(
		PIXI.loader.resources["thermInner"].texture
	);
	

	
	thermInner.interactive = true;
	thermInner.buttonMode = true;
	
	thermInner.on('mousedown', clickTemperature);
	thermInner.on('tap', clickTemperature);
	
	stage.addChild(thermInner);	
	
	thermInner.width=WHeight*0.15;
	thermInner.height=WHeight*0.5;
	thermInner.position.set(WWidth*0.614,WHeight*0.25);
	thermInner.position.set(thermOuter.position.x+thermOuter.width/2-thermInner.width/2,WHeight*0.25);
	
	
	thermMask=addBlock(stage, 0xFFFFFF,[thermInner.position.x,thermInner.position.y,thermInner.width,thermInner.height])
	thermInner.mask=thermMask;
	
	thermText.setStyle({font:"60px Arial"});
	thermText.position.set(thermInner.position.x+thermInner.width*0.25,thermInner.position.y+thermInner.height*0.8);
	thermText.setText("15");
	thermText.width=thermInner.width*0.5;
	thermText.height=thermText.width;
	
	stage.addChild(thermText);
	
	
	introText.setStyle({font:"40px Arial"});
	introText1.setStyle({font:"40px Arial"});
	introText2.setStyle({font:"40px Arial"});
	introText.position.set(WWidth/10,WHeight/3);
	introText1.position.set(WWidth/10+200,WHeight/3);
	introText2.position.set(WWidth/10+350,WHeight/3);
//	introText.text="Hi!";
	
	stage.addChild(introText);
	stage.addChild(introText1);
	stage.addChild(introText2);
	
	
	for (var i=0;i<5;i++){
	CO2[i] = new PIXI.Sprite(
		PIXI.loader.resources["CO2"].texture
	);
	stage.addChild(CO2[i]);
	CO2[i].width=WHeight/6;
	CO2[i].height=WHeight/6;
	CO2[i].position.set(WWidth-CO2[i].width*3,WHeight/6*(5-i));
	
	CO2Mask[i] =new PIXI.Graphics();
	stage.addChild(CO2Mask[i]);
	}
	 
	stage.addChild(powerText);	
	powerText.position.set(WWidth*2/3,WHeight*4/5);
	
	stage.addChild(loadingText);
	stage.addChild(titleText);
	
	//titleText.width=titleText.width*3;
	//titleText.height=titleText.height*3;
	titleText.setStyle({font:"80px Arial"});
	
	titleText.position.set((WWidth-titleText.width)/2,10);
	
	timeText.setStyle({font:"60px Arial"});
	timeText.position.set((WWidth-1.2*timeText.width),WHeight/5);
	timeBackground=addBlock(stage, 0xFFFFFF , [(WWidth-1.2*timeText.width)-10,WHeight/5,timeText.width*1.2*10,timeText.height]);
	timeBackground.visible=false;
	//titleText.bringToFront();
	mode="Loading";
	stage.addChild(finishedText);	
	
	
	powerUsed[0]=new Array(2);
	powerMade[0]=new Array(2);
	powerUsed[0][0]=new Array();
	powerUsed[0][1]=new Array();
	powerMade[0][0]=new Array();
	powerMade[0][1]=new Array();
	
	powerUsed[0][1][0]=0;
	powerMade[0][1][0]=0;
	
	//barGas=new barGraph(stage,1,[WWidth*2/3,30,WWidth*1/6-60,WHeight-60],RGB2HTML(0,255/4,2));
	//barGas.update(tempData[1],300);
	CO2Level(0);
	setTemperature(25)
	//logo.bringToFront();
	loadingLoop();
}
	
var cumulativeData=new Array();

function clickTemperature(){
	
	var maxTemp=26;
	var minTemp=14;
	
	
	thermMask.position.y=Math.min(Math.max(renderer.plugins.interaction.mouse.global.y,thermInner.position.y),thermInner.position.y+thermInner.height*0.77);
	thermText.text=parseInt(maxTemp-(thermMask.position.y-thermInner.position.y)/(thermInner.height*0.77)*(maxTemp-minTemp));
	//console.log(maxTemp-(thermMask.position.y-thermInner.position.y)/(thermInner.height*0.77)*(maxTemp-minTemp));
	
}

function setTemperature(temp){
	
	var maxTemp=26;
	var minTemp=14;
	
	temp=Math.max(Math.min(temp,maxTemp),minTemp);
	
	
	thermMask.position.y=(temp-minTemp)/(maxTemp-minTemp)*(thermInner.height*0.77)+thermInner.position.y;
	thermText.text=parseInt(maxTemp-(thermMask.position.y-thermInner.position.y)/(thermInner.height*0.77)*(maxTemp-minTemp));
	//console.log(maxTemp-(thermMask.position.y-thermInner.position.y)/(thermInner.height*0.77)*(maxTemp-minTemp));

	thermInner.visible=false;
	thermOuter.visible=false;
	thermText.visible=false;

}


function pausedLoop(){
	
	titleText.text="Paused";
	
	groupVisible(pauseS,1);
	
	groupFront(pauseS);
		
	nextFrame();
	
	groupVisible(pauseS,0);
	
	
	//if ((new Date()-startT)>100) {mode="Loading";}
	
}

var houseLoadedCheck=false;
var houseLoadedCheck2=false;

function loadingLoop() {
	
	titleText.text="Loading";
	
	
	//background set
	setDay(4*24/2/Math.PI);
	
	sunmove=sunmove+0.01;
	
	
	if (sunmove>24){sunmove=0;}
	//background set
	
	
	if (houseData.initialised()){var houseString="House Loading...";
	if (houseLoadedCheck2) {houseString="House Loaded";}
	
	}
	else {var houseString="Finding house... "+ String((new Date())-houseData.timer); houseData.request();}
	if (bikeData.initialised()){var bikeString="Bikes Loaded";
	
	if (!houseLoadedCheck){
	if (scenarioTXT==undefined){scenarioTXT="failed"; console.log("scenario file doesn't  ");}
	if (scenarioTXT!="failed"&&houseData.initialised()) {getScenario(); setTimeout(function(){
			getScenario();
			houseData.counter=(houseData.counter+1)%2; 
			calculatePower(); 
			houseData.counter=(houseData.counter+1)%2; 
			houseLoadedCheck2=true; 
				},3000);}
	houseLoadedCheck=true;
	console.log("houseLoaded");
	}
	}
	else {var bikeString="Finding bikes... "+ String((new Date())-bikeData.timer); bikeData.request();}
	if (dumpload.initialised()){var dumpString="dumpload found";}
	else {var dumpString="Finding dumpload... "+ String((new Date())-dumpload.timer); dumpload.request();}
	
	loadingText.text=houseString+"\n"+bikeString+"\n"+dumpString+"\n";
	loadingText.visible=true;
	nextFrame();
	loadingText.visible=false;
}

function startRunning(){
	
	barTimer=new Date();
	loadingText.text="";
	
	introText.visible=false;
	introText1.visible=false;
	introText2.visible=false;

	
	console.log(scTime);
	console.log(scRealT);
	console.log(scenarioTXT);
	
	console.log(appliancesSC[2][0]);
	
	//data functions
	
	calculatePower();
	timeBackground.visible=true;
	
	//console.log("start")
	
	
	
	thermInner.visible=false;
	thermOuter.visible=false;
	thermText.visible=false;
	
	////////////
	
	runningCharts[1]=new linePlot(stage,[WHeight/2+50,0+50,WHeight-50,WWidth*2/3-50]);
	runningCharts[1].axesState=0;
	runningCharts[1].color=RGB2HTML(0,255,0);
	runningCharts[1].setmaxmin(tempData,tempData[0].length,Math.max(tempData[0].length-200,0));
	runningCharts[1].miny=0;
	runningCharts[1].update(tempData,tempData[0].length,Math.max(tempData[0].length-200,0));
	
	
	runningCharts[0]=new linePlot(stage,[WHeight/2+50,0+50,WHeight-50,WWidth*2/3-50]);
	runningCharts[0].axesState=1;
	runningCharts[0].color=RGB2HTML(255,0,0);
	runningCharts[0].setmaxmin(tempData,tempData[0].length,Math.max(tempData[0].length-200,0));
	runningCharts[0].miny=0;
	runningCharts[0].maxy=2000;
	runningCharts[0].minx=2;
	runningCharts[0].maxx=26;
	runningCharts[0].update(tempData,tempData[0].length,Math.max(tempData[0].length-200,0));
	
	
	for (var i=0;i<numberCharts;i++){
	bar1[i]=new barGraph(stage,numberBars,[30,30,WWidth*2/3-60,WHeight/2-60],RGB2HTML(255,255/4/i,i*50));
	bar1.color=RGB2HTML(255,0,2);
	//bar1[i].update(tempData[1],2200);
	}
	
	newData();
}

function runningLoop() {
	//console.log("animation");
	
	////data functions///
	
//console.log(appliances.length);
	//console.log(totalGas);
	//console.log(gasNow);
	//console.log(deviceEnergy);
	
	powerText.text="Using: ";
	powerText.text+=(powerNow/1000).toFixed(1);
	powerText.text+="kW \nGenerating: "
	powerText.text+=((bikeList[1][bikeList[1].length-1]+bikeList2[1][bikeList[1].length-1])/125).toFixed(1);
	powerText.text+="kW";
	
	bikeData.detect();
	houseData.request();
	bikeData.request();	
	
	if (sEnergy.length==0) {applianceTracker(0);}
	
	////////////

	groupVisible(loadingS,0);
	
	//co2level++;
	CO2Level(co2level);
	
	
	var HouseTimeH=Math.floor(((new Date().getTime())-houseTimer)/scRealT/1000*scTime/60+2)%24;
	hoursPast=Math.floor(((new Date().getTime())-houseTimer)/scRealT/1000*scTime/60);
	//console.log(hoursPast);
	var HouseTimeM=Math.floor((((new Date().getTime())-houseTimer)/scRealT/1000*scTime)%60);
	timeText.setText(("00" + String(HouseTimeH)).slice(-2)+":"+("00" + String(HouseTimeM)).slice(-2));
	
	setDay(((new Date().getTime())-houseTimer)/scRealT/1000*scTime/60+2);
	
	stage.removeChild(timeText);		 	
	stage.addChild(timeText);
	
	titleText.text="Running";
	
	if ((Math.floor(((new Date().getTime())-houseTimer)))>=60*1000*scRealT)	 {mode="Finished"; applianceTracker(1);}
	
	
	if ((new Date())-timeRecur>timeRecur2){
	timeRecur=(new Date());
	calculatePower();
	newData();
	}
	nextFrame();
	console.log(co2level);
}

function finishedLoop(){  //loop for when simulation finished
	
	powerText.visible=false;
	timeBackground.visible=false;
	moon.visible=false;
	hills.visible=false;
	sun.visible=false;
	night.visible=false;
	sky.visible=false;
	
	
	introText.visible=true;
	introText.position.y=WHeight*3/4;
	introText.text="Total energy used:";
	introText.text+=((totalE+totalGas)/2500).toFixed(0);
	introText.text+="kWh\nTotal carbon emitted: "
	introText.text+=((totalE+totalGas)/2500*co2Intense).toFixed(0);
	
	introText.text+="gCO2e";
	
	
	runningCharts[1].line.visible=false;
	runningCharts[1].axes.visible=false;
	runningCharts[0].line.visible=false;
	runningCharts[0].axes.visible=false;
	//finishedText.text=applianceTracker(2);
	
	for (var i=numberCharts-1;i>=0;i--){
		
	bar1[i].size=[30,WHeight*0.25,WWidth*2/3-60,WHeight/2-60];
	bar1[i].update(barsData[i],16200);
	
	for (var k=0;k<cumulativeData.length;k++){cumulativeData[k]=cumulativeData[k]+tempData[1][k];}
	
	}
	
	nextFrame()

}



function nextFrame(){
	
	//WWidth=window.innerWidth-30;
   // WHeight=window.innerHeight-30;  //ideally this would update all things on the screen, currently not!
	
	if (mode=="Loading") {requestAnimationFrame(loadingLoop);}
	else if (mode=="Running") {requestAnimationFrame(runningLoop); }
	else if (mode=="Finished") {requestAnimationFrame(finishedLoop);}
	else {requestAnimationFrame(pausedLoop);}
	titleText.text=scenarioTXT[0][10];
	titleText.position.set((WWidth-titleText.width)/2,10);
	
	renderer.render(stage);
	
	//console.log(mode);
}

//var scRealT=0.1;
//var scTime=24;

function applianceTracker(mode){
	
	var tempString="";
	
	//on all day gave time of -117726
	
	for (var i=1;i<appliancesSC.length;i++){ //breaks if not 1, dont knwo why
	
		//if (mode==2&&(appliancesSC[i][0]!=undefined)&&(!isNaN(sEnergy[i]))) {console.log(fEnergy[i])	;console.log((sEnergy[i])); tempString+=appliancesSC[i][0] + " " + String(parseInt((fEnergy[i])-(sEnergy[i])*(appliancesSC[i][4]/1000*scTime/scRealT))) + " 'Watt hours' of energy\n"}
		if (mode==2&&(appliancesSC[i][0]!=undefined)&&(!isNaN(sEnergy[i]))) {tempString+="The "+ appliancesSC[i][0] + " used " + 
		String(parseInt((fEnergy[i])*(appliancesSC[i][4]/1000*scTime/scRealT)/60)) + " Watt-hours of energy\n"}
			//sEnergy seems to be useless since get restarted almost immediately afterwards

		
		if (appliancesSC[i][1]=="local"){} //if local device
		else {//controlled by the house. what is its state?
		
			for (var j=0;j<appliances.length;j++){  
			
				if (appliances[j][1]==appliancesSC[i][1]){//found it, is it on?
					
					if (mode==0) {sEnergy[i]=(appliances[j][3]); console.log(sEnergy[i]);} //get the starting time on
					
					if (mode==1) {fEnergy[i]=(appliances[j][3]); console.log(fEnergy[i]);}
					
					
					//if (mode==2&&(appliancesSC[i][0]!=undefined)) {tempString+=appliancesSC[i][0] + " " + String(parseInt(fEnergy[i]))+String(((fEnergy[i])))+String((appliancesSC[i][4]/1000)) + " 'joules' of energy\n"}
					
						//console.log(appliancesSC[i][5]);
					}
				}				
			}
		
		}
		//console.log(tempString);
		return tempString;
	}




function calculatePower(){
	powerNow=1;
	gasNow=0;
	for (var i=0;i<devCategories.length;i++){catPower[i]=0;}
	parseHouseData(houseData);
	//console.log(houseData);
	//console.log(appliances.length);
	for (var i=1;i<10;i++){  //breaks if not 1, dont knwo why
		powerNow+=parseInt(lights[0][i]*lightsPower[i]);
		catPower[0]+=parseInt(lights[0][i]*lightsPower[i]);
		deviceEnergy[0]+=(powerTimer-(new Date()))*lights[0][i]*lightsPower[i];
		}
	for (var i=1;i<appliancesSC.length;i++){ //brekas if not 1, dont knwo why
		
		if (appliancesSC[i][1]=="local"){powerNow+=parseInt(appliancesSC[i][4]);} //if local device
		else {//controlled by the house. what is its state?
			for (var j=0;j<appliances.length;j++){  
				if (appliances[j][1]==appliancesSC[i][1]){//found it, is it on?
					if (appliances[j][4]==1){
						//if (appliancesSC[i][5])
							if (appliancesSC[i][5]=="Gas"){gasNow+=parseInt(appliancesSC[i][4]);}
							else {powerNow+=parseInt(appliancesSC[i][4]);}
						deviceEnergy[i]+=(powerTimer-(new Date()))*appliancesSC[i][4];  //add energy to the device list
						//console.log((powerTimer-(new Date()))*appliancesSC[i][4]);
						for (var k=0;k<devCategories.length;k++){
							if (devCategories[k]==appliancesSC[i][5]){catPower[k]+=appliancesSC[i][4];}
							
						}
						//console.log(appliancesSC[i][5]);
					}
				}				
			}
		}
	}
	//setResistance(Math.min(2055,powerNow/2));
	
	setResistance(Math.floor(powerNow/4));
	powerList[0].push(((new Date().getTime())-houseTimer));
	bikeList[0].push(((new Date().getTime())-houseTimer));
	bikeList2[0].push(((new Date().getTime())-houseTimer));
	//steps++;
	bikeList[1].push(bikeData.data(4)*bikeData.data(6+4));
	
	bikeList2[1].push(bikeData.data(3)*bikeData.data(6+3));
	//console.log([Chart2.minx,Chart2.maxx,Chart2.miny,Chart2.maxy]);

	//console.log(powerNow);
	//bikeList[1].push(bikeData.data(2)*bikeData.data(8)+bikeData.data(3)*bikeData.data(9));
	//steps++;
	powerFactor=1/2000;
	if (isNaN(powerNow)) {powerNow=0;}
	powerList[1].push(powerNow);
	co2level=(totalE/1000*co2Intense+totalGas/1000*500)/400; // **need to make this actual values, related to energy mix
	console.log(co2Intense);
	console.log(co2level);
	//console.log(parseInt(getData(bikeData,"Voltage 3: ")));
	sumPower();
	//newData();
}

var barTimer=new Date();
	
function newData(){  //run for every data point that is collected
	
	var bikeval=Math.random()*30;
	var houseval=Math.random()*2000;
	
	powerUsed[0][0].push(((new Date().getTime())-houseTimer));
	powerMade[0][0].push(((new Date().getTime())-houseTimer));
	
	powerUsed[0][1].push((powerUsed[0][1][powerUsed[0][1].length-1]+((houseval-1000)/10)+4000)%2000);
	powerMade[0][1].push(bikeval);
	
//((new Date().getTime())-houseTimer)))>=60*1000*scRealT

//dont actually need to do this every time, jsut set boundaries at the beginning
	
	runningCharts[0].setmaxmin(bikeList2,bikeList[0].length); //setup bike energy plot
	runningCharts[0].miny=0;
	runningCharts[0].maxy=runningCharts[1].maxy/8;
	runningCharts[0].minx=0;
	runningCharts[0].maxx=60*1000*scRealT
	runningCharts[0].update(bikeList2,bikeList2[0].length);
	
	//console.log("zz");
	//console.log(powerList[1][powerList[0].length-1]);
	
	
	runningCharts[1].setmaxmin(powerList,powerList[1].length);  //setup house energy plot
	runningCharts[1].miny=0;
	runningCharts[1].maxy=Math.max(5,runningCharts[1].maxy);
	runningCharts[1].minx=0;
	runningCharts[1].maxx=60*1000*scRealT;
	runningCharts[1].update(powerList,powerList[1].length);
	
	//console.log(powerList);
	
	currentBar=Math.floor(((new Date().getTime())-houseTimer)/(60*1000*scRealT)*numberBars);
	//console.log(tempData[0].length);
	
	//for (var i=0;i<numberCharts;i++){barsData[i][currentBar]+=powerUsed[0][1][powerUsed[0][1].length-1]*(numberCharts-i)/500*(new Date()-barTimer)/100;}
	
	for (var i=0;i<numberCharts;i++){barsData[i][currentBar]+=powerList[1][powerList[1].length-1]*(numberCharts-i)/500*(new Date()-barTimer)/30;}
	
	for (var k=0;k<cumulativeData.length;k++){cumulativeData[k]=tempData[1][k]};
	for (var i=numberCharts-1;i>=0;i--){
		
	bar1[i].update(barsData[i],16200);
	
	for (var k=0;k<cumulativeData.length;k++){cumulativeData[k]=cumulativeData[k]+tempData[1][k];}
	
	}
	//console.log(barsData[1]);
	barTimer=new Date();
	
	
}



function parseHouseData(house){
	
	lines=house.html[(house.counter)].split('\n');
	//console.log(lines);
	DownloadedLines=lines.length;
	lights[0]=lines[0].split(" ");
	lights[1]=lines[0].split(" ");
	
	for (var j=1;j<lights[0].length;j++){
		//var temp=lines[0][j].split("-");
		//console.log(lights[0][j]);
		lights[0][j]=parseInt(lights[0][j].split('-')[0]);
		lights[1][j]=parseInt(lights[1][j].split('-')[1]);
	}
	appliances=new Array(0);
	for (var i=1;i<lines.length-1;i++){
		
		//tempArray=lines[i].split(" ");
		//console.log(lines[i]);
		appliances[i-1]=lines[i].split(" ");
		
		appliances[i-1][2]=parseInt(appliances[i-1][2]);
		appliances[i-1][3]=parseInt(appliances[i-1][3]);
		appliances[i-1][4]=parseInt(appliances[i-1][4]);
		appliances.push(new Array(5));
	}
}


function sumPower(){
	
	totalE+=-(powerTimer-(new Date()))*powerNow/1000/scRealT;
	totalGas+=((new Date())-powerTimer)*gasNow/1000/scRealT;
	//console.log((powerTimer-(new Date())));
	
	for (var i=0;i<devCategories.length;i++){
		totalCatE[i]+=(powerTimer-(new Date()))*catPower[i];

	}
	//console.log(totalE);
	powerTimer=new Date();
}

function setResistance(number){
	console.log("set resistance");
	console.log(number);
	var theURL="http://" + _urlDump +"/Set?";
	theURL+="Duty="+String(parseInt(number));
	$.get(theURL,{},function(response,stat){},"text");
	  
}

var energyMix=new Array(3);
var transportMix=new Array(5);

transportMix[0]=new Array();
transportMix[1]=new Array();
transportMix[2]=new Array();
transportMix[3]=new Array();
transportMix[4]=new Array();
energyMix[0]=new Array();
energyMix[1]=new Array();
energyMix[2]=new Array();

var co2Intense=0;
var totalPercent=0

function getScenario(){  //sends the data from the scenario file to the house and controllers
	
	//setHouse(0,0,12,6);
	//Cpanel, Cbutton, Csocket, Cmode
	
	setHouse(0,99,99,99);  //gets house to reset all of its current values
	setTimeout(function(){/*YourCode*/

	
	scTime=parseInt(scenarioTXT[0][4]);   //get scenario realtime length (mins) out of the csvfile
	scRealT=parseInt(scenarioTXT[0][1]);  //get scenario length (hours) out of the csvfile
	
	var CSVlightR=1;   //which Row the lights list is on
	var CSVmixR=2;  //which Row the energy mix list starts on
	var CSVtransportR=5;  //which Row the transport list starts on
	
	var i=1;
	introText.text="Energy Mix:\n"
	introText1.text="\n"
	introText2.text="\n"
	co2Intense=0;
	totalPercent=0;

	
	while ((scenarioTXT[CSVmixR][i]!="")&&(scenarioTXT[CSVmixR][i]!=undefined)){
		
		energyMix[0][i]=scenarioTXT[CSVmixR][i];
		energyMix[1][i]=scenarioTXT[CSVmixR+1][i];
		energyMix[2][i]=scenarioTXT[CSVmixR+2][i];
		
		introText.text+=energyMix[0][i];
		introText.text+=":\n";
		introText1.text+=energyMix[1][i];
		introText1.text+="%\n";
		introText2.text+=energyMix[2][i];
		introText2.text+=" gCO2e/kWh\n";
		i++;
		}
	
		co2Intense=0;
		totalPercent=0
	for (i=1;i<energyMix[1].length;i++){
		//console.log(co2Intense);
		co2Intense+=parseInt(energyMix[1][i])*parseInt(energyMix[2][i]);
		totalPercent+=parseInt(energyMix[1][i]);
		//console.log(parseFloat(energyMix[2][i]));
	}
	co2Intense=co2Intense/totalPercent;  //because the percentages might not actually add up to 100 every time
	console.log(co2Intense);
	
	console.log(i);
	i=1;
	while ((scenarioTXT[CSVtransportR][i]!="")&&(scenarioTXT[CSVtransportR][i]!=undefined)){
		
		transportMix[0][i]=scenarioTXT[CSVtransportR][i];
		transportMix[1][i]=scenarioTXT[CSVtransportR+1][i];
		transportMix[2][i]=scenarioTXT[CSVtransportR+2][i];
		transportMix[3][i]=scenarioTXT[CSVtransportR+3][i];
		transportMix[4][i]=scenarioTXT[CSVtransportR+4][i];
		i++;
		}
	console.log(i);
	
	var CSVdeviceR=11;  //which line the appliance list starts on
	lightsPower=[parseInt(scenarioTXT[CSVlightR][1]),parseInt(scenarioTXT[CSVlightR][2]),parseInt(scenarioTXT[CSVlightR][3]),parseInt(scenarioTXT[CSVlightR][4]),parseInt(scenarioTXT[CSVlightR][5]),parseInt(scenarioTXT[CSVlightR][6]),parseInt(scenarioTXT[CSVlightR][7]),parseInt(scenarioTXT[CSVlightR][8]),parseInt(scenarioTXT[CSVlightR][9]),parseInt(scenarioTXT[CSVlightR][10])];
	
	
	var tempCounter=0;
	while ((scenarioTXT[CSVdeviceR][1]!=undefined)){
		var Sfound=0;
		tempCounter++;
		appliancesSC.push(new Array(6));
		deviceEnergy.push(0);  //set all energy used to 0
		
		//(name, id,state , socket,power)
		
		appliancesSC[tempCounter][0]=scenarioTXT[CSVdeviceR][0]; //name
		appliancesSC[tempCounter][1]=scenarioTXT[CSVdeviceR][1]; //ID
		appliancesSC[tempCounter][2]=scenarioTXT[CSVdeviceR][2]; //mode/state
		appliancesSC[tempCounter][4]=scenarioTXT[CSVdeviceR][4]; //power
		appliancesSC[tempCounter][5]=scenarioTXT[CSVdeviceR][6]; //category
		appliancesSC[tempCounter][3]=-1; //socket
		
		if (scenarioTXT[CSVdeviceR][1]=="local") {Sfound=2; console.log(scenarioTXT[CSVdeviceR][0]+" "+scenarioTXT[CSVdeviceR][1]);}//add local device
		else if (scenarioTXT[CSVdeviceR][1]=="None") {Sfound=3; appliancesSC[tempCounter][3]=scenarioTXT[CSVdeviceR][5];setHouse(parseInt(scenarioTXT[CSVdeviceR][3].split("-")[0]),parseInt(scenarioTXT[CSVdeviceR][3].split("-")[1]),parseInt(scenarioTXT[CSVdeviceR][5]),scenarioTXT[CSVdeviceR][2]);console.log(scenarioTXT[CSVdeviceR][0]+" "+scenarioTXT[CSVdeviceR][1]);}//add local device
		//else if (scenarioTXT[CSVdeviceR][1]=="Profile") {Sfound=4; appliancesSC[tempCounter][3]=scenarioTXT[CSVdeviceR][5];}//add local device
		//started addinf profile option but not completed code. future work!
		else{
			//console.log(DownloadedLines);
			//console.log(DownloadedLines-2);
			for (var i=0;i<DownloadedLines-2;i++) {  //see if the device is connected to the house
				//console.log(appliances[i][1] +" "+scenarioTXT[CSVdeviceR][1]);
				//console.log(appliances[i][1]==scenarioTXT[CSVdeviceR][1]);
				//if (scenarioTXT[CSVdeviceR][1]==""&&)
				if (appliances[i][1]==scenarioTXT[CSVdeviceR][1]){
					Sfound=1; 
					setHouse(parseInt(scenarioTXT[CSVdeviceR][3].split("-")[0]),parseInt(scenarioTXT[CSVdeviceR][3].split("-")[1]),appliances[i][2],scenarioTXT[CSVdeviceR][2]);
					appliancesSC[tempCounter][3]=appliances[i][2]; //set socket
					}//yay its been found in the house
			}
		}
		//if (Sfound==1){}
		if (Sfound==0) {console.log("device: " + scenarioTXT[CSVdeviceR][0]+" not found");}
		if (Sfound==1) {console.log("device: " + scenarioTXT[CSVdeviceR][0]+" found");}
		CSVdeviceR++;
	}	
	
	
	},500);  //end of timeout
}


function setHouse(Cpanel, Cbutton, Csocket, Cmode){
	
	var theURL="http://" + _urlHouse+"/SetHouse?";
	theURL+="Number="+String(Csocket);
	theURL+="&State="+String(Cmode);
	theURL+="&Link="+String(Cpanel*7+Cbutton);
	
	console.log(theURL);
	$.get(theURL,{},function(response,stat){},"text");
	
}



function CO2Level(percentage){

	groupVisible(CO2,0);
	
	if (percentage<0){return;}
	for (var i=0;i<5;i++){	
	if (percentage>0+100*i){CO2[i].visible=true; arcMask(percentage-100*i,CO2[i],CO2Mask[i]); }
	}
	if (percentage>500){return;}
	
}

function arcMask(percentage,object,mask){
	
	if (object.parent==undefined){return;}
	if (mask==undefined){var mask =new PIXI.Graphics();
	object.parent.addChild(mask);}
	
	var level=percentage/50*Math.PI;
	
	object.mask=mask;
	
	mask.position.set(object.x,object.y);
	var startPoint=Math.PI*3/2;
	mask.clear();
	mask.beginFill(RGB2HTML(0,255,2));
	mask.moveTo(object.width/2,object.height/2);
	mask.arc(object.width/2,object.height/2,object.width/2,startPoint,level+startPoint,false);
	mask.moveTo(object.width/2,object.height/2);
	mask.endFill();
	
	return mask;
}


function groupVisible(array,state){
	
	for (var i=0;i<array.length;i++){
	try{	
	if (state==1) {(array[i]).visible=true;}
	else if (state==0) {(array[i]).visible=false;}
	else {array[i].visible=true; array[i].alpha=state; }		
	}
	catch(err){}  //allows arrays that are not full to be used
	}
}


function groupFront(array){ //moves a whole array of sprites to the front
	
	
	for (var i=0;i<array.length;i++){
	try{	
	array[i].bringToFront();
	}
	catch(err){}  //allows arrays that are not full to be used
	}
	
}

function RGB2HTML(red, green, blue)  //more easily create colours dynamically
{
	blue= constrain(blue ,0,255); //constrain variables to [0,255]
	red=  constrain(red  ,0,255);
	green=constrain(green,0,255);
    var decColor =0x1000000+ blue + 0x100 * green + 0x10000 *red ;
    //console.log('0x'+decColor.toString(16).substr(1));
	return '0x'+decColor.toString(16).substr(1);
}

function constrain(input, min, max){
	
	return Math.min(Math.max(input ,min),max);
	
}

function addBlock(stage, color,position){  //position = [left, down, width, height]
	
	if (color==undefined){color=0xFF3000;}
	
	var texture = new PIXI.RenderTexture(renderer, 10, 10);
	var graphics = new PIXI.Graphics();
	graphics.beginFill(color);
	graphics.drawRect(0, 0, 10, 10);
	graphics.endFill();
	texture.render(graphics);
	block=new PIXI.Sprite(texture);
	stage.addChild(block);
	
	if (position.length==4){
		block.position.set(position[0],position[1]);
		block.width=position[2]; 
		block.height=position[3];
		}
	return block;
}

function addCircle(stage, color,position){
	
    var texture = new PIXI.RenderTexture(renderer, 80, 80);
	var graphics= new PIXI.Graphics();
	graphics.beginFill(color);
	graphics.drawCircle(40, 40, 40 );
	graphics.endFill();
	texture.render(graphics);
	ball=new PIXI.Sprite(texture);
	stage.addChild(ball);
	if (position.length==4){
		ball.position.set(position[0],position[1]);
		ball.width=position[2]; 
		ball.height=position[3];
		}
	if (position.length==3){
		ball.position.set(position[0],position[1]);
		ball.width=position[2]; 
		ball.height=position[2];
		}
	return ball;
}

function getParameter(name,defaultVal){
	var urlParams = new URLSearchParams(window.location.search);
	var _url;
	if (urlParams.has(name)) {_url=urlParams.get(name);}
	else if (defaultVal!=undefined){
	_url = location.href;
    _url += (_url.split('?')[1] ? '&':'?') + name + "=" + defaultVal;
	location.href=_url; //add the default ip address and reload the page
	
}
	return _url;
}

PIXI.Text.prototype.bringToFront = function() {	if (this.parent) {		var parent = this.parent;		parent.removeChild(this);		parent.addChild(this);	}}
