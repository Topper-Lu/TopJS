tjs.sql.search = {
	ops:{
		OP_UNDER:-6,
		OP_IN:-5,
		OP_BITAND:-4,
		OP_INCLUDE:-3,
		OP_STARTWITH:-2,
		OP_ENDWITH:-1,
		OP_EQUAL:0,
		OP_LESS_THAN:1,
		OP_GREATER_THAN:2,
		OP_LESS_OR_EQUAL:3,
		OP_GREATER_OR_EQUAL:4,
		OP_BETWEEN:5
	},
	getOps4String:function(){
		if (!this._aOps4String) {
			var ops = tjs.config.oResource.get('search_ops');
			this._aOps4String = [];
			for (var i = 0; i < 4; i++) {
				this._aOps4String.push(ops[i]);
			}
		}
		return this._aOps4String.concat();
	},
	getOps4Number:function(){
		if (!this._aOps4Number) {
			var ops = tjs.config.oResource.get('search_ops');
			this._aOps4Number = [];
			for (var i = 3, isize = ops.length; i < isize; i++) {
				this._aOps4Number.push(ops[i]);
			}
		}
		return this._aOps4Number.concat();
	},
	toConditions:function(oEncoder,oFactory,a){
		if (tjs.lang.isArray(a) && a.length > 0) {
			var b = [], k = 0, o, oField, s;
			for (var i = 0, isize = a.length; i < isize; i++) {
				o = a[i];
				oField = oFactory.getField(o.name);
				if (oField) {
					s = oField.getSearchItemClass().toCondition(oEncoder,oField,o);
					if (s) {
						b[k++] = s;
					}
				}
			}
			s = b.join(' AND ');
			tjs.lang.destroyArray(b);
			return s;
		} else {
			return null;
		}
	},
	getKeyWordTemplate:function(){
		if (!this.oTemplate){
			var b = [], k = 0;
			b[k++] = '<table width="280" class="tjs_keyword" border="0" cellpadding="0" cellspacing="0">';
			b[k++] = '<colgroup><col width="100"><col width="180"></colgroup>';
			b[k++] = '<tbody><tr><th><div class="label">';
			b[k++] = tjs.config.oResource.get('keyword');
			b[k++] = ' 1</div></th><td><div class="container"></div></td></tr><tr><th><div class="label">';
			b[k++] = tjs.config.oResource.get('keyword');
			b[k++] = ' 2</div></th><td><div class="container"></div></td></tr></tbody></table>';
			var o = document.createElement('div');
			o.innerHTML = b.join('');
			tjs.lang.destroyArray(b);
			this.oTemplate = o.firstChild;
			o.removeChild(this.oTemplate);
		}
		return this.oTemplate;
	},
	classname:'tjs.sql.search'
};

tjs.lang.defineClass('tjs.sql.search.Item',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},{
	_checkAll:function(){
		this.oField = this.oMap.remove('oField');
//tjs_debug_start
		tjs.lang.assert(this.oField instanceof tjs.sql.Field,'!(this.oField instanceof tjs.sql.Field) @'+this.classname);
//tjs_debug_end
/*
		this.fCondition = this.oMap.remove('fCondition');
		if (!tjs.lang.isFunction(this.fCondition)) {
			this.fCondition = this.constructor.toCondition;
		}
*/
	},
	_construct:function(){
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'div','tagName != "div" @'+this.classname);
//tjs_debug_end
			if (this.oElement.hasChildNodes()) {
				this.oElement.innerHTML = '';
			}
		} else {
			this.oElement = document.createElement('div');
			var oParent = this.oMap.remove('oParent');
			if (tjs.dom.isElement(oParent)) {
				oParent.appendChild(this.oElement);
			}
		}
		this._createEditors();
	},
	getCondition:function(oEncoder) {
		if (this.hasValue()) {
			return this.constructor.toCondition(oEncoder,this.oField,this.getValue());
			//return this.fCondition(oEncoder,this.oField,this.getValue());
		} else {
			return null;
		}
	},
	// to be overrided
	_createEditors:function(){
		tjs.lang.assert(false,'No implementation of _createEditors @'+this.classname);
	},
	hasValue:function() {
		tjs.lang.assert(false,'No implementation of hasValue @'+this.classname);
	},
	setValue:function(data,fireEvent) {
		tjs.lang.assert(false,'No implementation of setValue @'+this.classname);
	},
	getValue:function() {
		tjs.lang.assert(false,'No implementation of getValue @'+this.classname);
	}
});

