tjs.lang.defineClass('tjs.widget.DockLayout',tjs.widget.Widget,
function(obj) {
	tjs.widget.Widget.call(this,obj);
},tjs.widget.posWidget,{
	_construct:function() {
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'div','tagName != "div" @'+this.classname+'._construct');
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
		tjs.dom.addClass(this.oElement,'overflow_hidden');

		var dock = this.oMap.remove('dock');
		if (!tjs.lang.isObject(dock)) {
			dock = {};
		}
		this.oDock = tjs.widget.createContainer(dock);
		tjs.dom.addClass(this.oDock,'tjs_dock');
		//this.oDock.style.cssText = 'z-index:2;position:absolute;';

		var content = this.oMap.remove('content');
		if (!tjs.lang.isObject(content)) {
			content = {};
		}
		this.oDockContent = tjs.widget.createContainer(content);
		tjs.dom.addClass(this.oDockContent,'tjs_dock_content');
		//this.oDockContent.style.cssText = 'z-index:1;position:relative;';

		this.oWrapper = document.createElement('div');
		this.oWrapper.className = 'pos_rel overflow_hidden';
		this.oWrapper.appendChild(this.oDockContent);
		this.oWrapper.appendChild(this.oDock);
		this.oElement.appendChild(this.oWrapper);

		if (tjs.lang.isString(dock.url) && dock.url != '') {
			tjs.html.loadElementContent(dock.url,this.oDock);
		}
		if (tjs.lang.isString(content.url) && content.url != '') {
			tjs.html.loadElementContent(content.url,this.oDockContent);
		}
		tjs.lang.destroyObject(dock);
		tjs.lang.destroyObject(content);

		if (this.oMap.remove('draggable')) {
			this.oDraggable = new tjs.widget.DockLayout.Draggable({oDockLayout:this,oHandles:[this.oDock]});
		}
	},
	_destroy:function() {
		if (this.oDraggable) {
			this.oDraggable.destroy();
		}
	},
	_checkAll:function(){
		this._handleChildren();
		this._checkPos();
	},
	_handleChildren:function(){
		var aChildren = this.oMap.remove('aChildren');
		if (aChildren) {
			var i = aChildren.length;
			while (i--) {
				oChild = aChildren[i];
				aChildren[i] = null;
				if (oChild.child_id == 'dock') {
					delete oChild.child_id;
					this.oMap.put('dock',oChild);
				} else if (oChild.child_id == 'content') {
					delete oChild.child_id;
					this.oMap.put('content',oChild);
				} else {
					tjs.lang.destroyObject(oChild,true);
				}
			}
			aChildren.length = 0;
		}
	},
	layout:function() {
		var w = tjs.css.getContentBoxWidth(this.oElement);
		var h = tjs.css.getContentBoxHeight(this.oElement);
		tjs.css.setOffsetDimension(this.oWrapper,w,h);
		w = parseInt(this.oWrapper.style.width);
		h = parseInt(this.oWrapper.style.height);
		var isH = this._pos == 'n' || this._pos == 's';
		if (isH) {
			tjs.css.setOffsetWidth(this.oDock,w);
			tjs.css.setOffsetWidth(this.oDockContent,w);
			if (tjs.bom.isIE6) {
				this.oDock.style.height = '1px';
				this.oDockContent.style.height = '1px';
			}
			this.oDock.style.height = '';
			this.oDockContent.style.height = '';
		} else {
			if (tjs.bom.isIE6) {
				this.oDock.style.width = '1px';
				this.oDockContent.style.width = '1px';
			}
			this.oDock.style.width = '';
			this.oDockContent.style.width = '';
			tjs.css.setOffsetHeight(this.oDock,h);
			tjs.css.setOffsetHeight(this.oDockContent,h);
		}
		this._preLayout();//
		if (isH) {
			h -= this.oDock.offsetHeight;
			tjs.css.setOffsetHeight(this.oDockContent,h);
		} else {
			w -= this.oDock.offsetWidth;
			tjs.css.setOffsetWidth(this.oDockContent,w);
		}
		var oStyle1 = this.oDock.style;
		var oStyle2 = this.oDockContent.style;
		switch (this._pos) {
			case 'n':
				oStyle1.left = '0px';
				oStyle1.top = '0px';
				oStyle2.left = '0px';
				oStyle2.top = this.oDock.offsetHeight+'px';
				break;
			case 's':
				oStyle1.left = '0px';
				oStyle1.top = this.oDockContent.offsetHeight+'px';
				oStyle2.left = '0px';
				oStyle2.top = '0px';
				break;
			case 'w':
				oStyle1.left = '0px';
				oStyle1.top = '0px';
				oStyle2.left = this.oDock.offsetWidth+'px';
				oStyle2.top = '0px';
				break;
			case 'e':
				oStyle1.left = this.oDockContent.offsetWidth+'px';
				oStyle1.top = '0px';
				oStyle2.left = '0px';
				oStyle2.top = '0px';
				break;
		}
		this._postLayout();//
	},
	_preLayout:function() {
		if (this._pos == 'w' || this._pos == 'e') {
			var vWidth = this.oMap.get('vWidth');
			if (!tjs.lang.isNumber(vWidth)) {
				var w = parseInt(this.oWrapper.style.width);
				vWidth = Math.floor(w/5);
				this.oMap.put('vWidth',vWidth);
			}
			tjs.css.setOffsetWidth(this.oDock,vWidth);
		}
		tjs.html.evalLayouts(this.oDock);
	},
	_postLayout:function() {
		tjs.html.evalLayouts(this.oDockContent);
	},
	_onPosChanged:function(posOld,posNew){
		// no layout here
	}
});

