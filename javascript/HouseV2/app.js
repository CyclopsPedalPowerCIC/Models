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
document.write('<script type="text/javascript" src="'+ "lineplot2.js"+ '"></script>'); //includes the linechart code...		
document.write('<script type="text/javascript" src="'+ "csv.js"+ '"></script>'); //includes the csv parsing code...			
		
sessionLength=1;
dayLength=24;


level=0;

var _urlScenario=getParameter('Scenario','Scenario1.csv');
var _urlDump=getParameter('DumpIP','192.168.0.138');
var _urlBike=getParameter('BikeIP','192.168.0.139');
var _urlHouse=getParameter('HouseIP','192.168.0.140');

//console.log(window.location.href.split('index.html')[0]+"Scenarios/"+_urlScenario);

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
	
//var chartpos=[10,10,320,320];	
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
	.add("logo","images/profile picture.jpg")
	.add("apple","images/apple.jpg")
	.load(setup);
	
var logo;
var apple;
var testtext = new PIXI.Text('Basic text in pixi');
var titletext = new PIXI.Text('Model house Energy monitor');
	titletext.position.x = renderer.width / 3;
	

//var chartpos=[50+100,50+100,120+100,320+100];	//position given by: left, top, bottom, right
var chartpos=[WHeight*1/4,0,WHeight,WWidth*4/5];	 
var chartpos2=[0,WHeight*1.5/4,WWidth*4/5,WHeight*1.5/4-50];	//[xpos down, ypos, x width, y width]	
var chartpos3=[0,0,WWidth*4/5,WHeight*1.5/4-50];	//[xpos down, ypos, x width, y width]	

	
var testdata = [[0,1],[1,3]];
var powerList=[[0,0],[0,0]];


var bikeList= [[0,0],[0,0]];
var bikeList2= [[0,0],[0,0]];

var Chart2; //decalre the variables that hold the various charts...
var Chart3; //decalre the variables that hold the various charts...
var bar2 =new Array(1);
var bar1 =new Array(1);
var dayEnabled=true;

var steps=0;
var houseTimer=(new Date());


var timeRecur=(new Date());
var timeRecur2=200;


var thing = new PIXI.Graphics();

var scTime=1;
var scRealT=1;
var DownloadedLines=0; //variable to store how many lines of data have been downloaded from the house
var scenString


function setup() {
	
	var pause1=addBlock(stage,0xA0A0A0,[7.5*WWidth/18,WHeight/6,WWidth/18,2*WHeight/3]);
	var pause2=addBlock(stage,0xA0A0A0,[9.5*WWidth/18,WHeight/6,WWidth/18,2*WHeight/3]);
	var pause3=addBlock(stage,0xA0A0A0,[0,0,WWidth,WHeight]);
	//var ball=addCircle(stage,0xAAFF00,[9*WWidth/18,WHeight/6,WWidth/18]);	
	//
	pause3.alpha=0.5;
	pause1.visible=false;
	pause2.visible=false;
	pause3.visible=false;
	//pause1.visible=true;
	//pause2.visible=true;
	//pause3.visible=true;
	//ball.alpha=0.5;
	
	
	
	
	if (scenarioTXT=="hi"){scenString="Scenario file not found";}
	else {
		scenarioTXT=CSVToArray(scenarioTXT, ',');
		scenString="Scenario file found: "+_urlScenario;
		}
	
	
	logo = new PIXI.Sprite(
		PIXI.loader.resources["logo"].texture
	);
	apple = new PIXI.Sprite(
		PIXI.loader.resources["apple"].texture
	);

	
for (var i=0;i<200;i++){
		testdata[0][i]=i/10;
		testdata[1][i]=Math.sin(i/10);
		//console.log(testdata[1][i]);
		
	}
	
	//stage.addChild(logo);
	//stage.addChild(apple);
	stage.addChild(testtext);
	stage.addChild(titletext);
	apple.scale.set(0.15,0.15);
	apple.x=renderer.width/2-apple.width;
	apple.y=renderer.height/2-apple.height;
	//console.log("testing");
	
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

	bikeData=new ESPdata("http://"+_urlBike+"/Data");
	houseData=new ESPdata("http://"+_urlHouse+"/Status");
	dumpload=new ESPdata("http://"+_urlDump+"/Set");  //no data back, doesn't need to be loaded?
	
	Chart2=new linePlot(stage,chartpos);
	Chart2.axesState=0;
	Chart3=new linePlot(stage,chartpos);
	Chart3.axesState=0;
	Chart3.color=0xff3f00
	
	Chart4=new linePlot(stage,chartpos);
	Chart4.axesState=0;
	Chart4.color=0x003fff
	
	//Chart2.setmaxmin(testdata,0,50);
	//Chart2.update(testdata,150,0,50);
	
	//for (var i=0;i<5;i++){
	//bar1.push("");
	//bar1[i]=new barGraph(stage,24,chartpos2,RGB2HTML(255,255/4*i,2));
	//bar1.color=RGB2HTML(255,0,2);
	//bar1[i].update([0,1,2,3,4,10-i,6,7,8,9,i,9,0,1,2,3,4,5,6,7,8,9,10,9],10);
	
	//bar2.push("");
	//bar2[i]=new barGraph(stage,24,chartpos3,RGB2HTML(0,255,255/4*i));
	//bar2[i].update([0,1,2,3,4,5-i,6-i,7-i,8-i,9-i,10,9,0,1,2,3,4,5,6,7,8,9,10,9],10);
	//}
	
	
	//pause1.bringToFront();
	//pause2.bringToFront();
	//pause3.bringToFront();
	
	houseData.requestNow();
	bikeData.requestNow();
	dumpload.requestNow();   //initial data request
	loadingLoop();
	//console.log(_urlHouse);
}	

