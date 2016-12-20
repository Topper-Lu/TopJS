tjs.lang.defineClass('tjs.sql.Field',tjs.data.KeyedObject,
function(o){
	this.oMap = tjs.util.toMap(o);
	this.construct();
},{
	construct:function(){
		this._doConfig();
		this._construct();
	},
	destroy:function(){
		if (this.oMap){
			this.oMap.destroy();
			tjs.lang.destroyObject(this,true);
		}
	},
	getMap:function(){
		return this.oMap;
	},
	getKey:function(){
		return this.oMap.get('key');
	},
	toString:function(){
		return this.oMap.get('caption');
	},
	getTooltip:function(){
		return this.oMap.get('tooltip') || '';
	},
	isMultiColumn:function(){
		return false;
	},
	isSortable:function(){
		return this.oMap.get('sortable');
	},
	hasGridColumn:function(){
		return tjs.lang.isFunction(this.oMap.get('fGridColumn'));
	},
	isSearchable:function(){
		return tjs.lang.isFunction(this.oMap.get('fEditor4Search')) && tjs.lang.isFunction(this.oMap.get('fSearchItem'));
	},
	isEditable:function(){
		return tjs.lang.isFunction(this.oMap.get('fEditor'));
	},
	isRenderable:function(){
		return tjs.lang.isFunction(this.oMap.get('fRenderer'));
	},
	getSearchItemClass:function(){
		return this.oMap.get('fSearchItem');
	},
	createSearchItem:function(oElement){
		var f = this.oMap.get('fSearchItem');
		return f ? new f({oField:this,oElement:oElement}) : null;
	},
	fromEditorValue:function(data,value){
		this.setValue(data,value);
	},
	toEditorValue:function(data){
		return this.getValue(data);
	},
	toRendererValue:function(data){
		return this.getValue(data);
	},
	toGridColumnValue:function(data){
		return this.getValue(data);
	},
	// to be overrided
	_doConfig:function(){},
	_construct:function(){},
	createGridColumn:function(){return null;},
	createRenderer:function(oContainer){return null;},
	createEditor:function(oContainer){return null;},
	createEditor4Search:function(oContainer){return null;},
	setValue:function(data,value){},
	getValue:function(data){return null;},
	encode:function(oEncoder,value){return null;}
});

// Single Column Field
tjs.lang.defineClass('tjs.sql.SField',tjs.sql.Field,
function(o){
	tjs.sql.Field.call(this,o);
},{
	_construct:function(){
//tjs_debug_start
		var name = this.oMap.get('name');
		tjs.lang.assert(tjs.lang.isString(name) && name != '','!tjs.lang.isString(name) @'+this.classname);
		var dataType = this.oMap.get('dataType');
		tjs.lang.assert(tjs.lang.isString(dataType) && dataType != '','!tjs.lang.isString(dataType) @'+this.classname);
		var sqlType = this.oMap.get('sqlType');
		tjs.lang.assert(tjs.lang.isString(sqlType) && sqlType != '','!tjs.lang.isString(sqlType) @'+this.classname);
//tjs_debug_end
		var key = this.oMap.get('name');
		this.oMap.put('key',key);
		this.oMap.putIfUndefined('caption',key);
		this.oMap.putIfUndefined('sortable',true);
	},
	setValue:function(data,value){
		if (data){
			data[this.oMap.get('name')] = tjs.data.convertValue(this.oMap.get('dataType'),value);
		}
	},
	getValue:function(data){
		return data ? data[this.oMap.get('name')] : null;
	},
	encode:function(oEncoder,value){
		var dataType = this.oMap.get('dataType');
		var sqlType = this.oMap.get('sqlType');
		value = tjs.data.convertValue(dataType,value);
		return oEncoder.encode(dataType,sqlType,value);
	}
});

