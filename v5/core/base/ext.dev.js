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
