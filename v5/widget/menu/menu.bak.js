tjs.lang.defineClass('tjs.widget.Menu',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},tjs.widget.clsWidget,tjs.widget.posWidget,{
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
		this.doBgAnim = Boolean(this.oMap.remove('doBgAnim')) && doAnim;
		if (this.doBgAnim) {
			var vs = this.oMap.remove('bgPosValues'), result = false, tl = tjs.lang;
			if (tl.isArray(vs) && vs.length == 2) {
				var a0 = vs[0], a1 = vs[1];
				if (tl.isArray(a0) && a0.length == 2 && tl.isArray(a1) && a1.length == 2) {
					if (tl.isNumber(a0[0]) && tl.isNumber(a0[1]) && tl.isNumber(a1[0]) && tl.isNumber(a1[1])) {
						result = true;
					}
				}
			}
			if (!result) {
				vs = [[0,0],[100,100]];
			}
			this.bgPosValues = vs;
			this.bgPos = [vs[0][0]+'% '+vs[0][1]+'%',vs[1][0]+'% '+vs[1][1]+'%'];
		}
	},
	_checkDatas:function() {
		var datas = this.oMap.remove('datas');
		if (tjs.lang.isArray(datas) && datas.length > 0) {
			var i = datas.length;
			while (i--) {
				datas[i] = tjs.data.TreeNode.createNode2(datas[i]);
			}
			this.oNodes = datas;
		}
	},
	_checkAll:function() {
		this._checkClsId();
		this._checkPos();
		this._checkListType();
		this._checkCellHandler();
		this._checkPopupContainer();
		this._checkAnims();
		this._checkDatas();
	},
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
		tjs.dom.addClass(this.oElement,'pos_rel');
		tjs.dom.addClass(this.oElement,'tjs_menu_container');
		tjs.dom.addClass(this.oElement,'tjs_menu_container_'+this._pos);
		tjs.dom.addClass(this.oElement,'tjs_menu_container_'+this._clsId);
		tjs.dom.addClass(this.oElement,'tjs_menu_container_'+this._clsId+'_'+this._pos);
		if (this.oNodes) {
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

			var o = this._createMenu(this.oNodes,this.oElement,'tjs_menu tjs_menu_'+this._clsId+' tjs_menu_'+this._pos+' tjs_menu_'+this._clsId+'_'+this._pos);
			this.oMenu = o.oMenu;
			if (o.q.length > 0) {
				var i = o.q.length,n;
				while (i--) {
					n = o.q[i];
					o.q[i] = null;
					this._createPopupMenu(n);
				}
				o.q.length = 0;
			}
			tjs.lang.destroyObject(o);
		}
	},
	_destroy:function() {
		if (this.oNodes) {
			tjs.event.removeListener(this.oMenu,'mouseover',this._mouseoverHandler_);
			tjs.event.removeListener(this.oMenu,'mouseout',this._mouseoutHandler_);
			tjs.event.removeListener(this.oMenu,'click',this._clickHandler_);
			var i = this.oNodes.length;
			while (i--) {
				tjs.data.TreeNode.visitPostOrder(this.oNodes[i],this._destroyNode,this);
			}
			tjs.lang.destroyArray(this.oNodes);
		}
	},
	_destroyNode:function(oNode) {
		if (oNode.oAnimation) {
			oNode.oAnimation.destroy();
		}
		if (oNode.oPopup) {
			var oPopup = oNode.oPopup;
			if (oPopup.oAnimation) {
				oPopup.oAnimation.destroy();
			}
			var oMenu = oPopup.oMenu;
			tjs.event.removeListener(oMenu,'mouseover',this._mouseoverHandler_);
			tjs.event.removeListener(oMenu,'mouseout',this._mouseoutHandler_);
			tjs.event.removeListener(oMenu,'click',this._clickHandler_);
			tjs.dom.removeNode(oPopup.oElement);
			tjs.lang.destroyObject(oPopup);
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
	_createMenu:function(oNodes,oParent,className) {
		var oMenu = document.createElement('span');
		oMenu.className = className;
		var oNode, data, q = [], k = 0;
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
			oNode.oCell.className = 'tjs_menu_cell tjs_menu_cell_normal';
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
		oParent.appendChild(oMenu);
		return {oMenu:oMenu,q:q};
	},
	_createPopupMenu:function(oNode){
		var oElement = document.createElement('div');
		oElement.className = 'tjs_popupmenu_container';
		oElement.style.visibility = 'hidden';
		this._getPopupContainer().appendChild(oElement);
		var o = this._createMenu(oNode.children,oElement,'tjs_popupmenu tjs_popupmenu_'+this._clsId);
		oNode.oPopup = {oElement:oElement,oMenu:o.oMenu};
		var s = oElement.style;
		s.width = o.oMenu.offsetWidth+'px';
		s.height = o.oMenu.offsetHeight+'px';
		if (o.q.length > 0) {
			var i = o.q.length,n;
			while (i--) {
				n = o.q[i];
				o.q[i] = null;
				this._createPopupMenu(n);
			}
			o.q.length = 0;
		}
		tjs.lang.destroyObject(o);
	},
	layout:function(){
		if (this.oNodes) {
			if (tjs.bom.isIE6) {
				var i = this.oNodes.length;
				while (i--) {
					tjs.data.TreeNode.visitPostOrder(this.oNodes[i],function(oNode){
						tjs.css.setOffsetDimension(oNode.oCell);
					});
				}
			}
			this._setPLocations();
		}
	},
	_setPLocations:function(){
		var tjs_css = tjs.css;
		var popupContainer = this._getPopupContainer();
		var w = tjs_css.getPaddingBoxWidth(popupContainer);
		var h = tjs_css.getPaddingBoxHeight(popupContainer);
		var pos_0 = tjs_css.getPosition(popupContainer);
		var q = [], isize = this.oNodes.length, i, j, jsize, oNode, oCell, oElement, s, zIndex, pos_1, x, y, children;
		for (i = 0; i < isize; i++) {
			oNode = this.oNodes[i];
			if (oNode.oPopup) {
				oCell = oNode.oCell;
				pos_1 = tjs_css.getPosition(oCell);
				x = pos_1.x - pos_0.x;
				y = pos_1.y - pos_0.y;
				pos_1.destroy();
				oElement = oNode.oPopup.oElement;
				s = oElement.style;
				zIndex = 100;
				oNode.oPopup.zIndex = zIndex;
				s.zIndex = zIndex;
				switch (this._pos) {
					case 'n':
						oNode.goX = (x + oElement.offsetWidth) <= w;
						oNode.goY = true;
						s.top = (y+oCell.offsetHeight)+'px';
						if (oNode.goX) {
							s.left = x+'px';
						} else {
							s.left = (x+oCell.offsetWidth-oElement.offsetWidth)+'px';
						}
						break;
					case 's':
						oNode.goX = (x + oElement.offsetWidth) <= w;
						oNode.goY = false;
						if (oNode.goX) {
							s.left = x+'px';
						} else {
							s.left = (x+oCell.offsetWidth-oElement.offsetWidth)+'px';
						}
						s.top = (y-oElement.offsetHeight)+'px';
						break;
					case 'w':
						oNode.goX = true;
						oNode.goY = (y + oElement.offsetHeight) <= h;
						s.left = (x+oCell.offsetWidth)+'px';
						if (oNode.goY) {
							s.top = y+'px';
						} else {
							s.top = (y+oCell.offsetHeight-oElement.offsetHeight)+'px';
						}
						break;
					case 'e':
						oNode.goX = false;
						oNode.goY = (y + oElement.offsetHeight) <= h;
						s.left = (x-oElement.offsetWidth)+'px';
						if (oNode.goY) {
							s.top = y+'px';
						} else {
							s.top = (y+oCell.offsetHeight-oElement.offsetHeight)+'px';
						}
						break;
				}
				children = oNode.getChildren();
				for (j = 0, jsize = children.length; j < jsize; j++) {
					if (children[j].oPopup) {
						q[q.length] = children[j];
					}
				}
			}
		}
		while (q.length > 0) {
			oNode = q.shift();
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
			children = oNode.getChildren();
			for (j = 0, jsize = children.length; j < jsize; j++) {
				if (children[j].oPopup) {
					q[q.length] = children[j];
				}
			}
		}
		pos_0.destroy();
	},
	_mouseoverHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		oTarget = tjs.dom.getAncestorByClassName(oTarget,'span','tjs_menu_cell',this._getPopupContainer());
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
		oTarget = tjs.dom.getAncestorByClassName(oTarget,'span','tjs_menu_cell',this._getPopupContainer());
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
				this._isClick = true;
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
	_doAnimation1:function(oNode,reverse) {
		if (oNode.oAnimation) {
			oNode.oAnimation.stop();
		} else {
			var onStop = function(actor,cnt,oAnimation){
				if (oAnimation._reverse) {
					tjs.dom.replaceClass(actor.oElement,'tjs_menu_cell_hover','tjs_menu_cell_normal');
				} else {
					tjs.dom.replaceClass(actor.oElement,'tjs_menu_cell_normal','tjs_menu_cell_hover');
				}
			};
			oNode.oAnimation = new tjs.anim.Animation({interval:40,frameCount:10,ensureEnd:true});
			oNode.oAnimation.addActor(new tjs.anim.CssActor({oElement:oNode.oCell,handlers:[{name:'backgroundPosition',length:2,unit:['%','%'],v0:this.bgPosValues[0],v1:this.bgPosValues[1]}],onStop:onStop}));
		}
		oNode.oAnimation.reverse = reverse;
		oNode.oAnimation.start();
	},
	_doAnimation2:function(oPopup) {
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
				if (oNode.oAnimation) {
					if (this._isClick) {
						delete this._isClick;
						oNode.oAnimation.stop();
						oNode.oCell.style.backgroundPosition = this.bgPos[0];
						tjs.dom.replaceClass(oNode.oCell,'tjs_menu_cell_hover','tjs_menu_cell_normal');
					} else {
						this._doAnimation1(oNode,true);
					}
				} else {
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
				if (this.doBgAnim && i == 0) {
					this._doAnimation1(oNode,false);
				} else {
					tjs.dom.replaceClass(oNode.oCell,'tjs_menu_cell_normal','tjs_menu_cell_hover');
				}
				if (oNode.oPopup) {
					oNode.oPopup.oElement.style.visibility = 'visible';
					if (this.doPopupAnim) {
						this._doAnimation2(oNode.oPopup);
					}
				}
			}
			this._oldChain = this._currChain;
		}
	}
});
