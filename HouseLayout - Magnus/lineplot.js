

function linePlot(pixistage,chartDims){
	if (chartDims.length==4){
	this.color=0x00ff3f;  //set this to something that cyles through basic colors for each new graph
	this.stage=pixistage;
	this.miny=0;
	this.maxy=10; //default
	this.minx=0;
	this.maxx=10; //default
	
	this.size=chartDims;
	this.axesState=3; //0=none, 1=lines only, 2=lines+tickes, 3=including numbers
	
	this.tickLength=20;
	this.line;
	this.axes;
	this.axesTicks;
	this.totalTicks=5;
	this.axesLabels=[[0,0],[0,0]];
	line_setup(this);
	this.setmaxmin=function(heights,length){line_setMaxMin(this, heights,length);};
	this.checkmaxmin=function(heights,length){line_checkMaxMin(this, heights, length);};
	this.update=function(heights, length){line_change(this, heights, length);};
	//this.detail=function(heights, names){detailLine(this, heights, names);};
	}
	else {console.log("Could not create bar chart, wrong inputs");}
}

function line_setup(chart){
	
	chart.line = new PIXI.Graphics();
	chart.stage.addChild(chart.line);
	chart.line.position.set(chart.size[0],chart.size[1]);
	chart.axes = new PIXI.Graphics();
	chart.stage.addChild(chart.axes);
	chart.axes.position.set(chart.size[0],chart.size[1]);
	//console.log(chart.totalTicks);
	for (var i=0;i<chart.totalTicks;i++){
	chart.axesLabels[0][i]=new PIXI.Text("",{fontSize : (chart.size[3]-chart.size[1])/10});
	chart.axesLabels[1][i]=new PIXI.Text("",{fontSize : (chart.size[3]-chart.size[1])/10});
	chart.stage.addChild(chart.axesLabels[0][i]);
	chart.stage.addChild(chart.axesLabels[1][i]);
	}
	//chart.axesLabels[0][0].setText("Hi");

}

function line_setMaxMin(chart, heights,length){
	
	
	
	
	mm=line_checkMaxMin(chart, heights, length);
	chart.minx=mm[0];
	chart.miny=mm[1];
	chart.maxx=mm[2];
	chart.maxy=mm[3];
	
}

function line_checkMaxMin(chart, heights, length){
	
	if (length>0){} else {length=heights[0].length;}//if invalid length then calculate manually
	mm=[heights[0][0],heights[1][0],heights[0][0],heights[1][0]]; //minx miny maxx maxy
	
	for (var i=1;i<length;i++){
		
		if (heights[0][i]>mm[2]) {mm[2]=heights[0][i];}
		if (heights[0][i]<mm[0]) {mm[0]=heights[0][i];}
		if (-heights[1][i]>mm[3]) {mm[3]=-heights[1][i];}
		if (-heights[1][i]<mm[1]) {mm[1]=-heights[1][i];}
		
		//console.log(i);
		
	}
	
	return mm;
}

function line_calculateTicks(chart){
	
	axes_labels=[[0,0],[0,0]];
	
	scalex=Math.floor(Math.log10(chart.maxx-chart.minx));
	scaley=Math.floor(Math.log10(chart.maxy-chart.miny));
	
	
	
	//console.log((chart.maxx-chart.minx)*Math.pow(10,-scale));
	
	axes_labels[0][0]=			 Math.floor  (chart.minx*Math.pow(10,-scalex)*2)*Math.pow(10,scalex)/2;
	axes_labels[0][chart.totalTicks-1]=Math.ceil(chart.maxx*Math.pow(10,-scalex)*2)*Math.pow(10,scalex)/2;
	axes_labels[1][0]=			 Math.floor  (chart.miny*Math.pow(10,-scaley)*2)*Math.pow(10,scaley)/2;
	axes_labels[1][chart.totalTicks-1]=Math.ceil(chart.maxy*Math.pow(10,-scaley)*2)*Math.pow(10,scaley)/2;
	
	for (var i=1;i<chart.totalTicks-1;i++){
		
		axes_labels[0][i]=((axes_labels[0][chart.totalTicks-1]-axes_labels[0][0])/(chart.totalTicks-1)*i);
		axes_labels[1][i]=((axes_labels[1][chart.totalTicks-1]-axes_labels[1][0])/(chart.totalTicks-1)*i);
	}
	//console.log(chart.minx);
	//console.log(chart.maxx);
	
	//console.log(axes_labels[0]);
	//console.log(chart.miny);
	//console.log(chart.maxy);
	//console.log(axes_labels[1]);
	
	chart.maxx=axes_labels[0][chart.totalTicks-1];
	chart.minx=axes_labels[0][0];
	chart.maxy=axes_labels[1][chart.totalTicks-1];
	chart.miny=axes_labels[1][0];
	
	
	chart.axesTicks = axes_labels;
}

