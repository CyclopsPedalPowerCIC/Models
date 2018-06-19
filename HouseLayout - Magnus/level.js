var block=["",""];
function setupMeter(chartDims){
	var i;
	var number=8;
	var padding=0.1; //percentage of white space around bars
	
	var texture = new PIXI.RenderTexture(renderer, 10, 10);
	var graphics = new PIXI.Graphics();
	graphics.beginFill(0xFF3000);
	graphics.drawRect(0, 0, 10, 10);
	graphics.endFill();
	texture.render(graphics);
	
	for (i=0;i<number;i++){
		block[i]= new PIXI.Sprite(texture); 
		//bardet[i]=new PIXI.Text(' ');
		stage.addChild(block[i]);
		//stage.addChild(bardet[i]);
		//console.log(i);	
		block[i].position.set(chartDims[0],(chartDims[3]*(i/number+1/number*padding)+chartDims[1]))
		block[i].width=(chartDims[2])
		block[i].height=(chartDims[3]/number*(1.0-2.0*padding));
	}

	
}

//functions to be made:
//build
//change height/value
//change size/position
//add other element e.g. goal markers
//rebuild (for major alterations)