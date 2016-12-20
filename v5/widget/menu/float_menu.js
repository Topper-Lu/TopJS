tjs.lang.defineClass('tjs.widget.FloatMenu',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},tjs.widget.clsWidget,tjs.widget.movableWidget,{
	_float:true,
	_checkFloat:function() {
		var noFloat = Boolean(this.oMap.remove('noFloat'));
		if (noFloat) {
			this._float = false;
		}
	},
	_listType:'tjs_text_menu',
	_checkListType:function() {
		var listType = this.oMap.remove('listType');
		if (listType && tjs.lang.isString(listType)) {
			this._listType = listType;
		}
	},
	_cellHandler:'tjs.cell.TextHandler',
	_checkCellHandler:function() {
		var oCellHandler = this.oMap.remove('oCellHandler');
		if (oCellHandler instanceof tjs.cell.Handler) {
			this._oCellHandler = oCellHandler;
		} else {
			this._oCellHandler = tjs.cell.getHandler(this._cellHandler)
		}
	},
	_getPopupContainer:function(){
		return this.oMap.get('popupContainer');
	},
	_checkPopupContainer:function(){
		var popupContainer = this._getPopupContainer();
		if (!tjs.dom.isElement(popupContainer)) {
			this.oMap.put('popupContainer',tjs.html.getBodyWrapper());
		}
	},
	_checkAnims:function() {
		var doAnim = !tjs.config.get('tjs_anim_disabled');
		this.doPopupAnim = Boolean(this.oMap.remove('doPopupAnim')) && doAnim;
	},
	_checkDatas:function() {
		var datas = this.oMap.remove('datas');
		if (tjs.lang.isArray(datas) && datas.length > 0) {
			this.oRootNode = tjs.data.TreeNode.createNode2({children:datas});
			this.oRootNode.clickable = false;
		}
	},
	_checkAll:function() {
		this._checkClsId();
		this._checkListType();
		this._checkFloat();
		this._checkCellHandler();
		this._checkPopupContainer();
		this._checkAnims();
		this._checkDatas();
	},
	_construct:function() {
		if (!this.oElement) {
			if (this._float) {
				this.oElement = document.createElement('div');
				this._getPopupContainer().appendChild(this.oElement);
			} else {
				this.oElement = document.createElement('span');
				var oParent = this.oMap.remove('oParent');
				if (tjs.dom.isElement(oParent)) {
					oParent.appendChild(this.oElement);
				}
			}
		} else if (this._float) {
			tjs.dom.removeNode(this.oElement);
			this._getPopupContainer().appendChild(this.oElement);
		}
		tjs.dom.addClass(this.oElement,'tjs_menu_hoverable');
		if (this._float) {
			tjs.dom.addClass(this.oElement,'tjs_float_menu tjs_float_menu_'+this._clsId);
			this.oMap.put('movable',{noProxy:true});
			this._createMovable([this.oElement]);
			this.oMovable.addHandler(tjs.dnd.DRAG_END,this._dragEndHandler.bind(this));
		} else {
			tjs.dom.addClass(this.oElement,'tjs_fixed_menu tjs_fixed_menu_'+this._clsId);
		}
		if (this.oRootNode) {
			var urlHandler = this.oMap.remove('urlHandler');
			if (tjs.lang.isFunction(urlHandler)) {
				this.urlHandler = urlHandler;
			}
			this._mouseoverHandler_ = this._mouseoverHandler.bindAsEventListener(this);
			this._mouseoutHandler_ = this._mouseoutHandler.bindAsEventListener(this);
			this._clickHandler_ = this._clickHandler.bindAsEventListener(this);
			this._checkChain_ = this._checkChain.bind(this);
			this._currChain = null;
			this._oldChain = null;

			this.oElement.oNode = this.oRootNode;
			tjs.event.addListener(this.oElement,'mouseover',this._mouseoverHandler_);
			tjs.event.addListener(this.oElement,'mouseout',this._mouseoutHandler_);
			this._createPopupMenu(this.oRootNode);
		}
	},
	_destroy:function() {
		if (this.isMovable()) {
			this._destroyMovable();
			tjs.dom.removeNode(this.oElement);
		}
		if (this.oRootNode) {
			tjs.event.removeListener(this.oElement,'mouseover',this._mouseoverHandler_);
			tjs.event.removeListener(this.oElement,'mouseout',this._mouseoutHandler_);
			if (tjs.bom.isIE6 || tjs.bom.isIE7 || tjs.bom.isIE8) {
				this.oElement.oNode = null;
			} else {
				delete this.oElement.oNode;
			}
			tjs.data.TreeNode.visitPostOrder(this.oRootNode,this._destroyNode,this);
		}
	},
	_destroyNode:function(oNode) {
		if (oNode.oPopup) {
			var p = oNode.oPopup;
			if (p.oAnimation) {
				p.oAnimation.destroy();
			}
			var m = p.oMenu;
			tjs.event.removeListener(m,'mouseover',this._mouseoverHandler_);
			tjs.event.removeListener(m,'mouseout',this._mouseoutHandler_);
			tjs.event.removeListener(m,'click',this._clickHandler_);
			tjs.dom.removeNode(p.oElement);
			tjs.lang.destroyObject(p);
		}
		if (oNode.oCell) {
			this._oCellHandler.destroyContent(oNode,oNode.data);
			if (tjs.bom.isIE6 || tjs.bom.isIE7 || tjs.bom.isIE8) {
				oNode.oCell.oNode = null;
			} else {
				delete oNode.oCell.oNode;
			}
		}
		oNode.destroy();
	},
	_createPopupMenu:function(oParentNode){
		var oMenu = document.createElement('span');
		oMenu.className = 'tjs_popupmenu tjs_popupmenu_'+this._clsId;
		var oNodes = oParentNode.children, q = [], k = 0, oNode, data;
		for (var i = 0, isize = oNodes.length; i < isize; i++) {
			oNode = oNodes[i];
			data = oNode.data;
			if (('fHandler' in data) && !tjs.lang.isFunction(data.fHandler)) {
				delete data.fHandler;
			}
			if (('url' in data) && (!tjs.lang.isString(data.url) || !data.url)) {
				delete data.url;
			}
			if (('tooltip' in data) && (!tjs.lang.isString(data.tooltip) || !data.tooltip)) {
				delete data.tooltip;
			}
			if (('cls' in data) && (!tjs.lang.isString(data.cls) || !data.cls)) {
				delete data.cls;
			}
			oNode.clickable = Boolean(data.fHandler || data.url);

			oNode.oCell = document.createElement('span');
			oNode.oCell.className = 'tjs_menu_cell tjs_menu_cell_normal tjs_menu_hoverable';
			tjs.dom.addClass(oNode.oCell,oNode.isLeaf() ? 'tjs_menu_cell_leaf' : 'tjs_menu_cell_folder');
			if (oNode.clickable) {
				tjs.dom.addClass(oNode.oCell,'tjs_menu_clickable');
			}
			oNode.oCell.oNode = oNode;
			oMenu.appendChild(oNode.oCell);
			this._oCellHandler.createContent(oNode,oNode.data);
			this._oCellHandler.updateContent(oNode,oNode.data);

			if (!oNode.isLeaf()) {
				q[k++] = oNode;
			}
		}
		tjs.event.addListener(oMenu,'mouseover',this._mouseoverHandler_);
		tjs.event.addListener(oMenu,'mouseout',this._mouseoutHandler_);
		tjs.event.addListener(oMenu,'click',this._clickHandler_);

		var oElement = document.createElement('div');
		oElement.className = 'tjs_popupmenu_container tjs_popupmenu_container_'+this._clsId;
		oElement.style.visibility = 'hidden';
		oElement.appendChild(oMenu);
		this._getPopupContainer().appendChild(oElement);
		oParentNode.oPopup = {oElement:oElement,oMenu:oMenu};
		var s = oElement.style;
		s.width = oMenu.offsetWidth+'px';
		s.height = oMenu.offsetHeight+'px';

		if (k > 0) {
			while (k--) {
				oNode = q[k];
				q[k] = null;
				this._createPopupMenu(oNode);
			}
			q.length = 0;
		}
	},
	layout:function(){
		if (this.oRootNode) {
			if (tjs.bom.isIE6) {
				tjs.data.TreeNode.visitPostOrder(this.oRootNode,function(oNode){
					if (oNode.oCell) {
						tjs.css.setOffsetDimension(oNode.oCell);
					}
				});
			}
			this._setPLocations();
		}
	},
	_dragEndHandler:function(source,type,dndData){
		this._setPLocations();
	},
	_stackChildren:function(oNode,s){
		var a = oNode.getChildren();
		if (a && a.length > 0) {
			var i = a.length, n;
			while (i--) {
				n = a[i];
				if (n.oPopup) {
					s[s.length] = n;
				}
			}
		}
	},
	_setPLocations:function(){
		var tjs_css = tjs.css;
		var popupContainer = this._getPopupContainer();
		var w = tjs_css.getPaddingBoxWidth(popupContainer);
		var h = tjs_css.getPaddingBoxHeight(popupContainer);
		var pos_0 = tjs_css.getPosition(popupContainer);
		var pos_1 = tjs_css.getPosition(this.oElement);
		var x = pos_1.x - pos_0.x;
		var y = pos_1.y - pos_0.y;
		pos_1.destroy();
		this.oRootNode.goX = x <= w/2;
		this.oRootNode.goY = y <= h/2;
		var oElement = this.oRootNode.oPopup.oElement;
		var s = oElement.style;
		var zIndex = parseInt(tjs_css.getZIndex(this.oElement)) + 1;
		this.oRootNode.oPopup.zIndex = zIndex;
		s.zIndex = zIndex;
		if (this.oRootNode.goX) {
			s.left = (x+this.oElement.offsetWidth)+'px';
		} else {
			s.left = (x-oElement.offsetWidth)+'px';
		}
		if (this.oRootNode.goY) {
			s.top = y+'px';
		} else {
			s.top = (y+this.oElement.offsetHeight-oElement.offsetHeight)+'px';
		}
		var q = [], oNode, oCell;
		this._stackChildren(this.oRootNode,q);
		while (q.length > 0) {
			oNode = q.pop();
			oCell = oNode.oCell;
			pos_1 = tjs_css.getPosition(oCell);
			x = pos_1.x - pos_0.x;
			y = pos_1.y - pos_0.y;
			pos_1.destroy();
			oElement = oNode.oPopup.oElement;
			s = oElement.style;
			zIndex = oNode.parent.oPopup.zIndex + 1;
			oNode.oPopup.zIndex = zIndex;
			s.zIndex = zIndex;
			if (oNode.parent.goX) {
				oNode.goX = (x + oCell.offsetWidth + oElement.offsetWidth) <= w;
			} else {
				oNode.goX = (x - oElement.offsetWidth) < 0;
			}
			if (oNode.parent.goY) {
				oNode.goY = (y + oElement.offsetHeight) <= h;
			} else {
				oNode.goY = (y - oElement.offsetHeight + oCell.offsetHeight) < 0;
			}
			if (oNode.goX) {
				s.left = (x+oCell.offsetWidth)+'px';
			} else {
				s.left = (x-oElement.offsetWidth)+'px';
			}
			if (oNode.goY) {
				s.top = y+'px';
			} else {
				s.top = (y+oCell.offsetHeight-oElement.offsetHeight)+'px';
			}
			this._stackChildren(oNode,q);
		}
		pos_0.destroy();
	},
	_mouseoverHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		oTarget = tjs.dom.getAncestorByClassName(oTarget,null,'tjs_menu_hoverable',this._getPopupContainer());
		if (oTarget && oTarget.oNode) {
			var oRelatedTarget = oEvent.relatedTarget || oEvent.fromElement;
			if (!oRelatedTarget || !tjs.dom.isAncestorOf(oTarget,oRelatedTarget)) {
				if (this.idChain) {
					window.clearTimeout(this.idChain);
					delete this.idChain;
				}
				this._currChain = oTarget.oNode.getAncestors();
				this._checkChain();
			}
		}
	},
	_mouseoutHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		oTarget = tjs.dom.getAncestorByClassName(oTarget,null,'tjs_menu_hoverable',this._getPopupContainer());
		if (oTarget && oTarget.oNode) {
			var oRelatedTarget = oEvent.relatedTarget || oEvent.toElement;
			if (!oRelatedTarget || !tjs.dom.isAncestorOf(oTarget,oRelatedTarget)) {
				if (this.idChain) {
					window.clearTimeout(this.idChain);
				}
				this._currChain = null;
				this.idChain = window.setTimeout(this._checkChain_,200);
			}
		}
	},
	_clickHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		oTarget = tjs.dom.getAncestorByClassName(oTarget,'span','tjs_menu_clickable',this._getPopupContainer());
		if (oTarget && oTarget.oNode) {
			var oNode = oTarget.oNode;
			if (oNode.clickable) {
				if (this.idChain) {
					window.clearTimeout(this.idChain);
					delete this.idChain;
				}
				this._currChain = null;
				this._checkChain();
				if (oNode.data.fHandler) {
					oNode.data.fHandler();
				} else if (oNode.data.url) {
					if (oNode.data.popup) {
						window.open(oNode.data.url,'_blank');
					} else {
						this.urlHandler(oNode.data.url);
					}
				}
			}
		}
	},
	_doAnimation:function(oPopup) {
		if (oPopup.oAnimation) {
			oPopup.oAnimation.stop();
		} else {
			oPopup.oAnimation = new tjs.anim.Animation({fTiming:tjs.anim.timing.quartic.easeInOut,interval:40,frameCount:10,ensureEnd:false});
			oPopup.oAnimation.addActor(new tjs.anim.CssActor({oElement:oPopup.oElement,handlers:[{name:'width',v0:0,v1:oPopup.oMenu.offsetWidth},{name:'height',v0:0,v1:oPopup.oMenu.offsetHeight}]}));
		}
		oPopup.oAnimation.start();
	},
	_checkChain:function() {
		if (this.idChain) {
			delete this.idChain;
		}
		if (this._currChain != this._oldChain) {
			var newChain = this._currChain;
			var oldChain = this._oldChain;
			var newLen = newChain ? newChain.length : 0;
			var oldLen = oldChain ? oldChain.length : 0;
			var minLen = Math.min(newLen,oldLen);
			var i,j,oNode;
			for (j = 0; j < minLen; j++) {
				if (oldChain[j] != newChain[j]) {
					break;
				}
			}
			for (i = oldLen - 1; i >= j; i--) {
				oNode = oldChain[i];
				if (oNode.oPopup) {
					if (oNode.oPopup.oAnimation) {
						oNode.oPopup.oAnimation.stop();
					}
					oNode.oPopup.oElement.style.visibility = 'hidden';
				}
				if (oNode.oCell) {
					tjs.dom.replaceClass(oNode.oCell,'tjs_menu_cell_hover','tjs_menu_cell_normal');
				}
			}
			var hasOld = oldLen > 0 && oldChain[0].oPopup;
			var hasNew = newLen > 0 && newChain[0].oPopup;
			if (hasNew) {
				if (!hasOld) {
					tjs.dom.addClass(this._getPopupContainer(),'masked');
				}
			} else {
				if (hasOld) {
					tjs.dom.removeClass(this._getPopupContainer(),'masked');
				}
			}
			for (i = j; i < newLen; i++) {
				oNode = newChain[i];
				if (oNode.oCell) {
					tjs.dom.replaceClass(oNode.oCell,'tjs_menu_cell_normal','tjs_menu_cell_hover');
				}
				if (oNode.oPopup) {
					oNode.oPopup.oElement.style.visibility = 'visible';
					if (this.doPopupAnim) {
						this._doAnimation(oNode.oPopup);
					}
				}
			}
			this._oldChain = this._currChain;
		}
	}
});
