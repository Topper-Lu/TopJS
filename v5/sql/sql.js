tjs.sql = {
	editPhase: {
		INSERT:'INSERT',
		UPDATE:'UPDATE'
	},
	types: {
		BOOLEAN:'BOOLEAN',
		CHAR:'CHAR',
		VARCHAR:'VARCHAR',
		LONGVARCHAR:'LONGVARCHAR',
		BIT:'BIT',
		TINYINT:'TINYINT',
		SMALLINT:'SMALLINT',
		INTEGER:'INTEGER',
		BIGINT:'BIGINT',
		REAL:'REAL',
		FLOAT:'FLOAT',
		DOUBLE:'DOUBLE',
		DECIMAL:'DECIMAL',
		NUMERIC:'NUMERIC',
		DATE:'DATE',
		TIME:'TIME',
		TIMESTAMP:'TIMESTAMP',
		BINARY:'BINARY',
		VARBINARY:'VARBINARY',
		LONGVARBINARY:'LONGVARBINARY',
		CLOB:'CLOB',
		BLOB:'BLOB',
		REF:'REF',
		STRUCT:'STRUCT',
		ARRAY:'ARRAY',
		DATALINK:'DATALINK',
		DISTINCT:'DISTINCT',
		OBJECT:'OBJECT',
		OTHER:'OTHER',
		NULL:'NULL',
		classname:'tjs.sql.types'
	},
	options:{
		ADD:1,
		MODIFY:2,
		DELETE:4,
		REFRESH:8,
		PRINT:16,
		SEARCH:32,
		SORT:64,
		PAGED:128,
		DETAIL:256,
		MAIL:512
	},
	handleContainers:function(aFields,oRoot,attrName,fHandler){
		var oField,oContainer,attrValue,i,isize,j,jsize;
		var a = tjs.dom.getElementsByAttribute(oRoot,'*',attrName,null);
		if (a && a.length > 0) {
			for (j = 0, jsize = a.length; j < jsize; j++){
				oContainer = a[j];
				a[j] = null;
				attrValue = oContainer.getAttribute(attrName);
				oContainer.removeAttribute(attrName);
				for (i = 0, isize = aFields.length; i < isize; i++){
					oField = aFields[i];
					if (attrValue == oField.getKey()) {
						fHandler(oField,oContainer);
						break;
					}
				}
			}
			a.length = 0;
		}
	},
	createLabel:function(oField,oContainer){
		oContainer.innerHTML = oField.toString();
	},
	createField:function(k,f,dt,st,c,w,oe){
		var o = this.createItem(k,f,dt,st,c,w,oe);
		if (o) {
			var oField = new o.f(o.o);
			delete o.f;
			delete o.o;
			return oField;
		} else {
			return null;
		}
	},
	createItem:function(k,f,dt,st,c,w,oe){
		if (k && tjs.lang.isString(k) && tjs.lang.isFunction(f) && tjs.lang.isSubClassOf(f,tjs.sql.Field)) {
			var o = tjs.lang.copyObject(f.oConfig,{name:k});
			if (tjs.lang.isObject(oe)) {
				for (var x in oe) {
					o[x] = oe[x];
				}
			}
			if (c) {
				o.caption = c;
			}
			if (dt) {
				o.dataType = dt;
			}
			if (st) {
				o.sqlType = st;
			}
			if (tjs.lang.isNumber(w)) {
				if (!o.oGridColumn) {
					o.oGridColumn = {};
				}
				o.oGridColumn.width = w;
			}
			return {f:f,o:o};
		} else {
			return null;
		}
	},
	createRefItem:function(k,f,dt,st,ns,c,w){
		var o = tjs.lang.copyObject(f.oConfig,{dataType:dt,sqlType:st,names:ns,caption:c});
		if (!o.oGridColumn) {
			o.oGridColumn = {};
		}
		o.oGridColumn.width = w;
		return {f:f,o:o};
	},
	extraConfig2:function(c,fE){
		var tl = tjs.lang;
		if (tl.isFunction(fE)) {
			var oE = fE(),k;
			for (k in oE) {
				if (k in c) {
					tl.copyObject(oE[k],c[k].o);
				}
			}
		}
		return c;
	},
	extraConfig:function(c,fE){
		if (tjs.lang.isFunction(fE)) {
			var oE = fE(),k,s,d,x;
			for (k in oE) {
				if (k in c) {
					s = oE[k];
					d = c[k].o;
					for (x in s) {
						d[x] = s[x];
					}
				}
			}
		}
		return c;
	},
	classname:'tjs.sql'
};

