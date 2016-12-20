tjs.lang.defineClass('tjs.widget.List',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},tjs.data.List,tjs.widget.clsWidget,{
	_listType:'tjs_text_list',
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
	_checkAll:function() {
		this._checkClsId();
		this._checkListType();
		this._checkCellHandler();
	},
	_construct:function() {
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'span','tagName != "span" @'+this.classname+'._construct');
//tjs_debug_end
			if (this.oElement.hasChildNodes()) {
				this.oElement.innerHTML = '';
			}
		} else {
			this.oElement = document.createElement('span');
			var oParent = this.oMap.remove('oParent');
			if (tjs.dom.isElement(oParent)) {
				oParent.appendChild(this.oElement);
			}
		}
		tjs.dom.addClass(this.oElement,this._listType);
		tjs.dom.addClass(this.oElement,this._listType+'_'+this._clsId);
		this._handleListSubType();

		this._mouseoverHandler_ = this._mouseoverHandler.bindAsEventListener(this);
		this._mouseoutHandler_ = this._mouseoutHandler.bindAsEventListener(this);
		this._clickHandler_ = this._clickHandler.bindAsEventListener(this);
		this._widgetDisabled = Boolean(this.oMap.remove('widgetDisabled'));
		if (!this._widgetDisabled) {
			tjs.event.addListener(this.oElement,'mouseover',this._mouseoverHandler_);
			tjs.event.addListener(this.oElement,'mouseout',this._mouseoutHandler_);
			tjs.event.addListener(this.oElement,'click',this._clickHandler_);
		}
		this._layouted = false;
		this._alternate = Boolean(this.oMap.remove('alternate'));

		var dndOptions = this.oMap.get('dndOptions');
		if (tjs.lang.isNumber(dndOptions) && (dndOptions & 7) != 0) {
			var dragEffect = null;
			if ((dndOptions & tjs.dnd.DRAGGABLE) != 0) {
				dragEffect = this.oMap.get('dragEffect');
				if (!dragEffect || !tjs.lang.isString(dragEffect)) {
					dragEffect = 'copy';
				}
			}
			this._oListDnDable = new tjs.dnd.ListDnDable({oDnDTarget:new tjs.widget.List.ListDnDTarget({oView:this,dndOptions:dndOptions,dragEffect:dragEffect})});
		}

		this._checkDatas();
	},
	_destroy:function() {
		if (this._oListDnDable) {
			this._oListDnDable.destroy();
		}
		if (!this.isEmpty()) {
			var i = this._oNodes.length;
			while (i--) {
				this._destroyNode(this._oNodes[i]);
				this._oNodes[i] = null;
			}
			this._oNodes.length = 0;
		}
		this._oCellHandler.destroy();
		if (!this._widgetDisabled) {
			tjs.event.removeListener(this.oElement,'mouseover',this._mouseoverHandler_);
			tjs.event.removeListener(this.oElement,'mouseout',this._mouseoutHandler_);
			tjs.event.removeListener(this.oElement,'click',this._clickHandler_);
		}
	},
	_destroyNode:function(oNode) {
		if (oNode.oCell) {
			this._oCellHandler.destroyContent(oNode,oNode.data);
			if (tjs.bom.isIE6 || tjs.bom.isIE7 || tjs.bom.isIE8) {
				oNode.oCell.oNode = null;
			} else {
				delete oNode.oCell.oNode;
			}
		}
		tjs.lang.destroyObject(oNode);
	},
	_destroyNodeContent:function(oNode) {
		if (oNode.oCell) {
			tjs.html.destroyElementContent(oNode.oCell);
			this.oElement.removeChild(oNode.oCell);
		}
		this._destroyNode(oNode);
	},
	_updateNodeContent:function(oNode,doReset) {
		if (doReset) {
			this._resetNodeContent(oNode);
		}
		this._oCellHandler.updateContent(oNode,oNode.data);
	},
	_createNodeContent:function(oNode,refNode) {
		oNode.oCell = document.createElement('span');
		oNode.oCell.oNode = oNode;
		this._resetNodeContent(oNode);
		if (refNode) {
			this.oElement.insertBefore(oNode.oCell,refNode.oCell);
		} else {
			this.oElement.appendChild(oNode.oCell);
		}
		this._oCellHandler.createContent(oNode,oNode.data);
		this._oCellHandler.updateContent(oNode,oNode.data);
	},
	_resetNodeContent:function(oNode){
		oNode.oCell.className = 'tjs_list_cell '+this._listType+'_cell '+this._listType+'_cell_normal';
		if (oNode.disabled) {
			tjs.dom.addClass(oNode.oCell,this._listType+'_cell_disabled');
			oNode.oCell.style.cursor = '';
		} else {
			oNode.oCell.style.cursor = 'pointer';
		}
	},
	_detachNodeContent:function(oNode) {
		this.oElement.removeChild(oNode.oCell);
	},
	_attachNodeContent:function(oNode,refNode) {
		if (refNode) {
			this.oElement.insertBefore(oNode.oCell,refNode.oCell);
		} else {
			this.oElement.appendChild(oNode.oCell);
		}
	},
	_mouseoverHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		oTarget = tjs.dom.getAncestorByClassName(oTarget,'span','tjs_list_cell',this.oElement);
		if (oTarget && oTarget.oNode) {
			var oRelatedTarget = oEvent.relatedTarget || oEvent.fromElement;
			if (!oRelatedTarget || !tjs.dom.isAncestorOf(oTarget,oRelatedTarget)) {
				var oNode = oTarget.oNode;
				if (!oNode.disabled) {
					if (oNode.selected) {
						tjs.dom.replaceClass(oTarget,this._listType+'_cell_selected',this._listType+'_cell_selected_hover');
					} else {
						tjs.dom.replaceClass(oTarget,this._listType+'_cell_normal',this._listType+'_cell_normal_hover');
					}
					this._onHover(oNode);
				}
			}
		}
	},
	_mouseoutHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		oTarget = tjs.dom.getAncestorByClassName(oTarget,'span','tjs_list_cell',this.oElement);
		if (oTarget && oTarget.oNode) {
			var oRelatedTarget = oEvent.relatedTarget || oEvent.toElement;
			if (!oRelatedTarget || !tjs.dom.isAncestorOf(oTarget,oRelatedTarget)) {
				var oNode = oTarget.oNode;
				if (!oNode.disabled) {
					if (oNode.selected) {
						tjs.dom.replaceClass(oTarget,this._listType+'_cell_selected_hover',this._listType+'_cell_selected');
					} else {
						tjs.dom.replaceClass(oTarget,this._listType+'_cell_normal_hover',this._listType+'_cell_normal');
					}
				}
			}
		}
	},
	_clickHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		//tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		oTarget = tjs.dom.getAncestorByClassName(oTarget,'span','tjs_list_cell',this.oElement);
		if (oTarget && oTarget.oNode) {
			var oNode = oTarget.oNode;
			if (!oNode.disabled) {
				this.currClickedNode = oNode;
				this.fire(tjs.data.DATA_CLICKED,oNode);
				this._onClicked(oNode);
			}
		}
	},
	_onHover:function(oNode){
	},
	_onClicked:function(oNode){
	},
	_updateSelection:function(oNode){
		if (oNode.selected) {
			if (tjs.dom.hasClass(oNode.oCell,this._listType+'_cell_normal_hover')) {
				tjs.dom.replaceClass(oNode.oCell,this._listType+'_cell_normal_hover',this._listType+'_cell_selected_hover');
			} else {
				tjs.dom.replaceClass(oNode.oCell,this._listType+'_cell_normal',this._listType+'_cell_selected');
			}
		} else {
			if (tjs.dom.hasClass(oNode.oCell,this._listType+'_cell_selected_hover')) {
				tjs.dom.replaceClass(oNode.oCell,this._listType+'_cell_selected_hover',this._listType+'_cell_normal_hover');
			} else {
				tjs.dom.replaceClass(oNode.oCell,this._listType+'_cell_selected',this._listType+'_cell_normal');
			}
		}
	},
	_updateWidgetDisabled:function(){
		if (this._widgetDisabled) {
			tjs.event.removeListener(this.oElement,'mouseover',this._mouseoverHandler_);
			tjs.event.removeListener(this.oElement,'mouseout',this._mouseoutHandler_);
			tjs.event.removeListener(this.oElement,'click',this._clickHandler_);
		} else {
			tjs.event.addListener(this.oElement,'mouseover',this._mouseoverHandler_);
			tjs.event.addListener(this.oElement,'mouseout',this._mouseoutHandler_);
			tjs.event.addListener(this.oElement,'click',this._clickHandler_);
		}
	},
	_updateDisabled:function(oNode){
		var tjs_dom = tjs.dom;
		if (oNode.disabled) {
			oNode.oCell.style.cursor = '';
			tjs_dom.addClass(oNode.oCell,this._listType+'_cell_disabled');
			if (tjs_dom.hasClass(oNode.oCell,this._listType+'_cell_normal_hover')) {
				tjs_dom.replaceClass(oNode.oCell,this._listType+'_cell_normal_hover',this._listType+'_cell_normal');
			} else if (tjs_dom.hasClass(oNode.oCell,this._listType+'_cell_selected_hover')) {
				tjs_dom.replaceClass(oNode.oCell,this._listType+'_cell_selected_hover',this._listType+'_cell_normal');
			}
		} else {
			oNode.oCell.style.cursor = 'pointer';
			tjs_dom.removeClass(oNode.oCell,this._listType+'_cell_disabled');
		}
	},
	_updateHidden:function(oNode){
		oNode.oCell.style.display = oNode.hidden ? 'none' : '';
	},
	_updateAlterable:function(oNode){
		if (oNode.isEven) {
			tjs.dom.replaceClass(oNode.oCell,this._listType+'_cell_odd',this._listType+'_cell_even');
		} else {
			tjs.dom.replaceClass(oNode.oCell,this._listType+'_cell_even',this._listType+'_cell_odd');
		}
	},
	_checkUI:function(iBeg,iEnd) {
		if (this._layouted) {
			this.layout();
		}
	},
	layout:function(){
		this._layouted = true;
	},
	_handleListSubType:function() {
	}
});

