tjs.color = function(){
	var COLOR_3HEX = /^#[0-9a-fA-F]{3}$/;
	var COLOR_6HEX = /^#[0-9a-fA-F]{6}$/;
	var COLOR_RGB1 = /^rgb[(](\s*(([0-9])|([1-9][0-9])|(1[0-9][0-9])|(2(([0-4][0-9])|([5][0-5]))))\s*,){2}\s*(([0-9])|([1-9][0-9])|(1[0-9][0-9])|(2(([0-4][0-9])|([5][0-5]))))\s*[)]$/;
	var COLOR_RGB2 = /^rgb[(](\s*(([0-9])|([1-9][0-9])|(100))%\s*,){2}\s*(([0-9])|([1-9][0-9])|(100))%\s*[)]$/;
	var COLOR_RGBA1 = /^rgba[(](\s*(([0-9])|([1-9][0-9])|(1[0-9][0-9])|(2(([0-4][0-9])|([5][0-5]))))\s*,){3}\s*((1([.][0]+)?)|(0([.]\d+)?)|([.]\d+))\s*[)]$/;
	var COLOR_RGBA2 = /^rgba[(](\s*(([0-9])|([1-9][0-9])|(100))%\s*,){3}\s*((1([.][0]+)?)|(0([.]\d+)?)|([.]\d+))\s*[)]$/;
	//var COLOR_HSL = /^hsl[(]\s*(([0-9])|([1-9][0-9])|([1-9][0-9][0-9]))\s*(,\s*(([0-9])|([1-9][0-9])|(100))%\s*){2}[)]$/;
	//var COLOR_HSLA = /^hsla[(]\s*(([0-9])|([1-9][0-9])|([1-9][0-9][0-9]))\s*(,\s*(([0-9])|([1-9][0-9])|(100))%\s*){2},\s*((1([.][0]+)?)|(0([.]\d+)?)|([.]\d+))\s*[)]$/;
	var COLOR_MAP = {
		black: {r:0,g:0,b:0},
		gray: {r:0x80,g:0x80,b:0x80},
		silver: {r:0xc0,g:0xc0,b:0xc0},
		white: {r:0xff,g:0xff,b:0xff},
		red: {r:0xff,g:0,b:0},
		maroon: {r:0x80,g:0,b:0},
		lime: {r:0,g:0xff,b:0},
		green: {r:0,g:0x80,b:0},
		blue: {r:0,g:0,b:0xff},
		navy: {r:0,g:0,b:0x80},
		yellow: {r:0xff,g:0xff,b:0},
		olive: {r:0x80,g:0x80,b:0},
		fuchsia: {r:0xff,g:0,b:0xff},
		purple: {r:0x80,g:0,b:0x80},
		aqua: {r:0,g:0xff,b:0xff},
		teal: {r:0,g:0x80,b:0x80},
		orange: {r:0xff,g:0xa5,b:0}
	};
	var _parseColor1 = function(s,o) {
		var a,i,c,v;
		if (COLOR_RGB1.test(s)) {
			a = s.substr(4,s.length - 1).split(',');
			for (i = 0; i < 3; i++) {
				a[i] = parseInt(a[i].trim(),10);
			}
			o.r = a[0];
			o.g = a[1];
			o.b = a[2];
			o.a = 1;
			tjs.lang.destroyArray(a);
		} else if (COLOR_6HEX.test(s)) {
			c = parseInt(s.substr(1),16);
			o.r = (c & 0xff0000) >>> 16;
			o.g = (c & 0x00ff00) >>> 8;
			o.b = (c & 0x0000ff);
			o.a = 1;
		} else if (COLOR_3HEX.test(s)) {
			c = parseInt(s.substr(1),16);
			v = (c & 0xf00) >>> 8;
			o.r = v + (v << 4);
			v = (c & 0x0f0) >>> 4;
			o.g = v + (v << 4);
			v = (c & 0x00f);
			o.b = v + (v << 4);
			o.a = 1;
		} else if (s in COLOR_MAP) {
			var m = COLOR_MAP[s];
			o.r = m.r;
			o.g = m.g;
			o.b = m.b;
			o.a = 1;
		} else if (COLOR_RGBA1.test(s)) {
			a = s.substr(5,s.length - 1).split(',');
			for (i = 0; i < 3; i++) {
				a[i] = parseInt(a[i].trim(),10);
			}
			a[3] = parseFloat(a[3].trim());
			o.r = a[0];
			o.g = a[1];
			o.b = a[2];
			o.a = a[3];
			tjs.lang.destroyArray(a);
		} else {
			o = null;
		}
		return o;
	};
	var _parseColor2 = function(s,o) {
		var a,i;
		if (COLOR_RGB2.test(s)) {
			a = s.substr(4,s.length - 1).split(',');
			for (i = 0; i < 3; i++) {
				a[i] = Math.round(parseInt(a[i].trim(),10)*255/100);
			}
			o.r = a[0];
			o.g = a[1];
			o.b = a[2];
			o.a = 1;
			tjs.lang.destroyArray(a);
		} else if (COLOR_RGBA2.test(s)) {
			a = s.substr(5,s.length - 1).split(',');
			for (i = 0; i < 3; i++) {
				a[i] = Math.round(parseInt(a[i].trim(),10)*255/100);
			}
			a[3] = parseFloat(a[3].trim());
			o.r = a[0];
			o.g = a[1];
			o.b = a[2];
			o.a = a[3];
			tjs.lang.destroyArray(a);
		} else {
			o = null;
		}
		return o;
	};
	var _toHex = function(v) {
		var s = v.toString(16);
		if (v < 16) {
			s = '0'+s;
		}
		return s;
	};
	var _toHexString = function(o) {
		return '#'+_toHex(o.r)+_toHex(o.g)+_toHex(o.b);
	};
	var _toRGBString = function(o) {
		return 'rgb('+o.r+','+o.g+','+o.b+')';
	};
return {
	parseComputedColor:function(s,o) {
		if (!tjs.lang.isString(s) || s =='') {
			throw new TypeError('!s || !tjs.lang.isString(s) @'+this.classname+'.parseComputedColor');
		}
		if (!tjs.lang.isObject(o)) {
			o = {};
		}
		var oc = _parseColor1(s,o);
		if (!oc) {
			throw new TypeError('Illegal format of argument s @'+this.classname+'.parseComputedColor');
		} else {
			return oc;
		}
	},
	parseColor:function(s,o) {
		if (!tjs.lang.isString(s) || s =='') {
			throw new TypeError('!s || !tjs.lang.isString(s) @'+this.classname+'.parseColor');
		}
		if (!tjs.lang.isObject(o)) {
			o = {};
		}
		var oc = _parseColor1(s,o);
		if (!oc) {
			oc = _parseColor2(s,o);
		}
		if (!oc) {
			throw new TypeError('Illegal format of argument s @'+this.classname+'.parseColor');
		} else {
			return oc;
		}
	},
	toHexString:function(oRGB) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isObject(oRGB),'!tjs.lang.isObject(oRGB) @'+this.classname+'.toHexString');
		tjs.lang.assert(tjs.lang.isNumber(oRGB.r),'!tjs.lang.isNumber(oRGB.r) @'+this.classname+'.toHexString');
		tjs.lang.assert(tjs.lang.isNumber(oRGB.g),'!tjs.lang.isNumber(oRGB.g) @'+this.classname+'.toHexString');
		tjs.lang.assert(tjs.lang.isNumber(oRGB.b),'!tjs.lang.isNumber(oRGB.b) @'+this.classname+'.toHexString');
		tjs.lang.assert(oRGB.r >= 0 && oRGB.r < 256,'oRGB.r out of bound @'+this.classname+'.toHexString');
		tjs.lang.assert(oRGB.g >= 0 && oRGB.g < 256,'oRGB.g out of bound @'+this.classname+'.toHexString');
		tjs.lang.assert(oRGB.b >= 0 && oRGB.b < 256,'oRGB.b out of bound @'+this.classname+'.toHexString');
//tjs_debug_end
		return _toHexString(oRGB);
	},
	toRGBString:function(oRGB) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isObject(oRGB),'!tjs.lang.isObject(oRGB) @'+this.classname+'.toRGBString');
		tjs.lang.assert(tjs.lang.isNumber(oRGB.r),'!tjs.lang.isNumber(oRGB.r) @'+this.classname+'.toRGBString');
		tjs.lang.assert(tjs.lang.isNumber(oRGB.g),'!tjs.lang.isNumber(oRGB.g) @'+this.classname+'.toRGBString');
		tjs.lang.assert(tjs.lang.isNumber(oRGB.b),'!tjs.lang.isNumber(oRGB.b) @'+this.classname+'.toRGBString');
		tjs.lang.assert(oRGB.r >= 0 && oRGB.r < 256,'oRGB.r out of bound @'+this.classname+'.toRGBString');
		tjs.lang.assert(oRGB.g >= 0 && oRGB.g < 256,'oRGB.g out of bound @'+this.classname+'.toRGBString');
		tjs.lang.assert(oRGB.b >= 0 && oRGB.b < 256,'oRGB.b out of bound @'+this.classname+'.toRGBString');
