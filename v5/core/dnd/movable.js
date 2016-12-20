tjs.lang.defineClass('tjs.dnd.Movable',tjs.dnd.Draggable,
function(obj) {
	tjs.dnd.Draggable.call(this,obj);
},{
	_construct:function() {
		var oDragElement = this.getDragElement();
//tjs_debug_start
		tjs.lang.assert(tjs.dom.isElement(oDragElement),'!tjs.dom.isElement(oDragElement) @'+this.classname);
//tjs_debug_end
		var dragCursor = this.getDragCursor();
		if (!dragCursor) {
			dragCursor = 'move';
			this.oMap.put('dragCursor',dragCursor);
		}
		tjs.dnd.Draggable.prototype._construct.call(this);
		var position = tjs.css.getComputedStyle(oDragElement).position;
		if (position != 'absolute') {
			oDragElement.style.position = 'absolute';
		}
		var directions = this.oMap.remove('directions');
		if (!tjs.lang.isArray(directions)) {
			this.horizontal = true;
			this.vertical = true;
		} else {
			this.horizontal = directions.indexOf('h') > -1;
			this.vertical = directions.indexOf('v') > -1;
		}
		this.useProxy = !this.oMap.remove('noProxy');
		this.oXY0 = new tjs.geo.Point();
		this.oXY = new tjs.geo.Point();
		this.oXYMax = new tjs.geo.Point();
	},
	_destroy:function() {
		if (this.oAnimation) {
			this.oAnimation.destroy();
		}
		this.oXY0.destroy();
		this.oXY.destroy();
		this.oXYMax.destroy();
	},
	getMargins:function() {
		var margins = this.oMap.get('margins');
		if (!margins) {
			this._createProperties();
			margins = this.oMap.get('margins');
		}
		return margins;
	},
	_createProperties:function(){
		var tjs_css = tjs.css;
		var oDragElement = this.getDragElement();
		margins = [tjs_css.getMarginWidth(oDragElement,'t'),tjs_css.getMarginWidth(oDragElement,'r'),tjs_css.getMarginWidth(oDragElement,'b'),tjs_css.getMarginWidth(oDragElement,'l')];
		this.oMap.put('margins',margins);
	},
	onDragStart:function(dndData){
		var oDragElement = this.getDragElement();
		var margins = this.getMargins();
		var tjs_css = tjs.css;
		var pos = tjs_css.getRelPosition(oDragElement,oDragElement.offsetParent);
		this.oXY0.x = pos.x;
		this.oXY0.y = pos.y;
		pos.destroy();
		//this.oXY0.x = tjs_css.getLeft(oDragElement);
		//this.oXY0.y = tjs_css.getTop(oDragElement);
		this.oXY.x = this.oXY0.x;
		this.oXY.y = this.oXY0.y;
		if (this.horizontal) {
			this.oXYMax.x = tjs_css.getPaddingBoxWidth(oDragElement.offsetParent) - oDragElement.offsetWidth - margins[1] - margins[3];
		}
		if (this.vertical) {
			this.oXYMax.y = tjs_css.getPaddingBoxHeight(oDragElement.offsetParent) - oDragElement.offsetHeight - margins[0] - margins[2];
		}
		if (this.useProxy) {
			var oDragProxy = tjs.dnd.oDragProxy;
			oDragProxy.addClass('tjs_move_proxy');
			oDragProxy.setMargins(margins);
			oDragProxy.setRegion(this.oXY0.x,this.oXY0.y,oDragElement.offsetWidth,oDragElement.offsetHeight);
			oDragElement.offsetParent.appendChild(oDragProxy.getElement());
		}
	},
	onDrag:function(dndData){
		if (this.horizontal) {
			this.oXY.x = tjs.lang.boundedValue(this.oXY0.x + dndData.x - dndData.startX,0,this.oXYMax.x);
		}
		if (this.vertical) {
			this.oXY.y = tjs.lang.boundedValue(this.oXY0.y + dndData.y - dndData.startY,0,this.oXYMax.y);
		}
		if (this.useProxy) {
			tjs.dnd.oDragProxy.setPosition(this.oXY.x,this.oXY.y);
		} else {
			var oDragElement = this.getDragElement();
			oDragElement.style.left = this.oXY.x+'px';
			oDragElement.style.top = this.oXY.y+'px';
		}
	},
	onDragEnd:function(dndData){
		if (this.horizontal) {
			this.oXY.x = tjs.lang.boundedValue(this.oXY0.x + dndData.x - dndData.startX,0,this.oXYMax.x);
		}
		if (this.vertical) {
			this.oXY.y = tjs.lang.boundedValue(this.oXY0.y + dndData.y - dndData.startY,0,this.oXYMax.y);
		}
		var oDragElement = this.getDragElement();
		var doAnimation = false;
		if (this.useProxy) {
			tjs.dnd.oDragProxy.recycle();
			if (!tjs.config.get('tjs_anim_disabled')) {
				var dx = this.oXY.x - this.oXY0.x;
				var dy = this.oXY.y - this.oXY0.y;
				doAnimation = (dx*dx + dy*dy) > 2500;
			}
		}
		if (doAnimation) {
			this._doAnimation();
		} else {
			oDragElement.style.left = this.oXY.x+'px';
			oDragElement.style.top = this.oXY.y+'px';
		}
	},
	_doAnimation:function(){
		if (!this.oAnimation) {
			var onStart = (function(actor,cnt,oAnimation){
				actor.getHandler('left').setV01(this.oXY0.x,this.oXY.x);
				actor.getHandler('top').setV01(this.oXY0.y,this.oXY.y);
			}).bind(this);
			this.oAnimation = new tjs.anim.Animation({fTiming:tjs.anim.timing.quartic.easeInOut,interval:50,frameCount:16});
			this.oAnimation.addActor(new tjs.anim.CssActor({oElement:this.getDragElement(),handlers:[{name:'left'},{name:'top'}],onStart:onStart}));
		}
		this.oAnimation.start();
	}
});
