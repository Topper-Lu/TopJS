tjs.lang.defineClass('tjs.editor.ColorRGBChooser',tjs.widget.Widget,
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
			if (oParent) {
				oParent.appendChild(this.oElement);
			}
		}
		tjs.dom.addClass(this.oElement,'pos_rel');
		tjs.dom.addClass(this.oElement,'overflow_hidden');
		tjs.dom.addClass(this.oElement,'tjs_color_rgb');

		this._valueChangedHandler_ = this._valueChangedHandler.bind(this);
		this._createRGB(this.oElement);

		this.oText = document.createTextNode('');
		var oSpan = document.createElement('span');
		oSpan.className = 'tjs_color_text_span';
		oSpan.appendChild(this.oText);
		this.oTextContainer = document.createElement('div');
		this.oTextContainer.className = 'pos_rel overflow_hidden tjs_color_text_container';
		this.oTextContainer.appendChild(oSpan);
		this.oElement.appendChild(this.oTextContainer);

		this.oRGB = {r:0,g:0,b:0};
		this._changeTextValue(false);
		this._changeRGBEditors();
		this.setValue(this.oMap.remove('value'));
	},
	_destroy:function() {
		tjs.lang.destroyObject(this.oRGB);
	},
	_createRGB:function(oContainer) {
		var buf = [], k = 0;
		buf[k++] = '<table class="tjs_color_tb" width="400" border="0" cellpadding="0" cellspacing="0">';
		buf[k++] = '<colgroup>';
		buf[k++] = '<col width="280">';
		buf[k++] = '<col width="20">';
		buf[k++] = '<col width="100">';
		buf[k++] = '</colgroup>';
		buf[k++] = '<tbody>';
		buf[k++] = '<tr><td></td><td><span class="label">R</span></td><td></td></tr>';
		buf[k++] = '<tr><td></td><td><span class="label">G</span></td><td></td></tr>';
		buf[k++] = '<tr><td></td><td><span class="label">B</span></td><td></td></tr>';
		buf[k++] = '</tbody>';
		buf[k++] = '</table>';
		oContainer.innerHTML = buf.join('');
		tjs.lang.destroyArray(buf);
		var oTable = tjs.dom.getFirstChildByTagName(oContainer,'table');
		this.oSliderR = new tjs.editor.Slider({oParent:oTable.rows[0].cells[0],hv:'h',slotLength:255,slotWidth:6,slotDrawer:{fgColor0:'#f33',fgColor1:'#c00'},valueStart:0,valueEnd:255});
		this.oSliderR.addHandler(tjs.data.VALUE_CHANGED,this._valueChangedHandler_);
		this.oSliderG = new tjs.editor.Slider({oParent:oTable.rows[1].cells[0],hv:'h',slotLength:255,slotWidth:6,slotDrawer:{fgColor0:'#3f3',fgColor1:'#0c0'},valueStart:0,valueEnd:255});
		this.oSliderG.addHandler(tjs.data.VALUE_CHANGED,this._valueChangedHandler_);
		this.oSliderB = new tjs.editor.Slider({oParent:oTable.rows[2].cells[0],hv:'h',slotLength:255,slotWidth:6,slotDrawer:{fgColor0:'#33f',fgColor1:'#00c'},valueStart:0,valueEnd:255});
		this.oSliderB.addHandler(tjs.data.VALUE_CHANGED,this._valueChangedHandler_);
		this.oSpinnerR = new tjs.editor.Spinner({oParent:oTable.rows[0].cells[2],width:60,minValue:0,maxValue:255});
		this.oSpinnerR.addHandler(tjs.data.VALUE_CHANGED,this._valueChangedHandler_);
		this.oSpinnerG = new tjs.editor.Spinner({oParent:oTable.rows[1].cells[2],width:60,minValue:0,maxValue:255});
		this.oSpinnerG.addHandler(tjs.data.VALUE_CHANGED,this._valueChangedHandler_);
		this.oSpinnerB = new tjs.editor.Spinner({oParent:oTable.rows[2].cells[2],width:60,minValue:0,maxValue:255});
		this.oSpinnerB.addHandler(tjs.data.VALUE_CHANGED,this._valueChangedHandler_);
		this.oTable = oTable;
	},
	layout:function() {
		tjs.html.evalLayouts(this.oTable);
		var w = this.oTable.offsetWidth;
		var h = this.oTable.offsetHeight;
		tjs.css.setOffsetWidth(this.oTextContainer,w);
		h += this.oTextContainer.offsetHeight;
		var oStyle = this.oElement.style;
		oStyle.width = w + 'px';
		oStyle.height = h + 'px';
		tjs.html.forceRedraw();
	},
	_valueChangedHandler:function(source,type) {
		if (source == this.oSliderR) {
			this.oRGB.r = this.oSliderR.getValue();
			this.oSpinnerR.setValue(this.oRGB.r);
			this._changeTextValue(true);
		} else if (source == this.oSpinnerR) {
			this.oRGB.r = this.oSpinnerR.getValue();
			this.oSliderR.setValue(this.oRGB.r);
			this._changeTextValue(true);
		} else if (source == this.oSliderG) {
			this.oRGB.g = this.oSliderG.getValue();
			this.oSpinnerG.setValue(this.oRGB.g);
			this._changeTextValue(true);
		} else if (source == this.oSpinnerG) {
			this.oRGB.g = this.oSpinnerG.getValue();
			this.oSliderG.setValue(this.oRGB.g);
			this._changeTextValue(true);
		} else if (source == this.oSliderB) {
			this.oRGB.b = this.oSliderB.getValue();
			this.oSpinnerB.setValue(this.oRGB.b);
			this._changeTextValue(true);
		} else if (source == this.oSpinnerB) {
			this.oRGB.b = this.oSpinnerB.getValue();
			this.oSliderB.setValue(this.oRGB.b);
			this._changeTextValue(true);
		}
	},
	_changeTextValue:function(fireEvent) {
		var value = tjs.color.toRGBString(this.oRGB);
		var changed = this.oText.nodeValue != value;
		if (changed) {
			this.oText.nodeValue = value;
			this.oTextContainer.style.backgroundColor = value;
			if (fireEvent) {
				this.fire(tjs.data.VALUE_CHANGED);
			}
		}
		return changed;
	},
	_changeRGBEditors:function() {
		this.oSliderR.setValue(this.oRGB.r);
		this.oSpinnerR.setValue(this.oRGB.r);
		this.oSliderG.setValue(this.oRGB.g);
		this.oSpinnerG.setValue(this.oRGB.g);
		this.oSliderB.setValue(this.oRGB.b);
		this.oSpinnerB.setValue(this.oRGB.b);
	},
	_resetRGBValue:function(oRGB) {
		oRGB.r = 0;
		oRGB.g = 0;
		oRGB.b = 0;
	},
	hasValue:function() {
		return Boolean(this.oText.nodeValue);
	},
	getValue:function() {
		return this.oText.nodeValue;
	},
	getTextValue:function() {
		return this.oText.nodeValue;
	},
	setValue:function(value,fireEvent){
		try {
			tjs.color.parseColor(value,this.oRGB);
		} catch(oError) {
			this._resetRGBValue(this.oRGB);
		}
		var changed = this._changeTextValue(fireEvent);
		if (changed) {
			this._changeRGBEditors();
		}
	}
});
