tjs.data = {
	// event type
	CACHE_LOADED:'CACHE_LOADED',
	BEFORE_RESTRUCTURE:'BEFORE_RESTRUCTURE',
	AFTER_RESTRUCTURE:'AFTER_RESTRUCTURE',
	BEFORE_INSERT:'BEFORE_INSERT',
	AFTER_INSERT:'AFTER_INSERT',
	BEFORE_REPLACE:'BEFORE_UPDATE',
	AFTER_REPLACE:'AFTER_UPDATE',
	BEFORE_DELETE:'BEFORE_DELETE',
	AFTER_DELETE:'AFTER_DELETE',
	BEFORE_MOVE:'BEFORE_MOVE',
	AFTER_MOVE:'AFTER_MOVE',
	DATA_CLICKED:'DATA_CLICKED',
	DATA_SELECTED:'DATA_SELECTED',
	DATA_UNSELECTED:'DATA_UNSELECTED',
	SELECTEDDATA_CHANGED:'SELECTEDDATA_CHANGED',
	VALUE_CHANGED:'VALUE_CHANGED',
	// data types
	types: {
		BOOLEAN:'BOOLEAN',
		INTEGER:'INTEGER',
		NUMBER:'NUMBER',
		STRING:'STRING',
		DATE:'DATE',
		TIME:'TIME',
		TIMESTAMP:'TIMESTAMP',
		OTHER:'OTHER',
		classname:'tjs.data.types'
	},
	toText:function(x){
		var v;
		if (tjs.lang.isString(x)) {
			v = x;
		} else if (tjs.lang.isNumber(x)) {
			v = tjs.str.escapeNumber(x);
		} else if (tjs.lang.isBoolean(x)) {
			v = String(x);
		} else if (tjs.lang.isObject(x)) {
			if (x instanceof tjs.data.KeyedObject) {
				v = x.toString();
			} else if (('caption' in x) && tjs.lang.isString(x['caption'])) {
				v = x['caption'];
			} else {
				v = x.toString();
			}
		} else {
			v = '';
		}
		return v;
	},
	convertCmd:function(cmd,caption,tooltip,clsIcon){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(cmd) && cmd != '','!tjs.lang.isString(cmd) @'+this.classname+'.convertCmd');
//tjs_debug_end
		if (!tjs.lang.isString(caption) || caption == '') {
			caption = tjs.config.oResource.get(cmd) || cmd;
		}
		if (!tjs.lang.isString(tooltip) || tooltip == '') {
			tooltip = caption;
		}
		if (!tjs.lang.isString(clsIcon) || clsIcon == '') {
			clsIcon = cmd;
		}
		return new tjs.data.KeyedData(cmd,caption,tooltip,clsIcon);
	},
	convertCmds:function(cmds){
		var a;
		if (tjs.lang.isArray(cmds) && cmds.length > 0) {
			a = [];
			var fkd = tjs.data.KeyedData, oResource = tjs.config.oResource, k = 0, cmd, caption;
			for (var i = 0, isize = cmds.length; i < isize; i++) {
				cmd = cmds[i];
				cmds[i] = null;
				if (tjs.lang.isString(cmd) && cmd != '') {
					caption = oResource.get(cmd) || cmd;
					a[k++] = new fkd(cmd,caption,caption,cmd);
				}
			}
			cmds.length = 0;
			if (a.length == 0) {
				a = null;
			}
		}
		return a;
	},
	convertValue:function(dataType,value){
		var dataTypes = tjs.data.types;
		switch (dataType) {
			case dataTypes.BOOLEAN:
				return Boolean(value);
			case dataTypes.INTEGER:
			case dataTypes.NUMBER:
				return (value == null) ? null : Number(value);
			case dataTypes.DATE:
			case dataTypes.TIME:
			case dataTypes.TIMESTAMP:
			case dataTypes.STRING:
				return (value == null) ? null : String(value);
			case dataTypes.OTHER:
			default:
				return (value == null) ? null : value;
		}
	},
	setValue:function(data,name,dataType,value){
//tjs_debug_start
		tjs.lang.assert(data && tjs.lang.isObject(data),'!tjs.lang.isObject(data) @'+this.classname+'.setValue');
		tjs.lang.assert(name && tjs.lang.isString(name),'!tjs.lang.isString(name) @'+this.classname+'.setValue');
		tjs.lang.assert(dataType && tjs.lang.isString(dataType),'!tjs.lang.isString(dataType) @'+this.classname+'.setValue');
//tjs_debug_end
		data[name] = this.convertValue(dataType,value);
	},
	getValue:function(data,name){
//tjs_debug_start
		tjs.lang.assert(data && tjs.lang.isObject(data),'!tjs.lang.isObject(data) @'+this.classname+'.getValue');
		tjs.lang.assert(name && tjs.lang.isString(name),'!tjs.lang.isString(name) @'+this.classname+'.getValue');
//tjs_debug_end
		return data[name];
	},
	compareBoolean:function(a,b) {
		return (a == b) ? 0 : (a ? 1 : -1);
	},
	compareString:function(a,b) {
		return (a == b) ? 0 : ((a > b) ? 1 : -1);
	},
	compareStringCI:function(a,b) {
		a = a.toLowerCase();
		b = b.toLowerCase();
		return (a == b) ? 0 : ((a > b) ? 1 : -1);
	},
	compareNumber:function(a,b) {
		return a - b;
	},
	getSortHandler:function(dataType){
		var dataTypes = this.types;
		switch (dataType) {
		case dataTypes.BOOLEAN:
			return this.compareBoolean;
		case dataTypes.INTEGER:
		case dataTypes.NUMBER:
			return this.compareNumber;
		case dataTypes.DATE:
		case dataTypes.TIME:
		case dataTypes.TIMESTAMP:
		case dataTypes.STRING:
			return this.compareString;
		case dataTypes.OTHER:
		default:
			return null;
		}
	},
	searchByKey:function(data,key) {
//tjs_debug_start
		tjs.lang.assert(data == null || data instanceof tjs.data.KeyedObject,'!(data instanceof tjs.data.KeyedObject) @'+this.classname+'.searchByKey');
//tjs_debug_end
		return data != null && data.getKey() == key;
	},
	convertArray:function(a,fClass) {
//tjs_debug_start
		tjs.lang.assert(!a || tjs.lang.isArray(a),'!tjs.lang.isArray(a) @'+this.classname+'.convertArray');
		tjs.lang.assert(tjs.lang.isFunction(fClass),'!tjs.lang.isFunction(fClass) @'+this.classname+'.convertArray');
//tjs_debug_end
		if (tjs.lang.isArray(a) && a.length > 0) {
			for (var i = 0, isize = a.length; i < isize; i++){
				a[i] = new fClass(a[i]);
			}
			return a;
		} else {
			return null;
		}
	},
	classname:'tjs.data'
};

