tjs.lang.defineTopClass('tjs.sql.ListField',
function(){
},{
	_checkDatas:function() {
		var datas = this.oMap.remove('datas');
		var cache = this.oMap.remove('cache');
		if (tjs.lang.isArray(datas)) {
			this.datas = datas;
		} else if (tjs.lang.isObject(cache) && cache.url && tjs.lang.isString(cache.url) && tjs.lang.isFunction(cache.fClass)) {
			this.cache = cache;
		}
	},
	createRenderer:function(oContainer){
		var f = this.oMap.get('fRenderer');
		if (f) {
			var o1 = this.oMap.get('oRenderer');
			var o2 = {
				oParent:oContainer
			};
			if (this.datas) {
				o2.datas = this.datas;
			} else if (this.cache) {
				o2.cache = this.cache;
			}
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
			if (this.datas) {
				o2.datas = this.datas;
			} else if (this.cache) {
				o2.cache = this.cache;
			}
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
			if (this.datas) {
				o2.datas = this.datas;
			} else if (this.cache) {
				o2.cache = this.cache;
			}
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
			if (this.datas) {
				o2.datas = this.datas;
			} else if (this.cache) {
				o2.cache = this.cache;
			}
			return new f(o1 ? tjs.lang.copyObject(o1,o2,true) : o2);
		}
		return null;
	}
});

tjs.lang.defineClass('tjs.sql.ComboboxField',tjs.sql.SField,
function(o){
	tjs.sql.SField.call(this,o);
},tjs.sql.ListField,{
	_doConfig:function(){
		this._checkDatas();
		this.oMap.putIfUndefined('dataType',tjs.data.types.INTEGER);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.INTEGER);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.TextFromListColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.TextFromList);
		this.oMap.putIfUndefined('fEditor',tjs.editor.Combobox);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.CheckboxListDialog);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4In);
	}
});
tjs.sql.ComboboxField.oConfig = {oEditor:{width:120},oEditor4Search:{width:120}};

tjs.lang.defineClass('tjs.sql.DualRadioField',tjs.sql.SField,
function(o){
	tjs.sql.SField.call(this,o);
},tjs.sql.ListField,{
	_doConfig:function(){
		this._checkDatas();
		this.oMap.putIfUndefined('dataType',tjs.data.types.INTEGER);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.INTEGER);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.RadioListColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.RadioList);
		this.oMap.putIfUndefined('fEditor',tjs.editor.RadioList);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.RadioList);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4Default);
	}
});
tjs.sql.DualRadioField.oConfig = {oRenderer:{hv:'h'},oEditor:{hv:'h'},oEditor4Search:{hv:'h'}};

tjs.lang.defineClass('tjs.sql.RadioListField',tjs.sql.SField,
function(o){
	tjs.sql.SField.call(this,o);
},tjs.sql.ListField,{
	_doConfig:function(){
		this._checkDatas();
		this.oMap.putIfUndefined('dataType',tjs.data.types.INTEGER);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.INTEGER);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.RadioListColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.RadioList);
		this.oMap.putIfUndefined('fEditor',tjs.editor.RadioList);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.CheckboxList);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4In);
	}
});
tjs.sql.RadioListField.oConfig = {};

tjs.lang.defineClass('tjs.sql.RadioListDialogField',tjs.sql.SField,
function(o){
	tjs.sql.SField.call(this,o);
},tjs.sql.ListField,{
	_doConfig:function(){
		this._checkDatas();
		this.oMap.putIfUndefined('dataType',tjs.data.types.INTEGER);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.INTEGER);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.TextFromListColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.TextFromList);
		this.oMap.putIfUndefined('fEditor',tjs.editor.RadioListDialog);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.CheckboxListDialog);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4In);
	}
});
tjs.sql.RadioListDialogField.oConfig = {oEditor:{width:120},oEditor4Search:{width:120}};