tjs.lang.defineClass('tjs.sql.search.Item4Default',tjs.sql.search.Item,
function(o) {
	tjs.sql.search.Item.call(this,o);
},{
	layout:function(){
		this.oEditor.layout();
	},
	_createEditors:function(){
		this.oEditor = this.oField.createEditor4Search(this.oElement);
		if (this.oEditor.constructor == tjs.editor.Checkbox) {
			this._defaultValue = true;
			this.oEditor.setValue(true);
		} else {
			this._defaultValue = null;
		}
	},
	hasValue:function() {
		return this.oEditor.hasValue();
	},
	setValue:function(data,fireEvent) {
		this.oEditor.setValue(data ? data.value : this._defaultValue,fireEvent);
	},
	getValue:function() {
		if (this.hasValue()) {
			return {name:this.oField.getKey(),op:tjs.sql.search.ops.OP_EQUAL,value:this.oEditor.getValue()};
		} else {
			return null;
		}
	}
});
tjs.lang.extend(tjs.sql.search.Item4Default,{
	toCondition:function(oEncoder,oField,o) {
		if (oField.isMultiColumn()) {
			var names = oField.oMap.get('names');
			var b = oField.encode(oEncoder,o.value);
			for (var i = 0, isize = names.length; i < isize; i++) {
				b[i] = names[i]+'='+b[i];
			}
			var s = b.join(' AND ');
			tjs.lang.destroyArray(b);
			return '('+s+')';
		} else {
			return '('+o.name+'='+oField.encode(oEncoder,o.value)+')';
		}
	}
});

tjs.lang.defineClass('tjs.sql.search.Item4In',tjs.sql.search.Item,
function(o) {
	tjs.sql.search.Item.call(this,o);
},{
	layout:function(){
		this.oEditor.layout();
	},
	_createEditors:function() {
		this.oEditor = this.oField.createEditor4Search(this.oElement);
	},
	hasValue:function() {
		return this.oEditor.hasValue();
	},
	setValue:function(data,fireEvent) {
		this.oEditor.setValue(data ? data.value : null,fireEvent);
	},
	getValue:function() {
		if (this.hasValue()) {
			return {name:this.oField.getKey(),op:tjs.sql.search.ops.OP_IN,value:this.oEditor.getValue()};
		} else {
			return null;
		}
	}
});
tjs.lang.extend(tjs.sql.search.Item4In,{
	toCondition:function(oEncoder,oField,o) {
		var v = o.value;
		if (!tjs.lang.isArray(v)) {
			return null;
		}
		var isize = v.length, i, s, b;
		if (oField.isMultiColumn()) {
			var names = oField.oMap.get('names');
			var jsize = names.length, j, u;
			if (isize > 1) {
				b = [];
				for (i = 0; i < isize; i++) {
					u = oField.encode(oEncoder,v[i]);
					for (j = 0; j < jsize; j++) {
						u[j] = names[j]+'='+u[j];
					}
					s = u.join(' AND ');
					tjs.lang.destroyArray(u);
					b[i] = '('+s+')';
				}
				s = b.join(' OR ');
				tjs.lang.destroyArray(b);
				return '('+s+')';
			} else {
				u = oField.encode(oEncoder,v[0]);
				for (j = 0; j < jsize; j++) {
					u[j] = names[j]+'='+u[j];
				}
				s = u.join(' AND ');
				tjs.lang.destroyArray(u);
				return '('+s+')';
			}
		} else {
			if (isize > 1) {
				b = [];
				for (i = 0; i < isize; i++) {
					b[i] = oField.encode(oEncoder,v[i]);
				}
				s = b.join(',');
				tjs.lang.destroyArray(b);
				return '('+o.name+' IN ('+s+'))';
			} else {
				return '('+o.name+'='+oField.encode(oEncoder,v[0])+')';
			}
		}
	}
});

