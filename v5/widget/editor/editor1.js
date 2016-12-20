tjs.editor = {
	createTemplate:function(os,ratio,a){
		if (!tjs.lang.isNumber(ratio)){
			ratio = 0.35;
		} else if (ratio < 0.2) {
			ratio = 0.2;
		} else if (ratio > 0.8) {
			ratio = 0.8;
		}
		if (!tjs.lang.isArray(a) || a.length == 0) {
			a = null;
		}
		var lw = Math.round(ratio*100), b = [], k = 0, isize = os.length, i, o;
		b[k++] = '<table class="data"';
		if (!tjs.bom.isIE6 && !tjs.bom.isIE7) {
			b[k++] = ' width="100%"';
		}
		b[k++] = ' border="0" cellpadding="0" cellspacing="0"><colgroup><col width="';
		b[k++] = lw;
		b[k++] = '%"><col width="';
		b[k++] = (100 - lw);
		b[k++] = '%"></colgroup><tbody>';
		for (i = 0; i < isize; i++){
			o = os[i];
			b[k++] = '<tr><th><div class="label" component_label="';
			b[k++] = o.getKey();
			b[k++] = '"></div></th><td><div class="container" component_container="';
			b[k++] = o.getKey();
			b[k++] = '"></div></td></tr>';
			if (a && i == a[0]) {
				b[k++] = '<tr><th><div class="label"></div></th><td><div class="container"></div></td></tr>';
				a.shift();
				if (a.length == 0) {
					a = null;
				}
			}
		}
		b[k++] = '</tbody></table>';
		o = b.join('');
		tjs.lang.destroyArray(b);
		return o;
	},
	classname:'tjs.editor'
};

tjs.lang.defineTopClass('tjs.editor.Editor',
function() {
},{
	isFile:function(){
		return false;
	},
	reset:function(){
	},
	setValue:function(value,fireEvent){
	},
	hasValue:function(){
		return false;
	},
	getValue:function(){
		return null;
	}
});

tjs.lang.defineClass('tjs.editor.SimpleEditor',tjs.editor.Editor,
function() {
},{
	_stateChanged:function(){
		if (this._readValue()) {
			this.fire(tjs.data.VALUE_CHANGED);
		}
	},
	setValue:function(value,fireEvent){
		if (this._writeValue(value) && fireEvent) {
			this.fire(tjs.data.VALUE_CHANGED);
		}
	},
	// write value into current value
	_writeValue:function(value){
		return false;// return current value changed
	},
	// read internal state into current value
	_readValue:function(){
		return false;// return current value changed
	}
});

tjs.lang.defineClass('tjs.editor.Checkbox',tjs.renderer.Checkbox,
function(obj) {
	tjs.renderer.Checkbox.call(this,obj);
},tjs.editor.Editor,{
	_construct:function() {
		tjs.renderer.Checkbox.prototype._construct.call(this);
		this._clickHandler_ = this._clickHandler.bindAsEventListener(this);
		tjs.event.addListener(this.oElement,'click',this._clickHandler_);
	},
	_destroy:function() {
		tjs.event.removeListener(this.oElement,'click',this._clickHandler_);
	},
	_clickHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		this.setValue(!this.value,true);
	},
	hasValue:function(){
		return true;
	},
	getValue:function(){
		return this.value;
	},
	setValue:function(value,fireEvent){
		value = Boolean(value);
		if (this.value != value) {
			this.value = value;
			if (value) {
				tjs.dom.replaceClass(this.oElement,'tjs_checkbox_normal','tjs_checkbox_selected');
			} else {
				tjs.dom.replaceClass(this.oElement,'tjs_checkbox_selected','tjs_checkbox_normal');
			}
			if (fireEvent) {
				this.fire(tjs.data.VALUE_CHANGED);
			}
		}
	}
});
