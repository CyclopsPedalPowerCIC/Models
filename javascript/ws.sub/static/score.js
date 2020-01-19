function get_orb_colour(obj) {
    var value = null;
    //console.log(obj);
    if (obj && obj[metrics[metric]] !== null) {
	value = obj[metrics[metric]];
	if (!isFinite(value)) value = null;
	else {
	    //value = 2 * (value - 1); // map from 1-5 to 0-8
	    value += 4; // map from -5-5 to 0-8
	    if (value < 0) value = 0;
	    if (value > 8) value = 8;
	    value *= 2;
	    value |= 0;
	}
    }
    //console.log(`value=${value}`);
    //value goes from 0-8
    var orb_colours = [
	//modified version to make the real life colours better (no blue, more full saturated r/g
	0xe00000,
	0xf00000,
	0xff4000,
	0xff6000,
	0xff8000,
	0xffa000,
	0xffc000,
	0xffd000,
	0xffe700,
	0xfff400,
	0xffff00,
	0xe0ff00,
	0xc2ff00,
	0xa0ff00,
	0x79ff00,
	0x40ff00,
	0x00ff00
    ];
    //console.log(`orb ${value}`);
    var rgb = value === null ? 0x000000 : orb_colours[value];
    return rgb;
}

function format_score(s) {
    if (!isFinite(s)) return "???";
    s=s.toFixed(2);
    if (s>0) return "+"+s;
    return s;
}

function score_adjust(s) {
    //if (s<0) return -score_adjust(-s);
    //if (s>game.score_max) s=game.score_max;
    //return Math.pow(s/game.score_max,game.nonlinearity)*game.score_max;
    return Math.atan(s/game.score_max/game.nonlinearity)*game.score_max;
}

function score_tiles(tiles) {
    var problems = [];
    var mc = {total:[]}; // calculated metrics
    var mt = {};
    var counts = {};

    for (let obj of tiles) {
	if (!obj) continue;
	for (let m of Object.keys(obj)) {
	    if (m=="name") continue;
	    //console.log(`adding ${i}`);
	    var p=m;
	    do {
		if (!mc[p])
		    mc[p] = [];
		mc[p].push(obj[m]);
	    } while (p = game.parents[p]);
	    mc.total.push(obj[m]);
	}
    }

    for (let m of Object.keys(mc)) {
	var t=0;
	for (let i of mc[m]) {
	    t += i;
	}
	console.log(t);
	//t /= mc[m].length;
	t = score_adjust(t);
	mt[m] = t;
    }
    
/*    
    var str = "";
    for (let m of metrics) {
	if (counts[m]) {
	    mc[m] /= counts[m]; // average
	} else {
	    mc[m] = 0; // neutral
	}
	total += score_adjust(mc[m]);

	//str += `${m}: ${mc[m].toFixed(2)} `;
	//console.log(`val_${m}`);
	//gebi(`val_${m}`).innerHTML= format_score(mc[m]);
    }
    total /= metrics.length;
    //gebi(`val_total`).innerHTML=total.toFixed(2);
    //str += `total: ${total.toFixed(2)}`;
    //set_happiness("total", total);    
   */ 
    return mt;
}
