tjs.lang.defineClass('tjs.editor.TreeEditor',tjs.editor.Editor,
function() {
},{
	_checkValueHandler:function(source,type){
		if (!this.isEmpty()) {
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
	setValue:function(value,fireEvent) {
		if (!this.isEmpty()) {
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
		if (!this.isEmpty()) {
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
	hasValue:function() {
		return this.hasSelection();//
	},
	getTextValue:function() {
		return this.getSelectedText();//
	},
	// to be overrided
	_setValue:function(value,fireEvent){
	}
});

tjs.lang.defineClass('tjs.editor.RadioTree',tjs.widget.RadioTree,
function(obj) {
	tjs.widget.RadioTree.call(this,obj);
},tjs.editor.TreeEditor,{
	_construct:function() {
		tjs.widget.RadioTree.prototype._construct.call(this);
		this._checkValue();
	},
	_setValue:function(value,fireEvent){
		this.setSelectedKey(value,fireEvent);
	},
	getValue:function(){
		return this.getSelectedKey();
	}
});

tjs.lang.defineClass('tjs.editor.RadioPTree',tjs.widget.RadioTree,
function(obj) {
	tjs.widget.RadioTree.call(this,obj);
},tjs.editor.TreeEditor,{
	_construct:function() {
		tjs.widget.RadioTree.prototype._construct.call(this);
		this._checkValue();
	},
	_setValue:function(value,fireEvent){
		this.setSelectedKeyPath(value,fireEvent);
	},
	getValue:function(){
		return this.getSelectedKeyPath();
	}
});

tjs.lang.defineClass('tjs.editor.CheckboxTree',tjs.widget.CheckboxTree,
function(obj) {
	tjs.widget.CheckboxTree.call(this,obj);
},tjs.editor.TreeEditor,{
	_construct:function() {
		tjs.widget.CheckboxTree.prototype._construct.call(this);
		this._checkValue();
	},
	_setValue:function(value,fireEvent) {
		this.setSelectedKeys(value,fireEvent);
	},
	getValue:function() {
		return this.getSelectedKeys();
	}
});

tjs.lang.defineClass('tjs.editor.CheckboxPTree',tjs.widget.CheckboxTree,
function(obj) {
	tjs.widget.CheckboxTree.call(this,obj);
},tjs.editor.TreeEditor,{
	_construct:function() {
		tjs.widget.CheckboxTree.prototype._construct.call(this);
		this._checkValue();
	},
	_setValue:function(value,fireEvent) {
		this.setSelectedKeyPaths(value,fireEvent);
	},
	getValue:function() {
		return this.getSelectedKeyPaths();
	}
});
