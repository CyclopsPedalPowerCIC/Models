//function for bar graph object, works but needs neatening up! 08/11/17


function barGraph(stage, number,chartDims,color){
	if (chartDims.length==4){
	this.bars=["",""];
	this.bardet=["",""];
	
	this.nbars=number;
	this.color=color;
	this.size=chartDims;
	setupBars(stage, this);
	
	this.update=function(heights, max){changeBars(this, heights, max);};
	this.detail=function(heights, names){detailBars(this, heights, names);};
	}
	else {console.log("Could not create bar chart, wrong inputs");}
}


function setupBars(stage, chart){
	var i;
	var padding=0.1; //percentage of white space around bars
	number=chart.nbars;
	chartDims=chart.size;
	var texture = new PIXI.RenderTexture(renderer, 10, 10);
	var graphics = new PIXI.Graphics();
	//graphics.beginFill(0xFF3000);
	graphics.beginFill(chart.color);
	graphics.drawRect(0, 0, 10, 10);
	graphics.endFill();
	texture.render(graphics);
	
	for (i=0;i<number;i++){
		chart.bars[i]= new PIXI.Sprite(texture); 
		chart.bardet[i]=new PIXI.Text(' ');
		stage.addChild(chart.bars[i]);
		stage.addChild(chart.bardet[i]);
		//console.log(i);	
		chart.bars[i].position.set(chartDims[0]+chartDims[2]*(i/number+1/number*padding),(chartDims[3]*0.9+chartDims[1]))
		chart.bars[i].width=(chartDims[2]/number*(1.0-2.0*padding))
		chart.bars[i].height=(chartDims[3]*0.1);
	}

	
}

function changeBars(chart, heightsIn, max){
	var padding=0.1;
	heights=heightsIn;
	number=chart.nbars;
	chartDims=chart.size;
	for (i=0;i<number;i++){
		heights[i]=Math.min(heights[i], max);	
		chart.bars[i].position.set(chartDims[0]+chartDims[2]*(i/number+1/number*padding),(chartDims[3]*(1-heights[i]/max-0.01)+chartDims[1]))
		chart.bars[i].width=(chartDims[2]/number*(1.0-2.0*padding))
		chart.bars[i].height=(chartDims[3]*(heights[i]/max+0.01));
	}	
}



function detailBars(chart, heights, names){
	var padding=0.1;
	var tempstr;
	number=chart.nbars;
	chartDims=chart.size;
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
		chart.bardet[i].setText(names[i]+tempstr);
		
		chart.bardet[i].rotation=3.14*3/2;
		chart.bardet[i].position.set(chartDims[0]+chartDims[2]*(i/number+0/number*padding),(chartDims[3]*(1.0)+chartDims[1]))
		chart.bardet[i].height=(chartDims[2]/number*(1.0-0*padding))
		chart.bardet[i].width=(chartDims[3]*(0.8));
	}	
}

function RGB2HTML(red, green, blue)
{
	blue= constrain(blue ,0,255); //constrain variables to [0,255]
	red=  constrain(red  ,0,255);
	green=constrain(green,0,255);
    var decColor =0x1000000+ blue + 0x100 * green + 0x10000 *red ;
    //console.log('0x'+decColor.toString(16).substr(1));
	return '0x'+decColor.toString(16).substr(1);
}

function constrain(input, min, max){
	
	return Math.floor(Math.min(Math.max(input ,min),max));
	
}
