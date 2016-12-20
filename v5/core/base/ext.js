(function(){

var fp = Function.prototype;
if (!fp.bind) {
	fp.bind = function(o) {
		var f = this;
		if (arguments.length > 1) {
			var ap = Array.prototype, a = ap.slice.call(arguments, 1);
			return function(){
				return f.apply(o,arguments.length > 0 ? ap.concat.apply(a, arguments) : a);
			};
		} else {
			return function(){
				return arguments.length > 0 ? f.apply(o,arguments) : f.call(o);
			};
		}
	};
}
if (!fp.bindAsEventListener) {// non stanard
	fp.bindAsEventListener = function(o,w) {
		var f = this;
		return function(e){
			if (!e) {
				e = w ? w.event : window.event;
			}
			return f.call(o,e);
		};
	};
}

var sp = String.prototype;
if (!sp.trim) {
	var _re0 = /(^\s+)|(\s+$)/g;
	sp.trim = function() {
		return this.replace(_re0,'');
	};
}
if (!sp.trimLeft) {// IE
	var _re1 = /^\s+/;
	sp.trimLeft = function() {
		return this.replace(_re1,'');
	};
}
if (!sp.trimRight) {// IE
	var _re2 = /\s+$/;
	sp.trimRight = function() {
		return this.replace(_re2,'');
	};
}

if (!Array.isArray) {
	Array.isArray = function(x) {
		return typeof(x) == 'object' && Object.prototype.toString.call(x) == '[object Array]';
	};
}
var ap = Array.prototype;
if (!ap.indexOf) {
	ap.indexOf = function(elt /*, from*/) {
		var len = this.length >>> 0;
		var from = Number(arguments[1]) || 0;
		from = (from < 0) ? Math.ceil(from) : Math.floor(from);
		if (from < 0) {
			from += len;
		}
		for (; from < len; from++) {
			if (from in this && this[from] === elt) {
				return from;
			}
		}
		return -1;
	};
}
if (!ap.lastIndexOf) {
	ap.lastIndexOf = function(elt /*, from*/) {
		var len = this.length;
		var from = Number(arguments[1]);
		if (isNaN(from)) {
			from = len - 1;
		} else {
			from = (from < 0) ? Math.ceil(from) : Math.floor(from);
			if (from < 0) {
				from += len;
			} else if (from >= len) {
				from = len - 1;
			}
		}
		for (; from > -1; from--) {
			if (from in this && this[from] === elt) {
				return from;
			}
		}
		return -1;
	};
}
if (!ap.some) {
	ap.some = function(fun /*, o*/) {
		if (typeof fun != "function") {
			throw new TypeError();
		}
		var o = arguments[1];
		var len = this.length >>> 0;
		for (var i = 0; i < len; i++) {
			if (i in this && fun.call(o, this[i], i, this)) {
				return true;
			}
		}
		return false;
	};
}
if (!ap.every) {
	ap.every = function(fun /*, o*/) {
		if (typeof fun != "function") {
			throw new TypeError();
		}
		var o = arguments[1];
		var len = this.length >>> 0;
		for (var i = 0; i < len; i++) {
			if (i in this && !fun.call(o, this[i], i, this)) {
				return false;
			}
		}
		return true;
	};
}
if (!ap.filter) {
	ap.filter = function(fun /*, o*/) {
		if (typeof fun != "function") {
			throw new TypeError();
		}
		var res = new Array();
		var o = arguments[1];
		var len = this.length >>> 0;
		for (var i = 0; i < len; i++) {
			if (i in this) {
				var val = this[i]; // in case fun mutates this
				if (fun.call(o, val, i, this)) {
					res.push(val);
				}
			}
		}
		return res;
	};
}
if (!ap.map) {
	ap.map = function(fun /*, o*/) {
		if (typeof fun != "function") {
			throw new TypeError();
		}
		var len = this.length >>> 0;
		var res = new Array(len);
		var o = arguments[1];
		for (var i = 0; i < len; i++) {
			if (i in this) {
				res[i] = fun.call(o, this[i], i, this);
			}
		}
		return res;
	};
}
if (!ap.forEach) {
	ap.forEach = function(fun /*, o*/) {
		if (typeof fun != "function") {
			throw new TypeError();
		}
		var o = arguments[1];
		var len = this.length >>> 0;
		for (var i = 0; i < len; i++) {
			if (i in this) {
				fun.call(o, this[i], i, this);
			}
		}
	};
}
if (!ap.reduce) {
	ap.reduce = function(fun /*, initial*/) {
		if (typeof fun != "function") {
			throw new TypeError();
		}
		var len = this.length >>> 0;
		// no value to return if no initial value and an empty array
		if (len == 0 && arguments.length == 1) {
			throw new TypeError();
		}
		var i = 0;
		if (arguments.length >= 2) {
			var rv = arguments[1];
		} else {
			do {
				if (i in this) {
					rv = this[i++];
					break;
				}
				// if array contains no values, no initial value to return
				if (++i >= len) {
					throw new TypeError();
				}
			} while (true);
		}
		for (; i < len; i++) {
			if (i in this) {
				rv = fun.call(null, rv, this[i], i, this);
			}
		}
		return rv;
	};
}
if (!ap.reduceRight) {
	ap.reduceRight = function(fun /*, initial*/) {
		var len = this.length >>> 0;
		if (typeof fun != "function") {
			throw new TypeError();
		}
		// no value to return if no initial value, empty array
		if (len == 0 && arguments.length == 1) {
			throw new TypeError();
		}
		var i = len - 1;
		if (arguments.length >= 2) {
			var rv = arguments[1];
		} else {
			do {
				if (i in this) {
					rv = this[i--];
					break;
				}
				// if array contains no values, no initial value to return
				if (--i < 0) {
					throw new TypeError();
				}
			} while (true);
		}
		for (; i >= 0; i--) {
			if (i in this) {
				rv = fun.call(null, rv, this[i], i, this);
			}
		}
		return rv;
	};
}

})();
