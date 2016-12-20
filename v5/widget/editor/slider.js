tjs.lang.defineClass('tjs.editor.Slider',tjs.widget.Widget,
function(obj) {
	tjs.widget.Widget.call(this,obj);
},tjs.widget.clsWidget,tjs.widget.hvWidget,tjs.editor.SimpleEditor,{
	_checkAll:function(){
		this._checkClsId();
		this._checkHV();
		this._checkBounds();
		this.doAnim = Boolean(this.oMap.remove('doAnim')) && !tjs.config.get('tjs_anim_disabled');
	},
	_checkBounds:function(){
		this.slotLength = this.oMap.remove('slotLength');
		if (!tjs.lang.isNumber(this.slotLength) || this.slotLength < 2) {
			this.slotLength = 200;
		}
		this.slotWidth = this.oMap.remove('slotWidth') || 6;
		var slotDrawer = this.oMap.remove('slotDrawer');
		if (tjs.lang.isObject(slotDrawer)) {
			if (!tjs.lang.isString(slotDrawer.bgColor0) || slotDrawer.bgColor0 == '') {
				slotDrawer.bgColor0 = '#444';
			}
			if (!tjs.lang.isString(slotDrawer.bgColor1) || slotDrawer.bgColor1 == '') {
				slotDrawer.bgColor1 = '#bbb';
			}
			if (!tjs.lang.isString(slotDrawer.fgColor0) || slotDrawer.fgColor0 == '') {
				slotDrawer.fgColor0 = '#f00';
			}
			if (!tjs.lang.isString(slotDrawer.fgColor1) || slotDrawer.fgColor1 == '') {
				slotDrawer.fgColor1 = '#900';
			}
			this.slotDrawer = slotDrawer;
		}

		this.tickSize = this.oMap.remove('tickSize') || 0;
		this.tickAlign = this.tickSize > 0 && Boolean(this.oMap.remove('tickAlign'));
		this.tickColor = this.oMap.remove('tickColor') || '#808080';
		this.keyIncrement = this.oMap.remove('keyIncrement') || this.tickSize || 20;

		var valueStart = this.oMap.remove('valueStart');
		var valueEnd = this.oMap.remove('valueEnd');
		if (tjs.lang.isNumber(valueStart) && tjs.lang.isNumber(valueEnd) && valueStart != valueEnd) {
			this.valueStart = valueStart;
			this.valueEnd = valueEnd;
		} else {
			this.valueStart = 0;
			this.valueEnd = this.slotLength;
		}
		this.reversed = this.valueStart > this.valueEnd;
		this.factor = (this.valueEnd - this.valueStart)/this.slotLength;
	},
	_construct:function() {
		this.horizontal = this._hv == 'h';
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
		tjs.dom.addClass(this.oElement,'pos_rel');
		tjs.dom.addClass(this.oElement,'overflow_hidden');
		tjs.dom.addClass(this.oElement,'tjs_slider');
		tjs.dom.addClass(this.oElement,'tjs_slider_'+this._clsId);

		var w,h;
		if (this.horizontal) {
			w = this.slotLength;
			h = this.slotWidth;
		} else {
			w = this.slotWidth;
			h = this.slotLength;
		}
		this.oSlot = document.createElement('div');
		this.oSlot.className = 'tjs_slider_slot tjs_slider_slot_'+this._hv;
		this.oSlot.style.cssText = 'width:'+w+'px;height:'+h+'px;';

		this.oThumbTL = document.createElement('div');
		this.oThumbTL.className = 'tjs_slider_thumb_tl';
		this.oThumbBR = document.createElement('div');
		this.oThumbBR.className = 'tjs_slider_thumb_br';
		this.oThumb = document.createElement('div');
		this.oThumb.className = 'tjs_slider_thumb tjs_slider_thumb_'+this._hv;
		if (this.tickSize > 0) {
			tjs.dom.addClass(this.oThumb,'tjs_slider_thumb_'+this._hv+'_tick');
		} else {
			tjs.dom.addClass(this.oThumb,'tjs_slider_thumb_'+this._hv+'_notick');
		}
		this.oThumb.appendChild(this.oThumbTL);
		this.oThumb.appendChild(this.oThumbBR);

		this.oWrapper = document.createElement('div');
		this.oWrapper.className = 'tjs_slider_wrapper';
		this.oWrapper.appendChild(this.oSlot);
		this.oWrapper.appendChild(this.oThumb);
		this.oElement.appendChild(this.oWrapper);

		if (this.slotDrawer) {
			this.oSlotBg = new tjs.widget.Canvas({oParent:this.oSlot,cssText:'display:block;position:absolute;left:0px;top:0px;width:'+w+'px;height:'+h+'px;'});
		}
		if (this.tickSize > 0) {
			this.oTickBg = new tjs.widget.Canvas({oParent:this.oWrapper,cssText:'z-index:1;display:block;position:absolute;left:0px;top:0px;'});
		}

		this.oDraggable = new tjs.dnd.Draggable({oHandles:[this.oThumb]});
		this.oDraggable.onDragStart = this._onDragStart.bind(this);
		this.oDraggable.onDrag = this._onDrag.bind(this);
		this.oDraggable.onDragEnd = this._onDragEnd.bind(this);

		this.clickHandler = this._clickHandler.bindAsEventListener(this);
		tjs.event.addListener(this.oWrapper,'click',this.clickHandler);

		this.oWrapper.tabIndex = -1;
		this._keyboardHandler_ = this._keyboardHandler.bindAsEventListener(this);
		tjs.event.addListener(this.oWrapper,'keydown',this._keyboardHandler_);

		this.oPos1 = new tjs.geo.Point();
		this.oPos2 = new tjs.geo.Point();
		this.s = 0;
		this._layout();
		this.value = 0;
		this.setValue(this.oMap.remove('value'));
	},
	_destroy:function() {
		tjs.event.removeListener(this.oWrapper,'keydown',this._keyboardHandler_);
		tjs.event.removeListener(this.oSlot,'click',this.clickHandler);
		this.oDraggable.destroy();
		this.oPos1.destroy();
		this.oPos2.destroy();
		if (this.slotDrawer) {
			tjs.lang.destroyObject(this.slotDrawer);
		}
		if (this.oAnimation) {
			this.oAnimation.destroy();
		}
	},
	_layout:function() {
		var wTL = this.oThumbTL.offsetWidth;
		var hTL = this.oThumbTL.offsetHeight;
		var wBR = this.oThumbBR.offsetWidth;
		var hBR = this.oThumbBR.offsetHeight;
		var w,h;
		if (this.horizontal) {
			this.oThumb.style.width = Math.max(wTL,wBR)+'px';
			this.oThumb.style.height = (hTL + this.slotWidth + hBR)+'px';
			w = this.oThumb.offsetWidth + this.slotLength;
			h = this.oThumb.offsetHeight;
		} else {
			this.oThumb.style.width = (wTL + this.slotWidth + wBR)+'px';
			this.oThumb.style.height = Math.max(hTL,hBR)+'px';
			w = this.oThumb.offsetWidth;
			h = this.oThumb.offsetHeight + this.slotLength;
		}
		var w0 = this.oSlot.offsetWidth;
		var h0 = this.oSlot.offsetHeight;
		var pl = (w - w0)/2;
		var pt = (h - h0)/2;
		if (this.reversed) {
			pl = Math.floor(pl);
			pt = Math.floor(pt);
		} else {
			pl = Math.ceil(pl);
			pt = Math.ceil(pt);
		}
		var pr = w - w0 - pl;
		var pb = h - h0 - pt;
		var oStyle;
		oStyle = this.oWrapper.style;
		oStyle.width = w0+'px';
		oStyle.height = h0+'px';
		oStyle.paddingLeft = pl+'px';
		oStyle.paddingRight = pr+'px';
		oStyle.paddingTop = pt+'px';
		oStyle.paddingBottom = pb+'px';

		if (this.oTickBg) {
			oStyle = this.oTickBg.oElement.style;
			oStyle.width = w+'px';
			oStyle.height = h+'px';
			this._drawTickBg();
		}
		if (this.slotDrawer) {
			this._drawSlotBg();
		}
		if (this.horizontal) {
			this.oThumb.style.left = this.s+'px';
		} else {
			this.oThumb.style.top = this.s+'px';
		}
	},
	_drawTickBg:function(){
		var oCanvas = this.oTickBg.oElement;
		var oStyle = oCanvas.style;
		var w = parseInt(oStyle.width);
		var h = parseInt(oStyle.height);
		oCanvas.width = w;
		oCanvas.height = h;
		var ctx = oCanvas.getContext('2d');
		ctx.strokeStyle = this.tickColor;
		ctx.beginPath();
		var len;
		if (this.horizontal) {
			var x0 = this.oThumb.offsetWidth/2;
			if (this.reversed) {
				x0 = Math.floor(x0) + 0.5;
			} else {
				x0 = Math.ceil(x0) - 0.5;
			}
			var xe = x0 + this.slotLength;
			len = Math.floor((h - this.slotWidth - 4)/2);
			var x = x0;
			while (x < xe) {
				ctx.moveTo(x,0);
				ctx.lineTo(x,len);
				ctx.moveTo(x,h-len);
				ctx.lineTo(x,h);
				x += this.tickSize;
			}
			x = xe;
			ctx.moveTo(x,0);
			ctx.lineTo(x,len);
			ctx.moveTo(x,h-len);
			ctx.lineTo(x,h);
		} else {
			var y0 = this.oThumb.offsetHeight/2;
			if (this.reversed) {
				y0 = Math.floor(y0) + 0.5;
			} else {
				y0 = Math.ceil(y0) - 0.5;
			}
			var ye = y0 + this.slotLength;
			len = Math.floor((w - this.slotWidth - 4)/2);
			var y = y0;
			while (y < ye) {
				ctx.moveTo(0,y);
				ctx.lineTo(len,y);
				ctx.moveTo(w-len,y);
				ctx.lineTo(w,y);
				y += this.tickSize;
			}
			y = ye;
			ctx.moveTo(0,y);
			ctx.lineTo(len,y);
			ctx.moveTo(w-len,y);
			ctx.lineTo(w,y);
		}
		ctx.stroke();
	},
	_drawSlotBg:function(){
		var oCanvas = this.oSlotBg.oElement;
		var oStyle = oCanvas.style;
		var w = parseInt(oStyle.width);
		var h = parseInt(oStyle.height);
		oCanvas.width = w+1;
		oCanvas.width = w;
		oCanvas.height = h;
		var ctx = oCanvas.getContext('2d');
		var c0 = this.slotDrawer.bgColor0;
		var c1 = this.slotDrawer.bgColor1;
		if (this.horizontal) {
			this.__drawGradientRect(ctx,0,0,w,h,false,c0,c1);
		} else {
			this.__drawGradientRect(ctx,0,0,w,h,true,c0,c1);
		}
		c0 = this.slotDrawer.fgColor0;
		c1 = this.slotDrawer.fgColor1;
		if (this.reversed) {
			if (this.s < this.slotLength) {
				if (this.horizontal) {
					this.__drawGradientRect(ctx,this.s,0,w-this.s,h,false,c0,c1);
				} else {
					this.__drawGradientRect(ctx,0,this.s,w,h-this.s,true,c0,c1);
				}
			}
		} else {
			if (this.s > 0) {
				if (this.horizontal) {
					this.__drawGradientRect(ctx,0,0,this.s,h,false,c0,c1);
				} else {
					this.__drawGradientRect(ctx,0,0,w,this.s,true,c0,c1);
				}
			}
		}
	},
	__drawGradientRect:function(ctx,x,y,w,h,goH,c0,c1){
		var oGradient;
		if (goH) {
			oGradient = ctx.createLinearGradient(x, y, x+w, y);
		} else {
			oGradient = ctx.createLinearGradient(x, y, x, y+h);
		}
		oGradient.addColorStop(0,c0);
		oGradient.addColorStop(1,c1);
		ctx.fillStyle = oGradient;
		ctx.fillRect(x,y,w,h);
	},
	_setPos:function(s,doAnim) {
		if (this.tickAlign) {
			s = Math.round(s/this.tickSize)*this.tickSize;//
		}
		s = tjs.lang.boundedValue(s,0,this.slotLength);
		if (this.s != s) {
			this.__setPos(s,doAnim);
			this._stateChanged();
		}
	},
	__setPos:function(s,doAnim) {
		doAnim = doAnim && this.doAnim && Math.abs(s - this.s) >= 30;
		if (this.horizontal) {
			if (doAnim) {
				this.oPos1.x = this.s;
				this.oPos2.x = s;
				this._doAnimation();
			} else {
				this.oThumb.style.left = s+'px';
			}
		} else {
			if (doAnim) {
				this.oPos1.y = this.s;
				this.oPos2.y = s;
				this._doAnimation();
			} else {
				this.oThumb.style.top = s+'px';
			}
		}
		this.s = s;
		if (this.slotDrawer) {
			this._drawSlotBg();
		}
	},
	_doAnimation:function(){
		if (!this.oAnimation) {
			var onStart = (function(actor,cnt,oAnimation){
				actor.getHandler('left').setV01(this.oPos1.x,this.oPos2.x);
				actor.getHandler('top').setV01(this.oPos1.y,this.oPos2.y);
			}).bind(this);
			this.oAnimation = new tjs.anim.Animation({fTiming:tjs.anim.timing.quartic.easeInOut,interval:50,frameCount:10});
			this.oAnimation.addActor(new tjs.anim.CssActor({oElement:this.oThumb,handlers:[{name:'left'},{name:'top'}],onStart:onStart}));
		}
		this.oAnimation.start();
	},
	_keyboardHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		//tjs.event.preventDefault(oEvent);
		switch (oEvent.keyCode) {
		case 0x23:// end
			if (this.s < this.slotLength) {
				this._setPos(this.slotLength,true);
			}
			break;
		case 0x24:// home
			if (this.s > 0) {
				this._setPos(0,true);
			}
			break;
		case 0x25:// left
			if (this.horizontal && this.s > 0) {
				this._setPos(this.s - this.keyIncrement,true);
			}
			break;
		case 0x26:// up
			if (!this.horizontal && this.s > 0) {
				this._setPos(this.s - this.keyIncrement,true);
			}
			break;
		case 0x27:// right
			if (this.horizontal && this.s < this.slotLength) {
				this._setPos(this.s + this.keyIncrement,true);
			}
			break;
		case 0x28:// down
			if (!this.horizontal && this.s < this.slotLength) {
				this._setPos(this.s + this.keyIncrement,true);
			}
			break;
		}
	},
	_clickHandler:function(oEvent){
		var oTarget = oEvent.target || oEvent.srcElement;
		while (oTarget && oTarget != this.oWrapper) {
			oTarget = oTarget.parentNode;
		}
		if (oTarget == this.oWrapper) {
			tjs.event.stopPropagation(oEvent);
			tjs.event.preventDefault(oEvent);
			var pos = tjs.css.toLocalPosition(this.oSlot,oEvent.clientX,oEvent.clientY);
			var s = this.horizontal ? pos.x : pos.y;
			pos.destroy();
			this._setPos(s,true);
			this._handleWrapperFocus();
		}
	},
	_handleWrapperFocus:function(dndData){
		if (this.oWrapper.focus) {
			try {
				this.oWrapper.focus();
			} catch(e){}
		}
	},
	_onDragStart:function(dndData){
		this.s0 = this.s;
	},
	_onDrag:function(dndData){
		this._setPos(this.s0 + (this.horizontal ? (dndData.x - dndData.startX) : (dndData.y - dndData.startY)));
	},
	_onDragEnd:function(dndData){
		this._handleWrapperFocus();
		this._setPos(this.s0 + (this.horizontal ? (dndData.x - dndData.startX) : (dndData.y - dndData.startY)));
	},
	hasValue:function(){
		return true;
	},
	getValue:function(){
		return this.valueStart + this.value*this.factor;
	},
	_writeValue:function(value){
		if (tjs.lang.isNumber(value)) {
			value = (value - this.valueStart)/this.factor;
			if (this.tickAlign) {
				value = Math.round(value/this.tickSize)*this.tickSize;//
			}
			value = tjs.lang.boundedValue(value,0,this.slotLength);
		} else {
			value = 0;
		}
		var changed = this.value != value;
		if (changed) {
			this.value = value;
			this.__setPos(value);
		}
		return changed;
	},
	_readValue:function() {
		var changed = this.value != this.s;
		if (changed) {
			this.value = this.s;
		}
		return changed;
	}
});