tjs.lang.defineClass('tjs.sql.BitCheckboxListField',tjs.sql.SField,
function(o){
	tjs.sql.SField.call(this,o);
},tjs.sql.ListField,{
	_doConfig:function(){
		this._checkDatas();
		this.oMap.putIfUndefined('dataType',tjs.data.types.INTEGER);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.INTEGER);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.BitCheckboxListColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.BitCheckboxList);
		this.oMap.putIfUndefined('fEditor',tjs.editor.BitCheckboxList);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.BitCheckboxList);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4Bits);
	}
});
tjs.sql.BitCheckboxListField.oConfig = {};

tjs.lang.defineClass('tjs.sql.BitCheckboxListDialogField',tjs.sql.SField,
function(o){
	tjs.sql.SField.call(this,o);
},tjs.sql.ListField,{
	_doConfig:function(){
		this._checkDatas();
		this.oMap.putIfUndefined('dataType',tjs.data.types.INTEGER);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.INTEGER);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.BitTextFromListColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.BitTextFromList);
		this.oMap.putIfUndefined('fEditor',tjs.editor.BitCheckboxListDialog);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.BitCheckboxListDialog);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4Bits);
	}
});
tjs.sql.BitCheckboxListDialogField.oConfig = {oEditor:{width:120},oEditor4Search:{width:120}};

tjs.lang.defineTopClass('tjs.sql.TreeField',
function(){
},{
	_checkDatas:function() {
		var root = this.oMap.remove('root');
		var cache = this.oMap.remove('cache');
		if (root instanceof tjs.data.TreeNode) {
			this.root = root;
		} else if (tjs.lang.isObject(cache) && cache.url && tjs.lang.isString(cache.url) && tjs.lang.isFunction(cache.fClass)) {
			this.cache = cache;
		}
	},
	createRenderer:function(oContainer){
		var f = this.oMap.get('fRenderer');
		if (f) {
			var o1 = this.oMap.get('oRenderer');
			var o2 = {
				oParent:oContainer
			};
			if (this.root) {
				o2.root = this.root;
			} else if (this.cache) {
				o2.cache = this.cache;
			}
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
			if (this.root) {
				o2.root = this.root;
			} else if (this.cache) {
				o2.cache = this.cache;
			}
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
				dataType:this.oMap.get('dataType'),
				name:this.oMap.get('key'),
				caption:this.oMap.get('caption')
			};
			if (this.root) {
				o2.root = this.root;
			} else if (this.cache) {
				o2.cache = this.cache;
			}
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
			if (this.root) {
				o2.root = this.root;
			} else if (this.cache) {
				o2.cache = this.cache;
			}
			return new f(o1 ? tjs.lang.copyObject(o1,o2,true) : o2);
		}
		return null;
	}
});

tjs.lang.defineClass('tjs.sql.RadioTreeDialogField',tjs.sql.SField,
function(o){
	tjs.sql.SField.call(this,o);
},tjs.sql.TreeField,{
	_doConfig:function(){
		this._checkDatas();
		this.oMap.putIfUndefined('dataType',tjs.data.types.INTEGER);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.INTEGER);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.TextFromTreeColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.TextFromTree);
		this.oMap.putIfUndefined('fEditor',tjs.editor.RadioTreeDialog);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.CheckboxTreeDialog);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4In);
	}
});
tjs.sql.RadioTreeDialogField.oConfig = {oEditor:{hideRoot:false,leafOnly:false,width:120},oEditor4Search:{hideRoot:false,leafOnly:false,width:120}};

tjs.lang.defineClass('tjs.sql.RadioPTreeDialogField',tjs.sql.SField,
function(o){
	tjs.sql.SField.call(this,o);
},tjs.sql.TreeField,{
	_doConfig:function(){
		this._checkDatas();
		this.oMap.putIfUndefined('dataType',tjs.data.types.INTEGER);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.INTEGER);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.TextFromTreeColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.TextFromTree);
		this.oMap.putIfUndefined('fEditor',tjs.editor.RadioPTreeDialog);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.CheckboxPTreeDialog);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4TreePath);
	}
});
tjs.sql.RadioPTreeDialogField.oConfig = {oEditor:{hideRoot:false,leafOnly:false,width:120},oEditor4Search:{excludeDescendants:true,hideRoot:false,leafOnly:false,width:120}};

