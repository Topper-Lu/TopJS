tjs.lang.defineClass('tjs.sql.search.KeywordEditor',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},{
	_checkAll:function(){
		this.aFields = this.oMap.remove('aFields');
	},
	_construct:function(){
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
		tjs.dom.addClass(this.oElement,'tjs_search_keyword_editor');

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
		this._keyboardHandler_ = this._keyboardHandler.bindAsEventListener(this);
		tjs.event.addListener(this.oText,'keyup',this._keyboardHandler_);

		this.oButton = document.createElement('input');
		this.oButton.type = 'button';
		this.oButton.value = tjs.config.oResource.get('search');
		this.oElement.appendChild(this.oButton);
		this._clickHandler_ = this._clickHandler.bindAsEventListener(this);
		tjs.event.addListener(this.oButton,'click',this._clickHandler_);
	},
	_destroy:function() {
		tjs.event.removeListener(this.oText,'keyup',this._keyboardHandler_);
		tjs.event.removeListener(this.oButton,'click',this._clickHandler_);
	},
	_keyboardHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		//tjs.event.preventDefault(oEvent);
		if (oEvent.keyCode == 13) {
			this.fire('search');
		}
	},
	_clickHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		var oTarger = oEvent.target || oEvent.srcElement;
		if (oTarger == this.oButton) {
			this.fire('search');
		}
	},
	setValue:function(v) {
		this.oText.value = tjs.lang.isString(v) ? v : '';
	},
	hasValue:function() {
		return this.oText.value != '';
	},
	getValue:function() {
		return this.oText.value;
	},
	getConditions:function(){
		if (!this.hasValue()) {
			return null;
		}
		var oEncoder = this.oMap.get('oEncoder');
		var v = this.getValue();
		var b = [], k = 0;
		var i = this.aFields.length;
		while (i--) {
			oField = this.aFields[i];
			b[k++] = '('+oField.getKey()+' LIKE '+oField.encode(oEncoder,'%'+v+'%')+')';
		}
		var s = b.join(' OR ');
		tjs.lang.destroyArray(b);
		return s;
	}
});
