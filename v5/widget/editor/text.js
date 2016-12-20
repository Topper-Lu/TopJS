tjs.lang.defineClass('tjs.editor.Text',tjs.widget.Widget,
function(obj) {
	tjs.widget.Widget.call(this,obj);
},tjs.editor.SimpleEditor,{
	_construct:function() {
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'span','tagName != "span" @'+this.classname);
//tjs_debug_end
			if (this.oElement.hasChildNodes()) {
				this.oElement.innerHTML = '';
			}
		} else {
			this.oElement = document.createElement('span');
			var oParent = this.oMap.remove('oParent');
			if (tjs.dom.isElement(oParent)) {
				oParent.appendChild(this.oElement);
			}
		}
		tjs.dom.addClass(this.oElement,'tjs_text');

		this.oText = document.createElement('input');
		this.oText.type = 'text';
		this.oText.className = 'text';
		var width = this.oMap.remove('width');
		if (tjs.lang.isNumber(width)) {
			this.oText.style.width = width+'px';
		}
		var maxLength = this.oMap.remove('maxLength');
		if (tjs.lang.isNumber(maxLength)) {
			this.oText.maxLength = maxLength;
		}
		this.oElement.appendChild(this.oText);

		this.value = '';
		this.setValue(this.oMap.remove('value'));
		this._changeHandler_ = this._changeHandler.bindAsEventListener(this);
		this._keyboardHandler_ = this._keyboardHandler.bindAsEventListener(this);
		tjs.event.addListener(this.oText,'change',this._changeHandler_);
		tjs.event.addListener(this.oText,'keyup',this._keyboardHandler_);
	},
	_destroy :function() {
		tjs.event.removeListener(this.oText,'keyup',this._keyboardHandler_);
		tjs.event.removeListener(this.oText,'change',this._changeHandler_);
	},
	_keyboardHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		//tjs.event.preventDefault(oEvent);
		if (oEvent.keyCode == 13) {
			this._stateChanged();
		}
		this.fire('keyup',oEvent);
	},
	_changeHandler:function(oEvent) {
		var oTarget = oEvent.target || oEvent.srcElement;
		if (oTarget == this.oText) {
			tjs.event.stopPropagation(oEvent);
			this._stateChanged();
		}
	},
	hasValue:function() {
		return Boolean(this.value);
	},
	getValue:function() {
		return this.value ? this.value : null;
	},
	_writeValue:function(value) {
		value = tjs.lang.isString(value) ? tjs.str.normalizeOneLine(value) : '';
		var changed = this.value != value;
		if (changed) {
			this.value = value;
			this.oText.value = value;
		}
		return changed;
	},
	_readValue:function() {
		this.oText.value = tjs.str.normalizeOneLine(this.oText.value);
		var changed = this.value != this.oText.value;
		if (changed) {
			this.value = this.oText.value;
		}
		return changed;
	}
});

