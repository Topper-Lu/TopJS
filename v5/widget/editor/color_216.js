tjs.lang.defineClass('tjs.editor.Color216Chooser',tjs.widget.Widget,
function(obj) {
	tjs.widget.Widget.call(this,obj);
},tjs.editor.Editor,{
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
		tjs.dom.addClass(this.oElement,'tjs_color_216');

		var a = [], buf = [], k = 0, i;
		for (i = 0; i < 16; i++) {
			a[i] = i.toString(16);
		}
		buf[k++] = '<table border="0" cellpadding="0" cellspacing="1">';
		buf[k++] = '<tbody>';
		var r,g,b,c,m;
		i = 0;
		for (r = 0; r < 16; r += 3) {
			for (g = 0; g < 16; g += 3) {
				for (b = 0; b < 16; b += 3, i++) {
					m = i % 18;
					if (m == 0) {
						buf[k++] = '<tr>';
					}
					c = a[r]+a[g]+a[b];
					buf[k++] = '<td class="#'+c+'" style="background-color:#'+c+'">&nbsp;</td>';
					if (m == 17) {
						buf[k++] = '</tr>';
					}
				}
			}
		}
		buf[k++] = '</tbody>';
		buf[k++] = '</table>';
		this.oElement.innerHTML = buf.join('');
		buf.length = 0;
		this.oTable = tjs.dom.getFirstChildByTagName(this.oElement,'table');

		var oStyle = this.oElement.style;
		oStyle.width = this.oTable.offsetWidth + 'px';
		oStyle.height = this.oTable.offsetHeight + 'px';

		this.value = null;
		this.setValue(this.oMap.remove('value'));
		this._clickHandler_ = this._clickHandler.bindAsEventListener(this);
		tjs.event.addListener(this.oTable,'click',this._clickHandler_);
	},
	_destroy :function() {
		tjs.event.removeListener(this.oTable,'click',this._clickHandler_);
	},
	_clickHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		oTarget = tjs.dom.getAncestorByTagName(oTarget,'td',this.oTable);
		if (oTarget) {
			this._setValue(oTarget.className,true);
		}
	},
	_setValue:function(value,fireEvent){
		if (this.value != value) {
			this.value = value;
			if (fireEvent) {
				this.fire(tjs.data.VALUE_CHANGED);
			}
		}
	},
	hasValue:function() {
		return Boolean(this.value);
	},
	getValue:function() {
		return this.value;
	},
	setValue:function(value,fireEvent){
		if (!tjs.lang.isString(value) || value == '') {
			value = null;
		}
		this._setValue(value,fireEvent);
	}
});
