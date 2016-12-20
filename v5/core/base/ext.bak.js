this.undefined = this.undefined;

if (!Function.prototype.bind) {
Function.prototype.bind = function(o) {
	var f = this;
	var ap,a;
	if (arguments.length > 1) {
		ap = Array.prototype;
		a = ap.slice.call(arguments, 1);
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
if (!Function.prototype.bindAsEventListener) {
Function.prototype.bindAsEventListener = function(o,w) {
	var f = this;
	return function(e){
		if (!e) {
			e = w ? w.event : window.event;
		}
		return f.call(o,e);
	};
};
}

if (!String.prototype.trim) {
(function(){
var _re0 = /(^\s+)|(\s+$)/g;
String.prototype.trim = function() {
	return this.replace(_re0,'');
};
})();
}

if (!String.prototype.trimLeft) {
(function(){
var _re1 = /^\s+/;
var _re2 = /\s+$/;
String.prototype.trimLeft = function() {
	return this.replace(_re1,'');
};
String.prototype.trimRight = function() {
	return this.replace(_re2,'');
};
})();
}

if (!Array.prototype.indexOf) {
Array.prototype.indexOf = function(elt /*, from*/) {
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

if (!Array.prototype.lastIndexOf) {
Array.prototype.lastIndexOf = function(elt /*, from*/) {
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

if (!Array.prototype.some) {
Array.prototype.some = function(fun /*, o*/) {
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

if (!Array.prototype.every) {
Array.prototype.every = function(fun /*, o*/) {
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

if (!Array.prototype.filter) {
Array.prototype.filter = function(fun /*, o*/) {
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

if (!Array.prototype.map) {
Array.prototype.map = function(fun /*, o*/) {
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

if (!Array.prototype.forEach) {
Array.prototype.forEach = function(fun /*, o*/) {
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

if (!Array.prototype.reduce) {
Array.prototype.reduce = function(fun /*, initial*/) {
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

if (!Array.prototype.reduceRight) {
Array.prototype.reduceRight = function(fun /*, initial*/) {
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

if (!Object.getPrototypeOf) {
Object.getPrototypeOf = function(o){
 	if (!(o instanceof Object)) {
		throw new TypeError();
	}
	if (o.__proto__) {
		return o.__proto__;
	} else if (o.constructor) {
		return o.constructor.prototype;
	}
};
}

if (!Object.keys) {
Object.keys = function(o) {
// names of own enumerable properties
 	if (!(o instanceof Object)) {
		throw new TypeError();
	}
	var a = [];
	var b = Boolean(o.__lookupGetter__);
	for (var x in o){
		if (object.hasOwnProperty(x) && x != "__proto__"){
			a.push(x);
		} else if (b && (o.__lookupGetter__(x) || o.__lookupSetter__(x))) {
			a.push(x);
		}
	}
	/*
	if (window.ActiveXObject) {
		if (o.toString != Object.prototype.toString) {
			a.push('toString');
		}
		if (o.valueOf != Object.prototype.valueOf) {
			a.push('valueOf');
		}
	}
	*/
	//a.sort();
	return a;
};
}

if (!Object.getOwnPropertyNames) {
Object.getOwnPropertyNames = function(o){
// names of own properties
 	if (!(o instanceof Object)) {
		throw new TypeError();
	}
	return Object.keys(o);
};
}

if (!Object.getOwnPropertyDescriptor) {
Object.getOwnPropertyDescriptor = function(o, p){
 	if (!(o instanceof Object)) {
		throw new TypeError();
	}
	var desc,g,s;
	if (o.__lookupGetter__) {
		g = o.__lookupGetter__(p);
		s = o.__lookupSetter__(p);
	}
	if (g || s) {
		desc = {
			get: g,
			set: s,
			enumerable: true,
			configurable: true
		};
	} else if (o.hasOwnProperty(p)){
		desc = {
			value: o[p],
			writable: true,
			enumerable: true,
			configurable: true
		};
	}
	return desc;
};
}

if (!Object.defineProperty) {
Object.defineProperty = function(o, p, attributes){
 	if (!(o instanceof Object)) {
		throw new TypeError();
	}
	if ('value' in attributes) {
		o[p] = attributes.value;
	} else if (o.__defineGetter__) {
		if ('get' in attributes){
			o.__defineGetter__(p, attributes.getter);
		}
		if ('set' in attributes){
			o.__defineSetter__(p, attributes.setter);
		}
	}
	return o;
};
}

if (!Object.defineProperties) {
Object.defineProperties = function(o, props){
 	if (!(o instanceof Object)) {
		throw new TypeError();
	}
	var keys = Object.keys(props), p;
	for (var i = 0, isize = keys.length; i < isize; i++){
		p = keys[i];
		Object.defineProperty(o, p, props[p]);
	}
	return o;
};
}

if (!Object.create) {
Object.create = function(o, props){
 	if (!(o instanceof Object)) {
		throw new TypeError();
	}
	var obj;
	if (o != Object.prototype) {
		var f = function(){};
		f.prototype = o;
		obj = new f();
	} else {
		obj = {};
	}
	if (!obj.__proto__){
		obj.__proto__ = o;
	}
	if (props instanceof Object){
		Object.defineProperties(obj, props);
	}
	return obj;
};
}
