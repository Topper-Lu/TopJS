tjs.flash = {
	"classid":"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
	"codebase":"http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,28,0",
	"pluginspage":"http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash",
	"type":"application/x-shockwave-flash",
	_getArgType:function(name){
		var t;
		switch (name){
		case "classid":
		case "codebase":
		case "movie":
		case "pluginspage":
		case "type":
		case "src":
			t = 0;
			break;
		case "onafterupdate":
		case "onbeforeupdate":
		case "onblur":
		case "oncellchange":
		case "onclick":
		case "ondblClick":
		case "ondrag":
		case "ondragend":
		case "ondragenter":
		case "ondragleave":
		case "ondragover":
		case "ondrop":
		case "onfinish":
		case "onfocus":
		case "onhelp":
		case "onmousedown":
		case "onmouseup":
		case "onmouseover":
		case "onmousemove":
		case "onmouseout":
		case "onkeypress":
		case "onkeydown":
		case "onkeyup":
		case "onload":
		case "onlosecapture":
		case "onpropertychange":
		case "onreadystatechange":
		case "onrowsdelete":
		case "onrowenter":
		case "onrowexit":
		case "onrowsinserted":
		case "onstart":
		case "onscroll":
		case "onbeforeeditfocus":
		case "onactivate":
		case "onbeforedeactivate":
		case "ondeactivate":
			t = 0;
			break;
		case "width":
		case "height":
		case "id":
		case "name":
		case "tabindex":
		case "align":
		case "vspace":
		case "hspace":
		case "class":
		case "title":
		case "accesskey":
			t = 1;
			break;
		default:
			t = -1;
			break;
		}
		return t;
	},
	createFL:function(url,args){
		var o;
		if (tjs.bom.isIE && tjs.bom.isWindows && !tjs.bom.isOpera) {
			var p, t;
			o = document.createElement('object');
			o.setAttribute('classid',this["classid"]);
			o.setAttribute('codebase',this["codebase"]);
			p = document.createElement('param');
			p.setAttribute('name','movie');
			p.setAttribute('value',url);
			o.appendChild(p);
			for (var x in args) {
				t = this._getArgType(x);
				if (t > 0) {
					o.setAttribute(x,args[x]);
				} else if (t < 0) {
					p = document.createElement('param');
					p.setAttribute('name',x);
					p.setAttribute('value',args[x]);
					o.appendChild(p);
				}
			}
		} else {
			o = document.createElement('embed');
			o.setAttribute('src',url);
			o.setAttribute('pluginspage',this["pluginspage"]);
			o.setAttribute('type',this["type"]);
			for (var x in args) {
				o.setAttribute(x,args[x]);
			}
		}
		return o;
	}
};
