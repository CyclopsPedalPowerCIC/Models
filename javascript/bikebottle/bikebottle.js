function gebi(id) { return document.getElementById(id); }
var q=gebi("2");
var eta=gebi("eta");
var str='';
var made=0;
var lastmade=0;
var total=650;
var timedelta = 1;
var req_interval = 200; // ms
function req() {
    //var url = "https://sphere.chronosempire.org.uk/~HEx/tmp/bike";
    var url = "bike";
    //var url = "http://192.168.0.138/Data";
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
    made += power * req_interval / 3600 / 1000;
    console.log(`made=${made}`);
    var str;
    for (var i=0; i<4; i++) {
	str = made.toFixed(i);
	if (str.length >= 5) break;
    }
    q.innerHTML = str;
    gebi("power").innerHTML = `${(power).toFixed(1)} W`;
}

function estimate() {
    var delta = made-lastmade;
    if (delta) {
	lastmade = made;
	var needed = total-made;
	var time=(needed/delta)*timedelta;
	var percent=(made/total*100).toFixed(2)+"%";
	var hours=(time/3600)|0, minutes=((time/60)%60)|0, seconds = (time%60)|0;
	etastr = `${hours}h ${minutes}m ${seconds}s`;
    } else {
	etastr = "Forever.  Get pedalling!";
    }
    eta.innerHTML = etastr;
    console.log(`${percent} done ${needed} delta=${delta} time=${time}`);
}
//setInterval(add,50);
setInterval(req,req_interval);

// update the time remaining estimate once a second
setInterval(estimate,timedelta*1000);