function line_calculateTicks1(chart){ //version where tries to match middle ticks to whole numbers, not good idea
	
	axes_labels=[[0,0],[0,0]];
	
	scalex=Math.floor(Math.log10(chart.maxx-chart.minx));
	scaley=Math.floor(Math.log10(chart.maxy-chart.miny));
	
	
	
	//console.log((chart.maxx-chart.minx)*Math.pow(10,-scale));
	
	axes_labels[0][0]=			 Math.floor  (chart.minx*Math.pow(10,-scalex)*2)*Math.pow(10,scalex)/2;
	axes_labels[0][chart.totalTicks-1]=Math.ceil(chart.maxx*Math.pow(10,-scalex)*2)*Math.pow(10,scalex)/2;
	axes_labels[1][0]=			 Math.floor  (chart.miny*Math.pow(10,-scaley)*2)*Math.pow(10,scaley)/2;
	axes_labels[1][chart.totalTicks-1]=Math.ceil(chart.maxy*Math.pow(10,-scaley)*2)*Math.pow(10,scaley)/2;
	
	for (var i=1;i<chart.totalTicks-1;i++){
		
		axes_labels[0][i]=Math.floor((axes_labels[0][chart.totalTicks-1]-axes_labels[0][0])*Math.pow(10,-scalex+1)/(chart.totalTicks-1)*i)*Math.pow(10,scalex-1);
		axes_labels[1][i]=Math.floor((axes_labels[1][chart.totalTicks-1]-axes_labels[1][0])*Math.pow(10,-scaley+1)/(chart.totalTicks-1)*i)*Math.pow(10,scaley-1);
	}
	//console.log(chart.minx);
	//console.log(chart.maxx);
	
	//console.log(axes_labels[0]);
	//console.log(chart.miny);
	//console.log(chart.maxy);
	//console.log(axes_labels[1]);
	
	chart.maxx=axes_labels[0][chart.totalTicks-1];
	chart.minx=axes_labels[0][0];
	chart.maxy=axes_labels[1][chart.totalTicks-1];
	chart.miny=axes_labels[1][0];
	
	
	chart.axesTicks = axes_labels;
}

