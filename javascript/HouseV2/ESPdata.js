//code for ESPdata object, that communicates with a Cyclops esp8211 and returns gets data
//
//
//


function ESPdata(url){
	
	this.counter=1; //when counter = 0 html[0] most recently updated data 
	this.html = ["",""];  //array holds current and past data
	this.espurl = url;
	//this.espurl = "http://192.168.0.62/Data";
	this.timer=new Date;
	this.timer2=0;
	this.timelimit =3000; //time after which to give up on on esp reponse and try again
	this.lasttimer=0;
	this.numsens=0;
	this.autoRequest=false;
	this.autoTimer=50;
	
	this.initialised=function(){if((((this.html[0]=="")&&(this.html[1])==""))||(((this.html[0]==undefined)&&(this.html[1])==undefined))){return false;}else {return true;}};
	this.namesens=["",""];//array to store names of each sensor
	this.detect=function(){detectSensors(this);};
	this.data=function(number) {return getData(this, this.namesens[number]);};
	this.dataArray=function() {return allData(this);};
	
	this.startAuto=function() {autoRequest(this);};
	this.request=function() {nextData(this);};
	this.requestNow=function() {dataNow(this);};
	this.load=function() {loadData(this);};
	
	this.request(); //does an initial data request
}


function detectSensors(espdata){
	var tempc;
	var currentpos=0;
	var endpos=0;
	var senscount=0; 
	//automatically run through the html string and extract all sensors given
	//and their names, names are stored to namesens array
	
	if (espdata.html[espdata.counter]!=""||espdata.html[espdata.counter]!=undefined){
		tempc=espdata.counter;
	}
	else if (espdata.html[(espdata.counter+1)%2]!=""||espdata.html[(espdata.counter+1)%2]!=undefined){
		tempc=((espdata.counter+1)%2);
	}
	
	while ((currentpos=espdata.html[tempc].substring(endpos).search(/[\d\.]{1,}\n/))>1){
	currentpos+=endpos;
	espdata.namesens[senscount]=espdata.html[tempc].substring(endpos,currentpos);
	senscount++;
	endpos=currentpos+1+espdata.html[tempc].substring(currentpos).search(/\n/);
	}
	espdata.numsens=senscount;
	
	
}

function allData(espdata){  //function to return all data as an array
	data=["",""];
	for (var i=0;i<espdata.numsens;i++){
		data[i]=espdata.data(i);
	}
	return data;
}

function getData(espdata,name){ //gets data already downloaded data string
	var tempc=0;
	var rString="";
	var loc=0;
	//find the most recent data for number
	if (espdata.html[espdata.counter]!=""){
		tempc=espdata.counter;
	}
	else if (!(espdata.html[(espdata.counter+1)%2]==""||espdata.html[(espdata.counter+1)%2]==undefined||"")){
		tempc=((espdata.counter+1)%2);
	}
	
	loc=(espdata.html[tempc]).indexOf(name)+name.length;
	
	rString = (espdata.html[tempc]).substr(loc,5).match(/[\d\.]{1,}/); //removes non numeric elements
	return rString;
}

function autoRequest(espdata){
	
	if (espdata.autoRequest) {nextData(espdata);}
	setTimeout(function(){autoRequest(espdata);},espdata.autoTimer);
	
}

function nextData(espdata){
	if (!(espdata.html[(espdata.counter+1)%2]=="")||(espdata.html[(espdata.counter+1)%2]==undefined)){
		//checks that the other html has loaded so that a valid html still exists
		loadData(espdata,espdata.espurl,espdata.counter);
		
		espdata.lasttimer=espdata.timer2;
		espdata.timer2=0;
		espdata.counter=(espdata.counter+1)%2; //increment counter
	}
	else if ((new Date())-espdata.timer>espdata.timelimit){
		espdata.counter=(espdata.counter+1)%2; //it failed last time so reset counter and try again
		loadData(espdata,espdata.espurl,espdata.counter);
		espdata.counter=(espdata.counter+1)%2; //increment counter
	}
}