tjs.lang.defineClass('tjs.sql.SimpleField',tjs.sql.SField,
function(o){
	tjs.sql.SField.call(this,o);
},{
	createRenderer:function(oContainer){
		var f = this.oMap.get('fRenderer');
		if (f) {
			var o1 = this.oMap.get('oRenderer');
			var o2 = {
				oParent:oContainer
			};
			return new f(o1 ? tjs.lang.copyObject(o1,o2,true) : o2);
		}
		return null;
	},
	createEditor:function(oContainer){
		var f = this.oMap.get('fEditor');
		if (f) {
			var o1 = this.oMap.get('oEditor');
			var o2 = {
				oParent:oContainer,
				name:this.oMap.get('key'),
				caption:this.oMap.get('caption')
			};
			return new f(o1 ? tjs.lang.copyObject(o1,o2,true) : o2);
		}
		return null;
	},
	createEditor4Search:function(oContainer){
		var f = this.oMap.get('fEditor4Search');
		if (f) {
			var o1 = this.oMap.get('oEditor4Search');
			var o2 = {
				oParent:oContainer,
				name:this.oMap.get('key'),
				caption:this.oMap.get('caption')
			};
			return new f(o1 ? tjs.lang.copyObject(o1,o2,true) : o2);
		}
		return null;
	},
	createGridColumn:function(){
		var f = this.oMap.get('fGridColumn');
		if (f) {
			var o1 = this.oMap.get('oGridColumn');
			var o2 = {
				oDataHandler:this,
				sortable:this.isSortable(),
				dataType:this.oMap.get('dataType'),
				name:this.oMap.get('key'),
				caption:this.oMap.get('caption')
			};
			return new f(o1 ? tjs.lang.copyObject(o1,o2,true) : o2);
		}
		return null;
	}
});

tjs.lang.defineClass('tjs.sql.URLField',tjs.sql.SimpleField,
function(o){
	tjs.sql.SimpleField.call(this,o);
},{
	_doConfig:function(){
		this.oMap.putIfUndefined('dataType',tjs.data.types.STRING);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.VARCHAR);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.URLColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.URLRenderer);
		this.oMap.putIfUndefined('fEditor',tjs.editor.Text);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.Text);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4String);
	}
});
tjs.sql.URLField.oConfig = {};

tjs.lang.defineClass('tjs.sql.HTMLField',tjs.sql.SimpleField,
function(o){
	tjs.sql.SimpleField.call(this,o);
},{
	_doConfig:function(){
		this.oMap.putIfUndefined('dataType',tjs.data.types.STRING);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.VARCHAR);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.HTMLColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.HTMLRenderer);
		this.oMap.putIfUndefined('fEditor',tjs.editor.HTMLDialog);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.Text);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4String);
	}
});
tjs.sql.HTMLField.oConfig = {};

tjs.lang.defineClass('tjs.sql.CheckboxField',tjs.sql.SimpleField,
function(o){
	tjs.sql.SimpleField.call(this,o);
},{
	_doConfig:function(){
		this.oMap.putIfUndefined('dataType',tjs.data.types.BOOLEAN);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.BOOLEAN);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.CheckboxColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.Checkbox);
		this.oMap.putIfUndefined('fEditor',tjs.editor.Checkbox);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.Checkbox);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4Default);
	}
});
tjs.sql.CheckboxField.oConfig = {};

tjs.lang.defineClass('tjs.sql.TextField',tjs.sql.SimpleField,
function(o){
	tjs.sql.SimpleField.call(this,o);
},{
	_doConfig:function(){
		this.oMap.putIfUndefined('dataType',tjs.data.types.STRING);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.VARCHAR);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.TextColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.OneLineText);
		this.oMap.putIfUndefined('fEditor',tjs.editor.Text);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.Text);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4String);
	}
});
tjs.sql.TextField.oConfig = {oEditor:{width:160},oEditor4Search:{width:160}};