tjs.lang.defineClass('tjs.widget.DockLayout.Draggable',tjs.dnd.Draggable,
function(obj) {
	tjs.dnd.Draggable.call(this,obj);
},{
	_construct:function() {
		tjs.dnd.Draggable.prototype._construct.call(this);
		var oDockLayout = this._getDockLayout();
		this.oDockProxy = document.createElement('div');
		this.oDockProxy.className = 'tjs_dock_proxy tjs_dock_proxy_'+oDockLayout._pos;
		this.oDockProxy.style.display = 'none';
		oDockLayout.oWrapper.appendChild(this.oDockProxy);
		this.currPos = null;
	},
	_destroy:function() {
		var dragData = this.oMap.remove('dragData');
		if (dragData) {
			tjs.lang.destroyObject(dragData);
		}
		delete this.currPos;
		delete this.oDockProxy;
	},
	_getDockLayout:function() {
		return this.oMap.get('oDockLayout');
	},
	_getDragData:function() {
		return this.oMap.get('dragData');
	},
	onDragStart:function(dndData){
		var oDockLayout = this._getDockLayout();
		var pos = tjs.css.toLocalPosition(oDockLayout.oElement,dndData.startX,dndData.startY);
		var w = tjs.css.getPaddingBoxWidth(oDockLayout.oElement);
		var h = tjs.css.getPaddingBoxHeight(oDockLayout.oElement);
		var dragData = this._getDragData();
		if (!dragData) {
			dragData = {};
			this.oMap.put('dragData',dragData);
		}
		dragData.x0 = pos.x;
		dragData.y0 = pos.y;
		dragData.x = dragData.x0;
		dragData.y = dragData.y0;
		dragData.w = w;
		dragData.h = h;
		dragData.minX = 6;
		dragData.minY = 6;
		dragData.maxX = w - 6;
		dragData.maxY = h - 6;
		pos.destroy();
	},
	onDrag:function(dndData){
		var deltaX = dndData.x - dndData.startX;
		var deltaY = dndData.y - dndData.startY;
		var dragData = this._getDragData();
		dragData.x = tjs.lang.boundedValue(dragData.x0 + deltaX,dragData.minX,dragData.maxX);
		dragData.y = tjs.lang.boundedValue(dragData.y0 + deltaY,dragData.minY,dragData.maxY);
		var pos = this._getDragPosition(dragData.x,dragData.y,dragData.w,dragData.h);
		if (pos) {
			if (this.currPos != pos) {
				this.currPos = pos;
				var oDockLayout = this._getDockLayout();
				if (oDockLayout._pos != pos) {
					this.oDockProxy.className = 'tjs_dock_proxy tjs_dock_proxy_'+pos;
					if (pos == 'n' || pos == 's') {
						tjs.css.setOffsetDimension(this.oDockProxy,dragData.w,Math.floor(dragData.h/5));
					} else {
						tjs.css.setOffsetDimension(this.oDockProxy,Math.floor(dragData.w/5),dragData.h);
					}
					this.oDockProxy.style.display = 'block';
				} else {
					this.oDockProxy.style.display = 'none';
				}
			}
		} else {
			if (this.currPos) {
				this.oDockProxy.style.display = 'none';
				this.currPos = null;
			}
		}
	},
	onDragEnd:function(dndData){
		var deltaX = dndData.x - dndData.startX;
		var deltaY = dndData.y - dndData.startY;
		var dragData = this._getDragData();
		dragData.x = tjs.lang.boundedValue(dragData.x0 + deltaX,dragData.minX,dragData.maxX);
		dragData.y = tjs.lang.boundedValue(dragData.y0 + deltaY,dragData.minY,dragData.maxY);
		if (this.currPos) {
			this.oDockProxy.style.display = 'none';
			this.currPos = null;
		}
		this._getDockLayout().setPos(this._getDragPosition(dragData.x,dragData.y,dragData.w,dragData.h));
	},
	showDragImage:function(dndData){
		tjs.dnd.oDragImage.show(dndData.x,dndData.y);
	},
	hideDragImage:function(dndData){
		tjs.dnd.oDragImage.hide();
	},
	_getDragPosition:function(x,y,w,h){
		var m = h/w;
		var ne = y <= m*x;
		var nw = y <= -m*x + h;
		if (ne) {
			if (nw) {
				return 'n';
			} else {
				return 'e';
			}
		} else {
			if (nw) {
				return 'w';
			} else {
				return 's';
			}
		}
	}
});