tjs.lang.defineClass('tjs.sql.search.Item4TreePath',tjs.sql.search.Item,
function(o) {
	tjs.sql.search.Item.call(this,o);
},{
	layout:function(){
		this.oEditor.layout();
	},
	_createEditors:function() {
		this.oEditor = this.oField.createEditor4Search(this.oElement);
	},
	hasValue:function() {
		return this.oEditor.hasValue();
	},
	setValue:function(data,fireEvent) {
		this.oEditor.setValue(data ? data.value : null,fireEvent);
	},
	getValue:function() {
		if (this.hasValue()) {
			return {name:this.oField.getKey(),op:tjs.sql.search.ops.OP_UNDER,value:this.oEditor.getValue()};
		} else {
			return null;
		}
	}
});
tjs.lang.extend(tjs.sql.search.Item4TreePath,{
	toCondition:function(oEncoder,oField,o) {
		var v = o.value;
		if (!tjs.lang.isArray(v)) {
			return null;
		}
		var isize = v.length;
		if (isize > 1) {
			var b = [];
			for (var i = 0; i < isize; i++) {
				b[i] = "("+o.name+" LIKE '"+v[i]+"%')";
			}
			var s = b.join(" OR ");
			tjs.lang.destroyArray(b);
			return "("+s+")";
		} else {
			return "("+o.name+" LIKE '"+v[0]+"%')";
		}
	}
});

tjs.lang.defineClass('tjs.sql.search.Item4Bits',tjs.sql.search.Item,
function(o) {
	tjs.sql.search.Item.call(this,o);
},{
	layout:function(){
		this.oEditor.layout();
	},
	_createEditors:function() {
		this.oEditor = this.oField.createEditor4Search(this.oElement);
	},
	hasValue:function() {
		return this.oEditor.hasValue();
	},
	setValue:function(data,fireEvent) {
		this.oEditor.setValue(data ? data.value : null,fireEvent);
	},
	getValue:function() {
		if (this.hasValue()) {
			return {name:this.oField.getKey(),op:tjs.sql.search.ops.OP_BITAND,value:this.oEditor.getValue()};
		} else {
			return null;
		}
	}
});
tjs.lang.extend(tjs.sql.search.Item4Bits,{
	toCondition:function(oEncoder,oField,o) {
		if (oEncoder instanceof tjs.sql.Encoder4Oracle) {
			return '(BITAND('+o.name+','+o.value+') != 0)';
		} else {
			return '(('+o.name+'&'+o.value+') != 0)';
		}
	}
});

tjs.lang.defineClass('tjs.sql.search.Item4String',tjs.sql.search.Item,
function(o) {
	tjs.sql.search.Item.call(this,o);
},{
	layout:function(){
		this.oCombobox.layout();
		this.oEditor.layout();
	},
	_createEditors:function() {
		this.oCombobox = new tjs.editor.Combobox({oParent:this.oElement,width:130,datas:tjs.sql.search.getOps4String()});
		this.oCombobox.setValue(-3);
		this.oEditor = new tjs.editor.Text({oParent:this.oElement,width:160});
	},
	hasValue:function() {
		return this.oCombobox.hasValue() && this.oEditor.hasValue();
	},
	setValue:function(data,fireEvent) {
		if (data) {
			if (data.op == null) {
				data.op = -3;
			}
			this.oCombobox.setValue(data.op,fireEvent);
			this.oEditor.setValue(data.value,fireEvent);
		} else {
			this.oCombobox.setValue(-3,fireEvent);
			this.oEditor.setValue(null,fireEvent);
		}
	},
	getValue:function() {
		if (this.hasValue()) {
			return {name:this.oField.getKey(),op:this.oCombobox.getValue(),value:this.oEditor.getValue()};
		} else {
			return null;
		}
	}
});
tjs.lang.extend(tjs.sql.search.Item4String,{
	toCondition:function(oEncoder,oField,o) {
		var v = o.value;
		var ops = tjs.sql.search.ops;
		switch (o.op) {
		case ops.OP_INCLUDE:
			v = oField.encode(oEncoder,'%'+v+'%');
			return '('+o.name+' LIKE '+v+')';
		case ops.OP_STARTWITH:
			v = oField.encode(oEncoder,v+'%');
			return '('+o.name+' LIKE '+v+')';
		case ops.OP_ENDWITH:
			v = oField.encode(oEncoder,'%'+v);
			return '('+o.name+' LIKE '+v+')';
		case ops.OP_EQUAL:
			v = oField.encode(oEncoder,v);
			return '('+o.name+'='+v+')';
		default:
			return null;
		}
	}
});