tjs.lang.defineClass('tjs.sql.PasswordField',tjs.sql.SimpleField,
function(o){
	tjs.sql.SimpleField.call(this,o);
},{
	_doConfig:function(){
		this.oMap.putIfUndefined('dataType',tjs.data.types.STRING);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.VARCHAR);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.TextColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.OneLineText);
		this.oMap.putIfUndefined('fEditor',tjs.editor.Password);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.Text);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4String);
	}
});
tjs.sql.PasswordField.oConfig = {oEditor:{width:160},oEditor4Search:{width:160}};

tjs.lang.defineClass('tjs.sql.TextAreaField',tjs.sql.SimpleField,
function(o){
	tjs.sql.SimpleField.call(this,o);
},{
	_doConfig:function(){
		this.oMap.putIfUndefined('dataType',tjs.data.types.STRING);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.VARCHAR);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.MultiLineTextColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.MultiLineText);
		this.oMap.putIfUndefined('fEditor',tjs.editor.TextArea);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.Text);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4String);
	}
});
tjs.sql.TextAreaField.oConfig = {oEditor:{height:100},oEditor4Search:{width:160}};

tjs.lang.defineClass('tjs.sql.PhraseField',tjs.sql.SimpleField,
function(o){
	tjs.sql.SimpleField.call(this,o);
},{
	_doConfig:function(){
		this.oMap.putIfUndefined('dataType',tjs.data.types.STRING);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.VARCHAR);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.MultiLineTextColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.MultiLineText);
		this.oMap.putIfUndefined('fEditor',tjs.editor.Phrase);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.Text);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4String);
	}
});
tjs.sql.PhraseField.oConfig = {oEditor:{height:100},oEditor4Search:{width:160}};

tjs.lang.defineClass('tjs.sql.NumberField',tjs.sql.SimpleField,
function(o){
	tjs.sql.SimpleField.call(this,o);
},{
	_doConfig:function(){
		this.oMap.putIfUndefined('dataType',tjs.data.types.NUMBER);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.DOUBLE);//
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.NumberColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.Number);
		this.oMap.putIfUndefined('fEditor',tjs.editor.Number);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.Number);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4Number);
	}
});
tjs.sql.NumberField.oConfig = {oEditor:{width:80},oEditor4Search:{width:80}};

tjs.lang.defineClass('tjs.sql.IntegerField',tjs.sql.SimpleField,
function(o){
	tjs.sql.SimpleField.call(this,o);
},{
	_doConfig:function(){
		this.oMap.putIfUndefined('dataType',tjs.data.types.INTEGER);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.INTEGER);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.NumberColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.Number);
		this.oMap.putIfUndefined('fEditor',tjs.editor.Integer);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.Integer);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4Number);
	}
});
tjs.sql.IntegerField.oConfig = {oEditor:{width:80},oEditor4Search:{width:80}};

tjs.lang.defineClass('tjs.sql.SpinnerField',tjs.sql.SimpleField,
function(o){
	tjs.sql.SimpleField.call(this,o);
},{
	_doConfig:function(){
		this.oMap.putIfUndefined('dataType',tjs.data.types.INTEGER);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.INTEGER);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.NumberColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.Number);
		this.oMap.putIfUndefined('fEditor',tjs.editor.Spinner);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.Spinner);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4Number);
	}
});
tjs.sql.SpinnerField.oConfig = {oEditor:{width:80},oEditor4Search:{width:80}};

tjs.lang.defineClass('tjs.sql.SliderField',tjs.sql.SimpleField,
function(o){
	tjs.sql.SimpleField.call(this,o);
},{
	_doConfig:function(){
		this.oMap.putIfUndefined('dataType',tjs.data.types.INTEGER);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.INTEGER);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.NumberColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.Number);
		this.oMap.putIfUndefined('fEditor',tjs.editor.Slider);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.Slider);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4Number);
	}
});
tjs.sql.SliderField.oConfig = {oEditor:{slotLength:200,tickSize:10,valueStart:0,valueEnd:200},oEditor4Search:{slotLength:200,tickSize:10,valueStart:0,valueEnd:200}};