//tjs_debug_end
		return _toRGBString(oRGB);
	},
	toRGBString4H:function(h) {
		var o = this.convertH2RGB(h);
		var s = _toRGBString(o);
		tjs.lang.destroyObject(o);
		return s;
	},
	toHexString4H:function(h) {
		var o = this.convertH2RGB(h);
		var s = _toHexString(o);
		tjs.lang.destroyObject(o);
		return s;
	},
	convertH2RGB:function(h,o) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(h),'!tjs.lang.isNumber(h) @'+this.classname+'.convertH2RGB');
		tjs.lang.assert(h >= 0 && h < 360,'h out of bound @'+this.classname+'.convertH2RGB');
//tjs_debug_end
		if (!tjs.lang.isObject(o)) {
			o = {};
		}
		var th = h / 60;
		var i = Math.floor(th);
		switch (i) {
		case 0:
			o.r = 255;
			o.g = Math.round(255*(th - i));
			o.b = 0;
			break;
		case 1:
			o.r = Math.round(255*(1 + i - th));
			o.g = 255;
			o.b = 0;
			break;
		case 2:
			o.r = 0;
			o.g = 255;
			o.b = Math.round(255*(th - i));
			break;
		case 3:
			o.r = 0;
			o.g = Math.round(255*(1 + i - th));
			o.b = 255;
			break;
		case 4:
			o.r = Math.round(255*(th - i));
			o.g = 0;
			o.b = 255;
			break;
		default:
			o.r = 255;
			o.g = 0;
			o.b = Math.round(255*(1 + i - th));
			break;
		}
		return o;
	},
	convertRGB2HSV:function(oRGB,oHSV) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isObject(oRGB),'!tjs.lang.isObject(oRGB) @'+this.classname+'.convertRGB2HSV');
		tjs.lang.assert(tjs.lang.isNumber(oRGB.r),'!tjs.lang.isNumber(oRGB.r) @'+this.classname+'.convertRGB2HSV');
		tjs.lang.assert(tjs.lang.isNumber(oRGB.g),'!tjs.lang.isNumber(oRGB.g) @'+this.classname+'.convertRGB2HSV');
		tjs.lang.assert(tjs.lang.isNumber(oRGB.b),'!tjs.lang.isNumber(oRGB.b) @'+this.classname+'.convertRGB2HSV');
		tjs.lang.assert(oRGB.r >= 0 && oRGB.r < 256,'oRGB.r out of bound @'+this.classname+'.convertRGB2HSV');
		tjs.lang.assert(oRGB.g >= 0 && oRGB.g < 256,'oRGB.g out of bound @'+this.classname+'.convertRGB2HSV');
		tjs.lang.assert(oRGB.b >= 0 && oRGB.b < 256,'oRGB.b out of bound @'+this.classname+'.convertRGB2HSV');
