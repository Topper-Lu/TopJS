tjs.lang.defineClass('tjs.dnd.Resizable',tjs.dnd.Draggable,
function(obj) {
	tjs.dnd.Draggable.call(this,obj);
},{
	_construct:function() {
		var oDragElement = this.getDragElement();
//tjs_debug_start
		tjs.lang.assert(tjs.dom.isElement(oDragElement),'!tjs.dom.isElement(oDragElement) @'+this.classname);
//tjs_debug_end
		var oCS = tjs.css.getComputedStyle(oDragElement);
//tjs_debug_start
		tjs.lang.assert(oCS.position != 'fixed','position == "fixed" @'+this.classname);
//tjs_debug_end
		if (oCS.position == 'static') {
			var oStyle = oDragElement.style;
			oStyle.position = 'relative';
			oStyle.left = '0px';
			oStyle.top = '0px';
		}

		var keepRatio = Boolean(this.oMap.remove('keepRatio'));
		this.oMap.put('keepRatio',keepRatio);

		var directions = this.oMap.remove('directions');
		if (!tjs.lang.isArray(directions)) {
			if (oCS.position == 'absolute') {
				directions = keepRatio ? ['n','s','e','w'] : ['ne','nw','se','sw','n','s','e','w'];
			} else {
				directions = keepRatio ? ['s','e'] : ['s','e','se'];
			}
		} else if (keepRatio) {
			var idx;
			idx = directions.indexOf('ne');
			if (idx >= 0) {
				directions.splice(idx,1);
			}
			idx = directions.indexOf('nw');
			if (idx >= 0) {
				directions.splice(idx,1);
			}
			idx = directions.indexOf('se');
			if (idx >= 0) {
				directions.splice(idx,1);
			}
			idx = directions.indexOf('sw');
			if (idx >= 0) {
				directions.splice(idx,1);
			}
		}

		var oHandles = [];
		var oHandle,dir;
		var i = directions.length;
		while (i--) {
			dir = directions[i];
			oHandle = document.createElement('div');
			oHandle.className = 'tjs_resizer_'+dir;
			oHandle.style.cursor = dir+'-resize';
			oHandle.direction = dir;
			oDragElement.appendChild(oHandle);
			oHandles.push(oHandle);
		}
		this.oMap.put('oHandles',oHandles);
		this.oMap.put('useProxy',!this.oMap.remove('noProxy'));
		this.oMap.put('canDrop',false);
		tjs.dnd.Draggable.prototype._construct.call(this);
	},
	_destroy:function() {
		var dragData = this.oMap.remove('dragData');
		if (dragData) {
			for (var v in dragData) {
				delete dragData[v];
			}
		}
		var margins = this.oMap.get('margins');
		if (margins) {
			var i = margins.length;
			while (i--) {
				margins[i] = null;
			}
			margins.length = 0;
		}
	},
	useProxy:function(){
		return this.oMap.get('useProxy');
	},
	getMargins:function() {
		var margins = this.oMap.get('margins');
		if (!margins) {
			this._createProperties();
			margins = this.oMap.get('margins');
		}
		return margins;
	},
	getDeltaDim:function() {
		var deltaDim = this.oMap.get('deltaDim');
		if (!deltaDim) {
			this._createProperties();
			deltaDim = this.oMap.get('deltaDim');
		}
		return deltaDim;
	},
	_createProperties:function(){
		var oDragElement = this.getDragElement();
		var tjs_css = tjs.css;
		var margins = [tjs_css.getMarginWidth(oDragElement,'t'),tjs_css.getMarginWidth(oDragElement,'r'),tjs_css.getMarginWidth(oDragElement,'b'),tjs_css.getMarginWidth(oDragElement,'l')];
		if (tjs.bom.isWebKit) {
			var oCS = tjs_css.getComputedStyle(oDragElement);
			if (oCS.cssFloat == 'none' && oCS.position != 'absolute') {
				var oStyle = oDragElement.style;
				var cssFloat = oStyle.cssFloat;
				oStyle.cssFloat = 'left';
				margins[1] = tjs_css.getMarginWidth(oDragElement,'r');
				oStyle.cssFloat = cssFloat;
			}
		}
		var deltaDim = [tjs_css.getHBorders(oDragElement) + tjs_css.getHPaddings(oDragElement),tjs_css.getVBorders(oDragElement) + tjs_css.getVPaddings(oDragElement)];
		this.oMap.put('margins',margins);
		this.oMap.put('deltaDim',deltaDim);
		if (this.keepRatio()) {
			var ratio = (oDragElement.offsetHeight - deltaDim[1])/(oDragElement.offsetWidth - deltaDim[0]);
			this.oMap.put('ratio',ratio);
		}
	},
	keepRatio:function(){
		return this.oMap.get('keepRatio');
	},
	getRatio:function() {
		var ratio = this.oMap.get('ratio');
		if (!ratio) {
			this._createProperties();
			ratio = this.oMap.get('ratio');
		}
		return ratio;
	},
	getResizeHandler:function(){
		return this.oMap.get('fResizeHandler');
	},
	setResizeHandler:function(handler){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isFunction(handler),'!tjs.lang.isFunction(handler) @'+this.classname+'.setResizeHandler');
//tjs_debug_end
		this.oMap.put('fResizeHandler',handler);
	},
	getMinW:function(){
		return this.oMap.get('minW');
	},
	setMinW:function(minW){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(minW),'!tjs.lang.isNumber(minW) @'+this.classname+'.setMinW');
//tjs_debug_end
		this.oMap.put('minW',minW);
	},
	getMinH:function(){
		return this.oMap.get('minH');
	},
	setMinH:function(minH){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(minH),'!tjs.lang.isNumber(minH) @'+this.classname+'.setMinH');