function dataNow(espdata){//onyl to be used at the beginning ideally
	
	
		espdata.counter=(espdata.counter+1)%2; //reset counter and try again
		loadData(espdata,espdata.espurl,espdata.counter);
		espdata.counter=(espdata.counter+1)%2; //increment counter
	
}

function loadData(espdata,theURL,i)
{
	espdata.html[i]="";
	$.get(theURL,{},function(response,stat){
	espdata.html[i]=response;
},"text");
	espdata.timer2+=(new Date())-espdata.timer;
	espdata.timer=new Date();
}




function recordData(ESPobject,Vinput,Iinput){//records voltage and current (and therefore power) for a single bike
	this.source=[ESPobject,Vinput,Iinput];
	this.timeOut=1000;
	this.totalPoints=0;
	this.maxPoints=12;
	this.currentPoint=0;
	this.max=[0,0,0];
	this.min=[0,0,0];
	this.average=[0,0,0];
	this.totalE=0;
	this.startTime=new Date();
	this.lastTime=0;
	this.last=[0,0,0,0];
	this.dataArray=[[0,0],[0,0],[0,0],[0,0]];//four arrays of V, I and W and t
	this.request=true;
	this.recordAll=true;

	this.clear=function(){clearData(this)};
	this.next=function(){readNext(this)};
	console.log("record started")
	//setTimeout(this.next,this.timeOut);	
}

function dataToV(input){ //in case data doesn't come correctly adjusted
	
	return input;
	
}
	
function dataToI(input){
	
	return input;
	
}
		
	
function readNext(dataObj){//function that keeps running to record the values that are got from the esp
	//console.log(dataObj.currentPoint);
	setTimeout(function(){dataObj.next();},dataObj.timeOut)//next iteration...
	if (dataObj.request) {
		dataObj.source[0].request();
	}
	//console.log(dataObj.totalPoints);
	dataObj.last[0]=parseFloat(dataToV(dataObj.source[0].data(dataObj.source[1]))); //V
	dataObj.last[1]=parseFloat(dataToI(dataObj.source[0].data(dataObj.source[2]))); //I   
	dataObj.last[2]=dataObj.last[1]*dataObj.last[0];   								//W
	dataObj.last[3]=new Date()-dataObj.startTime;	   								//t
		
	dataObj.totalE+=Math.abs(dataObj.last[2]*(dataObj.last[3]-dataObj.lastTime))/1000; //energy in joules
	console.log(String(dataObj.last[2])+'   '+String((dataObj.last[3]-dataObj.lastTime))+'   '+String(dataObj.last[1])+'   '+String(dataObj.last[0]));

	dataObj.lastTime=new Date()-dataObj.startTime;
	if (dataObj.last[0]<dataObj.min[0]){dataObj.min[0]=dataObj.last[0];}
	if (dataObj.last[1]<dataObj.min[1]){dataObj.min[1]=dataObj.last[1];}
	if (dataObj.last[2]<dataObj.min[2]){dataObj.min[2]=dataObj.last[2];}
	if (dataObj.last[0]>dataObj.max[0]){dataObj.max[0]=dataObj.last[0];}
	if (dataObj.last[1]>dataObj.max[1]){dataObj.max[1]=dataObj.last[1];}
	if (dataObj.last[2]>dataObj.max[2]){dataObj.max[2]=dataObj.last[2];}
	
	if(dataObj.recordAll==false){//loops around and overwrites data
	
		recordPointLoop(dataObj);
	}
	else{//compacts data when gets to maximum and continues
		
		recordPointAll(dataObj);
	}
}

