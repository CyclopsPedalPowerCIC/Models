function gebi(id) { return document.getElementById(id); }
var eta=gebi("eta");
//var bgbottle=gebi("bgbottle").cloneNode();
var made=0;
var lastmade=0;
var energy1=180; // energy per recycled bottle
var energy2=650; // energy per non-recycled bottle
var co21=20; // grams co2 per recycled bottle
var co22=80; // grams co2 per non-recycled bottle
var timedelta = 1;
var req_interval = 200; // ms
var timer;
var started; // game in progress
var waiting; // waiting for pedalling to commence
var gametime = 20; // seconds
var bestpower = 0; // hi score
var recycval; // percentage recycled
var bottlespersec = 450; // UK bottle usage per second
var fakebike = true; // for testing
var bottleimage = new Image();
var multtime, multlast;
bottleimage.src = 'cokebg.png';

function go() {
    if (started || waiting) return;
    made=0;
    lastmade=0;
    waiting = true;
    gebi("final").style.display='none';
    timer = setInterval(req,req_interval);
    emptycanvas();
    update(0); // set power to zero
    estimate();
    drawtime();
}

function stop() {
    clearInterval(timer);
    started = null;
    waiting = false;
    // add an extra second to wait for outstanding responses
    setTimeout(drawstats,1000);
}

function commaify (num) {
    var num_string, i,  len, threes = [], remainders;

    num_string = num.toString();
    len = num_string.length;
    remainders = len % 3;

    if (remainders != 0)
        threes.push(num_string.substr(0, remainders));

    for (i = remainders; i < len; i += 3)
        threes.push(num_string.substr(i, 3));

    return threes.join();
}

function geteta(time,short) {
    //var percent=(made/total*100).toFixed(2)+"%";
    var days=(time/86400)|0, hours=((time/3600)%24)|0, minutes=((time/60)%60)|0, seconds = (time%60)|0;
    return  short?
	`${days ? days+"d ":" "}${hours}h ${minutes}m ${seconds}s` : `
${days ? days+" day"+(days==1?'':'s'):''}
${hours ? hours+" hour"+(hours==1?'':'s'):''}
${minutes} minute${minutes==1?'':'s'}
    `// ${seconds}${seconds==1?'':'s'}`
    ;
}

function drawstats() {
    gebi("final").style.display='block';
    var eta1 = geteta((energy1/made)*gametime);
    var eta2 = geteta((energy2/made)*gametime);
    var etaavg = geteta(total); // average based upon recycling factor
    var hi=false;
    var power = made*3600/gametime;
    var popneeded = total*bottlespersec/(made/gametime);
    if (bestpower < power) {
	bestpower = power;
	hi = true;
    }
    gebi("heading").innerHTML=hi?"Impressive Pedalling!":"Time's Up!";
    gebi("stats").innerHTML=`
    	<p>Your average power output: ${power.toFixed(1)}W.  Today's best: ${bestpower.toFixed(1)}W${hi?' (<b>that\'s you!</b>)':''}.

<p>You pedalled for ${gametime} seconds and made ${made.toFixed(3)} watt-hours of energy.

At this rate it would take ${eta2} to make a virgin plastic bottle and ${eta1} to make a recycled plastic bottle.

<p>While you were pedalling the UK used ${commaify(bottlespersec*gametime)} plastic bottles!

With ${recycval}% recycling that's ${commaify((total*bottlespersec*gametime).toFixed(0))} watt-hours of energy consumed and ${(co2*bottlespersec*gametime/1000).toFixed(0)}kg of CO<sub>2</sub> released.

    Powering the UK's bottle production would take ${commaify(popneeded|0)} people like you pedalling continuously (that's
    ${popneeded>70e6 ? "more than the UK population!)"
															      : (popneeded/70e6*100).toFixed(2)+"% of the UK population)"}.
    `;
}