tjs.lang.defineTopClass('tjs.sql.Data',
function(data){
	this.init();
	if (tjs.lang.isObject(data)){
		for (var x in this) {
			if (this.hasOwnProperty(x) && data.hasOwnProperty(x)) {
				this[x] = data[x];
			}
		}
	}
},{
	//-- to be overrided
	init:function(){}
});

tjs.lang.defineTopClass('tjs.sql.Factory',
function(oConfig){
//tjs_debug_start
	tjs.lang.assert(tjs.lang.isObject(oConfig),'!tjs.lang.isObject(oConfig) @'+this.classname);
//tjs_debug_end
	this._createFields(oConfig);
	tjs.event.addSystemUnloadHandler(this.destroy.bind(this));
},{
	destroy:function(){
		if (this.oFields){
			this.oFields.forEach(tjs.util.destructor);
			this.oFields.destroy();
			tjs.lang.destroyObject(this,true);
		}
	},
	_createFields:function(oConfig){
		var o = {}, x, c, oField;
		for (x in oConfig) {
			c = oConfig[x];
			if (tjs.lang.isObject(c) && tjs.lang.isObject(c.o) && tjs.lang.isFunction(c.f)) {
				oField = new c.f(c.o);
				delete c.f;
				delete c.o;
				delete oConfig[x];
				o[oField.getKey()] = oField;
			}
		}
		this.oFields = new tjs.util.Map(o);
	},
	addField:function(oField){
		if (oField instanceof tjs.sql.Field) {
			this.oFields.put(oField.getKey(),oField);
		}
	},
	getField:function(name){
		return this.oFields.get(name);
	},
	removeField:function(name){
		return this.oFields.remove(name);
	},
	getFields:function(aFieldNames, fFilter){
//tjs_debug_start
		tjs.lang.assert(aFieldNames == null || tjs.lang.isArray(aFieldNames),'!tjs.lang.isArray(aFieldNames) @'+this.classname+'.getFields');
		tjs.lang.assert(fFilter == null || tjs.lang.isFunction(fFilter),'!tjs.lang.isFunction(fFilter) @'+this.classname+'.getFields');
//tjs_debug_end
		if (fFilter == null) {
			fFilter = this._fTrueFilter;
		}
		var oItems = this.oFields.items;
		var a = [], k = 0, x, oField;
		if (aFieldNames){
			var o = {}, isize = aFieldNames.length;
			for (var i = 0; i < isize; i++){
				x = aFieldNames[i];
				if (!o[x]) {
					o[x] = true;
					oField = oItems[x];
					if (oField && fFilter(oField)){
						a[k++] = oField;
					}
				}
			}
			tjs.lang.destroyObject(o);
		} else {
			for (x in oItems){
				oField = oItems[x];
				if (fFilter(oField)){
					a[k++] = oField;
				}
			}
		}
		return a;
	},
	_fTrueFilter:function(){
		return true;
	},
	_fSearchFilter:function(oField){
		return oField.isSearchable();
	},
	_fSortFilter:function(oField){
		return oField.isSortable();
	},
	_fEditFilter:function(oField){
		return oField.isEditable();
	},
	_fRenderFilter:function(oField){
		return oField.isRenderable();
	},
	_fGridColumnFilter:function(oField){
		return oField.hasGridColumn();
	},
	getEditFields:function(aFieldNames){
		return this.getFields(aFieldNames, this._fEditFilter);
	},
	getRenderFields:function(aFieldNames){
		return this.getFields(aFieldNames, this._fRenderFilter);
	},
	getGridColumnFields:function(aFieldNames){
		return this.getFields(aFieldNames, this._fGridColumnFilter);
	},
	getSearchFields:function(aFieldNames){
		return this.getFields(aFieldNames, this._fSearchFilter);
	},
	getSortFields:function(aFieldNames){
		return this.getFields(aFieldNames, this._fSortFilter);
	}
});