function line_axes(chart){
	
	if (chart.axesState>0){
	chart.axes.clear();
	chart.axes.lineStyle(3,0x000000)
		.moveTo(0,0)
		.lineTo(0,chart.size[3]-chart.size[1])
		.lineTo(chart.size[2]-chart.size[0],chart.size[3]-chart.size[1]);
		
	}
	
	
	if (chart.axesState>1){
		
		line_calculateTicks(chart)
		
		for (var i=0;i<chart.totalTicks;i++){
			chart.axes.moveTo(0,chart.axesTicks[1][i]*(chart.size[2]-chart.size[0])/(chart.maxy-chart.miny))
				.lineTo(-chart.tickLength,chart.axesTicks[1][i]*(chart.size[2]-chart.size[0])/(chart.maxy-chart.miny));
				
			chart.axes.moveTo(chart.axesTicks[0][i]*(chart.size[3]-chart.size[1])/(chart.maxx-chart.minx),(chart.size[2]-chart.size[0]))
				.lineTo(chart.axesTicks[0][i]*(chart.size[3]-chart.size[1])/(chart.maxx-chart.minx),(chart.size[2]-chart.size[0])+chart.tickLength);
		}
		
	}
	
	//chart.axesLabels[0][0].setText("Hi");
	//console.log(chart.axesLabels[1][0].width);
	if (chart.axesState>2){
		
		
		
		for (var i=0;i<chart.totalTicks;i++){
			var expo=Math.floor(Math.log10(chart.axesTicks[0][i]+10**(-3)))-2;
			//console.log(expo);
			chart.axesLabels[0][i].setText(Math.round(chart.axesTicks[0][i]/10**expo)*10**expo);
			chart.axesLabels[0][i].x=(chart.axesTicks[0][i]*(chart.size[3]-chart.size[1])/(chart.maxx-chart.minx)+chart.size[1]);
			chart.axesLabels[0][i].y=(chart.size[2]);
			var expo=Math.floor(Math.log10(chart.axesTicks[1][i]+10**(-3)));
			chart.axesLabels[1][i].setText(Math.round(chart.axesTicks[1][i]*100)/100);
			chart.axesLabels[1][i].x=chart.size[1]-chart.axesLabels[1][i].width-5;
			chart.axesLabels[1][i].y=chart.axesTicks[1][i]*(chart.size[2]-chart.size[0])/(chart.maxy-chart.miny)+chart.size[0];
			
		}
		
	}
	
	
}
	

function line_change(chart,heights,length){
	//console.log("Hi!");
	chart.line.clear();
	chart.line.lineStyle(5,chart.color)
		
	
	//	chart.line.lineStyle(5,0xff00ff);
	chart.line.moveTo((heights[0][0]-chart.minx)*(chart.size[3]-chart.size[1])/(chart.maxx-chart.minx),(-heights[1][0]-chart.miny)*(chart.size[2]-chart.size[0])/(chart.maxy-chart.miny))
			
	
		
	
	for (i=1;i<length;i++){
		
		chart.line.lineTo((heights[0][i]-chart.minx)*(chart.size[3]-chart.size[1])/(chart.maxx-chart.minx),(-heights[1][i]-chart.miny)*(chart.size[2]-chart.size[0])/(chart.maxy-chart.miny));
		//console.log(testdata[1][i]);
		
	}
	 //add arrow ..>
	line_arrow(chart,[(heights[0][length-2]-chart.minx)*(chart.size[3]-chart.size[1])/(chart.maxx-chart.minx),(-heights[1][length-2]-chart.miny)*(chart.size[2]-chart.size[0])/(chart.maxy-chart.miny),(heights[0][length-1]-chart.minx)*(chart.size[3]-chart.size[1])/(chart.maxx-chart.minx),(-heights[1][length-1]-chart.miny)*(chart.size[2]-chart.size[0])/(chart.maxy-chart.miny)],30);
	
	line_axes(chart);
	
}

function line_arrow(chart,points,length){
	
	var lfactor=length/Math.pow(Math.pow(points[0]-points[2],2)+Math.pow((points[1]-points[3]),2),0.5);
	//console.log(lfactor);
	//console.log(points);
	//console.log(length);
	
	//chart.line.lineStyle(5,0xff0000);
	chart.line.moveTo((points[2]+(points[1]-points[3])*lfactor+points[2]+(points[0]-points[2])*lfactor)/2,(points[3]-(points[0]-points[2])*lfactor+points[3]+(points[1]-points[3])*lfactor)/2);
	chart.line.lineTo(points[2],points[3]);
	chart.line.lineTo((points[2]-(points[1]-points[3])*lfactor+points[2]+(points[0]-points[2])*lfactor)/2,(points[3]+(points[0]-points[2])*lfactor+points[3]+(points[1]-points[3])*lfactor)/2);
	
	//points[3]-(points[1]-points[3])*lfactor
	//points[2]-(points[0]-points[2])*lfactor
	
//	chart.line.moveTo(points[0],points[1]);
//	chart.line.lineTo(points[2],points[3]);
	
	}