tjs.lang.defineClass('tjs.widget.SList',tjs.widget.List,
function(o) {
	tjs.widget.List.call(this,o);
},tjs.data.SList,{
	_checkAll:function() {
		tjs.widget.List.prototype._checkAll.call(this);
		this._selectOnInserted = Boolean(this.oMap.remove('selectOnInserted'));
		this._alwaysSelected = Boolean(this.oMap.remove('alwaysSelected'));
		this._noUnselection = this._alwaysSelected || Boolean(this.oMap.remove('noUnselection'));
	},
	_onClicked:function(oNode){
		if (oNode != this._selectedNode) {
			this.setSelectedNode(oNode,true);
		} else if (!this._noUnselection) {
			this.setSelectedNode(null,true);
		}
	}
});

tjs.lang.defineClass('tjs.widget.MList',tjs.widget.List,
function(o) {
	tjs.widget.List.call(this,o);
},tjs.data.MList,{
	_onClicked:function(oNode){
		this.setNodeSelection(oNode,!oNode.selected,true);
	}
});

tjs.lang.defineClass('tjs.widget.hvList',tjs.widget.hvWidget,
function() {
},{
	_handleListSubType:function() {
		this._checkHV();
		tjs.dom.addClass(this.oElement,this._listType+'_'+this._hv);
		tjs.dom.addClass(this.oElement,this._listType+'_'+this._clsId+'_'+this._hv);
	}
});

tjs.lang.defineClass('tjs.widget.posList',tjs.widget.posWidget,
function() {
},{
	_handleListSubType:function() {
		this._checkPos();
		//tjs.dom.addClass(this.oElement,'tjs_list_'+this._pos);
		tjs.dom.addClass(this.oElement,this._listType+'_'+this._pos);
		tjs.dom.addClass(this.oElement,this._listType+'_'+this._clsId+'_'+this._pos);
	}
});
