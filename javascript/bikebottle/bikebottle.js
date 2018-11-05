function gebi(id) { return document.getElementById(id); }
var q=gebi("2");
var eta=gebi("eta");
var str='';
var made=0;
var lastmade=0;
var total=650;
var timedelta = 1;
function add() {
    made += gebi("speed").value/1000;
    var str;
    for (var i=0; i<4; i++) {
	str = made.toFixed(i);
	if (str.length == 5) break;
    }
    q.innerHTML = str;
    
}
function estimate() {
    var delta = made-lastmade;
    if (delta) {
	lastmade = made;
	var needed = total-made;
	var time=(needed/delta)*timedelta;
	var percent=(made/total*100).toFixed(2)+"%";
	var hours=(time/3600)|0, minutes=((time/60)%60)|0, seconds = (time%60)|0;
	etastr = `${hours} hours ${minutes} minutes ${seconds} seconds`;
    } else {
	etastr = "Forever.  Get pedalling!";
    }
    eta.innerHTML = etastr;
    console.log(`${percent} done ${needed} delta=${delta} time=${time}`);
}
setInterval(add,50);

setInterval(estimate,timedelta*1000);
