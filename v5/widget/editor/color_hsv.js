tjs.lang.defineClass('tjs.editor.ColorHSVChooser',tjs.widget.Widget,
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
		tjs.dom.addClass(this.oElement,'tjs_color_hsv');

		this._valueChangedHandler_ = this._valueChangedHandler.bind(this);
		this._createHSV(this.oElement);

		this.oText = document.createTextNode('');
		var oSpan = document.createElement('span');
		oSpan.className = 'tjs_color_text_span';
		oSpan.appendChild(this.oText);
		this.oTextContainer = document.createElement('div');
		this.oTextContainer.className = 'pos_rel overflow_hidden tjs_color_text_container';
		this.oTextContainer.appendChild(oSpan);
		this.oElement.appendChild(this.oTextContainer);

		this.oRGB = {r:0,g:0,b:0};
		this.oHSV = {h:0,s:0,v:0};
		this.oPos = new tjs.geo.Point();
		this.oPos0 = new tjs.geo.Point();
		this._changeTextValue(false);
		this._changeHSVEditors();
		this.setValue(this.oMap.remove('value'));
	},
	_destroy:function() {
		tjs.event.removeListener(this.oSVWrapper,'click',this._clickHandler4SV_);
		this.oDraggable.destroy();
		tjs.lang.destroyObject(this.oRGB);
		tjs.lang.destroyObject(this.oHSV);
		this.oPos.destroy();
		this.oPos0.destroy();
	},
	_createHSV:function(oContainer) {
		var buf = [], k = 0;
		buf[k++] = '<table class="tjs_color_tb" width="400" border="0" cellpadding="0" cellspacing="0">';
		buf[k++] = '<colgroup>';
		buf[k++] = '<col width="280">';
		buf[k++] = '<col width="20">';
		buf[k++] = '<col width="100">';
		buf[k++] = '</colgroup>';
		buf[k++] = '<tbody>';
		buf[k++] = '<tr><td colspan="3"></td></tr>';
		buf[k++] = '<tr><td rowspan="3"></td><td><span class="label">H</span></td><td></td></tr>';
		buf[k++] = '<tr><td><span class="label">S</span></td><td></td></tr>';
		buf[k++] = '<tr><td><span class="label">V</span></td><td></td></tr>';
		buf[k++] = '</tbody>';
		buf[k++] = '</table>';
		oContainer.innerHTML = buf.join('');
		buf.length = 0;
		var oTable = tjs.dom.getFirstChildByTagName(oContainer,'table');
		this.oSliderH = new tjs.editor.Slider({oParent:oTable.rows[0].cells[0],clsId:'hue',hv:'h',slotLength:359,slotWidth:30,valueStart:0,valueEnd:359});
		this.oSliderH.addHandler(tjs.data.VALUE_CHANGED,this._valueChangedHandler_);
		this.oSpinnerH = new tjs.editor.Spinner({oParent:oTable.rows[1].cells[2],width:60,minValue:0,maxValue:359});
		this.oSpinnerH.addHandler(tjs.data.VALUE_CHANGED,this._valueChangedHandler_);
		this.oSpinnerS = new tjs.editor.Spinner({oParent:oTable.rows[2].cells[1],width:60,minValue:0,maxValue:100});
		this.oSpinnerS.addHandler(tjs.data.VALUE_CHANGED,this._valueChangedHandler_);
		this.oSpinnerV = new tjs.editor.Spinner({oParent:oTable.rows[3].cells[1],width:60,minValue:0,maxValue:100});
		this.oSpinnerV.addHandler(tjs.data.VALUE_CHANGED,this._valueChangedHandler_);

		this.oSVSlot = document.createElement('div');
		this.oSVSlot.className = 'pos_rel overflow_hidden tjs_color_sv_slot';
		this.oSVSlot.style.cssText = 'z-index:1;cursor:pointer;margin:0px;border:0px none;padding:0px;font-size:0px;line-height:0px;width:256px;height:256px;';

		this.oSVCursor = document.createElement('div');
		this.oSVCursor.className = 'overflow_hidden tjs_color_sv_cursor';
		this.oSVCursor.style.cssText = 'z-index:2;cursor:pointer;margin:0px;font-size:0px;line-height:0px;position:absolute;left:0px;top:0px;';

		this.oSVWrapper = document.createElement('div');
		this.oSVWrapper.className = 'pos_rel overflow_hidden';
		this.oSVWrapper.style.cssText = 'cursor:pointer;margin:0px;border:0px none;font-size:0px;line-height:0px;';
		this.oSVWrapper.appendChild(this.oSVSlot);
		this.oSVWrapper.appendChild(this.oSVCursor);

		this.oSVContainer = document.createElement('div');
		this.oSVContainer.className = 'pos_rel overflow_hidden tjs_color_sv_container';
		this.oSVContainer.appendChild(this.oSVWrapper);
		oTable.rows[1].cells[0].appendChild(this.oSVContainer);
		this._svLayout();

		this.oDraggable = new tjs.dnd.Draggable({oHandles:[this.oSVCursor]});
		this.oDraggable.onDragStart = this._onDragStart.bind(this);
		this.oDraggable.onDrag = this._onDrag.bind(this);
		this.oDraggable.onDragEnd = this._onDragEnd.bind(this);

		this._clickHandler4SV_ = this._clickHandler4SV.bindAsEventListener(this);
		tjs.event.addListener(this.oSVWrapper,'click',this._clickHandler4SV_);

		this.oTable = oTable;
	},
	_svLayout:function() {
		var w,h;
		w = this.oSVCursor.offsetWidth;
		h = this.oSVCursor.offsetHeight;
		var pl = Math.floor(w/2);
		var pr = w - pl;
		var pt = Math.floor(h/2);
		var pb = h - pt;
		var oStyle = this.oSVWrapper.style;
		oStyle.paddingLeft = pl+'px';
		oStyle.paddingRight = pr+'px';
		oStyle.paddingTop = pt+'px';
		oStyle.paddingBottom = pb+'px';
		oStyle.width = this.oSVSlot.offsetWidth+'px';
		oStyle.height = this.oSVSlot.offsetHeight+'px';
		this.svX = this.oSVSlot.offsetWidth - 1;
		this.svY = this.oSVSlot.offsetHeight - 1;
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
		if (source == this.oSliderH) {
			this.oHSV.h = this.oSliderH.getValue();
			this.oSpinnerH.setValue(this.oHSV.h);
			this.oSVSlot.style.backgroundColor = tjs.color.toRGBString4H(this.oHSV.h);
			this._changeTextValue(true);
		} else if (source == this.oSpinnerH) {
			this.oHSV.h = this.oSpinnerH.getValue();
			this.oSliderH.setValue(this.oHSV.h);
			this.oSVSlot.style.backgroundColor = tjs.color.toRGBString4H(this.oHSV.h);
			this._changeTextValue(true);
		} else if (source == this.oSpinnerS) {
			this.oHSV.s = this.oSpinnerS.getValue()/100;
			var x = Math.round(this.oHSV.s*this.svX);
			this.oPos.x = x;
			this.oSVCursor.style.left = x+'px';
			this._changeTextValue(true);
		} else if (source == this.oSpinnerV) {
			this.oHSV.v = this.oSpinnerV.getValue()/100;
			var y = Math.round(this.oHSV.v*this.svY);
			this.oPos.y = y;
			this.oSVCursor.style.top = y+'px';
			this._changeTextValue(true);
		}
	},
	_changeHSVEditors:function() {
		var h = Math.round(this.oHSV.h);
		this.oSpinnerH.setValue(h);
		this.oSliderH.setValue(h);
		this.oSVSlot.style.backgroundColor = tjs.color.toRGBString4H(this.oHSV.h);
		this.oSpinnerS.setValue(Math.round(this.oHSV.s*100));
		this.oSpinnerV.setValue(Math.round(this.oHSV.v*100));
		var x = Math.round(this.oHSV.s*this.svX);
		var y = Math.round(this.oHSV.v*this.svY);
		this.oPos.x = x;
		this.oSVCursor.style.left = x+'px';
		this.oPos.y = y;
		this.oSVCursor.style.top = y+'px';
	},
	_setSV:function(x,y) {
		x = tjs.lang.boundedValue(x,0,this.svX);
		y = tjs.lang.boundedValue(y,0,this.svY);
		var changed = false;
		if (this.oPos.x != x) {
			this.oPos.x = x;
			this.oSVCursor.style.left = x+'px';
			this.oHSV.s = x/this.svX;
			this.oSpinnerS.setValue(Math.round(this.oHSV.s*100));
			changed = true;
		}
		if (this.oPos.y != y) {
			this.oPos.y = y;
			this.oSVCursor.style.top = y+'px';
			this.oHSV.v = y/this.svY;
			this.oSpinnerV.setValue(Math.round(this.oHSV.v*100));
			changed = true;
		}
		if (changed) {
			this._changeTextValue(true);
		}
	},
	_clickHandler4SV:function(oEvent){
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		while (oTarget && oTarget != this.oSVWrapper) {
			oTarget = oTarget.parentNode;
		}
		if (oTarget == this.oSVWrapper) {
			var pos = tjs.css.toLocalPosition(this.oSVSlot,oEvent.clientX,oEvent.clientY);
			this._setSV(pos.x,pos.y);
			pos.destroy();
		}
	},
	_onDragStart:function(dndData){
		this.oPos0.x = this.oPos.x;
		this.oPos0.y = this.oPos.y;
	},
	_onDrag:function(dndData){
		this._setSV(this.oPos0.x + dndData.x - dndData.startX,this.oPos0.y + dndData.y - dndData.startY);
	},
	_onDragEnd:function(dndData){
		this._setSV(this.oPos0.x + dndData.x - dndData.startX,this.oPos0.y + dndData.y - dndData.startY);
	},
	_resetRGBValue:function(oRGB) {
		oRGB.r = 0;
		oRGB.g = 0;
		oRGB.b = 0;
	},
	_changeTextValue:function(fireEvent) {
		tjs.color.convertHSV2RGB(this.oHSV,this.oRGB);
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
			tjs.color.convertRGB2HSV(this.oRGB,this.oHSV);
			this._changeHSVEditors();
		}
	}
});