// (Array Value) Single Column Field
tjs.lang.defineClass('tjs.sql.ASField',tjs.sql.Field,
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
			data[this.oMap.get('name')] = (tjs.lang.isArray(value) && value.length > 0) ? value.join(',') : null;
		}
	},
	getValue:function(data){
		if (data) {
			var value = data[this.oMap.get('name')];
			if (value) {
				return value.split(',');
			}
		}
		return null;
	},
	encode:function(oEncoder,value){
		var dataType = this.oMap.get('dataType');
		var sqlType = this.oMap.get('sqlType');
		value = tjs.data.convertValue(dataType,value);
		return oEncoder.encode(dataType,sqlType,value);
	}
});

tjs.lang.defineClass('tjs.sql.CheckboxListField',tjs.sql.ASField,
function(o){
	tjs.sql.ASField.call(this,o);
},tjs.sql.ListField,{
	_doConfig:function(){
		this._checkDatas();
		this.oMap.putIfUndefined('dataType',tjs.data.types.INTEGER);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.INTEGER);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.CheckboxListColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.CheckboxList);
		this.oMap.putIfUndefined('fEditor',tjs.editor.CheckboxList);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.CheckboxList);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4In);
	}
});
tjs.sql.CheckboxListField.oConfig = {};

tjs.lang.defineClass('tjs.sql.CheckboxListDialogField',tjs.sql.ASField,
function(o){
	tjs.sql.ASField.call(this,o);
},tjs.sql.ListField,{
	_doConfig:function(){
		this._checkDatas();
		this.oMap.putIfUndefined('dataType',tjs.data.types.INTEGER);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.INTEGER);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.MTextFromListColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.MTextFromList);
		this.oMap.putIfUndefined('fEditor',tjs.editor.CheckboxListDialog);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.CheckboxListDialog);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4In);
	}
});
tjs.sql.CheckboxListDialogField.oConfig = {oEditor:{width:120},oEditor4Search:{width:120}};

tjs.lang.defineClass('tjs.sql.CheckboxTreeDialogField',tjs.sql.ASField,
function(o){
	tjs.sql.ASField.call(this,o);
},tjs.sql.TreeField,{
	_doConfig:function(){
		this._checkDatas();
		this.oMap.putIfUndefined('dataType',tjs.data.types.INTEGER);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.INTEGER);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.MTextFromTreeColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.MTextFromTree);
		this.oMap.putIfUndefined('fEditor',tjs.editor.CheckboxTreeDialog);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.CheckboxTreeDialog);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4In);
	}
});
tjs.sql.CheckboxTreeDialogField.oConfig = {oEditor:{excludeDescendants:false,hideRoot:false,leafOnly:false,width:120},oEditor4Search:{excludeDescendants:false,hideRoot:true,leafOnly:false,width:120}};

tjs.lang.defineClass('tjs.sql.CheckboxPTreeDialogField',tjs.sql.ASField,
function(o){
	tjs.sql.ASField.call(this,o);
},tjs.sql.TreeField,{
	_doConfig:function(){
		this._checkDatas();
		this.oMap.putIfUndefined('dataType',tjs.data.types.INTEGER);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.INTEGER);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.MTextFromTreeColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.MTextFromTree);
		this.oMap.putIfUndefined('fEditor',tjs.editor.CheckboxPTreeDialog);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.CheckboxPTreeDialog);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4TreePath);
	}
});
tjs.sql.CheckboxPTreeDialogField.oConfig = {oEditor:{excludeDescendants:true,hideRoot:false,leafOnly:false,width:120},oEditor4Search:{excludeDescendants:true,hideRoot:true,leafOnly:false,width:120}};