function recordPointLoop(dataObj){
	
		//console.log(dataObj.last);
		//console.log(dataObj.average[0]);
		//if (isNaN(dataObj.average[0])){dataObj.average[0]=dataObj.last[0];}//something messy going on with average function...
		//console.log(dataObj.average[0]);

		if (dataObj.totalPoints<dataObj.maxPoints){ //set average values...
			dataObj.average[0]=(dataObj.average[0]*dataObj.currentPoint+dataObj.last[0])/(dataObj.currentPoint+1);	
			dataObj.average[1]=(dataObj.average[1]*dataObj.currentPoint+dataObj.last[1])/(dataObj.currentPoint+1);
			dataObj.average[2]=(dataObj.average[2]*dataObj.currentPoint+dataObj.last[2])/(dataObj.currentPoint+1);
		}
		else {
			dataObj.average[0]=(dataObj.average[0]*dataObj.maxPoints+dataObj.last[0]-dataObj.dataArray[0][dataObj.currentPoint])/(dataObj.maxPoints);
			dataObj.average[1]=(dataObj.average[1]*dataObj.maxPoints+dataObj.last[1]-dataObj.dataArray[1][dataObj.currentPoint])/(dataObj.maxPoints);
			dataObj.average[2]=(dataObj.average[2]*dataObj.maxPoints+dataObj.last[2]-dataObj.dataArray[2][dataObj.currentPoint])/(dataObj.maxPoints);	
		}
		
		dataObj.dataArray[0][dataObj.currentPoint]=dataObj.last[0];
		dataObj.dataArray[1][dataObj.currentPoint]=dataObj.last[1];
		dataObj.dataArray[2][dataObj.currentPoint]=dataObj.last[2];
		dataObj.dataArray[3][dataObj.currentPoint]=dataObj.last[3];
		
	//console.log(dataObj.average[0]);
	
	dataObj.currentPoint=(dataObj.currentPoint+1)%dataObj.maxPoints;
	dataObj.totalPoints++;
	
}


function recordPointAll(dataObj){
	
	if (dataObj.totalPoints<(dataObj.maxPoints-1)){
		recordPointLoop(dataObj);
		return;
	}
	else {
		if (dataObj.currentPoint==dataObj.maxPoints){
			//compress the data by half
		for (var i=0;i<dataObj.maxPoints/2;i++){
			dataObj.dataArray[0][i]=dataObj.dataArray[0][i*2];
			dataObj.dataArray[1][i]=dataObj.dataArray[1][i*2];
			dataObj.dataArray[2][i]=dataObj.dataArray[2][i*2];

			
		}
		for (var i=0;i<dataObj.maxPoints/2;i++){

			dataObj.dataArray[0][i+dataObj.maxPoints/2]=0;
			dataObj.dataArray[1][i+dataObj.maxPoints/2]=0;
			dataObj.dataArray[2][i+dataObj.maxPoints/2]=0;
			
		}
		dataObj.currentPoint=i;
		}
		else
			var compression=0;
			while (Math.pow(2,(compression))<dataObj.totalPoints/dataObj.maxPoints){compression++;}
				//results in 2^1 if data is compressed one, 2^5 if it was compressed 5 times already
			console.log(compression);	
		if (dataObj.totalPoints%Math.pow(2,(compression))==0){//record point only 2nd/4th/8th etc point after each compression
			
			
			
			dataObj.dataArray[0][dataObj.currentPoint]=dataObj.last[0];
			dataObj.dataArray[1][dataObj.currentPoint]=dataObj.last[1];
			dataObj.dataArray[2][dataObj.currentPoint]=dataObj.last[2];
			dataObj.dataArray[3][dataObj.currentPoint]=dataObj.last[3];
			
			
			dataObj.currentPoint++;
			
		}
		dataObj.average[0]=(dataObj.average[0]*dataObj.totalPoints+dataObj.last[0])/(dataObj.totalPoints+1);
		dataObj.average[1]=(dataObj.average[1]*dataObj.totalPoints+dataObj.last[1])/(dataObj.totalPoints+1);
		dataObj.average[2]=(dataObj.average[2]*dataObj.totalPoints+dataObj.last[2])/(dataObj.totalPoints+1);	
			
		dataObj.totalPoints++;
	}
	
			
}

//record data object:
//
//inputs: data1(V) data2(A)
//time to poll (0= don't but monitor changes?)
//num of points to keep
//mode: most recent or total points
//
//total
//max
//min
//average
//array of points
//t between points
//current point
//reset