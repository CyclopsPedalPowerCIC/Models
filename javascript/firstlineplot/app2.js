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

	
	
var chartpos=[150,150,320,320];	
	
var testdata = [[0,1],[1,3]];

function setup() {
	
	for (var i=0;i<200;i++){
		testdata[0][i]=i/10;
		testdata[1][i]=Math.sin(i/10);
		//console.log(testdata[1][i]);
		
	}
	Chart2=new linePlot(stage,chartpos);
	Chart2.setmaxmin(testdata);
	Chart2.update(testdata,150);
	loadingLoop();
	
}	

tempindex=0;

function loadingLoop() {
	
	tempindex=(tempindex+1)%200;
	
    Chart2.setmaxmin(testdata,tempindex);
	Chart2.update(testdata,tempindex);
	
	requestAnimationFrame(loadingLoop); //restart this loop 
	
	renderer.render(stage);
	
	
}