tjs.lang.defineClass('tjs.editor.Password',tjs.widget.Widget,
function(obj) {
	tjs.widget.Widget.call(this,obj);
},tjs.editor.SimpleEditor,{
	_construct:function() {
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'span','tagName != "span" @'+this.classname);
//tjs_debug_end
			if (this.oElement.hasChildNodes()) {
				this.oElement.innerHTML = '';
			}
		} else {
			this.oElement = document.createElement('span');
			var oParent = this.oMap.remove('oParent');
			if (tjs.dom.isElement(oParent)) {
				oParent.appendChild(this.oElement);
			}
		}
		tjs.dom.addClass(this.oElement,'tjs_password');

		this.oPasswd = document.createElement('input');
		this.oPasswd.type = 'password';
		this.oPasswd.className = 'password';
		var width = this.oMap.remove('width');
		if (tjs.lang.isNumber(width)) {
			this.oPasswd.style.width = width+'px';
		}
		var maxLength = this.oMap.remove('maxLength');
		if (tjs.lang.isNumber(maxLength)) {
			this.oPasswd.maxLength = maxLength;
		}
		this.oElement.appendChild(this.oPasswd);

		this.value = '';
		this.setValue(this.oMap.remove('value'));
		this._changeHandler_ = this._changeHandler.bindAsEventListener(this);
		this._keyboardHandler_ = this._keyboardHandler.bindAsEventListener(this);
		tjs.event.addListener(this.oPasswd,'change',this._changeHandler_);
		tjs.event.addListener(this.oPasswd,'keyup',this._keyboardHandler_);
	},
	_destroy :function() {
		tjs.event.removeListener(this.oPasswd,'keyup',this._keyboardHandler_);
		tjs.event.removeListener(this.oPasswd,'change',this._changeHandler_);
	},
	_keyboardHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		//tjs.event.preventDefault(oEvent);
		if (oEvent.keyCode == 13) {
			this._stateChanged();
		}
		this.fire('keyup',oEvent);
	},
	_changeHandler:function(oEvent) {
		var oTarget = oEvent.target || oEvent.srcElement;
		if (oTarget == this.oPasswd) {
			tjs.event.stopPropagation(oEvent);
			this._stateChanged();
		}
	},
	hasValue:function() {
		return Boolean(this.value);
	},
	getValue:function() {
		return this.value ? this.value : null;
	},
	_writeValue:function(value) {
		value = tjs.lang.isString(value) ? value : '';
		var changed = this.value != value;
		if (changed) {
			this.value = value;
			this.oPasswd.value = value;
		}
		return changed;
	},
	_readValue:function() {
		this.oPasswd.value = this.oPasswd.value;
		var changed = this.value != this.oPasswd.value;
		if (changed) {
			this.value = this.oPasswd.value;
		}
		return changed;
	}
});

tjs.lang.defineClass('tjs.editor.TextArea',tjs.widget.Widget,
function(obj) {
	tjs.widget.Widget.call(this,obj);
},tjs.editor.SimpleEditor,{
	_construct:function() {
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
		tjs.dom.addClass(this.oElement,'tjs_textarea');
		var height = this.oMap.remove('height');
		if (tjs.lang.isNumber(height)) {
			this.oElement.style.height = height+'px';
		}

		this.oTextarea = document.createElement('textarea');
		this.oElement.appendChild(this.oTextarea);

		this.normalize = !this.oMap.remove('noNormalize');
		this.value = '';
		this.setValue(this.oMap.remove('value'));
		this._changeHandler_ = this._changeHandler.bindAsEventListener(this);
		tjs.event.addListener(this.oTextarea,'change',this._changeHandler_);
	},
	_destroy:function() {
		tjs.event.removeListener(this.oTextarea,'change',this._changeHandler_);
	},
	layout:function() {
		var w = tjs.css.getContentBoxWidth(this.oElement);
		var h = tjs.css.getContentBoxHeight(this.oElement);
		tjs.css.setOffsetDimension(this.oTextarea,w,h);
	},
	_changeHandler:function(oEvent) {
		var oTarget = oEvent.target || oEvent.srcElement;
		if (oTarget == this.oTextarea) {
			tjs.event.stopPropagation(oEvent);
			this._stateChanged();
		}
	},
	hasValue:function() {
		return Boolean(this.value);
	},
	getValue:function() {
		return this.value ? this.value : null;
	},
	_writeValue:function(value) {
		if (!tjs.lang.isString(value)) {
			value = '';
		} else if (this.normalize) {
			value = tjs.str.normalizeMultiLine(value);
		}
		var changed = this.value != value;
		if (changed) {
			this.value = value;
			this.oTextarea.value = value;
		}
		return changed;
	},
	_readValue:function() {
		if (this.normalize) {
			this.oTextarea.value = tjs.str.normalizeMultiLine(this.oTextarea.value);
		}
		var changed = this.value != this.oTextarea.value;
		if (changed) {
			this.value = this.oTextarea.value;
		}
		return changed;
	}
});