function loadingLoop() {
	
	
	if (houseData.initialised()){var houseString="House Loaded"}
	else {var houseString="Finding house... "+ String((new Date())-houseData.timer)}
	if (bikeData.initialised()){var bikeString="Bikes Loaded"}
	else {var bikeString="Finding bikes... "+ String((new Date())-bikeData.timer)}
	if (dumpload.initialised()){var dumpString="dumpload found"}
	else {var dumpString="Finding dumpload... "+ String((new Date())-dumpload.timer)}
	
	
	testtext.setText(houseString+"\n"+bikeString+"\n"+dumpString+"\n"+scenString+ "\nNot connecting? maybe the ip address is wrong, change it in the url above.");
	//console.log(bikeData.initialised());
	//if (!(bikeData.initialised()&&houseData.initialised()&&dumpload.initialised())){
	//if (!bikeData.initialised()){
	if (!bikeData.initialised()||!houseData.initialised()||!dumpload.initialised()){
		
		requestAnimationFrame(loadingLoop); //restart this loop 
		//do nothing while it loads the first datapoints
		//testtext.setText("Loading...");
		houseData.request();
		bikeData.request();
		dumpload.request();
		//console.log(_urlBike);
		//console.log(houseData.html[1]);
		
	}
	else {
		bikeData.detect(); //gets a list of sensors from initial data
		houseData.detect(); //gets a list of sensors from initial data
		//dumpload.detect(); //gets a list of sensors from initial data
		//Chart1=new barGraph(bikeData.numsens,chartpos);
		//setupMeter([10,10,50,150]);
		//Chart1.update([0,1,2,3,4,5,6,7,8,9,10,11],10)
		//requestAnimationFrame(animationLoop); //start the main animation loop
		if (dayEnabled==true){requestAnimationFrame(animationLoop);}
		else{requestAnimationFrame(waitingLoop);}
		
		console.log(bikeData.html[0]);
		counter=1;
		calculatePower();
		if (scenarioTXT==undefined){scenarioTXT="failed"; console.log("scenario file doesn't  ");}
		if (scenarioTXT!="failed") {getScenario(); setTimeout(function(){getScenario()},3000);}
		//a=window.open("./PPbird-newLib/src/index.html");
		//bike3.next();
		houseTimer=(new Date());
		//console.log(appliancesSC.length);
		
	}
	
	renderer.render(stage);
	
	
}


function waitingLoop(){  //loop for when not got the simulation running, 

	renderer.render(stage);
	
	if (dayEnabled==true){requestAnimationFrame(animationLoop);}
	else{requestAnimationFrame(waitingLoop);}
}

