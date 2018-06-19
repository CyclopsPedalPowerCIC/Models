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
	.load(setup);
	
	
	
	var logo;
	var sky;
	var hills;
	var sun;
	var moon;
	var night;
	
var sunmove=0;
var sunheight=0;

function loadingLoop() {
	
	
	titleText.text="Loading";
	
	//console.log("Hello");
	
	
	sun.position.set(WWidth/2-WWidth*Math.sin(sunmove-Math.PI/2)/2-sun.width/2,WHeight/2-WHeight*Math.cos(sunmove-Math.PI/2)/2);
	moon.position.set(WWidth/2-WWidth*Math.sin(sunmove+Math.PI/2)/2-sun.width/2,WHeight/2-WHeight*Math.cos(sunmove+Math.PI/2)/2);
	
	sunmove=sunmove%(Math.PI*2);
	if (sunmove<Math.PI*0.1){night.alpha=1-(sunmove+0.1*Math.PI)/Math.PI*5;}
	else if (sunmove<Math.PI*0.9){night.alpha=0;}
	else if (sunmove<Math.PI*1.1){night.alpha=(sunmove-Math.PI*0.9)/Math.PI*5;}
	else if (sunmove<Math.PI*1.9) {night.alpha=1;}
	else {night.alpha=1-(sunmove-Math.PI*1.9)/Math.PI*5;}
	
	sunmove=sunmove+0.01;
	
	
	if (sunmove>Math.PI*2){sunmove=0;}
	nextFrame();
	
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
	
	

	
	for (var i=0;i<10;i++){console.log(i);}
	
	
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
	CO2[i].position.set(WWidth*6/6-CO2[i].width*3,WHeight/6*(5-i));
	
	CO2Mask[i] =new PIXI.Graphics();
	stage.addChild(CO2Mask[i]);
	}
	
	
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
	
var cumulativeData=new Array();
	
function newData(){
	
	var bikeval=Math.random()*30;
	var houseval=Math.random()*2000;
	
	powerUsed[0][0].push(((new Date().getTime())-houseTimer));
	powerMade[0][0].push(((new Date().getTime())-houseTimer));
	
	powerUsed[0][1].push((powerUsed[0][1][powerUsed[0][1].length-1]+((houseval-1000)/10)+4000)%2000);
	powerMade[0][1].push(bikeval);
	
//((new Date().getTime())-houseTimer)))>=60*1000*scRealT

//dont actually need to do this every time, jsut set boundaries at the beginning
	
	runningCharts[0].setmaxmin(powerUsed[0],powerUsed[0][0].length);
	runningCharts[0].miny=0;
	runningCharts[0].maxy=2000;
	runningCharts[0].minx=0;
	runningCharts[0].maxx=60*1000*scRealT
	runningCharts[0].update(powerUsed[0],powerUsed[0][0].length);
	
	
	runningCharts[1].setmaxmin(powerUsed[0],powerUsed[0][0].length);
	runningCharts[1].miny=0;
	runningCharts[1].maxy=30;
	runningCharts[1].minx=0;
	runningCharts[1].maxx=60*1000*scRealT;
	runningCharts[1].update(powerMade[0],powerMade[0][0].length);
	
	currentBar=Math.floor(((new Date().getTime())-houseTimer)/(60*1000*scRealT)*numberBars);
	//console.log(tempData[0].length);
	
	for (var i=0;i<numberCharts;i++){barsData[i][currentBar]+=powerUsed[0][1][powerUsed[0][1].length-1]*(numberCharts-i)/500;}
	
	for (var k=0;k<cumulativeData.length;k++){cumulativeData[k]=tempData[1][k]};
	for (var i=numberCharts-1;i>=0;i--){
		
	bar1[i].update(barsData[i],2200);
	
	for (var k=0;k<cumulativeData.length;k++){cumulativeData[k]=cumulativeData[k]+tempData[1][k];}
	
	}
	//console.log(barsData[1]);
	
	
	
}

function startRunning(){
	
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
	
}

function pausedLoop(){
	
	titleText.text="Paused";
	
	groupVisible(pauseS,1);
	
	groupFront(pauseS);
		
	nextFrame();
	
	groupVisible(pauseS,0);
	
	
	//if ((new Date()-startT)>100) {mode="Loading";}
	
}



function runningLoop() {
	//console.log("animation");
	groupVisible(loadingS,0);
	
	
	co2level++;
	CO2Level(co2level);
	
	
	var HouseTimeH=Math.floor(((new Date().getTime())-houseTimer)/scRealT/1000*scTime/60+2)%24;
	var HouseTimeM=Math.floor((((new Date().getTime())-houseTimer)/scRealT/1000*scTime)%60);
	timeText.setText(("00" + String(HouseTimeH)).slice(-2)+":"+("00" + String(HouseTimeM)).slice(-2));
	
	
	stage.removeChild(timeText);		 	
	stage.addChild(timeText);
	
	titleText.text="Running";
	
	if ((Math.floor(((new Date().getTime())-houseTimer)))>=60*1000*scRealT)	 {mode="Finished";}
	
	newData();
	nextFrame();
}

function finishedLoop(){  //loop for when simulation finished
	
	runningCharts[1].line.visible=false;
	runningCharts[1].axes.visible=false;
	runningCharts[0].line.visible=false;
	runningCharts[0].axes.visible=false;
	titleText.text="Finished";
	
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

PIXI.Text.prototype.bringToFront = function() {	if (this.parent) {		var parent = this.parent;		parent.removeChild(this);		parent.addChild(this);	}}


PIXI.Sprite.prototype.bringToFront = function() {	if (this.parent) {		var parent = this.parent;		parent.removeChild(this);		parent.addChild(this);	}}
//http://www.html5gamedevs.com/topic/7507-how-to-move-the-sprite-to-the-top/
