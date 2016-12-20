tjs.lang.defineClass('tjs.widget.Canvas',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},{
	_construct:function(){
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'canvas','tagName != "canvas" @'+this.classname);
//tjs_debug_end
			if (this.oElement.hasChildNodes()) {
				this.oElement.innerHTML = '';
			}
		} else {
			this.oElement = document.createElement('canvas');
			var oParent = this.oMap.remove('oParent');
			if (tjs.dom.isElement(oParent)) {
				oParent.appendChild(this.oElement);
			}
		}
		var cssText = this.oMap.remove('cssText');
		if (tjs.lang.isString(cssText) && cssText != '') {
			this.oElement.style.cssText = cssText;
		}
		var width = this.oMap.remove('width');
		if (tjs.lang.isNumber(width) && width > 0) {
			this.oElement.width = width;
		}
		var height = this.oMap.remove('height');
		if (tjs.lang.isNumber(height) && height > 0) {
			this.oElement.height = height;
		}
		this._vml = tjs.bom.isIE6 || tjs.bom.isIE7 || tjs.bom.isIE8;
		if (this._vml) {
			this._initIE();
		}
	},
	_initIE:function(){
		var o = this.oElement;
		if (!('width' in o)) {
			o.width = 300;
		} else if (tjs.lang.isNumber(o.width)) {
			if (o.width < 0) {
				o.width = 300;
			}
		} else if (tjs.lang.isString(o.width)) {
			o.width = parseInt(o.width);
			if (isNaN(o.width) || o.width < 0) {
				o.width = 300;
			}
		} else {
			o.width = 300;
		}
		if (!('height' in o)) {
			o.height = 150;
		} else if (tjs.lang.isNumber(o.height)) {
			if (o.height < 0) {
				o.height = 150;
			}
		} else if (tjs.lang.isString(o.height)) {
			o.height = parseInt(o.height);
			if (isNaN(o.height) || o.height < 0) {
				o.height = 150;
			}
		} else {
			o.height = 150;
		}
		o.attachEvent('onpropertychange', this._onPropertyChange);
		o.getContext = function(contextId) {
			if (!this._context && contextId == '2d') {
				this._context = new tjs.vml.CanvasRenderingContext2D(this);
			}
			return this._context;
		};
	},
	_onPropertyChange:function() {
		var e = window.event;
		var o = e.srcElement;
		switch (e.propertyName) {
		case 'width':
			o.getContext('2d')._reset();
			break;
		case 'height':
			o.getContext('2d')._reset();
			break;
		}
	},
	_destroy:function(){
		if (this._vml) {
			var o = this.oElement;
			o.detachEvent('onpropertychange', this._onPropertyChange);
			o.innerHTML = '';
			if (o._context) {
				o._context.destroy();
				o._context = null;
			}
			o.getContext = null;
		}
	},
	reset:function(){
		if (this._vml) {
			if (this.oElement) {
				this.oElement.getContext('2d')._reset();
			}
		} else {
			if (this.oElement) {
				this.oElement.width = this.oElement.width;
			}
		}
	},
	layout:function(){
		var o = this.oElement;
		var os = tjs.css.getComputedStyle(o);
		if (os.width == 'auto') {
			o.style.width = o.width + 'px';
		}
		if (os.height == 'auto') {
			o.style.height = o.height + 'px';
		}
	},
	getContext:function(contextId) {
		return this.oElement.getContext(contextId || '2d');
	},
	roundRect:function(x,y,w,h,r,m){
		var ctx = this.oElement.getContext('2d');
		this._roundRect(ctx,x,y,w,h,r,m);
	},
	_roundRect:function(ctx,x,y,w,h,r,m){
		var isIE9 = tjs.bom.isIE9;
		if ((m & 1) != 0) {
			ctx.moveTo(x,y+h-r);
			ctx.arcTo(x,y,x+r,y,r);
			if (isIE9) {ctx.lineTo(x+r,y);}
		} else {
			ctx.moveTo(x,y+h);
			ctx.lineTo(x,y);
		}
		if ((m & 2) != 0) {
			ctx.arcTo(x+w,y,x+w,y+r,r);
			if (isIE9) {ctx.lineTo(x+w,y+r);}
		} else {
			ctx.lineTo(x+w,y);
		}
		if ((m & 4) != 0) {
			ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
			if (isIE9) {ctx.lineTo(x+w-r,y+h);}
		} else {
			ctx.lineTo(x+w,y+h);
		}
		if ((m & 8) != 0) {
			ctx.arcTo(x,y+h,x,y+h-r,r);
			if (isIE9) {ctx.lineTo(x,y+h-r);}
		} else {
			ctx.lineTo(x,y+h);
		}
	}
});
