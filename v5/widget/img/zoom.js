tjs.lang.defineClass('tjs.widget.ImgZoom',tjs.widget.Widget,
function(obj) {
	tjs.widget.Widget.call(this,obj);
},{
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
		tjs.dom.addClass(this.oElement,'pos_rel');
		tjs.dom.addClass(this.oElement,'overflow_hidden');
		tjs.dom.addClass(this.oElement,'tjs_img_zoom');

		var oThumb = this.oMap.get('oThumb');
		var oImg = this.oMap.get('oImg');
		var oZoom = this.oMap.get('oZoom');
		var tooltip = this.oMap.remove('tooltip');
		var oStyle;
		this.isVertical = 'h' != this.oMap.remove('direction');
		var ratio = oThumb.width/oImg.width;
		this.factor = -1/ratio;

		this.oThumb = document.createElement('img');
		this.oThumb.className = 'pos_rel tjs_img_zoom_thumb';
		this.oThumb.src = oThumb.url;
		if (tooltip && tjs.lang.isString(tooltip)) {
			this.oThumb.title = tooltip;
		}
		oStyle = this.oThumb.style;
		oStyle.width = oThumb.width+'px';
		oStyle.height = oThumb.height+'px';

		this.oSlider = document.createElement('div');
		this.oSlider.className = 'pos_abs pos_tl overflow_hidden tjs_img_zoom_slider';
		oStyle = this.oSlider.style;
		oStyle.width = Math.round(oZoom.width*ratio)+'px';
		oStyle.height = Math.round(oZoom.height*ratio)+'px';

		this.oWrapper = document.createElement('div');
		this.oWrapper.className = 'pos_rel overflow_hidden tjs_wrapper';
		this.oWrapper.noLayout = true;
		this.oWrapper.appendChild(this.oThumb);
		this.oWrapper.appendChild(this.oSlider);

		this.oElement.appendChild(this.oWrapper);

		var w = this.oThumb.offsetWidth;
		var h = this.oThumb.offsetHeight;
		this.oWrapper.style.width = w+'px';
		this.oWrapper.style.height = h+'px';
		this.oElement.style.width = w+'px';
		this.oElement.style.height = h+'px';

		this.mData = {ready:false};
		var w2 = this.oSlider.offsetWidth;
		var h2 = this.oSlider.offsetHeight;
		this.mData.xMax = w - w2;
		this.mData.yMax = h - h2;
		this.mData.dx = Math.round(w2/2);
		this.mData.dy = Math.round(h2/2);
		this.oSlider.style.display = 'none';

		this.oImg = document.createElement('img');
		this.oImg.className = 'tjs_img_zoom_img';
		this.oImg.src = oImg.url;
		oStyle = this.oImg.style;
		oStyle.width = oImg.width+'px';
		oStyle.height = oImg.height+'px';

		var oBody = document.body;
		this.oContainer = this.oElement;
		while (this.oContainer.parentNode != oBody) {
			this.oContainer = this.oContainer.parentNode;
		}
		this.oZoom = document.createElement('div');
		this.oZoom.className = 'tjs_img_zoom_zoom';
		oStyle = this.oZoom.style;
		oStyle.width = oZoom.width+'px';
		oStyle.height = oZoom.height+'px';
		oStyle.display = 'none';
		this.oZoom.appendChild(this.oImg);
		this.oContainer.appendChild(this.oZoom);

		this.mouseoverHandler = this._mouseoverHandler.bindAsEventListener(this);
		this.mousemoveHandler = this._mousemoveHandler.bindAsEventListener(this);
		this.mouseoutHandler = this._mouseoutHandler.bindAsEventListener(this);
		tjs.event.addListener(this.oWrapper,'mouseover',this.mouseoverHandler);
		tjs.event.addListener(this.oWrapper,'mousemove',this.mousemoveHandler);
		tjs.event.addListener(this.oWrapper,'mouseout',this.mouseoutHandler);
	},
	_destroy:function() {
		this.oContainer.removeChild(this.oZoom);
		tjs.event.removeListener(this.oWrapper,'mouseover',this.mouseoverHandler);
		tjs.event.removeListener(this.oWrapper,'mousemove',this.mousemoveHandler);
		tjs.event.removeListener(this.oWrapper,'mouseout',this.mouseoutHandler);
		tjs.lang.destroyObject(this.mData);
		if (this.pos) {
			this.pos.destroy();
			delete this.pos;
		}
	},
	layout:function() {
		if (this.pos) {
			this.pos.destroy();
			delete this.pos;
		}
		var oZoom = this.oMap.get('oZoom');
		this.pos = tjs.css.getRelPosition(this.oWrapper,this.oContainer);
		if (this.isVertical) {
			var x = this.pos.x + Math.round((this.oWrapper.offsetWidth - this.oContainer.offsetWidth)/2);
			if (x > 0) {
				this.oZoom.style.left = (this.pos.x - 5 - oZoom.width)+'px';
			} else {
				this.oZoom.style.left = (this.pos.x + 5 + this.oWrapper.offsetWidth)+'px';
			}
			this.oZoom.style.top = Math.round((this.oContainer.offsetHeight - oZoom.height)/2)+'px';
		} else {
			var y = this.pos.y + Math.round((this.oWrapper.offsetHeight - this.oContainer.offsetHeight)/2);
			if (y > 0) {
				this.oZoom.style.top = (this.pos.y - 5 - oZoom.height)+'px';
			} else {
				this.oZoom.style.top = (this.pos.y + 5 + this.oWrapper.offsetHeight)+'px';
			}
			this.oZoom.style.left = Math.round((this.oContainer.offsetWidth - oZoom.width)/2)+'px';
		}
	},
	_mouseoverHandler:function(oEvent){
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		var oRelatedTarget = oEvent.relatedTarget || oEvent.fromElement;
		if (oRelatedTarget && tjs.dom.isAncestorOf(this.oWrapper,oRelatedTarget)) {
			return;
		}
		this.mData.startX = oEvent.clientX;
		this.mData.startY = oEvent.clientY;
		var pos = tjs.css.toLocalPosition(this.oWrapper,oEvent.clientX,oEvent.clientY);
		this.mData.x0 = pos.x - this.mData.dx;
		this.mData.y0 = pos.y - this.mData.dy;
		pos.destroy();
		var x = tjs.lang.boundedValue(this.mData.x0,0,this.mData.xMax);
		var y = tjs.lang.boundedValue(this.mData.y0,0,this.mData.yMax);
		this.oSlider.style.left = x+'px';
		this.oSlider.style.top = y+'px';
		this.oImg.style.left = Math.round(x*this.factor)+'px';
		this.oImg.style.top = Math.round(y*this.factor)+'px';
		this.oSlider.style.display = '';
		this.oZoom.style.display = '';
		this.mData.ready = true;
	},
	_mousemoveHandler:function(oEvent){
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		if (oTarget && tjs.dom.isAncestorOf(this.oWrapper,oTarget) && this.mData.ready) {
			var x = tjs.lang.boundedValue(this.mData.x0 + oEvent.clientX - this.mData.startX,0,this.mData.xMax);
			var y = tjs.lang.boundedValue(this.mData.y0 + oEvent.clientY - this.mData.startY,0,this.mData.yMax);
			this.oSlider.style.left = x+'px';
			this.oSlider.style.top = y+'px';
			this.oImg.style.left = Math.round(x*this.factor)+'px';
			this.oImg.style.top = Math.round(y*this.factor)+'px';
		}
	},
	_mouseoutHandler:function(oEvent){
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		var oRelatedTarget = oEvent.relatedTarget || oEvent.toElement;
		if (oRelatedTarget && tjs.dom.isAncestorOf(this.oWrapper,oRelatedTarget)) {
			return;
		}
		this.mData.ready = false;
		this.oSlider.style.display = 'none';
		this.oZoom.style.display = 'none';
	}
});