//tjs_debug_end
		var r = oRGB.r/255,g = oRGB.g/255,b = oRGB.b/255;
		var h,s,v;
		var max = Math.max(r,g,b);
		var min = Math.min(r,g,b);
		v = max;
		s = max == 0 ? 0 : (1 - min/max);
		h = 0;
		if (min != max) {
			var d = (max - min);
			if (r == max) {
				h = (g - b)/d;
			} else if (g == max) {
				h = 2 + (b - r)/d;
			} else {
				h = 4 + (r - g)/d;
			}
			h *= 60;
			if (h < 0) {
				h += 360;
			}
		}
		if (!tjs.lang.isObject(oHSV)) {
			oHSV = {};
		}
		oHSV.h = h;
		oHSV.s = s;
		oHSV.v = v;
		return oHSV;
	},
	convertHSV2RGB:function(oHSV,oRGB) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isObject(oHSV),'!tjs.lang.isObject(oHSV) @'+this.classname+'.convertHSV2RGB');
		tjs.lang.assert(tjs.lang.isNumber(oHSV.h),'!tjs.lang.isNumber(oHSV.h) @'+this.classname+'.convertHSV2RGB');
		tjs.lang.assert(tjs.lang.isNumber(oHSV.s),'!tjs.lang.isNumber(oHSV.s) @'+this.classname+'.convertHSV2RGB');
		tjs.lang.assert(tjs.lang.isNumber(oHSV.v),'!tjs.lang.isNumber(oHSV.v) @'+this.classname+'.convertHSV2RGB');
		tjs.lang.assert(oHSV.h >= 0 && oHSV.h < 360,'oHSV.h out of bound @'+this.classname+'.convertHSV2RGB');
		tjs.lang.assert(oHSV.s >= 0 && oHSV.s <= 1,'oHSV.s out of bound @'+this.classname+'.convertHSV2RGB');
		tjs.lang.assert(oHSV.v >= 0 && oHSV.v <= 1,'oHSV.v out of bound @'+this.classname+'.convertHSV2RGB');