function animationLoop() {
	
	if ((new Date())-timeRecur>timeRecur2){
	timeRecur=(new Date());
	calculatePower();
	}
	
	bikeData.detect();
	
	Chart2.setmaxmin(powerList,powerList[0].length,Math.max(powerList[0].length-200,0));
	Chart2.update(powerList,powerList[0].length,Math.max(powerList[0].length-200,0));
	
	//console.log(Chart2.maxy);
	//console.log(Chart2.miny);
	//console.log(Chart2.maxx);
	//console.log(Chart2.minx);
	
	Chart3.setmaxmin(bikeList,bikeList[0].length-3,Math.max(bikeList[0].length-200,0));
	Chart4.setmaxmin(bikeList2,bikeList2[0].length-3,Math.max(bikeList2[0].length-200,0));
	
	
	Chart4.minx=Math.min(Chart4.minx,Chart3.minx);
	Chart3.minx=Math.min(Chart4.minx,Chart3.minx);
	Chart4.miny=Math.min(Chart4.miny,Chart3.miny);
	Chart3.miny=Math.min(Chart4.miny,Chart3.miny);
	Chart4.maxx=Math.max(Chart4.maxx,Chart3.maxx);
	Chart3.maxx=Math.max(Chart4.maxx,Chart3.maxx);
	Chart4.maxy=Math.max(Chart4.maxy,Chart3.maxy);
	Chart3.maxy=Math.max(Chart4.maxy,Chart3.maxy);//setting max min to be the same for both bikes
	
	Chart3.update(bikeList,bikeList[0].length-3,Math.max(bikeList[0].length-200,0));
	Chart4.update(bikeList2,bikeList2[0].length-3,Math.max(bikeList2[0].length-200,0));
	
	
	
	
	houseData.request();
	bikeData.request();
	logo.scale.set(0.5,0.5);
	logo.x=renderer.width/2;
	logo.y=renderer.height/2;
	logo.anchor.set(0.5,0.5);
	
	logo.pivot.set(200,0);
	
	level+=0.01;
	
	thing.clear();
	thing.beginFill(RGB2HTML(0,255,2));
	thing.moveTo(18,25);
	thing.arc(18,25,60,0,level,false);
	thing.moveTo(18,25);
	thing.endFill();
	
	//values=bikeData.dataArray();
	//values=bike3.dataArray[0];	
	
	//Chart1.update(values,30);
	
	//Chart1.changeBars(bikeData.numsens,chartpos,values,30);
	//Chart1.detailBars(bikeData.numsens,chartpos,values,bikeData.namesens);
	
	//testtext.setText("ping: "+ String(houseData.lasttimer)+"\n"+
	//String((new Date())-houseData.timer0+houseData.timer2)+
	//"\ncounter: "+houseData.namesens[1]);
	
	//houseTimer in real ms, want xmins=yhours house time y*60 <-- x*60*1000
	var HouseTimeH=Math.floor(((new Date())-houseTimer)/scRealT/1000*scTime/60+2)%24;
	var HouseTimeM=Math.floor((((new Date())-houseTimer)/scRealT/1000*scTime)%60);
	testtext.setText(("00" + String(HouseTimeH)).slice(-2)+":"+("00" + String(HouseTimeM)).slice(-2));
	
	powerFactor=1;
	
	if (dayEnabled==true){requestAnimationFrame(animationLoop);}
	else{requestAnimationFrame(waitingLoop);}
	renderer.render(stage);
	
}


function setResistance(number){
	
	var theURL="http://" + _urlDump +"/Set?";
	theURL+="Duty="+String(parseInt(number));
	$.get(theURL,{},function(response,stat){},"text");
	  
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
	powerList[0].push(steps);
	bikeList[0].push(steps);
	bikeList2[0].push(steps);
	steps++;
	bikeList[1].push(parseInt(getData(bikeData,"Voltage 3: "))*parseInt(getData(bikeData,"Current 3: ")));
	bikeList[1][bikeList[1].length-2]+=(parseInt(getData(bikeData,"Voltage 4: "))*parseInt(getData(bikeData,"Current 4: ")));
	bikeList[1][bikeList[1].length-3]+=(parseInt(getData(bikeData,"Voltage 4: "))*parseInt(getData(bikeData,"Current 4: ")));
	bikeList[1][bikeList[1].length-4]+=(parseInt(getData(bikeData,"Voltage 4: "))*parseInt(getData(bikeData,"Current 4: ")));
	
	bikeList2[1].push(parseInt(getData(bikeData,"Voltage 2: "))*parseInt(getData(bikeData,"Current 2: ")))/8;
	bikeList2[1][bikeList2[1].length-2]+=(parseInt(getData(bikeData,"Voltage 2: "))*parseInt(getData(bikeData,"Current 2: ")))/8;
	bikeList2[1][bikeList2[1].length-3]+=(parseInt(getData(bikeData,"Voltage 2: "))*parseInt(getData(bikeData,"Current 2: ")))/8;
	bikeList2[1][bikeList2[1].length-4]+=(parseInt(getData(bikeData,"Voltage 2: "))*parseInt(getData(bikeData,"Current 2: ")))/8;
	
	
	//bikeList[1].push(bikeData.data(2)*bikeData.data(8)+bikeData.data(3)*bikeData.data(9));
	//steps++;
	powerList[1].push(powerNow);
	//console.log(parseInt(getData(bikeData,"Voltage 3: ")));
	sumPower();
}


var powerNow=1;
powerTimer=new Date();
totalE=0;
totalCatE=new Array(devCategories.length)
for (var i=0;i<devCategories.length;i++){totalCatE[i]=0;}

function sumPower(){
	
	totalE+=(powerTimer-(new Date()))*powerNow;
	
	for (var i=0;i<devCategories.length;i++){
		totalCatE[i]+=(powerTimer-(new Date()))*catPower[i];

	}
	powerTimer=new Date();
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

PIXI.Sprite.prototype.bringToFront = function() {	if (this.parent) {		var parent = this.parent;		parent.removeChild(this);		parent.addChild(this);	}}
//http://www.html5gamedevs.com/topic/7507-how-to-move-the-sprite-to-the-top/
function movingAv(input, number){

	number=parseInt(number) //incase it isn't already an integer
	if (number<2) return input;  //makes no sense to have an average of less than 2 points
	var output=[];
	for (var i=0;i<(input.length-number+1);i++){
		output.push(input[i])
		for (var j=1;j<(number);j++){
			output[i]+=input[i+j];
		}
		output[i]=output[i]/number;
	}
	return output;  //has length of input-mov average amount +1
	
}