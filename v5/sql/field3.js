// Multiple Columns Field
tjs.lang.defineClass('tjs.sql.MField',tjs.sql.Field,
function(o){
	tjs.sql.Field.call(this,o);
},{
	_construct:function(){
//tjs_debug_start
		var names = this.oMap.get('names');
		tjs.lang.assert(tjs.lang.isArray(names),'!tjs.lang.isArray(names) @'+this.classname);
		var dataTypes = this.oMap.get('dataTypes');
		tjs.lang.assert(tjs.lang.isArray(dataTypes),'!tjs.lang.isArray(dataTypes) @'+this.classname);
		tjs.lang.assert(names.length == dataTypes.length,'names.length != dataTypes.length @'+this.classname);
		var sqlTypes = this.oMap.get('sqlTypes');
		tjs.lang.assert(tjs.lang.isArray(sqlTypes),'!tjs.lang.isArray(sqlTypes) @'+this.classname);
		tjs.lang.assert(names.length == sqlTypes.length,'names.length != sqlTypes.length @'+this.classname);
//tjs_debug_end
		var key = this.oMap.get('names').join(',');
		this.oMap.put('key',key);
		this.oMap.putIfUndefined('caption',key);
		this.oMap.putIfUndefined('sortable',false);
		this.oMap.putIfUndefined('dataType',tjs.data.types.STRING);
	},
	isMultiColumn:function(){
		return true;
	},
	setValue:function(data,value){
		if (data){
			var names = this.oMap.get('names');
			var values = value.split(',');
//tjs_debug_start
			tjs.lang.assert(values.length == names.length,'values.length != names.length @'+this.classname+'.setValue');
//tjs_debug_end
			var dataTypes = this.oMap.get('dataTypes');
			var f = tjs.data.convertValue;
			for (var i = 0, isize = names.length; i < isize; i++){
				data[names[i]] = f(dataTypes[i],values[i]);
			}
		}
	},
	getValue:function(data){
		if (data){
			var names = this.oMap.get('names');
			var a = [];
			for (var i = 0, isize = names.length; i < isize; i++){
				a[i] = data[names[i]];
			}
			var s = a.join(',');
			tjs.lang.destroyArray(a);
			return s;
		} else {
			return null;
		}
	},
	encode:function(oEncoder,value){
//tjs_debug_start
		tjs.lang.assert(oEncoder instanceof tjs.sql.Encoder,'!(oEncoder instanceof tjs.sql.Encoder) @'+this.classname+'.encode');
//tjs_debug_end
		var names = this.oMap.get('names');
		var values = value.split(',');
//tjs_debug_start
		tjs.lang.assert(values.length == names.length,'values.length != names.length @'+this.classname+'.encode');
//tjs_debug_end
		var dataTypes = this.oMap.get('dataTypes');
		var sqlTypes = this.oMap.get('sqlTypes');
		var f = tjs.data.convertValue;
		var i = names.length, v, dt;
		while (i--){
			v = values[i];
			dt = dataTypes[i];
			v = f(dt,v);
			values[i] = oEncoder.encode(dt,sqlTypes[i],v);
		}
		return values;
	}
});

tjs.lang.defineClass('tjs.sql.ComboboxMField',tjs.sql.MField,
function(o){
	tjs.sql.MField.call(this,o);
},tjs.sql.ListField,{
	_doConfig:function(){
		this._checkDatas();
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.TextFromListColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.TextFromList);
		this.oMap.putIfUndefined('fEditor',tjs.editor.Combobox);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.CheckboxListDialog);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4In);
	}
});
tjs.sql.ComboboxMField.oConfig = {oEditor:{width:120},oEditor4Search:{width:120}};

tjs.lang.defineClass('tjs.sql.RadioListMField',tjs.sql.MField,
function(o){
	tjs.sql.MField.call(this,o);
},tjs.sql.ListField,{
	_doConfig:function(){
		this._checkDatas();
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.RadioListColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.RadioList);
		this.oMap.putIfUndefined('fEditor',tjs.editor.RadioList);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.CheckboxList);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4In);
	}
});
tjs.sql.RadioListMField.oConfig = {oRenderer:{hv:'h'},oEditor:{hv:'h'},oEditor4Search:{hv:'h'}};

tjs.lang.defineClass('tjs.sql.RadioListDialogMField',tjs.sql.MField,
function(o){
	tjs.sql.MField.call(this,o);
},tjs.sql.ListField,{
	_doConfig:function(){
		this._checkDatas();
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.TextFromListColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.TextFromList);
		this.oMap.putIfUndefined('fEditor',tjs.editor.RadioListDialog);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.CheckboxListDialog);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4In);
	}
});
tjs.sql.RadioListDialogMField.oConfig = {oEditor:{width:120},oEditor4Search:{width:120}};

tjs.lang.defineClass('tjs.sql.RadioTreeDialogMField',tjs.sql.MField,
function(o){
	tjs.sql.MField.call(this,o);
},tjs.sql.TreeField,{
	_doConfig:function(){
		this._checkDatas();
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.TextFromTreeColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.TextFromTree);
		this.oMap.putIfUndefined('fEditor',tjs.editor.RadioTreeDialog);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.CheckboxTreeDialog);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4In);
	}
});
tjs.sql.RadioTreeDialogMField.oConfig = {oEditor:{hideRoot:false,leafOnly:false,width:120},oEditor4Search:{excludeDescendants:false,hideRoot:true,leafOnly:false,width:120}};

tjs.lang.defineClass('tjs.sql.RadioPTreeDialogMField',tjs.sql.MField,
function(o){
	tjs.sql.MField.call(this,o);
},tjs.sql.TreeField,{
	_doConfig:function(){
		this._checkDatas();
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.TextFromTreeColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.TextFromTree);
		this.oMap.putIfUndefined('fEditor',tjs.editor.RadioPTreeDialog);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.CheckboxPTreeDialog);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4TreePath);
	}
});
tjs.sql.RadioPTreeDialogMField.oConfig = {oEditor:{excludeDescendants:true,hideRoot:false,leafOnly:false,width:120},oEditor4Search:{excludeDescendants:true,hideRoot:true,leafOnly:false,width:120}};

// No Column Field
tjs.lang.defineClass('tjs.sql.NField',tjs.sql.Field,
function(o){
	tjs.sql.Field.call(this,o);
},{
	_construct:function(){
//tjs_debug_start
		var name = this.oMap.get('name');
		tjs.lang.assert(tjs.lang.isString(name) && name != '','!tjs.lang.isString(name) @'+this.classname);
//tjs_debug_end
		var key = this.oMap.get('name');
		this.oMap.put('key',key);
		this.oMap.putIfUndefined('caption',key);
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
	}
});

tjs.lang.defineClass('tjs.sql.FileField',tjs.sql.NField,
function(o){
	tjs.sql.NField.call(this,o);
},{
	_doConfig:function(){
		this.oMap.putIfUndefined('fEditor',tjs.editor.File);
	}
});
tjs.sql.FileField.oConfig = {oEditor:{width:200}};

tjs.lang.defineClass('tjs.sql.FilesField',tjs.sql.NField,
function(o){
	tjs.sql.NField.call(this,o);
},{
	_doConfig:function(){
		this.oMap.putIfUndefined('fEditor',tjs.editor.Files);
	}
});
tjs.sql.FilesField.oConfig = {oEditor:{width:200}};