//tjs_debug_end
		var h = oHSV.h,s = oHSV.s,v = oHSV.v;
		var r,g,b;
		if (v == 0) {
			r = 0;
			g = 0;
			b = 0;
		} else if (s == 0) {
			r = v;
			g = v;
			b = v;
		} else {
			var th = h/60;
			var i = Math.floor(th);
			var f = th - i;
			var p = v*(1 - s);
			var q = v*(1 - s*f);
			var t = v*(1 - s*(1 - f));
			switch (i) {
			case 0:
				r = v;
				g = t;
				b = p;
				break;
			case 1:
				r = q;
				g = v;
				b = p;
				break;
			case 2:
				r = p;
				g = v;
				b = t;
				break;
			case 3:
				r = p;
				g = q;
				b = v;
				break;
			case 4:
				r = t;
				g = p;
				b = v;
				break;
			default:
				r = v;
				g = p;
				b = q;
				break;
			}
		}
		if (!tjs.lang.isObject(oRGB)) {
			oRGB = {};
		}
		oRGB.r = Math.round(r*255);
		oRGB.g = Math.round(g*255);
		oRGB.b = Math.round(b*255);
		return oRGB;
	},
	convertRGB2HSL:function(oRGB,oHSL) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isObject(oRGB),'!tjs.lang.isObject(oRGB) @'+this.classname+'.convertRGB2HSL');
		tjs.lang.assert(tjs.lang.isNumber(oRGB.r),'!tjs.lang.isNumber(oRGB.r) @'+this.classname+'.convertRGB2HSL');
		tjs.lang.assert(tjs.lang.isNumber(oRGB.g),'!tjs.lang.isNumber(oRGB.g) @'+this.classname+'.convertRGB2HSL');
		tjs.lang.assert(tjs.lang.isNumber(oRGB.b),'!tjs.lang.isNumber(oRGB.b) @'+this.classname+'.convertRGB2HSL');
		tjs.lang.assert(oRGB.r >= 0 && oRGB.r < 256,'oRGB.r out of bound @'+this.classname+'.convertRGB2HSL');
		tjs.lang.assert(oRGB.g >= 0 && oRGB.g < 256,'oRGB.g out of bound @'+this.classname+'.convertRGB2HSL');
		tjs.lang.assert(oRGB.b >= 0 && oRGB.b < 256,'oRGB.b out of bound @'+this.classname+'.convertRGB2HSL');
