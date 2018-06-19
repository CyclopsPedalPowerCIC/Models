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
		
var appliances = new Array(1); //array to hold appliance data from the house	
var appliancesSC = new Array(1); //array to hold appliance data	from scenario file (name, id, power, socket,state)
//state= 0 off 1, on, 2, controlled
var lights = new Array(2);	
var lightsPower=[1,1,1,8,1,1,1,1,1,1];

var powerList=[[0,0],[0,0]];


var bikeList= [[0,0],[0,0]];
var bikeList2= [[0,0],[0,0]];

var DownloadedLines=0; //variable to store how many lines of data have been downloaded from the house
var scenString



var steps=0;


var powerNow=1;
powerTimer=new Date();
totalE=0;
totalCatE=new Array(devCategories.length)
for (var i=0;i<devCategories.length;i++){totalCatE[i]=0;}

var timeRecur2=100;
var timeRecur=(new Date());


var sEnergy=new Array();
var fEnergy=new Array();


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
var titleText=new PIXI.Text('Title');
var timeText=new PIXI.Text('Time');
var runningCharts=new Array();
var barCharts=new Array();
var co2level=0;
var loadingText=new PIXI.Text('');
	
var tempData=[[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25],[200,210,200,180,210,310,600,800,850,820,900,880,850,840,860,950,1050,920,900,930,900,700,400,220]];
var bar1 =new Array(1);
var bar2 =new Array(1);



	numberBars=24;
	numberCharts=6;

var barsData=new Array(); //an array of arrays of data, one for each bar chart

for (var i=0;i<numberCharts;i++){
	barsData[i]=new Array();
	for (var j=0;j<numberBars;j++){
	barsData[i][j]=0;
}
}

var powerUsed=new Array();
var powerMade=new Array();

var houseTimer=new Date().getTime();
var pausedTimer=new Date().getTime();
	//setup();	
	
var scRealT=0.1;
var scTime=24;
		
	
function click(){
	
	//console.log(pausedTimer);
	//console.log(houseTimer);
	
	if (mode=="Loading"){mode="Running"; houseTimer=new Date().getTime(); startRunning();}
	else if (mode=="Running"){mode="Paused"; pausedTimer=new Date().getTime();}
	else if (mode=="Paused"){mode="Running"; houseTimer+=new Date().getTime()-pausedTimer;}
	else if (mode=="Finished"){}
	
}	
	
function setup() {
	
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
	
	
	stage.addChild(loadingText);
	stage.addChild(titleText);
	
	titleText.width=titleText.width*3;
	titleText.height=titleText.height*3;
	titleText.position.set((WWidth-titleText.width)/2,10);
	
	
	timeText.setStyle({font:"60px Arial"});
	timeText.position.set((WWidth-1.2*timeText.width),WHeight/5);
	
	//titleText.bringToFront();
	mode="Loading";
	
	
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
	
	//logo.bringToFront();
	loadingLoop();
}
	
