function gebi(id) { return document.getElementById(id); }

var code = gebi('code');

var options = {
    autoIndent: true,
    autoOpen: true,
    autoStrip: true,
    overwrite: true,
    softTabs: 2,
    replaceTab: true,
    pairs: [],//[['(', ')'], ['[', ']'], ['{', '}'], ['"'], ["'"]],
    oninput: function(q) {
	Prism.highlightElement(code);
	//console.log(q);
	var error = null;
	try {
	    block = JSON.parse (q);
	} catch (e) {
	    error = e;
	}
	gebi("error").innerHTML =
	    `JSON syntax check: <span style="font-size: 200%; color: ${error?'red':'green'}">
            ${error?"✗":"✓"}</span>`;
	do_update(error);
    },
    undoLimit: 0,
};

var misbehave;


function init_syn() {
    misbehave = new Misbehave(code, options);
    
    var pre = gebi('pre');
    pre.onclick = function() {
	code.focus();
	return false;
    }
    code.focus();
}
