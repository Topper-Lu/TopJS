/**
 * @object tjs.lang
 */
tjs.lang = {
	/**
	 * @method tjs.lang.assert
	 * Throws an exception if the assertion fails.
	 * If the asserted condition is true, this method does nothing. If the condition is false, we throw an error with a error message.
	 * @param bCondition: Boolean
	 * A boolean value, which needs to be true for the assertion to succeed.
	 * @param message: String
	 * An optional string describing the assertion.
	 * @throws Error
	 * If bCondition is false.
	 */
	assert:function(bCondition, message) {
		console.assert(bCondition, message);
	},
	/**
	 * @method tjs.lang.isUndefined
	 * Tests whether x is undefined.
	 *
	 * @param x: Any
	 * The propertiy to be tested
	 * @return Boolean
	 * true if x is undefined, false otherwise.
	 */
	isUndefined:function(x) {
		return typeof(x) == 'undefined';
	},
	/**
	 * @method tjs.lang.isBoolean
	 * Tests whether x is a boolean type.
	 *
	 * @param x: Any
	 * The propertiy to be tested.
	 * @return Boolean
	 * true if x is a boolean type, false otherwise.
	 */
	isBoolean:function(x) {
		return typeof(x) == 'boolean';
	},
	/**
	 * @method tjs.lang.isNumber
	 * Tests whether x is a number type.
	 *
	 * @param x: Any
	 * The propertiy to be tested.
	 * @return Boolean
	 * true if x is a number type and is finite, false otherwise.
	 */
	isNumber:function(x) {
		return typeof(x) == 'number' && isFinite(x);
	},
	/**
	 * @method tjs.lang.isString
	 * Tests whether x is a string type.
	 *
	 * @param x: Any
	 * propertiy to be tested.
	 * @return Boolean
	 * true if x is a string type, false otherwise.
	 */
	isString:function(x) {
		return typeof(x) == 'string';
	},
	/**
	 * @method tjs.lang.isFunction
	 * Tests whether x is a function.
	 *
	 * @param x: Any
	 * The propertiy to be tested.
	 * @return Boolean
	 * true if x is a function, false otherwise.
	 */
	isFunction:function(x) {
		return typeof(x) == 'function';
	},
	/**
	 * @method tjs.lang.isObject
	 * Tests whether x is an object.
	 *
	 * @param x: Any
	 * The propertiy to be tested.
	 * @return Boolean
	 * true if x is an object, false otherwise.
	 */
	isObject:function(x) {
		return x && typeof(x) == 'object';
	},
	/**
	 * @method tjs.lang.isArray
	 * Tests whether x is an Array instance.
	 *
	 * @param x: Any
	 * The propertiy to be tested.
	 * @return Boolean
	 * true if x is an Array instance, false otherwise.
	 */
	isArray:function(x) {
		//return x instanceof Array;
		return Array.isArray(x);
	},
	/**
	 * @method tjs.lang.isArrayLike
	 * Tests whether x is an ArrayLike instance.
	 *
	 * @param x: Any
	 * The propertiy to be tested.
	 * @return Boolean
	 * true if x is an ArrayLike instance, false otherwise.
	 */
	isArrayLike:function(x) {
		if (!x || typeof(x) != 'object' || !('length' in x) || (x instanceof String)) {
			return false;
		} else {
			var len = x.length;
			return (typeof(len) == 'number' && len > 0);
		}
	},
	/**
	 * @method tjs.lang.toArray
	 * Converts an ArrayLike instance to an Array instance.
	 *
	 * @param arrayLike: ArrayLike
	 * The instance to be converted
	 * @param start: Integer
	 * An optional start position(included), if not specified 0 is used.
	 * @param end: Integer
	 * An optional end position(excluded), if not specified arrayLike.length is used.
	 * @return Array
	 * The converted Array instance
	 */
	toArray:function(arrayLike, start, end) {
//tjs_debug_start
		this.assert(this.isArrayLike(arrayLike),'!tjs.lang.isArrayLike(arrayLike) @'+this.classname+'.toArray');
		this.assert(start == null || this.isNumber(start),'!tjs.lang.isNumber(start) @'+this.classname+'.toArray');
		this.assert(end == null || this.isNumber(end),'!tjs.lang.isNumber(start) @'+this.classname+'.toArray');
//tjs_debug_end
		if (start == null || start < 0) {
			start = 0;
		}
		if (end == null || end > arrayLike.length) {
			end = arrayLike.length;
		}
		var a = [];
		for (var i = start; i < end; i++) {
			a[a.length] = arrayLike[i];
		}
		return a;
	},
	/**
	 * @method tjs.lang.toInteger
	 * Converts x to an integer.
	 *
	 * @param x: Any
	 * The property to be converted
	 * @return Integer
	 * The converted integer, or NaN
	 */
	toInteger:function(x) {
		switch (typeof(x)) {
			case 'number':
				return Math.round(x);
			case 'string':
				return parseInt(x);
			case 'boolean':
				return x ? 1 : 0;
			case 'undefined':
			case 'function':
				return NaN;
			case 'object':
				if (x instanceof Number) {
					return Math.round(x.valueOf());
				} else if (x instanceof String) {
					return parseInt(x.valueOf());
				} else if (x instanceof Boolean) {
					return x.valueOf() ? 1 : 0;
				} else {
					return NaN;
				}
			default:
				return NaN;
		}
	},
	/**
	 * @method tjs.lang.boundedValue
	 * Converts a number to a bounded value.
	 *
	 * @param v: Number
	 * The property to be converted
	 * @param vMin: Number
	 * The minimun value
	 * @param vMax: Number
	 * The maximun value
	 * @return Number
	 * A number between vMin(included) and vMax(included)
	 */
	boundedValue:function(v,vMin,vMax) {
//tjs_debug_start
		this.assert(this.isNumber(v),'!tjs.lang.isNumber(v) @'+this.classname+'.boundedValue');
		this.assert(this.isNumber(vMin),'!tjs.lang.isNumber(vMin) @'+this.classname+'.boundedValue');
		this.assert(this.isNumber(vMax),'!tjs.lang.isNumber(vMax) @'+this.classname+'.boundedValue');
		this.assert(vMin <= vMax,'vMin > vMax @'+this.classname+'.boundedValue');
//tjs_debug_end
		if (v < vMin) {
			v = vMin;
		} else if (v > vMax) {
			v = vMax;
		}
		return v;
	},
	/**
	 * @method tjs.lang.toNamespace
	 * Returns the namespace specified and creates it if it doesn't exist.
	 *
	 * @param aNames: Array
	 * The names of the namespace
	 * @return Object
	 * A reference to the namespace object
	 */
	toNamespace:function(aNames){
//tjs_debug_start
		this.assert(this.isArray(aNames),'!tjs.lang.isArray(aNames) @'+this.classname+'.toNamespace');
//tjs_debug_end
		var o = tjs.env,name;
		for (var i = 0,isize = aNames.length; i < isize; i++) {
			name = aNames[i];
			if (!(name in o)) {
				o[name] = {};
			}
			o = o[name];
		}
		return o;
	},
	/**
	 * @method tjs.lang.namespace
	 * Returns the namespace specified and creates it if it doesn't exist.
	 *
	 * @param sName: String
	 * The name of the namespace
	 * @return Object
	 * A reference to the namespace object
	 */
	namespace:function(sName) {
//tjs_debug_start
		this.assert(sName && this.isString(sName),'!tjs.lang.isString(sName) @'+this.classname+'.namespace');
//tjs_debug_end
		return this.toNamespace(sName.split('.'));
	},
	_extend:(function(){
		for(var p in {toString:null}) {
			return function(dst, src) {
				for (var x in src) {
					dst[x] = src[x];
				}
			};
		}
		var protoprops = ["toString", "valueOf", "constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable","toLocaleString"];
		return function(dst, src) {
			var x;
			for(x in src) {
				dst[x] = src[x];
			}
			for(var j = 0; j < protoprops.length; j++) {
				x = protoprops[j];
				if (src.hasOwnProperty(x)) dst[x] = src[x];
			}
		};
	}()),
	/**
	 * @method tjs.lang.extend
	 * Copy the properties/methods of objects src1,src2,... to object dst and return object dst.
	 *
	 * @param dst: Object
	 * The destination object.
	 * @param srcN: Object
	 * The source objects.
	 * N:1...
	 * @return Object
	 * dst
	 */
	extend:function(dst/*,src1,src2,...*/) {
		if (!(dst instanceof Object)) {
			dst = {};
		}
		var src;
		for (var i = 1, isize = arguments.length; i < isize; i++){
			src = arguments[i];
			if (src instanceof Object) {
				this._extend(dst,src);
			}
		}
		return dst;
	},
	/**
	 * @method tjs.lang.defineClass
	 * Create a new Class, which inherit properties/methods from the prototype of the specified constructor function of super class without calling it.
	 *
	 * @param sFullName: String
	 * The class full name for this class
	 * @param fConstructor: Function
	 * The constructor function for this class
	 * @param oPrototype: Object
	 * The prototype for this class.
	 */
	defineTopClass:function(sFullName,fConstructor,proto) {
//tjs_debug_start
		this.assert(sFullName && this.isString(sFullName),'!tjs.lang.isString(sFullName) @'+this.classname+'.defineTopClass');
		this.assert(fConstructor == null || this.isFunction(fConstructor),'!tjs.lang.isFunction(fConstructor) @'+this.classname+'.defineTopClass'+' '+sFullName);
		this.assert(this.isObject(proto),'!tjs.lang.isObject(proto) @'+this.classname+'.defineTopClass');
//tjs_debug_end
		if (fConstructor == null) {
			fConstructor = function(){};
		}
		var names = sFullName.split('.');
		var sClassName = names.pop();
		var o = this.toNamespace(names);
		o[sClassName] = fConstructor;
		fConstructor.classname = sFullName;
		fConstructor.superes = [Object];

		if (!proto.__proto__) {
			proto.__proto__ = Object.prototype;
		}
		var isize = arguments.length;
		if (isize > 3) {
			var arg;
			for (var i = 3; i < isize; i++) {
				arg = arguments[i];
				if (this.isFunction(arg)) {
					if (arg.prototype != Object.prototype) {
						this._extend(proto,arg.prototype);
						if (!fConstructor.superes) {
							fConstructor.superes = [arg];
						} else {
							fConstructor.superes.push(arg);
						}
					}
				} else if (this.isObject(arg)) {
					this._extend(proto,arg);
				}
			}
		}
		proto.classname = sFullName;
		proto.constructor = fConstructor;
		fConstructor.prototype = proto;
	},
	/**
	 * @method tjs.lang.defineClass
	 * Create a new Class, which inherit properties/methods from the prototype of the specified constructor function of super class without calling it.
	 *
	 * @param sFullName: String
	 * The class full name for this class
	 * @param fSupper: Function
	 * The constructor function of super class
	 * @param fConstructor: Function
	 * The constructor function for this class
	 * @param srcN: Object
	 * Optional objects to extend prototype of this new class.
	 * N:1...
	 */
	defineClass:function(sFullName,fSupper,fConstructor/*,obj1,obj2,...*/) {
//tjs_debug_start
		this.assert(sFullName && this.isString(sFullName),'!tjs.lang.isString(sFullName) @'+this.classname+'.defineClass');
		this.assert(this.isFunction(fSupper),'!tjs.lang.isFunction(fSupper) @'+this.classname+'.defineClass'+' '+sFullName);
		this.assert(fSupper.prototype != Object.prototype,'Use '+this.classname+'.defineTopClass instead.!');
		this.assert(fConstructor == null || this.isFunction(fConstructor),'!this.isFunction(fConstructor) @'+this.classname+'.defineClass');
//tjs_debug_end
		if (fConstructor == null) {
			fConstructor = function(){};
		}
		var names = sFullName.split('.');
		var sClassName = names.pop();
		var o = this.toNamespace(names);
		o[sClassName] = fConstructor;
		fConstructor.classname = sFullName;
		fConstructor.superes = [fSupper];

		var proto;
		if (fSupper.prototype != Object.prototype) {
			var f = function(){};
			f.prototype = fSupper.prototype;
			proto = new f();
		} else {
			proto = {};
		}
		if (!proto.__proto__) {
			proto.__proto__ = fSupper.prototype;
		}
		var isize = arguments.length;
		if (isize > 3) {
			var arg;
			for (var i = 3; i < isize; i++) {
				arg = arguments[i];
				if (this.isFunction(arg)) {
					if (arg.prototype != Object.prototype) {
						this._extend(proto,arg.prototype);
						fConstructor.superes.push(arg);
					}
				} else if (this.isObject(arg)) {
					this._extend(proto,arg);
				}
			}
		}
		proto.classname = sFullName;
		proto.constructor = fConstructor;
		fConstructor.prototype = proto;
	},
	/**
	 * @method tjs.lang.isSubClass
	 * Tests whether fClass is a subclass of fSuper.
	 *
	 * @param fClass: Function
	 * The subclass to be tested.
	 * @param fSuper: Function
	 * The superclass to be tested.
	 * @return Boolean
	 * true if fClass is a subclass of fSuper, false otherwise.
	 */
	isSubClassOf:function(fClass,fSuper){
//tjs_debug_start
		this.assert(this.isFunction(fClass),'!tjs.lang.isFunction(fClass) @'+this.classname+'.isSubClassOf');
		this.assert(this.isFunction(fSuper),'!tjs.lang.isFunction(fSuper) @'+this.classname+'.isSubClassOf');
//tjs_debug_end
		if (fSuper == Object) {
			return true;
		}
		var s = [fClass],i;
		while (s.length > 0) {
			fClass = s.pop();
			if (fClass == fSuper) {
				return true;
			}
			if (this.isArray(fClass.superes)) {
				i = fClass.superes.length;
				while (i--) {
					s[s.length] = fClass.superes[i];
				}
			}
		}
		return false;
	},
	cloneObject:function(o,includeFunction) {
		return this.copyObject(o,{},includeFunction);
	},
	copyObject:function(src,dst,includeFunction) {
//tjs_debug_start
		tjs.lang.assert(this.isObject(src),'!tjs.lang.isObject(src) @'+this.classname+'.copyObject');
		tjs.lang.assert(this.isObject(dst),'!tjs.lang.isObject(dst) @'+this.classname+'.copyObject');
//tjs_debug_end
		if (!src.nodeType) {
			includeFunction = Boolean(includeFunction);
			var x,u,v;
			for (x in src) {
				if (src.hasOwnProperty(x)) {
					u = src[x];
					switch (typeof u) {
					case 'function':
						if (includeFunction) {
							dst[x] = u;
						}
						break;
					case 'object':
						if (u == null) {
							dst[x] = u;
						} else if ((u instanceof Number) || (u instanceof String) || (u instanceof Boolean)) {
							dst[x] = u.valueOf();
						} else if (u instanceof Array) {
							dst[x] = this.copyArray(u,includeFunction);
						} else if (!u.nodeType) {
							v = dst[x];
							dst[x] = this.copyObject(u,(!v || typeof(v) != 'object') ? {} : v,includeFunction);
						}
						break;
					default:
						dst[x] = u;
						break;
					}
				}
			}
		}
		return dst;
	},
	copyArray:function(src,includeFunction) {
//tjs_debug_start
		tjs.lang.assert(this.isArray(src),'!tjs.lang.isArray(src) @'+this.classname+'.copyArray');
//tjs_debug_end
		includeFunction = Boolean(includeFunction);
		var isize = src.length, dst = [], u;
		dst.length = isize;
		for (var i = 0; i < isize; i++) {
			u = src[i];
			switch (typeof u) {
			case 'function':
				if (includeFunction) {
					dst[x] = u;
				}
				break;
			case 'object':
				if (u == null) {
					dst[i] = u;
				} else if ((u instanceof Number) || (u instanceof String) || (u instanceof Boolean)) {
					dst[i] = u.valueOf();
				} else if (u instanceof Array) {
					dst[i] = this.copyArray(u,includeFunction);
				} else if (!u.nodeType) {
					dst[i] = this.copyObject(u,{},includeFunction);
				}
				break;
			default:
				dst[i] = u;
				break;
			}
		}
		return dst;
	},
	/**
	 * @method tjs.lang.destroyObject
	 * Destroy an object.
	 *
	 * @param o: Object
	 * The object to be destroyed.
	 */
	destroyObject:function(o,deep){
		if (this.isObject(o) && !o.nodeType) {
			for (var v in o) {
				if (o.hasOwnProperty(v)) {
					if (deep) {
						this.destroyData(v,true);
					}
					delete o[v];
				}
			}
		}
	},
	/**
	 * @method tjs.lang.destroyArray
	 * Destroy an array.
	 *
	 * @param a: Array
	 * The array to be destroyed.
	 */
	destroyArray:function(a,deep){
		if (this.isArray(a) && a.length > 0) {
			var i = a.length;
			while (i--) {
				if (deep) {
					this.destroyData(a[i],true);
				}
				a[i] = null;
			}
			a.length = 0;
		}
	},
	/**
	 * @method tjs.lang.destroyData
	 * Destroy an data.
	 *
	 * @param d: Any
	 * The data to be destroyed.
	 */
	destroyData:function(v,deep) {
		if (this.isArray(v)) {
			this.destroyArray(v,deep);
		} else if (this.isObject(v)) {
			this.destroyObject(v,deep);
		}
	},
	_evalFlag:false,
	_jobs:[],
	invokeLater:function(f){
		if (this.isFunction(f)) {
			if (!this._invoke_) {
				this._invoke_ = this._invoke.bind(this);
			}
			this._jobs.push(f);
			if (!this._evalFlag) {
				this._evalFlag = true;
				window.setTimeout(this._invoke_,100);
			}
		}
	},
	_invoke:function(f){
		this._jobs.shift()();
		if (this._jobs.length > 0) {
			window.setTimeout(this._invoke_,100);
		} else {
			this._evalFlag = false;
		}
	},
	/**
	 * @field tjs.lang.classname: String
	 */
	classname:'tjs.lang'
};