tjs.lang.defineTopClass('tjs.data.KeyedObject',
function() {
},{
	destroy:function() {
		tjs.lang.destroyObject(this);
	},
	getKey:function() {
		throw new Error('No implemtation @'+this.classname+'.getKey');
	},
	toString:function() {
		throw new Error('No implemtation @'+this.classname+'.toString');
	},
	getTooltip:function() {
		return '';
	},
	getClsIcon:function() {
		return null;
	}
});

tjs.lang.defineClass('tjs.data.KeyedData',tjs.data.KeyedObject,
function() {
	switch (arguments.length) {
	case 4:
		this.clsIcon = arguments[3];
	case 3:
		this.tooltip = arguments[2];
	case 2:
		this.caption = arguments[1];
		this.key = arguments[0];
		break;
	case 1:
		var v = arguments[0];
		if (v != null) {
			if (tjs.lang.isString(v) || tjs.lang.isNumber(v) || tjs.lang.isBoolean(v)) {
				this.key = v;
			} else if (tjs.lang.isObject(v)) {
				for (var x in v) {
					if (v.hasOwnProperty(x) && !tjs.lang.isFunction(v[x])) {
						this[x] = v[x];
					}
				}
			}
		}
		break;
	}
	tjs.lang.assert(this.key != null,'No key @'+this.classname);
	if (!('caption' in this)) {
		this.caption = String(this.key);
	}
	if (!('tooltip' in this)) {
		this.tooltip = this.caption;//
	}
},{
	getKey:function() {
		return this.key;
	},
	toString:function() {
		return this.caption;
	},
	getTooltip:function() {
		return this.tooltip;
	},
	getClsIcon:function() {
		return this.clsIcon;
	}
});
