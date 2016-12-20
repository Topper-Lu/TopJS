tjs.lang.defineClass('tjs.editor.ListEditor',tjs.editor.Editor,
function() {
},{
	_checkValueHandler:function(source,type){
		if (!this._isEmpty()) {
			var setValue = this.oMap.remove('setValue');
			if (setValue) {
				this._setValue(setValue.value,setValue.fireEvent);
				tjs.lang.destroyObject(setValue);
			}
			var fSetTextValue = this.oMap.remove('fSetTextValue');
			if (fSetTextValue) {
				fSetTextValue(this.getTextValue());
			}
		}
	},
	setValue:function(value,fireEvent){
		if (!this._isEmpty()) {
			this._setValue(value,fireEvent);
		} else {
			var setValue = this.oMap.remove('setValue');
			if (setValue) {
				setValue.value = value;
				setValue.fireEvent = fireEvent;
			} else {
				setValue = {value:value,fireEvent:fireEvent};
			}
			this.oMap.put('setValue',setValue);
		}
	},
	readTextValue:function(fSetTextValue) {
		if (!this._isEmpty()) {
			fSetTextValue(this.getTextValue());
		} else {
			this.oMap.put('fSetTextValue',fSetTextValue);
		}
	},
	// to be overrided
	_checkValue:function() {
		this.addHandler(tjs.data.AFTER_RESTRUCTURE,this._checkValueHandler.bind(this));//
		this.setValue(this.oMap.remove('value'));
	},
	_isEmpty:function(){
		return this.isEmpty();//
	},
	hasValue:function(){
		return this.hasSelection();//
	},
	getTextValue:function() {
		return this.getSelectedText();//
	},
	_setValue:function(value,fireEvent){
	}
});

tjs.lang.defineClass('tjs.editor.SListEditor',tjs.editor.ListEditor,
function() {
},{
	_setValue:function(value,fireEvent){
		this.setSelectedKey(value,fireEvent);
	},
	getValue:function(){
		return this.getSelectedKey();
	}
});

tjs.lang.defineClass('tjs.editor.MListEditor',tjs.editor.ListEditor,
function() {
},{
	_setValue:function(value,fireEvent) {
		this.setSelectedKeys(value,fireEvent);
	},
	getValue:function() {
		return this.getSelectedKeys();
	}
});

tjs.lang.defineClass('tjs.editor.Combobox',tjs.widget.Combobox,
function(o) {
	tjs.widget.Combobox.call(this,o);
},tjs.editor.SListEditor,{
	_construct:function() {
		tjs.widget.Combobox.prototype._construct.call(this);
		this._checkValue();
	}
});

tjs.lang.defineClass('tjs.editor.RadioList',tjs.widget.RadioList,
function(o) {
	tjs.widget.RadioList.call(this,o);
},tjs.editor.SListEditor,{
	_construct:function() {
		tjs.widget.RadioList.prototype._construct.call(this);
		this._checkValue();
	}
});

tjs.lang.defineClass('tjs.editor.CheckboxList',tjs.widget.CheckboxList,
function(o) {
	tjs.widget.CheckboxList.call(this,o);
},tjs.editor.MListEditor,{
	_construct:function() {
		tjs.widget.CheckboxList.prototype._construct.call(this);
		this._checkValue();
	}
});

tjs.lang.defineClass('tjs.editor.BitCheckboxList',tjs.widget.CheckboxList,
function(o) {
	tjs.widget.CheckboxList.call(this,o);
},tjs.editor.ListEditor,{
	_construct:function() {
		tjs.widget.CheckboxList.prototype._construct.call(this);
		this._checkValue();
	},
	_setValue:function(value,fireEvent) {
		if (!this.isEmpty()) {
			if (tjs.lang.isNumber(value) && isFinite(value) && value > 0) {
				var changed = false;
				var oNodes = this.getNodes();
				var i = oNodes.length,oNode;
				while (i--) {
					oNode = oNodes[i];
					if (this._setNodeSelection(oNode,(Number(oNode.data.getKey()) & value) != 0,fireEvent)) {
						changed = true;
					}
				}
				if (changed && fireEvent) {this.fire(tjs.data.VALUE_CHANGED);}
			} else {
				this.unselectAll(fireEvent);
			}
		}
	},
	getValue:function() {
		var value = 0;
		if (!this.isEmpty()) {
			var oNodes = this.getNodes();
			var i = oNodes.length,oNode;
			while (i--) {
				oNode = oNodes[i];
				if (oNode.selected) {
					value += Number(oNode.data.getKey());
				}
			}
		}
		return value;
	},
	getTextValue:function() {
		return this.getSelectedText();
	}
});