tjs.lang.defineClass('tjs.sql.DateField',tjs.sql.SimpleField,
function(o){
	tjs.sql.SimpleField.call(this,o);
},{
	_doConfig:function(){
		this.oMap.putIfUndefined('dataType',tjs.data.types.DATE);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.DATE);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.DateTimeColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.OneLineText);
		this.oMap.putIfUndefined('fEditor',tjs.editor.Date);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.Date);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4Number);
	}
});
tjs.sql.DateField.oConfig = {oEditor:{width:120,spDate:'-',yearType:null},oEditor4Search:{width:120,spDate:'-',yearType:null}};

tjs.lang.defineClass('tjs.sql.TimeField',tjs.sql.SimpleField,
function(o){
	tjs.sql.SimpleField.call(this,o);
},{
	_doConfig:function(){
		this.oMap.putIfUndefined('dataType',tjs.data.types.TIME);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.TIME);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.DateTimeColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.OneLineText);
		this.oMap.putIfUndefined('fEditor',tjs.editor.Time);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.Time);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4Number);
	}
});
tjs.sql.TimeField.oConfig = {oEditor:{width:100,spTime:':',noSeconds:false},oEditor4Search:{width:100,spTime:':',noSeconds:false}};

tjs.lang.defineClass('tjs.sql.TimestampField',tjs.sql.SimpleField,
function(o){
	tjs.sql.SimpleField.call(this,o);
},{
	_doConfig:function(){
		this.oMap.putIfUndefined('dataType',tjs.data.types.TIMESTAMP);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.TIMESTAMP);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.DateTimeColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.OneLineText);
		this.oMap.putIfUndefined('fEditor',tjs.editor.Timestamp);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.Timestamp);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4Number);
	}
});
tjs.sql.TimestampField.oConfig = {oEditor:{width:200,spDate:'-',yearType:null,spTime:':',noSeconds:false,spTimestamp:' '},oEditor4Search:{width:200,spDate:'-',yearType:null,spTime:':',noSeconds:false,spTimestamp:' '}};

tjs.lang.defineClass('tjs.sql.ColorField',tjs.sql.SimpleField,
function(o){
	tjs.sql.SimpleField.call(this,o);
},{
	_doConfig:function(){
		this.oMap.putIfUndefined('dataType',tjs.data.types.STRING);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.VARCHAR);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.ColorColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.Color);
		this.oMap.putIfUndefined('fEditor',tjs.editor.Color);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.Color);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4Default);
	}
});
tjs.sql.ColorField.oConfig = {oEditor:{width:120},oEditor4Search:{width:120}};

tjs.lang.defineClass('tjs.sql.ImgField',tjs.sql.SimpleField,
function(o){
	tjs.sql.SimpleField.call(this,o);
},{
	_doConfig:function(){
		var fGetValue = this.oMap.remove('fGetValue');
		this.fGetValue = tjs.lang.isFunction(fGetValue) ? fGetValue : null;
		this.oMap.putIfUndefined('dataType',tjs.data.types.STRING);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.VARCHAR);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.ImgColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.ImgRenderer);
		this.oMap.putIfUndefined('fEditor',tjs.editor.File);
		this.oMap.put('sortable',false);
	},
	getValue:function(data){
		if (this.fGetValue) {
			return this.fGetValue(data);
			//'data:image/jpeg;base64,'+data[this.oMap.get('name')]
		} else {
			return data ? data[this.oMap.get('name')] : null;
		}
	}
});
tjs.sql.ImgField.oConfig = {oEditor:{width:200,ext:'png,gif,jpg,jpeg'}};