//tjs_debug_end
		this.oMap.put('minH',minH);
	},
	onDragStart:function(dndData){
		var oDragElement = this.getDragElement();
		var oHandle = this.getCurrHandle();
		var margins = this.getMargins();
		var deltaDim = this.getDeltaDim();
		var keepRatio = this.keepRatio();
		var ratio;
		if (keepRatio) {
			ratio = this.getRatio();
		}
		this.oMap.put('dragCursor',oHandle.direction+'-resize');

		var tjs_css = tjs.css;
		var oCS = tjs_css.getComputedStyle(oDragElement);
		var dragData = this.oMap.get('dragData');
		if (!dragData) {
			dragData = {};
			this.oMap.put('dragData',dragData);
		}
		dragData.x0 = tjs_css.getLeft(oDragElement);
		dragData.y0 = tjs_css.getTop(oDragElement);
		dragData.w0 = oDragElement.offsetWidth - deltaDim[0];
		dragData.h0 = oDragElement.offsetHeight - deltaDim[1];
		var pos,w,h;
		if (oCS.position == 'absolute') {
			w = tjs_css.getPaddingBoxWidth(oDragElement.offsetParent);
			h = tjs_css.getPaddingBoxHeight(oDragElement.offsetParent);
			dragData.x = dragData.x0;
			dragData.y = dragData.y0;
		} else {
			w = tjs_css.getContentBoxWidth(oDragElement.parentNode);
			h = tjs_css.getContentBoxHeight(oDragElement.parentNode);
			if (this.useProxy()) {
				pos = tjs_css.getOffsetPosition(oDragElement);
				dragData.x = pos.x - margins[3];
				dragData.y = pos.y - margins[0];
				pos.destroy();
			} else {
				dragData.x = dragData.x0;
				dragData.y = dragData.y0;
			}
		}
		w -= margins[1] + margins[3];
		h -= margins[0] + margins[2];
		if (this.useProxy()) {
			var oDragProxy = tjs.dnd.oDragProxy;
			oDragProxy.addClass('tjs_resize_proxy');
			oDragProxy.setMargins(margins);
			oDragProxy.setRegion(dragData.x,dragData.y,oDragElement.offsetWidth,oDragElement.offsetHeight);
			oDragElement.offsetParent.appendChild(oDragProxy.getElement());
			var oStyle = oDragProxy.getElement().style;
			dragData.w = parseInt(oStyle.width) || 0;
			dragData.h = parseInt(oStyle.height) || 0;
		} else {
			dragData.w = dragData.w0;
			dragData.h = dragData.h0;
		}
		var minW = this.getMinW();
		if (minW == null) {
			minW = 0;
		} else {
			minW -= deltaDim[0];
		}
		var minH = this.getMinH();
		if (minH == null) {
			minH = 0;
		} else {
			minH -= deltaDim[1];
		}
		var x,y;
		switch (oHandle.direction) {
			case 'n':
				dragData.maxY = dragData.h0 - minH;
				dragData.minY = -dragData.y0;
				if (keepRatio) {
					x = Math.round(dragData.y0/ratio);
					if (x > dragData.x0) {
						dragData.minY = -Math.floor(dragData.x0*ratio);
					}
				}
				break;
			case 'w':
				dragData.maxX = dragData.w0 - minW;
				dragData.minX = -dragData.x0;
				if (keepRatio) {
					y = Math.round(dragData.x0*ratio);
					if (y > dragData.y0) {
						dragData.minX = -Math.floor(dragData.y0/ratio);
					}
				}
				break;
			case 's':
				dragData.minY = minH - dragData.h0;
				dragData.maxY = h - dragData.y0 - oDragElement.offsetHeight;
				if (keepRatio) {
					dragData.maxX = w - dragData.x0 - oDragElement.offsetWidth;
					x = Math.round(dragData.maxY/ratio);
					if (x > dragData.maxX) {
						dragData.maxY = Math.floor(dragData.maxX*ratio);
					}
				}
				break;
			case 'e':
				dragData.minX = minW - dragData.w0;
				dragData.maxX = w - dragData.x0 - oDragElement.offsetWidth;
				if (keepRatio) {
					dragData.maxY = h - dragData.y0 - oDragElement.offsetHeight;
					y = Math.round(dragData.maxX*ratio);
					if (y > dragData.maxY) {
						dragData.maxX = Math.floor(dragData.maxY/ratio);
					}
				}
				break;
			case 'ne':
				dragData.minY = -dragData.y0;
				dragData.maxY = dragData.h0 - minH;
				dragData.minX = minW - dragData.w0;
				dragData.maxX = w - dragData.x0 - oDragElement.offsetWidth;
				break;
			case 'nw':
				dragData.minY = -dragData.y0;
				dragData.maxY = dragData.h0 - minH;
				dragData.minX = -dragData.x0;
				dragData.maxX = dragData.w0 - minW;
				break;
			case 'se':
				dragData.minY = minH - dragData.h0;
				dragData.maxY = h - dragData.y0 - oDragElement.offsetHeight;
				dragData.minX = minW - dragData.w0;
				dragData.maxX = w - dragData.x0 - oDragElement.offsetWidth;
				break;
			case 'sw':
				dragData.minY = minH - dragData.h0;
				dragData.maxY = h - dragData.y0 - oDragElement.offsetHeight;
				dragData.minX = -dragData.x0;
				dragData.maxX = dragData.w0 - minW;
				break;
		}
	},
	onDrag:function(dndData){
		var deltaX = dndData.x - dndData.startX;
		var deltaY = dndData.y - dndData.startY;
		var dragData = this.oMap.get('dragData');
		var oDragElement = this.getDragElement();
		var oHandle = this.getCurrHandle();
		//var margins = this.getMargins();
		//var deltaDim = this.getDeltaDim();
		var keepRatio = this.keepRatio();
		var ratio;
		if (keepRatio) {
			ratio = this.getRatio();
		}

		var oStyle = this.useProxy() ? tjs.dnd.oDragProxy.getElement().style : oDragElement.style;
		switch (oHandle.direction) {
			case 'n':
				deltaY = tjs.lang.boundedValue(deltaY,dragData.minY,dragData.maxY);
				oStyle.top = (dragData.y + deltaY)+'px';
				oStyle.height = (dragData.h - deltaY)+'px';
				if (keepRatio) {
					deltaX = Math.round(deltaY/ratio);
					oStyle.left = (dragData.x + deltaX)+'px';
					oStyle.width = (dragData.w - deltaX)+'px';
				}
				break;
			case 's':
				deltaY = tjs.lang.boundedValue(deltaY,dragData.minY,dragData.maxY);
				oStyle.height = (dragData.h + deltaY)+'px';
				if (keepRatio) {
					deltaX = Math.round(deltaY/ratio);
					oStyle.width = (dragData.w + deltaX)+'px';
				}
				break;
			case 'w':
				deltaX = tjs.lang.boundedValue(deltaX,dragData.minX,dragData.maxX);
				oStyle.left = (dragData.x + deltaX)+'px';
				oStyle.width = (dragData.w - deltaX)+'px';
				if (keepRatio) {
					deltaY = Math.round(deltaX*ratio);
					oStyle.top = (dragData.y + deltaY)+'px';
					oStyle.height = (dragData.h - deltaY)+'px';
				}
				break;
			case 'e':
				deltaX = tjs.lang.boundedValue(deltaX,dragData.minX,dragData.maxX);
				oStyle.width = (dragData.w + deltaX)+'px';
				if (keepRatio) {
					deltaY = Math.round(deltaX*ratio);
					oStyle.height = (dragData.h + deltaY)+'px';
				}
				break;
			case 'nw':
				deltaY = tjs.lang.boundedValue(deltaY,dragData.minY,dragData.maxY);
				oStyle.top = (dragData.y + deltaY)+'px';
				oStyle.height = (dragData.h - deltaY)+'px';

				deltaX = tjs.lang.boundedValue(deltaX,dragData.minX,dragData.maxX);
				oStyle.left = (dragData.x + deltaX)+'px';
				oStyle.width = (dragData.w - deltaX)+'px';
				break;
			case 'ne':
				deltaY = tjs.lang.boundedValue(deltaY,dragData.minY,dragData.maxY);
				oStyle.top = (dragData.y + deltaY)+'px';
				oStyle.height = (dragData.h - deltaY)+'px';

				deltaX = tjs.lang.boundedValue(deltaX,dragData.minX,dragData.maxX);
				oStyle.width = (dragData.w + deltaX)+'px';
				break;
			case 'sw':
				deltaY = tjs.lang.boundedValue(deltaY,dragData.minY,dragData.maxY);
				oStyle.height = (dragData.h + deltaY)+'px';

				deltaX = tjs.lang.boundedValue(deltaX,dragData.minX,dragData.maxX);
				oStyle.left = (dragData.x + deltaX)+'px';
				oStyle.width = (dragData.w - deltaX)+'px';
				break;
			case 'se':
				deltaY = tjs.lang.boundedValue(deltaY,dragData.minY,dragData.maxY);
				oStyle.height = (dragData.h + deltaY)+'px';

				deltaX = tjs.lang.boundedValue(deltaX,dragData.minX,dragData.maxX);
				oStyle.width = (dragData.w + deltaX)+'px';
				break;
		}
		if (!this.useProxy()) {
			var handler = this.getResizeHandler();
			if (handler) {
				handler();
			}
		}
	},
	onDragEnd:function(dndData){
		var deltaX = dndData.x - dndData.startX;
		var deltaY = dndData.y - dndData.startY;
		var dragData = this.oMap.get('dragData');
		var oDragElement = this.getDragElement();
		var oHandle = this.getCurrHandle();
		//var margins = this.getMargins();
		//var deltaDim = this.getDeltaDim();
		var keepRatio = this.keepRatio();
		var ratio;
		if (keepRatio) {
			ratio = this.getRatio();
		}
		if (this.useProxy()) {
			tjs.dnd.oDragProxy.recycle();
		}

		var oStyle = oDragElement.style;
		switch (oHandle.direction) {
			case 'n':
				deltaY = tjs.lang.boundedValue(deltaY,dragData.minY,dragData.maxY);
				oStyle.top = (dragData.y0 + deltaY)+'px';
				oStyle.height = (dragData.h0 - deltaY)+'px';
				if (keepRatio) {
					deltaX = Math.round(deltaY/ratio);
					oStyle.left = (dragData.x0 + deltaX)+'px';
					oStyle.width = (dragData.w0 - deltaX)+'px';
				}
				break;
			case 's':
				deltaY = tjs.lang.boundedValue(deltaY,dragData.minY,dragData.maxY);
				oStyle.height = (dragData.h0 + deltaY)+'px';
				if (keepRatio) {
					deltaX = Math.round(deltaY/ratio);
					oStyle.width = (dragData.w0 + deltaX)+'px';
				}
				break;
			case 'w':
				deltaX = tjs.lang.boundedValue(deltaX,dragData.minX,dragData.maxX);
				oStyle.left = (dragData.x0 + deltaX)+'px';
				oStyle.width = (dragData.w0 - deltaX)+'px';
				if (keepRatio) {
					deltaY = Math.round(deltaX*ratio);
					oStyle.top = (dragData.y0 + deltaY)+'px';
					oStyle.height = (dragData.h0 - deltaY)+'px';
				}
				break;
			case 'e':
				deltaX = tjs.lang.boundedValue(deltaX,dragData.minX,dragData.maxX);
				oStyle.width = (dragData.w0 + deltaX)+'px';
				if (keepRatio) {
					deltaY = Math.round(deltaX*ratio);
					oStyle.height = (dragData.h0 + deltaY)+'px';
				}
				break;
			case 'nw':
				deltaY = tjs.lang.boundedValue(deltaY,dragData.minY,dragData.maxY);
				oStyle.top = (dragData.y0 + deltaY)+'px';
				oStyle.height = (dragData.h0 - deltaY)+'px';

				deltaX = tjs.lang.boundedValue(deltaX,dragData.minX,dragData.maxX);
				oStyle.left = (dragData.x0 + deltaX)+'px';
				oStyle.width = (dragData.w0 - deltaX)+'px';
				break;
			case 'ne':
				deltaY = tjs.lang.boundedValue(deltaY,dragData.minY,dragData.maxY);
				oStyle.top = (dragData.y0 + deltaY)+'px';
				oStyle.height = (dragData.h0 - deltaY)+'px';

				deltaX = tjs.lang.boundedValue(deltaX,dragData.minX,dragData.maxX);
				oStyle.width = (dragData.w0 + deltaX)+'px';
				break;
			case 'sw':
				deltaY = tjs.lang.boundedValue(deltaY,dragData.minY,dragData.maxY);
				oStyle.height = (dragData.h0 + deltaY)+'px';

				deltaX = tjs.lang.boundedValue(deltaX,dragData.minX,dragData.maxX);
				oStyle.left = (dragData.x0 + deltaX)+'px';
				oStyle.width = (dragData.w0 - deltaX)+'px';
				break;
			case 'se':
				deltaY = tjs.lang.boundedValue(deltaY,dragData.minY,dragData.maxY);
				oStyle.height = (dragData.h0 + deltaY)+'px';

				deltaX = tjs.lang.boundedValue(deltaX,dragData.minX,dragData.maxX);
				oStyle.width = (dragData.w0 + deltaX)+'px';
				break;
		}
		var handler = this.getResizeHandler();
		if (handler) {
			handler();
		}
	}
});
