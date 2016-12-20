/**
 * @class tjs.dnd.DragProxy
 * @param obj: Object | tjs.util.Map
 */
tjs.lang.defineTopClass('tjs.dnd.DragProxy',
function() {
	this._construct();
},{
	_construct:function() {
		this.oElement = document.createElement('div');
		this.oElement.className = 'tjs_drag_proxy';
		var oStyle = this.oElement.style;
		oStyle.left = '0px';
		oStyle.top = '0px';
		oStyle.width = '0px';
		oStyle.height = '0px';
		var oContainer = tjs.html.getHiddenContainer();
		oContainer.appendChild(this.oElement);
		this.dw = this.oElement.offsetWidth;
		this.dh = this.oElement.offsetHeight;
		oContainer.removeChild(this.oElement);
		this.clses = [];
	},
	/**
	 * @method tjs.dnd.DragProxy.prototype.destroy
	 */
	destroy:function() {
		if (this.oElement) {
			tjs.lang.destroyArray(this.clses);
			tjs.lang.destroyObject(this);
		}
	},
	/**
	 * @method tjs.dnd.DragProxy.prototype.getElement
	 * @return Element
	 */
	getElement:function(){
		return this.oElement;
	},
	/**
	 * @method tjs.dnd.DragProxy.prototype.addClass
	 * @param cls: String
	 */
	addClass:function(cls){
//tjs_debug_start
		tjs.lang.assert(cls && tjs.lang.isString(cls),'!tjs.lang.isString(cls) @'+this.classname+'.addClass');
//tjs_debug_end
		var idx = this.clses.indexOf(cls);
		if (idx < 0) {
			tjs.dom.addClass(this.oElement,cls);
			this.clses.push(cls);
			var oContainer = tjs.html.getHiddenContainer();
			oContainer.appendChild(this.oElement);
			this.dw = this.oElement.offsetWidth;
			this.dh = this.oElement.offsetHeight;
			oContainer.removeChild(this.oElement);
		}
	},
	/**
	 * @method tjs.dnd.DragProxy.prototype.setMargins
	 * @param margins: Array
	 */
	setMargins:function(margins){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isArray(margins),'!tjs.lang.isArray(margins) @'+this.classname+'.setMargins');
//tjs_debug_end
		var oStyle = this.oElement.style;
		oStyle.marginTop = margins[0]+'px';
		oStyle.marginRight = margins[1]+'px';
		oStyle.marginBottom = margins[2]+'px';
		oStyle.marginLeft = margins[3]+'px';
	},
	/**
	 * @method tjs.dnd.DragProxy.prototype.setPosition
	 * @param x: Integer
	 * @param y: Integer
	 */
	setPosition:function(x,y){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(x),'!tjs.lang.isNumber(x) @'+this.classname+'.setPosition');
		tjs.lang.assert(tjs.lang.isNumber(y),'!tjs.lang.isNumber(y) @'+this.classname+'.setPosition');
//tjs_debug_end
		var oStyle = this.oElement.style;
		oStyle.left = x+'px';
		oStyle.top = y+'px';
	},
	/**
	 * @method tjs.dnd.DragProxy.prototype.setDimension
	 * @param offsetWidth: Integer
	 * @param offsetHeight: Integer
	 */
	setDimension:function(offsetWidth,offsetHeight){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(offsetWidth),'!tjs.lang.isNumber(offsetWidth) @'+this.classname+'.setDimension');
		tjs.lang.assert(tjs.lang.isNumber(offsetHeight),'!tjs.lang.isNumber(offsetHeight) @'+this.classname+'.setDimension');
//tjs_debug_end
		var oStyle = this.oElement.style;
		oStyle.width = (offsetWidth - this.dw)+'px';
		oStyle.height = (offsetHeight - this.dh)+'px';
	},
	/**
	 * @method tjs.dnd.DragProxy.prototype.setRegion
	 * @param x: Integer
	 * @param y: Integer
	 * @param offsetWidth: Integer
	 * @param offsetHeight: Integer
	 */
	setRegion:function(x,y,offsetWidth,offsetHeight){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(x),'!tjs.lang.isNumber(x) @'+this.classname+'.setRegion');
		tjs.lang.assert(tjs.lang.isNumber(y),'!tjs.lang.isNumber(y) @'+this.classname+'.setRegion');
		tjs.lang.assert(tjs.lang.isNumber(offsetWidth),'!tjs.lang.isNumber(offsetWidth) @'+this.classname+'.setRegion');
		tjs.lang.assert(tjs.lang.isNumber(offsetHeight),'!tjs.lang.isNumber(offsetHeight) @'+this.classname+'.setRegion');
//tjs_debug_end
		var oStyle = this.oElement.style;
		oStyle.left = x+'px';
		oStyle.top = y+'px';
		oStyle.width = (offsetWidth - this.dw)+'px';
		oStyle.height = (offsetHeight - this.dh)+'px';
	},
	/**
	 * @method tjs.dnd.DragProxy.prototype.recycle
	 */
	recycle:function(){
		if (this.clses.length > 0) {
			var i = this.clses.length;
			while (i--) {
				tjs.dom.removeClass(this.oElement,this.clses[i]);
				this.clses[i] = null;
			}
			this.clses.length = 0;
		}
		tjs.dom.removeNode(this.oElement);
		var oStyle = this.oElement.style;
		oStyle.marginTop = '0px';
		oStyle.marginRight = '0px';
		oStyle.marginBottom = '0px';
		oStyle.marginLeft = '0px';
		oStyle.left = '0px';
		oStyle.top = '0px';
		oStyle.width = '0px';
		oStyle.height = '0px';
	}
});

/**
 * @class tjs.dnd.DragImage
 * @param obj: Object | tjs.util.Map
 */
tjs.lang.defineTopClass('tjs.dnd.DragImage',
function() {
	this._construct();
},{
	_construct:function() {
		this.oElement = document.createElement('div');
		this.oElement.className = 'tjs_drag_img';
		var s = this.oElement.style;
		s.left = '-10000px';
		s.top = '-10000px';
		document.body.appendChild(this.oElement);
		if (document.elementFromPoint) {
			this.dx = Math.floor(this.oElement.offsetWidth/2);
			this.dy = Math.floor(this.oElement.offsetHeight/2);
			if (tjs.bom.isIE) {
				var p = tjs.bom.getViewportXY();
				this.dx += p.x;
				this.dy += p.y;
			}
		} else {
			this.dx = Math.floor(this.oElement.offsetWidth/2);
			this.dy = -1;
		}
		s.display = 'none';
	},
	/**
	 * @method tjs.dnd.DragImage.prototype.destroy
	 */
	destroy:function() {
		if (this.oElement) {
			tjs.lang.destroyObject(this);
		}
	},
	/**
	 * @method tjs.dnd.DragImage.prototype.hide
	 */
	hide:function(){
		this.oElement.style.display = 'none';
	},
	/**
	 * @method tjs.dnd.DragImage.prototype.show
	 * @param x: Integer
	 * @param y: Integer
	 */
	show:function(x,y){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(x),'!tjs.lang.isNumber(x) @'+this.classname+'.show');
		tjs.lang.assert(tjs.lang.isNumber(y),'!tjs.lang.isNumber(y) @'+this.classname+'.show');
//tjs_debug_end
		var s = this.oElement.style;
		s.left = (x - this.dx)+'px';
		s.top = (y - this.dy)+'px';
		s.display = '';
	}
});