tjs.lang.defineClass('tjs.sql.ImgFileField',tjs.sql.SimpleField,
function(o){
	tjs.sql.SimpleField.call(this,o);
},{
	_doConfig:function(){
		var fGetValue = this.oMap.remove('fGetValue');
		this.fGetValue = tjs.lang.isFunction(fGetValue) ? fGetValue : null;
		this.oMap.putIfUndefined('pathImgFile',tjs.sharedMap.get('pathImgFile'));
		this.oMap.putIfUndefined('dataType',tjs.data.types.STRING);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.VARCHAR);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.ImgColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.ImgRenderer);
		this.oMap.putIfUndefined('fEditor',tjs.editor.File);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.Text);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4String);
		this.oMap.put('sortable',false);
	},
	getValue:function(data){
		if (this.fGetValue) {
			return this.fGetValue(data);
		} else {
			var pathImgFile = this.oMap.get('pathImgFile');
			var key = this.oMap.get('key');
			return (data && data[key]) ? (pathImgFile+data[key]) : null;
		}
	}
});
tjs.sql.ImgFileField.oConfig = {oEditor:{width:200,ext:'png,gif,jpg,jpeg'},oEditor4Search:{width:160}};

tjs.lang.defineClass('tjs.sql.FlashFileField',tjs.sql.SimpleField,
function(o){
	tjs.sql.SimpleField.call(this,o);
},{
	_doConfig:function(){
		var fGetValue = this.oMap.remove('fGetValue');
		this.fGetValue = tjs.lang.isFunction(fGetValue) ? fGetValue : null;
		this.oMap.putIfUndefined('pathFlashFile',tjs.sharedMap.get('pathFlashFile'));
		this.oMap.putIfUndefined('dataType',tjs.data.types.STRING);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.VARCHAR);
		//this.oMap.putIfUndefined('fGridColumn',tjs.grid.FlashColumn);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.TextColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.OneLineText);
		this.oMap.putIfUndefined('fEditor',tjs.editor.File);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.Text);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4String);
		this.oMap.put('sortable',false);
	},
	getValue:function(data){
		if (this.fGetValue) {
			return this.fGetValue(data);
		} else {
			var pathFlashFile = this.oMap.get('pathFlashFile');
			var key = this.oMap.get('key');
			return (data && data[key]) ? (pathFlashFile+data[key]) : null;
		}
	}
});
tjs.sql.FlashFileField.oConfig = {oEditor:{width:200,ext:'swf'},oEditor4Search:{width:160}};

tjs.lang.defineClass('tjs.sql.MimeFileField',tjs.sql.SimpleField,
function(o){
	tjs.sql.SimpleField.call(this,o);
},{
	_doConfig:function(){
		var fGetValue = this.oMap.remove('fGetValue');
		this.fGetValue = tjs.lang.isFunction(fGetValue) ? fGetValue : null;
		this.oMap.putIfUndefined('pathMimeFile',tjs.sharedMap.get('pathMimeFile'));
		this.oMap.putIfUndefined('dataType',tjs.data.types.STRING);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.VARCHAR);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.LinkColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.OneLineText);
		this.oMap.putIfUndefined('fEditor',tjs.editor.File);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.Text);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4String);
		this.oMap.put('sortable',false);
		var o = this.oMap.get('oGridColumn');
		if (!tjs.lang.isObject(o)) {
			this.oMap.put('oGridColumn',{defaultText:tjs.config.oResource.get('file_download')});
		} else if (!o.defaultText || !tjs.lang.isString(o.defaultText)) {
			o.defaultText = tjs.config.oResource.get('file_download');
		}
	},
	getValue:function(data){
		if (this.fGetValue) {
			return this.fGetValue(data);
		} else {
			var pathMimeFile = this.oMap.get('pathMimeFile');
			var key = this.oMap.get('key');
			return (data && data[key]) ? (pathMimeFile+data[key]) : null;
		}
	}
});
tjs.sql.MimeFileField.oConfig = {oEditor:{width:200},oEditor4Search:{width:160}};