var cumulativeData=new Array();



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
	
	
	if (houseData.initialised()){var houseString="House Loading";
	if (houseLoadedCheck2) {houseString="House Loaded";}
	
	}
	else {var houseString="Finding house... "+ String((new Date())-houseData.timer); houseData.request();}
	if (bikeData.initialised()){var bikeString="Bikes Loaded";
	
	if (!houseLoadedCheck){
	if (scenarioTXT==undefined){scenarioTXT="failed"; console.log("scenario file doesn't  ");}
	if (scenarioTXT!="failed"&&houseData.initialised()) {getScenario(); setTimeout(function(){getScenario(); houseLoadedCheck2=true;},3000);}
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
	
	console.log(scTime);
	console.log(scRealT);
	console.log(scenarioTXT);
	
	console.log(appliancesSC[2][0]);
	
	//data functions
	
	calculatePower();
	
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
	

	
	bikeData.detect();
	houseData.request();
	bikeData.request();	
	
	////////////

	groupVisible(loadingS,0);
	
	//co2level++;
	CO2Level(co2level);
	
	
	var HouseTimeH=Math.floor(((new Date().getTime())-houseTimer)/scRealT/1000*scTime/60+2)%24;
	var HouseTimeM=Math.floor((((new Date().getTime())-houseTimer)/scRealT/1000*scTime)%60);
	timeText.setText(("00" + String(HouseTimeH)).slice(-2)+":"+("00" + String(HouseTimeM)).slice(-2));
	
	
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
}

function finishedLoop(){  //loop for when simulation finished
	
	runningCharts[1].line.visible=false;
	runningCharts[1].axes.visible=false;
	runningCharts[0].line.visible=false;
	runningCharts[0].axes.visible=false;
	titleText.text=applianceTracker(2);
	
	for (var i=numberCharts-1;i>=0;i--){
		
	bar1[i].size=[30,WHeight*0.25,WWidth*2/3-60,WHeight/2-60];
	bar1[i].update(barsData[i],2200);
	
	for (var k=0;k<cumulativeData.length;k++){cumulativeData[k]=cumulativeData[k]+tempData[1][k];}
	
	}
	
	nextFrame()

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

function nextFrame(){
	
	//WWidth=window.innerWidth-30;
   // WHeight=window.innerHeight-30;  //ideally this would update all things on the screen, currently not!
	
	if (mode=="Loading") {requestAnimationFrame(loadingLoop);}
	else if (mode=="Running") {requestAnimationFrame(runningLoop); }
	else if (mode=="Finished") {requestAnimationFrame(finishedLoop);}
	else {requestAnimationFrame(pausedLoop);}
	renderer.render(stage);
	
	//console.log(mode);
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

function applianceTracker(mode){
	
	var tempString="";
	
	for (var i=1;i<appliancesSC.length;i++){ //breaks if not 1, dont knwo why
		if (appliancesSC[i][1]=="local"){} //if local device
		else {//controlled by the house. what is its state?
			for (var j=0;j<appliances.length;j++){  
				if (appliances[j][1]==appliancesSC[i][1]){//found it, is it on?
					
					if (mode==0) {sEnergy[i]=(appliances[j][3]); console.log(i);} //get the starting time on
					
					if (mode==1) {fEnergy[i]=(appliances[j][3]); console.log(i);}
					
					
					//if (mode==2&&(appliancesSC[i][0]!=undefined)) {tempString+=appliancesSC[i][0] + " " + String(parseInt(fEnergy[i]))+String(((fEnergy[i])))+String((appliancesSC[i][4]/1000)) + " 'joules' of energy\n"}
					if (mode==2&&(appliancesSC[i][0]!=undefined)) {tempString+=appliancesSC[i][0] + " " + String(parseInt(fEnergy[i]))+String((sEnergy[i]))+String((appliancesSC[i][4]/1000)) + " 'joules' of energy\n"}
			
						//console.log(appliancesSC[i][5]);
					}
				}				
			}
		
		}
		console.log(tempString);
		return tempString;
	}




function calculatePower(){
	powerNow=1
	for (var i=0;i<devCategories.length;i++){catPower[i]=0;}
	parseHouseData(houseData);
	//console.log(appliances.length);
	for (var i=1;i<10;i++){  //breaks if not 1, dont knwo why
		powerNow+=parseInt(lights[0][i]*lightsPower[i]);
		catPower[0]+=parseInt(lights[0][i]*lightsPower[i]);
		}
	for (var i=1;i<appliancesSC.length;i++){ //brekas if not 1, dont knwo why
		if (appliancesSC[i][1]=="local"){powerNow+=parseInt(appliancesSC[i][4]);} //if local device
		else {//controlled by the house. what is its state?
			for (var j=0;j<appliances.length;j++){  
				if (appliances[j][1]==appliancesSC[i][1]){//found it, is it on?
					if (appliances[j][4]==1){
						if (appliancesSC[i][5])
						powerNow+=parseInt(appliancesSC[i][4]);
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
	
	setResistance(Math.floor(powerNow/2));
	powerList[0].push(((new Date().getTime())-houseTimer));
	bikeList[0].push(((new Date().getTime())-houseTimer));
	bikeList2[0].push(((new Date().getTime())-houseTimer));
	//steps++;
	bikeList[1].push(bikeData.data(2)*bikeData.data(6+2));
	
	bikeList2[1].push(bikeData.data(3)*bikeData.data(6+3));
	//console.log([Chart2.minx,Chart2.maxx,Chart2.miny,Chart2.maxy]);

	//console.log(powerNow);
	//bikeList[1].push(bikeData.data(2)*bikeData.data(8)+bikeData.data(3)*bikeData.data(9));
	//steps++;
	powerFactor=1/2000;
	if (isNaN(powerNow)) {powerNow=0;}
	powerList[1].push(powerNow);
	co2level+=powerNow*powerFactor;
	//console.log(powerNow);
	//console.log(parseInt(getData(bikeData,"Voltage 3: ")));
	sumPower();
	//newData();
}

var barTimer=new Date();
	
function newData(){
	
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
	runningCharts[0].maxy=Math.max(2000,runningCharts[0].maxy);
	runningCharts[0].minx=0;
	runningCharts[0].maxx=60*1000*scRealT
	runningCharts[0].update(bikeList2,bikeList2[0].length);
	
	//console.log("zz");
	//console.log(powerList[1][powerList[0].length-1]);
	
	
	runningCharts[1].setmaxmin(powerList,powerList[1].length);  //setup house energy plot
	runningCharts[1].miny=0;
	runningCharts[1].maxy=Math.max(2000,runningCharts[1].maxy);
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
		
	bar1[i].update(barsData[i],2200);
	
	for (var k=0;k<cumulativeData.length;k++){cumulativeData[k]=cumulativeData[k]+tempData[1][k];}
	
	}
	//console.log(barsData[1]);
	barTimer=new Date();
	
	
}



function parseHouseData(house){
	
	lines=house.html[house.counter].split('\n');
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
	
	totalE+=(powerTimer-(new Date()))*powerNow;
	
	for (var i=0;i<devCategories.length;i++){
		totalCatE[i]+=(powerTimer-(new Date()))*catPower[i];

	}
	
	powerTimer=new Date();
}

function setResistance(number){
	
	var theURL="http://" + _urlDump +"/Set?";
	theURL+="Duty="+String(parseInt(number));
	$.get(theURL,{},function(response,stat){},"text");
	  
}


function getScenario(){  //sends the data from the scenario file to the house and controllers
	
	//setHouse(0,0,12,6);
	//Cpanel, Cbutton, Csocket, Cmode
	
	setHouse(0,99,99,99);  //gets house to reset all of its current values
	setTimeout(function(){/*YourCode*/

	
	scTime=parseInt(scenarioTXT[0][4]);   //get scenario realtime length (mins) out of the csvfile
	scRealT=parseInt(scenarioTXT[0][1]);  //get scenario length (hours) out of the csvfile
	
	var CSVlightR=1;
	var CSVdeviceR=3;
	lightsPower=[parseInt(scenarioTXT[CSVlightR][1]),parseInt(scenarioTXT[CSVlightR][2]),parseInt(scenarioTXT[CSVlightR][3]),parseInt(scenarioTXT[CSVlightR][4]),parseInt(scenarioTXT[CSVlightR][5]),parseInt(scenarioTXT[CSVlightR][6]),parseInt(scenarioTXT[CSVlightR][7]),parseInt(scenarioTXT[CSVlightR][8]),parseInt(scenarioTXT[CSVlightR][9]),parseInt(scenarioTXT[CSVlightR][10])];
	
	
	var tempCounter=0;
	while ((scenarioTXT[CSVdeviceR][1]!=undefined)){
		var Sfound=0;
		tempCounter++;
		appliancesSC.push(new Array(6));
		
		//(name, id,state , socket,power)
		
		appliancesSC[tempCounter][0]=scenarioTXT[CSVdeviceR][0]; //name
		appliancesSC[tempCounter][1]=scenarioTXT[CSVdeviceR][1]; //ID
		appliancesSC[tempCounter][2]=scenarioTXT[CSVdeviceR][2]; //mode/state
		appliancesSC[tempCounter][4]=scenarioTXT[CSVdeviceR][4]; //power
		appliancesSC[tempCounter][5]=scenarioTXT[CSVdeviceR][6]; //category
		appliancesSC[tempCounter][3]=-1; //socket
		
		if (scenarioTXT[CSVdeviceR][1]=="local") {Sfound=2; console.log(scenarioTXT[CSVdeviceR][0]+" "+scenarioTXT[CSVdeviceR][1]);}//add local device
		else if (scenarioTXT[CSVdeviceR][1]=="None") {Sfound=3; appliancesSC[tempCounter][3]=scenarioTXT[CSVdeviceR][5];setHouse(parseInt(scenarioTXT[CSVdeviceR][3].split("-")[0]),parseInt(scenarioTXT[CSVdeviceR][3].split("-")[1]),parseInt(scenarioTXT[CSVdeviceR][5]),scenarioTXT[CSVdeviceR][2]);console.log(scenarioTXT[CSVdeviceR][0]+" "+scenarioTXT[CSVdeviceR][1]);}//add local device
		else{
			//console.log(DownloadedLines-2);
			for (var i=0;i<DownloadedLines-2;i++) {  //see if the device is connected to the house
				//console.log(appliances[i][1] +" "+scenarioTXT[CSVdeviceR][1]);
				//console.log(appliances[i][1]==scenarioTXT[CSVdeviceR][1]);
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

PIXI.Text.prototype.bringToFront = function() {	if (this.parent) {		var parent = this.parent;		parent.removeChild(this);		parent.addChild(this);	}}