function req() {
    if (fakebike) {
	update(parseFloat(gebi("speed").value/10));
	return;
    }
    //var url = "https://sphere.chronosempire.org.uk/~HEx/tmp/bike";
    //var url = "bike";
    var url = "http://192.168.0.138/Data";
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.overrideMimeType('text/plain');
    request.onload = function() {
	if (request.readyState==4)
            add(request.responseText);
    };
    request.send();
}

function add(resp) {
    var voltage=[], current=[];
    var lines=resp.split(/\n/);
    for (let e of lines) {
	var v=e.match(/Voltage (.): (.*)/);
	if (v)
	    voltage[parseInt(v[1])]=parseFloat(v[2]);
	var i=e.match(/Current (.): (.*)/);
	if (i)
	    current[parseInt(i[1])]=parseFloat(i[2]);
    }
    //console.log(voltage); console.log(current);
    var power = 0;
    for (var i=0; i<6; i++) {
	power += voltage[i]*current[i];
    }
    //made += gebi("speed").value/1000;
    //console.log(`made=${made}`);
    update(power);
}

function update(power) {
    // enforce a minimum power to start the game
    if (!started && power > 1.0) {
	started = Date.now();
	waiting = false;
	setTimeout(stop, gametime*1000);
	multtime = Date.now();
	requestAnimationFrame(multitude);
    } else if (!started) {
	power = 0;
    }
    
    made += power * req_interval / 3600 / 1000;
    
    var str;
    for (var i=0; i<4; i++) {
	str = made.toFixed(i);
	if (str.length >= 5) break;
    }
    gebi("energy").innerHTML = str;
    gebi("power").innerHTML = `${(power).toFixed(1)}W`;
}    

function estimate() {
    if (!started && !waiting) return;
    var delta = made-lastmade;
    var etastr;
    if (delta) {
	lastmade = made;
	var needed = total-made;
	etastr = geteta(needed/delta, false);//true);
    } else {
	etastr = "Forever.  Get pedalling!";
    }
    eta.innerHTML = etastr;
    //console.log(`${percent} done ${needed} delta=${delta} time=${time}`);
}

function drawtime() {
    var str='';
    var time;
    if (waiting) {
	time = gametime;
    } else {
	time = (started-Date.now())/1000+gametime;
	if (time<0) time=0;
    }
    str = `${time.toFixed(1)} seconds`;
    gebi("timer").innerHTML = str;
}

function emptycanvas() {
    var c=gebi("bottles");
    c.width = c.clientWidth;
    c.height = c.clientHeight;
    bottlewidth=9;
    bottleheight=30;
    bottlesperline = (c.width/bottlewidth)|0;
    bgx = 0;
    bgy = 0;
    //console.log(`width=${c.width} height=${c.height} bottlesperline=${bottlesperline}`);
}

function multitude() {
    var c = gebi("bottles").getContext("2d");
    if (!started) return;
    multlast = multtime;
    multtime = Date.now()
    var delta = multtime - multlast;
    var bottles = delta/1000 * bottlespersec;
    for (var i=0; i<bottles; i++) {
	c.drawImage(bottleimage, bgx*bottlewidth, bgy*bottleheight, bottlewidth, bottleheight);
	bgx++;
	if (bgx>bottlesperline) {
	    bgx=0; bgy++;
	}
    }
    //gebi("bottles").appendChild(bgbottle.cloneNode());
    requestAnimationFrame(multitude);
}

function setrecycle() {
    recycval = parseInt(gebi("recycle").value);
    gebi("recyctext").innerHTML=recycval+"%";
    total = (recycval/100) * energy1 + (1-recycval/100)*energy2;
    co2 = (recycval/100) * co21 + (1-recycval/100)*co22;
    gebi("bottleenergy").innerHTML=total.toFixed(1);
}

// update the time remaining estimate once a second
setInterval(estimate,timedelta*1000);
setInterval(drawtime,100);

gebi("button").onclick = go;
gebi("recycle").oninput = setrecycle;
setrecycle();
go();
gebi("fake").style.display=fake?'block':'none';
window.onkeypress = go;