tjs.lang.defineClass('tjs.sql.search.Item4Number',tjs.sql.search.Item,
function(o) {
	tjs.sql.search.Item.call(this,o);
},{
	layout:function(){
		this.oCombobox.layout();
		this.oEditor.layout();
		this.oEditor2.layout();
	},
	_valueChangedHandler:function(source,type){
		var op = this.oCombobox.getValue();
		this.oEditor2.oElement.style.visibility = op == tjs.sql.search.ops.OP_BETWEEN ? '' : 'hidden';
	},
	_createEditors:function() {
		this.oCombobox = new tjs.editor.Combobox({oParent:this.oElement,width:130,datas:tjs.sql.search.getOps4Number()});
		this.oCombobox.setValue(0);
		this.oCombobox.addHandler(tjs.data.VALUE_CHANGED,this._valueChangedHandler.bind(this));
		this.oEditor = this.oField.createEditor4Search(this.oElement);
		this.oEditor2 = this.oField.createEditor4Search(this.oElement);
		this.oEditor2.oElement.style.visibility = 'hidden';
	},
	hasValue:function() {
		var result = this.oCombobox.hasValue() && this.oEditor.hasValue();
		if (result && this.oCombobox.getValue() == tjs.sql.search.ops.OP_BETWEEN) {
			result = this.oEditor2.hasValue();
		}
		return result;
	},
	setValue:function(data,fireEvent) {
		if (data) {
			if (data.op == null) {
				data.op = 0;
			}
			this.oCombobox.setValue(data.op,fireEvent);
			this.oEditor.setValue(data.value,fireEvent);
			this.oEditor2.setValue(data.op == tjs.sql.search.ops.OP_BETWEEN ? data.value2 : null,fireEvent);
		} else {
			this.oCombobox.setValue(0,fireEvent);
			this.oEditor.setValue(null,fireEvent);
			this.oEditor2.setValue(null,fireEvent);
		}
	},
	getValue:function() {
		if (this.hasValue()) {
			var o = {name:this.oField.getKey(),op:this.oCombobox.getValue(),value:this.oEditor.getValue()};
			if (this.oCombobox.getValue() == tjs.sql.search.ops.OP_BETWEEN) {
				o.value2 = this.oEditor2.getValue();
			}
			return o;
		} else {
			return null;
		}
	}
});
tjs.lang.extend(tjs.sql.search.Item4Number,{
	toCondition:function(oEncoder,oField,o) {
		var v = oField.encode(oEncoder,o.value);
		var ops = tjs.sql.search.ops;
		switch (o.op) {
		case ops.OP_EQUAL:
			return '('+o.name+' = '+v+')';
		case ops.OP_LESS_THAN:
			return '('+o.name+' < '+v+')';
		case ops.OP_GREATER_THAN:
			return '('+o.name+' > '+v+')';
		case ops.OP_LESS_OR_EQUAL:
			return '('+o.name+' <= '+v+')';
		case ops.OP_GREATER_OR_EQUAL:
			return '('+o.name+' >= '+v+')';
		case ops.OP_BETWEEN:
			var v2 = oField.encode(oEncoder,o.value2);
			return '('+o.name+' BETWEEN '+v+' AND '+v2+')';
		default:
			return null;
		}
	}
});

