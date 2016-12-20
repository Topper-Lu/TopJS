tjs.util = {
	destructor:function(o) {
		o.destroy();
	},
	toMap:function(o){
		if (o instanceof Object) {
			return (o.constructor == tjs.util.Map) ? o : new tjs.util.Map(o);
		} else {
			return new tjs.util.Map();
		}
	},
	classname:'tjs.util'
};

tjs.lang.defineTopClass('tjs.util.Map',
function(o) {
	this.items = (o && o.constructor == Object) ? o : {};
},{
	destroy:function() {
		if (this.items) {
			var tjs_lang = tjs.lang;
			tjs_lang.destroyObject(this.items);
			tjs_lang.destroyObject(this);
		}
	},
	clear:function() {
		tjs.lang.destroyObject(this.items);
	},
	copyFrom:function(o) {
		var tjs_lang = tjs.lang;
//tjs_debug_start
		tjs_lang.assert(o instanceof Object,'!(o instanceof Object) @'+this.classname+'.copyFrom');
//tjs_debug_end
		if (o instanceof tjs.util.Map) {
			o = o.items;
		}
		tjs_lang.copyObject(o,this.items);
	},
	filter:function(fHandler) {
//tjs_debug_start
		var tjs_lang = tjs.lang;
		tjs_lang.assert(tjs_lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.filter');
//tjs_debug_end
		var a = [];
		for (var x in this.items) {
			if (fHandler(this.items[x])) {
				a.push(this.items[x]);
			}
		}
		return a;
	},
	forEach:function(fHandler) {
//tjs_debug_start
		var tjs_lang = tjs.lang;
		tjs_lang.assert(tjs_lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.forEach');
//tjs_debug_end
		for (var x in this.items) {
			fHandler(this.items[x]);
		}
	},
	contains:function(key) {
//tjs_debug_start
		var tjs_lang = tjs.lang;
		tjs_lang.assert(tjs_lang.isString(key) && key != '','!key || !tjs.lang.isString(key) @'+this.classname+'.contains');
		tjs_lang.assert(!(key in Object.prototype),'(key in Object.prototype) @'+this.classname+'.contains');
//tjs_debug_end
		return (key in this.items);
	},
	put:function(key,value) {
//tjs_debug_start
		var tjs_lang = tjs.lang;
		tjs_lang.assert(tjs_lang.isString(key) && key != '','!key || !tjs.lang.isString(key) @'+this.classname+'.put');
		tjs_lang.assert(!(key in Object.prototype),'(key in Object.prototype) @'+this.classname+'.put');
//tjs_debug_end
		var vOld = this.items[key];
		this.items[key] = value;
		return vOld;
	},
	putIfUndefined:function(key,value) {
//tjs_debug_start
		var tjs_lang = tjs.lang;
		tjs_lang.assert(tjs_lang.isString(key) && key != '','!key || !tjs.lang.isString(key) @'+this.classname+'.putIfUndefined');
		tjs_lang.assert(!(key in Object.prototype),'(key in Object.prototype) @'+this.classname+'.putIfUndefined');
//tjs_debug_end
		if (!(key in this.items)) {
			this.items[key] = value;
		}
	},
	get:function(key) {
//tjs_debug_start
		var tjs_lang = tjs.lang;
		tjs_lang.assert(tjs_lang.isString(key) && key != '','!key || !tjs.lang.isString(key) @'+this.classname+'.get');
		tjs_lang.assert(!(key in Object.prototype),'(key in Object.prototype) @'+this.classname+'.get');
//tjs_debug_end
		return this.items[key];
	},
	remove:function(key) {
//tjs_debug_start
		var tjs_lang = tjs.lang;
		tjs_lang.assert(tjs_lang.isString(key) && key != '','!key || !tjs.lang.isString(key) @'+this.classname+'.remove');
		tjs_lang.assert(!(key in Object.prototype),'(key in Object.prototype) @'+this.classname+'.remove');
//tjs_debug_end
		var obj;
		if (key in this.items) {
			obj = this.items[key];
			delete this.items[key];
		}
		return obj;
	}
});

tjs.lang.defineClass('tjs.util.IdObjectMap',tjs.util.Map,
function(obj) {
	tjs.util.Map.call(this,obj);
},{
	add:function(obj){
		var tjs_lang = tjs.lang;
		if (tjs_lang.isObject(obj) && obj.id && tjs_lang.isString(obj.id)) {
			var o = this.get(obj.id);
			if (!o || o != obj) {
				this.put(obj.id,obj);
				if (!this.get('tjs_default')) {
					this.put('tjs_default',obj);
				}
			}
		}
	},
	getDefault:function(){
		return this.get('tjs_default');
	},
	// to be overrided
	validate:function(obj){
		var tjs_lang = tjs.lang;
		if (!tjs_lang.isObject(obj) || !obj.id || !tjs_lang.isString(obj.id)) {
			return false;
		}
		return true;
	}
});

tjs.lang.defineTopClass('tjs.util.Trigger',
function() {
},{
	addHandler:function(types,fHandler) {
		var tjs_lang = tjs.lang;
//tjs_debug_start
		tjs_lang.assert(tjs_lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.addHandler');
//tjs_debug_end
		if (tjs_lang.isArray(types)) {
			for (var i = 0, isize = types.length; i < isize; i++) {
				this._addHandler(types[i],fHandler);
			}
		} else {
			this._addHandler(types,fHandler);
		}
	},
	_addHandler:function(type,fHandler) {
//tjs_debug_start
		var tjs_lang = tjs.lang;
		tjs_lang.assert(tjs_lang.isString(type) && type,'!tjs.lang.isString(type) @'+this.classname+'._addHandler');
//tjs_debug_end
		var h = this.handlers;
		if (!(type in h)) {
			h[type] = [];
		}
		var a = h[type];
		if (a.indexOf(fHandler) < 0) {
			a[a.length] = fHandler;
		}
	},
	removeHandler:function(type,fHandler) {
//tjs_debug_start
		var tjs_lang = tjs.lang;
		tjs_lang.assert(tjs_lang.isString(type) && type,'!tjs.lang.isString(type) @'+this.classname+'.removeHandler');
		tjs_lang.assert(tjs_lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.removeHandler');
//tjs_debug_end
		var h = this.handlers;
		if (type in h) {
			var a = h[type];
			var idx = a.indexOf(fHandler);
			if (idx > -1) {
				a.splice(idx,1);
				if (a.length == 0) {
					delete h[type];
				}
			}
		}
	},
	removeAllHandlers:function(type) {
		var tjs_lang = tjs.lang;
//tjs_debug_start
		tjs_lang.assert(tjs_lang.isString(type) && type,'!tjs.lang.isString(type) @'+this.classname+'.removeAllHandlers');
//tjs_debug_end
		var h = this.handlers;
		if (type == '*') {
			for (var x in h) {
				tjs_lang.destroyArray(h[x]);
				delete h[x];
			}
		} else {
			if (type in h) {
				tjs_lang.destroyArray(h[type]);
				delete h[type];
			}
		}
	},
	fire:function(type,o) {
//tjs_debug_start
		var tjs_lang = tjs.lang;
		tjs_lang.assert(type && tjs_lang.isString(type),'!tjs.lang.isString(type) @'+this.classname+'.fire');
//tjs_debug_end
		if (type in this.handlers) {
			var a = this.handlers[type];
			for (var i = 0, isize = a.length; i < isize; i++) {
				a[i](this,type,o);
			}
		}
	}
});
tjs.lang.extend(tjs.util.Trigger,{
	initInstance:function(o){
		o.handlers = {};
	},
	destroyInstance:function(o){
		if (o.handlers) {
			var tjs_lang = tjs.lang;
			var h = o.handlers;
			for (var x in h) {
				tjs_lang.destroyArray(h[x]);
				delete h[x];
			}
			delete o.handlers;
		}
	}
});