//tjs_debug_end
		var r = oRGB.r/255,g = oRGB.g/255,b = oRGB.b/255;
		var h,s,l;
		var max = Math.max(r,g,b);
		var min = Math.min(r,g,b);
		l = (min + max)/2;
		if (min == max) {
			s = 0;
			h = 0;
		} else {
			var d = max - min;
			s = (l <= 0.5) ? d/(max + min) : d/(2 - max - min);
			if (r == max) {
				h = (g - b)/d;
			} else if (g == max) {
				h = 2 + (b - r)/d;
			} else {
				h = 4 + (r - g)/d;
			}
			h *= 60;
			if (h < 0) {
				h += 360;
			}
		}
		if (!tjs.lang.isObject(oHSL)) {
			oHSL = {};
		}
		oHSL.h = h;
		oHSL.s = s;
		oHSL.l = l;
		return oHSL;
	},
	convertHSL2RGB:function(oHSL,oRGB) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isObject(oHSL),'!tjs.lang.isObject(oHSV) @'+this.classname+'.convertHSL2RGB');
		tjs.lang.assert(tjs.lang.isNumber(oHSL.h),'!tjs.lang.isNumber(oHSV.h) @'+this.classname+'.convertHSL2RGB');
		tjs.lang.assert(tjs.lang.isNumber(oHSL.s),'!tjs.lang.isNumber(oHSV.s) @'+this.classname+'.convertHSL2RGB');
		tjs.lang.assert(tjs.lang.isNumber(oHSL.l),'!tjs.lang.isNumber(oHSV.v) @'+this.classname+'.convertHSL2RGB');
		tjs.lang.assert(oHSL.h >= 0 && oHSL.h < 360,'oHSV.h out of bound @'+this.classname+'.convertHSL2RGB');
		tjs.lang.assert(oHSL.s >= 0 && oHSL.s <= 1,'oHSV.s out of bound @'+this.classname+'.convertHSL2RGB');
		tjs.lang.assert(oHSL.l >= 0 && oHSL.l <= 1,'oHSV.v out of bound @'+this.classname+'.convertHSL2RGB');
//tjs_debug_end
		var h = oHSL.h,s = oHSL.s,l = oHSL.l;
		var r,g,b;
		if (s == 0){
			r = l;
			g = l;
			b = l;
		} else {
			var c = (l <= 0.5) ? l*(1 + s) : (l + s - l*s);
			if (c == 0) {
				r = 0;
				g = 0;
				b = 0;
			} else {
				var m = 2*l - c;
				var sv = (c - m)/c;
				var th = h/60;
				var i = Math.floor(th);
				var f = th - i;
				var scf = c*sv*f;
				var d1 = m + scf, d2 = c - scf;
				switch (i) {
				case 0:
					r = c;
					g = d1;
					b = m;
					break;
				case 1:
					r = d2;
					g = c;
					b = m;
					break;
				case 2:
					r = m;
					g = c;
					b = d1;
					break;
				case 3:
					r = m;
					g = d2;
					b = c;
					break;
				case 4:
					r = d1;
					g = m;
					b = c;
					break;
				case 5:
					r = c;
					g = m;
					b = d2;
					break;
				}
			}
		}
		if (!tjs.lang.isObject(oRGB)) {
			oRGB = {};
		}
		oRGB.r = Math.round(r*255);
		oRGB.g = Math.round(g*255);
		oRGB.b = Math.round(b*255);
		return oRGB;
	},
	classname:'tjs.color'
};
}();