tjs.lang.defineClass('tjs.sql.search.Editor',tjs.widget.CheckboxList,
function(o) {
	tjs.widget.CheckboxList.call(this,o);
},{
	_hv:'v',
	_checkAll:function() {
		this.oMap.put('alternate',true);//
		this.useOR = Boolean(this.oMap.remove('useOR'));//
		tjs.widget.CheckboxList.prototype._checkAll.call(this);
	},
	_construct:function() {
		tjs.widget.CheckboxList.prototype._construct.call(this);
		this.addHandler(tjs.data.DATA_SELECTED,this._onDataSelected.bind(this));
		this.addHandler(tjs.data.DATA_UNSELECTED,this._onDataUnselected.bind(this));
	},
	layout:function() {
		if (!this.isEmpty()) {
			var tjs_css = tjs.css;
			var tjs_html = tjs.html;
			var w = tjs_css.getContentBoxWidth(this.oElement);
			var oNode;
			for (var i = 0, isize = this.getDataSize(); i < isize; i++) {
				oNode = this._oNodes[i];
				tjs_css.setOffsetWidth(oNode.oCell,w);
				tjs_html.evalLayouts(oNode.oCell);
				if (oNode.oItem) {
					if (!oNode.selected) {
						oNode.oItem.oElement.style.display = '';
					}
					tjs_css.setOffsetWidth(oNode.oItem.oElement,w);
					oNode.oItem.layout();
					if (!oNode.selected) {
						oNode.oItem.oElement.style.display = 'none';
					}
				}
			}
		}
	},
	_onDataSelected:function(source,type,oNode) {
		if (!oNode.oItem) {
			var oElement = document.createElement('div');
			oElement.className = 'pos_rel overflow_hidden tjs_search_item';
			tjs.dom.insertAfter(oElement,oNode.oCell);
			oNode.oItem = oNode.data.createSearchItem(oElement);
			tjs.css.setOffsetWidth(oNode.oItem.oElement,tjs.css.getContentBoxWidth(this.oElement));
			oNode.oItem.layout();
		} else {
			oNode.oItem.setValue(null);
			oNode.oItem.oElement.style.display = '';
		}
	},
	_onDataUnselected:function(source,type,oNode) {
		if (oNode.oItem) {
			oNode.oItem.setValue(null);
			oNode.oItem.oElement.style.display = 'none';
		}
	},
	setValue:function(a) {
		this.unselectAll(true);
		if (tjs.lang.isArray(a) && a.length > 0) {
			var o,oNode;
			for (var i = 0, isize = a.length; i < isize; i++) {
				o = a[i];
				if (o.name) {
					oNode = this.getNodeByKey(o.name);
					if (oNode) {
						this.setNodeSelection(oNode,true,true);
						//this._nodeSelected(oNode);
						oNode.oItem.setValue(o);
					}
				}
			}
		}
	},
	hasValue:function(){
		if (!this.isEmpty()) {
			var oNode;
			var i = this._oNodes.length;
			while (i--) {
				oNode = this._oNodes[i];
				if (oNode.selected) {
					if (oNode.oItem.hasValue()) {
						return true;
					} else {
						this.setNodeSelection(oNode,false,true);
						//this._nodeUnselected(oNode);
					}
				}
			}
		}
		return false;
	},
	getValue:function() {
		if (!this.isEmpty()) {
			var a = [], k = 0,oNode;
			for (var i = 0, isize = this._oNodes.length; i < isize; i++) {
				oNode = this._oNodes[i];
				if (oNode.selected) {
					if (oNode.oItem.hasValue()) {
						a[k++] = oNode.oItem.getValue();
					} else {
						this.setNodeSelection(oNode,false,true);
						//this._nodeUnselected(oNode);
					}
				}
			}
			return a.length > 0 ? a : null;
		} else {
			return null;
		}
	},
	getConditions:function() {
		if (!this.isEmpty()) {
			var oEncoder = this.oMap.get('oEncoder');
			var a = [], k = 0,oNode;
			for (var i = 0, isize = this._oNodes.length; i < isize; i++) {
				oNode = this._oNodes[i];
				if (oNode.selected) {
					if (oNode.oItem.hasValue()) {
						a[k++] = oNode.oItem.getCondition(oEncoder);
					} else {
						this.setNodeSelection(oNode,false,true);
						//this._nodeUnselected(oNode);
					}
				}
			}
			if (a.length > 0) {
				var result = this.useOR ? a.join(' OR ') : a.join(' AND ');
				tjs.lang.destroyArray(a);
				return result;
			}
		} else {
			return null;
		}
	}
});
