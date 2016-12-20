tjs.lang.defineClass('tjs.widget.Tree',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},tjs.data.Tree,tjs.widget.clsWidget,{
	_treeType:'tjs_text_tree',
	_checkTreeType:function() {
		var treeType = this.oMap.remove('treeType');
		if (treeType && tjs.lang.isString(treeType)) {
			this._treeType = treeType;
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
		this._checkTreeType();
		this._checkCellHandler();
		this.doAnim = Boolean(this.oMap.remove('doAnim')) && !tjs.config.get('tjs_anim_disabled');
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
		tjs.dom.addClass(this.oElement,'tjs_tree');
		tjs.dom.addClass(this.oElement,this._treeType);
		tjs.dom.addClass(this.oElement,this._treeType+'_'+this._clsId);

		this._hideRoot = Boolean(this.oMap.remove('hideRoot'));
		this._leafOnly = Boolean(this.oMap.remove('leafOnly'));
		this._oneClickMode = this._leafOnly || Boolean(this.oMap.remove('oneClickMode'));

		this._mouseoverHandler_ = this._mouseoverHandler.bindAsEventListener(this);
		this._mouseoutHandler_ = this._mouseoutHandler.bindAsEventListener(this);
		this._clickHandler_ = this._clickHandler.bindAsEventListener(this);
		tjs.event.addListener(this.oElement,'mouseover',this._mouseoverHandler_);
		tjs.event.addListener(this.oElement,'mouseout',this._mouseoutHandler_);
		tjs.event.addListener(this.oElement,'click',this._clickHandler_);
		if (!this._oneClickMode) {
			this._dblclickHandler_ = this._dblclickHandler.bindAsEventListener(this);
			tjs.event.addListener(this.oElement,'dblclick',this._dblclickHandler_);
		}

		var dndOptions = this.oMap.get('dndOptions');
		if (tjs.lang.isNumber(dndOptions) && (dndOptions & 7) != 0) {
			var dragEffect = null;
			if ((dndOptions & tjs.dnd.DRAGGABLE) != 0) {
				dragEffect = this.oMap.get('dragEffect');
				if (!dragEffect || !tjs.lang.isString(dragEffect)) {
					dragEffect = 'copy';
				}
			}
			this._oListDnDable = new tjs.dnd.ListDnDable({oDnDTarget:new tjs.widget.Tree.ListDnDTarget({oView:this,dndOptions:dndOptions,dragEffect:dragEffect})});
		}

		this._checkDatas();
	},
	_destroy:function() {
		if (this._oAnimation) {
			this._oAnimation.destroy();
		}
		if (this._oListDnDable) {
			this._oListDnDable.destroy();
		}
		if (!this._oneClickMode) {
			tjs.event.removeListener(this.oElement,'dblclick',this._dblclickHandler_);
		}
		tjs.event.removeListener(this.oElement,'mouseover',this._mouseoverHandler_);
		tjs.event.removeListener(this.oElement,'mouseout',this._mouseoutHandler_);
		tjs.event.removeListener(this.oElement,'click',this._clickHandler_);
		if (this._root) {
			tjs.data.TreeNode.visitPostOrder(this._root,this._destroyNode,this);
		}
		this._oCellHandler.destroy();
	},
	_destroyNode:function(oNode) {
		if (oNode.oElement) {
			this._oCellHandler.destroyContent(oNode,oNode.data);
			if (tjs.bom.isIE6 || tjs.bom.isIE7 || tjs.bom.isIE8) {
				oNode.oElement.oNode = null;
			} else {
				delete oNode.oElement.oNode;
			}
		}
		oNode.destroy();
	},
	_destroyNodeContent:function(oNode) {
		if (oNode.oChildrenContainer) {
			tjs.html.destroyElementContent(oNode.oChildrenContainer);
			oNode.oChildrenContainer.parentNode.removeChild(oNode.oChildrenContainer);
		}
		if (oNode.oElement) {
			tjs.html.destroyElementContent(oNode.oElement);
			oNode.oElement.parentNode.removeChild(oNode.oElement);
		}
		tjs.data.TreeNode.visitPostOrder(oNode,this._destroyNode,this);
	},
	_updateNodeContent:function(oNode) {
		this._oCellHandler.updateContent(oNode,oNode.data);
	},
	_createRootContent:function(oNode){
		oNode.opened = true;
		oNode.selected = false;
		if (!this._hideRoot && oNode.data) {
			// oNode.oCell
			oNode.oCell = document.createElement('span');
			oNode.oCell.className = 'tjs_treenode_clickable tjs_treenode_cell '+this._treeType+'_cell '+this._treeType+'_cell_normal';
			// oNode.oElement
			oNode.oElement = document.createElement('div');
			oNode.oElement.className = 'pos_rel tjs_treenode tjs_treenode_0';
			tjs.dom.addClass(oNode.oElement,oNode.isLeaf() ? 'tjs_treenode_leaf' : 'tjs_treenode_folder_opened');
			oNode.oElement.appendChild(oNode.oCell);
			oNode.oElement.oNode = oNode;
			//
			this.oElement.appendChild(oNode.oElement);
			this._oCellHandler.createContent(oNode,oNode.data);
			this._oCellHandler.updateContent(oNode,oNode.data);
		}
		this._createChildrenContent(oNode);
	},
	_createNodeContent:function(oNode,refNode){
		oNode.opened = false;
		oNode.selected = false;
		// oNode.oHandle
		oNode.oHandle = document.createElement('span');
		oNode.oHandle.className = 'tjs_treenode_clickable tjs_treenode_handle';
		// oNode.oCell
		oNode.oCell = document.createElement('span');
		oNode.oCell.className = 'tjs_treenode_clickable tjs_treenode_cell '+this._treeType+'_cell '+this._treeType+'_cell_normal';
		// oNode.oElement
		oNode.oElement = document.createElement('div');
		oNode.oElement.className = 'pos_rel tjs_treenode tjs_treenode_'+oNode.getPath().length;
		tjs.dom.addClass(oNode.oElement,oNode.isLeaf() ? 'tjs_treenode_leaf' : 'tjs_treenode_folder_closed');
		oNode.oElement.appendChild(oNode.oHandle);
		oNode.oElement.appendChild(oNode.oCell);
		oNode.oElement.oNode = oNode;
		//
		var oContainer = oNode.parent.oChildrenContainer;
		if (refNode) {
			oContainer.insertBefore(oNode.oElement,refNode.oElement);
		} else {
			oContainer.appendChild(oNode.oElement);
		}
		this._oCellHandler.createContent(oNode,oNode.data);
		this._oCellHandler.updateContent(oNode,oNode.data);
		//
		this._createChildrenContent(oNode);
	},
	_createChildrenContent:function(oNode) {
		if (!oNode.isLeaf()) {
			this._createChildrenContainer(oNode);//
			var children = oNode.getChildren();
			for (var i = 0, isize = children.length; i < isize; i++) {
				this._createNodeContent(children[i],null);
			}
		}
	},
	_createChildrenContainer:function(oNode){
		if (!oNode.oChildrenContainer) {
			var o = document.createElement('div');
			o.className = 'pos_rel tjs_treenode_children overflow_hidden';
			if (!oNode.opened) {
				o.style.display = 'none';
			}
			if (oNode.isRoot()) {
				this.oElement.appendChild(o);
			} else {
				tjs.dom.addClass(o,'tjs_treenode_padding');
				tjs.dom.insertAfter(o,oNode.oElement);
			}
			oNode.oChildrenContainer = o;
		}
	},
	_attachNodeContent:function(oNode,refNode) {
		var oContainer = oNode.parent.oChildrenContainer;
		if (refNode) {
			oContainer.insertBefore(oNode.oElement,refNode.oElement);
			if (oNode.oChildrenContainer) {
				oContainer.insertBefore(oNode.oChildrenContainer,refNode.oElement);
			}
		} else {
			oContainer.appendChild(oNode.oElement);
			if (oNode.oChildrenContainer) {
				oContainer.appendChild(oNode.oChildrenContainer);
			}
		}
	},
	_detachNodeContent:function(oNode) {
		if (oNode.oChildrenContainer) {
			oNode.oChildrenContainer.parentNode.removeChild(oNode.oChildrenContainer);
		}
		oNode.oElement.parentNode.removeChild(oNode.oElement);
	},
	_Leaf2Folder:function(oNode) {
		this._createChildrenContainer(oNode);
		tjs.dom.replaceClass(oNode.oElement,'tjs_treenode_leaf','tjs_treenode_folder_closed');
	},
	_Folder2Leaf:function(oNode) {
		if (oNode.opened) {
			tjs.dom.replaceClass(oNode.oElement,'tjs_treenode_folder_opened','tjs_treenode_leaf');
			oNode.opened = false;
		} else {
			tjs.dom.replaceClass(oNode.oElement,'tjs_treenode_folder_closed','tjs_treenode_leaf');
		}
		tjs.dom.removeNode(oNode.oChildrenContainer);
		delete oNode.oChildrenContainer;
	},
	_mouseoverHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		oTarget = tjs.dom.getAncestorByClassName(oTarget,'span','tjs_treenode_cell',this.oElement);
		if (oTarget) {
			var oRelatedTarget = oEvent.relatedTarget || oEvent.fromElement;
			if (!oRelatedTarget || !tjs.dom.isAncestorOf(oTarget,oRelatedTarget)) {
				var oNode = oTarget.parentNode.oNode;
				if (!this._leafOnly || oNode.isLeaf()) {
					if (oNode.selected) {
						tjs.dom.replaceClass(oTarget,this._treeType+'_cell_selected',this._treeType+'_cell_selected_hover');
					} else {
						tjs.dom.replaceClass(oTarget,this._treeType+'_cell_normal',this._treeType+'_cell_normal_hover');
					}
				}
			}
		}
	},
	_mouseoutHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		oTarget = tjs.dom.getAncestorByClassName(oTarget,'span','tjs_treenode_cell',this.oElement);
		if (oTarget) {
			var oRelatedTarget = oEvent.relatedTarget || oEvent.toElement;
			if (!oRelatedTarget || !tjs.dom.isAncestorOf(oTarget,oRelatedTarget)) {
				var oNode = oTarget.parentNode.oNode;
				if (!this._leafOnly || oNode.isLeaf()) {
					if (oNode.selected) {
						tjs.dom.replaceClass(oTarget,this._treeType+'_cell_selected_hover',this._treeType+'_cell_selected');
					} else {
						tjs.dom.replaceClass(oTarget,this._treeType+'_cell_normal_hover',this._treeType+'_cell_normal');
					}
				}
			}
		}
	},
	_clickHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		//tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		oTarget = tjs.dom.getAncestorByClassName(oTarget,'span','tjs_treenode_clickable',this.oElement);
		if (oTarget) {
			var oNode = oTarget.parentNode.oNode;
			var isCell = tjs.dom.hasClass(oTarget,'tjs_treenode_cell');
			if (!isCell || this._oneClickMode) {
				this._toggleOpen(oNode);
			}
			if (isCell && (!this._leafOnly || oNode.isLeaf())) {
				this.currClickedNode = oNode;
				this.fire(tjs.data.DATA_CLICKED,oNode);
				this._onClicked(oNode);
			}
		}
	},
	_onClicked:function(path,oNode){
	},
	_dblclickHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		//tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		oTarget = tjs.dom.getAncestorByClassName(oTarget,'span','tjs_treenode_cell',this.oElement);
		if (oTarget) {
			var oNode = oTarget.parentNode.oNode;
			this._toggleOpen(oNode);
		}
	},
	_toggleOpen:function(oNode) {
		if (!oNode.isLeaf()) {
			oNode.opened = !oNode.opened;
			if (oNode.opened) {
				tjs.dom.replaceClass(oNode.oElement,'tjs_treenode_folder_closed','tjs_treenode_folder_opened');
				if (this.doAnim) {
					this._doAnimation(oNode,false);
				} else {
					oNode.oChildrenContainer.style.display = '';
					tjs.html.forceRedraw();
				}
			} else {
				tjs.dom.replaceClass(oNode.oElement,'tjs_treenode_folder_opened','tjs_treenode_folder_closed');
				if (this.doAnim) {
					this._doAnimation(oNode,true);
				} else {
					oNode.oChildrenContainer.style.display = 'none';
					tjs.html.forceRedraw();
				}
			}
		}
	},
	_doAnimation:function(oNode,reverse) {
		if (this._oAnimation) {
			this._oAnimation.stop();
		} else {
			var onStart = function(actor,cnt,oAnimation) {
				var e = actor.oElement;
				var s = e.style;
				if (!oAnimation._reverse) {
					s.display = '';
					tjs.css.setOffsetHeight(e,e.offsetHeight);
					actor.h = parseInt(s.height);
					actor.getHandler('height').setV1(actor.h);
					s.height = '0px';
				}
			};
			var onStop = function(actor,cnt,oAnimation) {
				var e = actor.oElement;
				var s = e.style;
				if (oAnimation._reverse) {
					s.display = 'none';
				}
				s.height = '';
				tjs.html.forceRedraw();
			};
			this._oAnimation = new tjs.anim.Animation({fTiming:tjs.anim.timing.quartic.easeInOut,interval:50,frameCount:10,ensureEnd:false});
			this._oAnimation.addActor(new tjs.anim.CssActor({handlers:[{name:'height',v0:0,v1:0}],onStart:onStart,onStop:onStop}));
		}
		this._oAnimation.reverse = reverse;
		this._oAnimation.getActor(0).setElement(oNode.oChildrenContainer);
		this._oAnimation.start();
	},
	_updateSelection:function(oNode){
		if (oNode.selected) {
			var p = oNode.parent;
			while (p && !p.opened) {
				if (p.oElement) {
					tjs.dom.replaceClass(p.oElement,'tjs_treenode_folder_closed','tjs_treenode_folder_opened');
				}
				p.oChildrenContainer.style.display = '';
				p.opened = true;
				p = p.parent;
			}
			if (tjs.dom.hasClass(oNode.oCell,this._treeType+'_cell_normal_hover')) {
				tjs.dom.replaceClass(oNode.oCell,this._treeType+'_cell_normal_hover',this._treeType+'_cell_selected_hover');
			} else {
				tjs.dom.replaceClass(oNode.oCell,this._treeType+'_cell_normal',this._treeType+'_cell_selected');
			}
		} else {
			if (tjs.dom.hasClass(oNode.oCell,this._treeType+'_cell_selected_hover')) {
				tjs.dom.replaceClass(oNode.oCell,this._treeType+'_cell_selected_hover',this._treeType+'_cell_normal_hover');
			} else {
				tjs.dom.replaceClass(oNode.oCell,this._treeType+'_cell_selected',this._treeType+'_cell_normal');
			}
		}
	},
	layout:function(){
		tjs.html.forceRedraw();
	},
	_checkUI:function() {
		tjs.html.forceRedraw();
	}
});

tjs.lang.defineClass('tjs.widget.STree',tjs.widget.Tree,
function(o) {
	tjs.widget.Tree.call(this,o);
},tjs.data.STree,{
	_checkAll:function() {
		tjs.widget.Tree.prototype._checkAll.call(this);
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

tjs.lang.defineClass('tjs.widget.MTree',tjs.widget.Tree,
function(o) {
	tjs.widget.Tree.call(this,o);
},tjs.data.MTree,{
	_checkAll:function(){
		tjs.widget.Tree.prototype._checkAll.call(this);
		this._excludeDescendants = !this._leafOnly && Boolean(this.oMap.remove('excludeDescendants'));
	},
	_onClicked:function(oNode){
		this.setNodeSelection(oNode,!oNode.selected,true);
	}
});
