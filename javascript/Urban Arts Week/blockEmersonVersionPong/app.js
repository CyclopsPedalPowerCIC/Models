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



var stage = new PIXI.Container();

var style=new PIXI.TextStyle({fill: ['#FFFFFF','#FFFFFF']});

var testtext = new PIXI.Text('Basic text in pixi',style);

//testtext.color.set(0xFF0000);

//var espurl = "http://192.168.0.62/Data";
var espurl = "http://192.168.0.138";


var renderer = PIXI.autoDetectRenderer(window.innerWidth,window.innerHeight,{
	transparent: true,
	resolution: 1
});

document.getElementById("display").appendChild(renderer.view);


//could use window.innerHeight and window.innerWidth

//PIXI.loader.load(setup);






var position=[0,0,0,0];

var bikesV=[5,10];

var ballSpeed=[0,0];

var score=[0,0];

setup();
	
function setup() {
	
	
	bikeInputs=new ESPdata(espurl+"/Data");
	bike3=new recordData(bikeInputs,2,8);
	bike4=new recordData(bikeInputs,4,8);
	console.log("setup");
	

	var texture = new PIXI.RenderTexture(renderer, innerWidth,innerHeight);
	var graphics = new PIXI.Graphics();
	graphics.beginFill(0x000000);
	graphics.drawRect(0, 0, innerWidth,innerHeight);
	graphics.endFill();
	texture.render(graphics);
	block=new PIXI.Sprite(texture);
	stage.addChild(block);
	
	
	var texture2 = new PIXI.RenderTexture(renderer, 200, 500);
	var graphics2 = new PIXI.Graphics();
	graphics2.beginFill(0xFFFFFF);
	graphics2.drawRect(0, 0, 40, 200);
	graphics2.endFill();
	texture2.render(graphics2);
	block2=new PIXI.Sprite(texture2);
	stage.addChild(block2);
	
    var texture3 = new PIXI.RenderTexture(renderer, 200, 500);
	var graphics3 = new PIXI.Graphics();
	graphics3.beginFill(0xFFFFFF);
	graphics3.drawRect(0, 0, 40, 200);
	graphics3.endFill();
	texture3.render(graphics3);
	block3=new PIXI.Sprite(texture3);
	stage.addChild(block3);
	
    var texture4 = new PIXI.RenderTexture(renderer, 200, 500);
	var graphics4= new PIXI.Graphics();
	graphics4.beginFill(0xFFFFFF);
	graphics4.drawCircle(40, 40, 40 );
	graphics4.endFill();
	texture4.render(graphics4);
	ball=new PIXI.Sprite(texture4);
	stage.addChild(ball);
		
	stage.addChild(testtext);
	loadingLoop();
}	


function loadingLoop() {
	
	
	ballSpeed[0]=3;
	ballSpeed[1]=-5;
		

	
    position[0]=700;
    position[1]=150;
	
	block.position.set(0,0,0,0)//(position[0],position[1],2,);
	
	block2.position.set(100,450,200,0);
	
	block3.position.set(1400,450,200,0);
	
	ball.position.set(700,250,200,0);
	
	
	console.log("loading");
	testtext.setText("Loading... "+ String((new Date())-bikeInputs.timer));
	if (!bikeInputs.initialised()){
		
		requestAnimationFrame(loadingLoop); //restart this loop 
		bikeInputs.request();
		
	}
	else {
		bikeInputs.detect(); //gets a list of sensors from initial data
		requestAnimationFrame(animationLoop); //start the main animation loop
		testtext.setText("");
		//a=window.open("./PPbird-newLib/src/index.html");
		bike3.next();		
	}
	
	renderer.render(stage);
	
}
function animationLoop() {
	
	testtext.setText("Score: "+ score[1] +"  -  " + score[0]);
	
	bikesV[0]=parseInt(bikeInputs.data(2)[0]);
	bikesV[1]=parseInt(bikeInputs.data(3)[0]); //get the inputs from the bikes
	
	
	ball.position.set(ball.x+ballSpeed[0],ball.y+ballSpeed[1]);
	if (ball.y<0){ballSpeed[1]=-ballSpeed[1];}
	
	ball.position.set(ball.x+ballSpeed[0],ball.y+ballSpeed[1]);
	if (ball.y>innerHeight-80){ballSpeed[1]=-ballSpeed[1];}
	
	if ((ball.x>block2.x+20)&&(ball.x<block2.x+40)&&(ball.y<block2.y+120)&&(ball.y>block2.y-80)){ballSpeed[0]=-ballSpeed[0];}
	
	if ((ball.x<block3.x-60)&&(ball.x>block3.x-80)&&(ball.y<block3.y+120)&&(ball.y>block3.y-80)){ballSpeed[0]=-ballSpeed[0];}
	
	if ((ball.x<0)){
		score[0]=score[0]+1; 
		ball.x=innerWidth/2;
		ballSpeed[0]=-ballSpeed[0];
		}
	
	if ((ball.x>innerWidth+40)){
		score[1]=score[1]+1;
		ball.x=innerWidth/2;
		ballSpeed[0]=-ballSpeed[0];
		}
	
	
	//console.log(bikesV[0]);
	//console.log(bikesV[1]);
	
	//position[0]=position[0]+bikesV[0]/5;
	//position[0]=position[0]-bikesV[1]/5;

	//if(position[0]<500){testtext.setText(
	//"Player one wins!!");
	//testtext.x=650;
	//testtext.y=400;
	//}
	
	//if(position[0]>900){testtext.setText(
	//"Player two wins!!");
	//testtext.x=650;
	//testtext.y=200;
	//}
	//if(position[0]<500){testtext.setText(
	//"Player one wins!!");
	//testtext.width=400;
	//testtext.height=400
	//}
	
	//if(position[0]>900){testtext.setText(
	//"Player two wins!!");
	//testtext.width=400;
	//testtext.height=400;
	//}
	//if(position[0]>900){testtext.setText("Player two wins!!");}
//	if (position[0]>1000){position[0]=0;}
//	if (position[1]>500){position[1]=0;}
	
	
	
	block2.position.set(block2.x,innerHeight-200-bikesV[1]*20);
	
	block3.position.set(block3.x,innerHeight-200-bikesV[0]*20);
	
	//console.log("go!");
	
	requestAnimationFrame(animationLoop);
	
	bikeInputs.request();
	
	renderer.render(stage);
	
}