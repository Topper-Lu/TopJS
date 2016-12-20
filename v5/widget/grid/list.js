tjs.lang.defineClass('tjs.grid.ListGrid',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},tjs.data.List,{
	_checkAll:function() {
		this.aColumns = this.oMap.remove('aColumns');
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isArray(this.aColumns) && this.aColumns.length > 0,'!tjs.lang.isArray(this.aColumns) @'+this.classname);
//tjs_debug_end
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
			if (tjs.css.getComputedStyle(this.oElement).position == 'static') {
				tjs.dom.addClass(this.oElement,'pos_rel');
			}
			tjs.dom.addClass(this.oElement,'overflow_hidden');
		} else {
			this.oElement = document.createElement('div');
			this.oElement.className = 'pos_rel overflow_hidden';
			var oParent = this.oMap.remove('oParent');
			if (tjs.dom.isElement(oParent)) {
				oParent.appendChild(this.oElement);
			}
		}
		if (!this.oElement.id) {
			this.oElement.id = 'tjs_grid_' + String(Math.round(Math.random()*100000000));
		}

		this._createStyles();
		var colAuto = this.oMap.remove('colAuto');
		if (tjs.lang.isNumber(colAuto) && colAuto > -1) {
			this._colAuto = colAuto;
		} else {
			this._colAuto = -1;
		}
		this._hasHeader = !this.oMap.remove('noHeader');
		if (this._hasHeader) {
			this._oResizer = document.createElement('div');
			this._oResizer.style.display = 'none';
			this._oResizer.className = 'pos_abs pos_tl overflow_hidden tjs_grid_resizer';

			this._oHeaderViewport = document.createElement('div');
			this._oHeaderViewport.className = 'pos_rel overflow_hidden tjs_grid_hd_viewport';
			this._oHeaderViewport.innerHTML = '<table class="pos_rel tjs_grid_hd_table" border="0" cellpadding="0" cellspacing="0"><tbody></tbody></table>';
			this._oHeaderTable = tjs.dom.getFirstChildByTagName(this._oHeaderViewport,'table');

			this.oElement.appendChild(this._oResizer);
			this.oElement.appendChild(this._oHeaderViewport);

			this._oDraggable4ColResize = new tjs.dnd.Draggable({dragCursor:(tjs.bom.isIE || tjs.bom.isGecko) ? 'col-resize' : 'e-resize'});
			this._oDraggable4ColResize.onDragStart = this._fColResizeDragStartHandler.bind(this);
			this._oDraggable4ColResize.onDrag = this._fColResizeDragHandler.bind(this);
			this._oDraggable4ColResize.onDragEnd = this._fColResizeDragEndHandler.bind(this);

			var sortType = this.oMap.remove('sortType');
			if (!tjs.lang.isNumber(sortType) || sortType < 0) {
				sortType = 0;
			}
			this._sortType = sortType;
			if (this._sortType > 0) {
				this._sortState = {oColumn:null,sortType:0};
				this._clickHandler4Header_ = this._clickHandler4Header.bindAsEventListener(this);
				tjs.event.addListener(this._oHeaderTable,'click',this._clickHandler4Header_);
			}
			this._createHeader();
		}

		this._oBodyViewport = document.createElement('div');
		this._oBodyViewport.className = 'pos_rel overflow_auto tjs_grid_bd_viewport';
		this._oBodyViewport.innerHTML = '<table class="tjs_grid_bd_table" border="0" cellpadding="0" cellspacing="0"><tbody></tbody></table>';
		this._oBodyTable = tjs.dom.getFirstChildByTagName(this._oBodyViewport,'table');
		this.oElement.appendChild(this._oBodyViewport);
		if (this._hasHeader) {
			this._scrollHandler_ = this._scrollHandler.bindAsEventListener(this);
			tjs.event.addListener(this._oBodyViewport,'scroll',this._scrollHandler_);
		}

		this._mouseoverHandler_ = this._mouseoverHandler.bindAsEventListener(this);
		this._mouseoutHandler_ = this._mouseoutHandler.bindAsEventListener(this);
		this._clickHandler_ = this._clickHandler.bindAsEventListener(this);
		this._widgetDisabled = Boolean(this.oMap.remove('widgetDisabled'));
		if (!this._widgetDisabled) {
			tjs.event.addListener(this._oBodyTable,'mouseover',this._mouseoverHandler_);
			tjs.event.addListener(this._oBodyTable,'mouseout',this._mouseoutHandler_);
			tjs.event.addListener(this._oBodyTable,'click',this._clickHandler_);
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
			this._oListDnDable = new tjs.dnd.ListDnDable({oDnDTarget:new tjs.grid.ListDnDTarget({oView:this,dndOptions:dndOptions,dragEffect:dragEffect})});
		}

		this._checkDatas();
	},
	_destroy:function() {
		if (this._oListDnDable) {
			this._oListDnDable.destroy();
		}
		if (!this._widgetDisabled) {
			tjs.event.removeListener(this._oBodyTable,'mouseover',this._mouseoverHandler_);
			tjs.event.removeListener(this._oBodyTable,'mouseout',this._mouseoutHandler_);
			tjs.event.removeListener(this._oBodyTable,'click',this._clickHandler_);
		}
		if (this._clickHandler4Header_) {
			tjs.event.removeListener(this._oHeaderTable,'click',this._clickHandler4Header_);
			tjs.lang.destroyObject(this._sortState);
		}
		if (this._hasHeader) {
			tjs.event.removeListener(this._oBodyViewport,'scroll',this._scrollHandler_);
			this._oDraggable4ColResize.destroy();
		}
		var i = this._oNodes.length, j, oNode;
		while (i--) {
			oNode = this._oNodes[i];
			this._oNodes[i] = null;
			j = oNode.oColNodes.length;
			while (j--) {
				tjs.lang.destroyObject(oNode.oColNodes[j]);
				oNode.oColNodes[j] = null;
			}
			oNode.oColNodes.length = 0;
			tjs.lang.destroyObject(oNode);
		}
		this._oNodes.length = 0;

		var isIE = tjs.bom.isIE, oColumn, oCol;
		j = this.aColumns.length;
		while (j--) {
			oColumn = this.aColumns[j];
			this.aColumns[j] = null;
			oCol = oColumn.oCol;
			if (oCol) {
				if (isIE) {
					oCol.oColumn = null;
				} else {
					delete oCol.oColumn;
				}
			}
			oColumn.destroy();
		}
		this.aColumns.length = 0;
		tjs.html.removeStyleSheet(this.oElement.id+'_style');
	},
	_createStyles:function() {
		var selector4Cell = 'div#'+this.oElement.id+' div.tjs_grid_cell_';
		var jsize = this.aColumns.length, j, oColumn;
		var b = [], k = 0;
		for (j = 0; j < jsize; j++) {
			oColumn = this.aColumns[j];
			oColumn.idx = j;
			oColumn.oCellStyle = selector4Cell+oColumn.getName();
			b[k++] = oColumn.oCellStyle+'{width:'+oColumn.getWidth()+'px;}';
		}
		var sText = b.join('');
		tjs.lang.destroyArray(b);
		var oStyleSheet = tjs.html.createStyleSheet(this.oElement.id+'_style',null,sText);
		var rules = tjs.css.styleSheet.getRules(oStyleSheet), o = {}, rule;
		k = rules.length;
		while (k--) {
			rule = rules[k];
			o[rule.selectorText.toLowerCase()] = rule.style;
		}
		for (j = 0; j < jsize; j++) {
			oColumn = this.aColumns[j];
			oColumn.oCellStyle = o[oColumn.oCellStyle];
		}
		tjs.lang.destroyObject(o);
	},
	_createHeader:function() {
		var oRow = this._oHeaderTable.insertRow(0);
		oRow.className = 'tjs_grid_hd_row';
		var jsize = this.aColumns.length;
		var oColumn, columnSortable, oClearFloat;
		for (var j = 0; j < jsize; j++) {
			oColumn = this.aColumns[j];

			oColumn.oSpliter = document.createElement('div');
			oColumn.oSpliter.className = 'tjs_grid_spliter float_right';
			oColumn.oSpliter.title = 'Resize column';

			oColumn.oIconBar = document.createElement('div');
			oColumn.oIconBar.className = 'tjs_grid_iconbar tjs_grid_iconbar_normal';
			oColumn.oIconBar.appendChild(oColumn.oSpliter);
			if (this._sortType && oColumn.isSortable()) {
				if (this._sortType == 1) {
					if (oColumn.createSortHandlers()) {
						columnSortable = true;
					} else {
						oColumn.setSortable(false);
						columnSortable = false;
					}
				} else {
					columnSortable = true;
				}
				if (columnSortable) {
					oColumn.oSort = document.createElement('div');
					oColumn.oSort.className = 'tjs_grid_sort';
					oColumn.oIconBar.appendChild(oColumn.oSort);
					tjs.dom.addClass(oColumn.oIconBar,'tjs_grid_clickable');
					oColumn.oIconBar.title = 'sort column';
				}
			}
			oClearFloat = document.createElement('div');
			oClearFloat.className = 'clear_float';
			oColumn.oIconBar.appendChild(oClearFloat);

			oColumn.oCell = document.createElement('div');
			oColumn.oCell.className = 'tjs_grid_cell tjs_grid_cell_'+oColumn.getName();
			oColumn.oCell.appendChild(document.createTextNode(oColumn.getCaption()));
			oColumn.oCell.appendChild(oColumn.oIconBar);

			oColumn.oCol = oRow.insertCell(j);
			oColumn.oCol.className = 'tjs_grid_col tjs_grid_col_'+oColumn.getName();
			oColumn.oCol.appendChild(oColumn.oCell);
			oColumn.oCol.oColumn = oColumn;

			if (j != this._colAuto) {
				this._oDraggable4ColResize.addHandle(oColumn.oSpliter);
			}
		}
	},
	_clickHandler4Header:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		//tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		oTarget = tjs.dom.getAncestorByTagName(oTarget,'td',this._oHeaderTable);
		if (oTarget && oTarget.oColumn) {
			var oColumn = oTarget.oColumn;
			if (oColumn.isSortable()) {
				if (this._sortState.oColumn == oColumn) {
					if (this._sortType == 1) {
						this._updateSortUI(oColumn,this._sortState.sortType,-this._sortState.sortType);
						this._sortState.sortType = -this._sortState.sortType;
					} else {
						if (this._sortState.sortType > 0) {
							this._updateSortUI(oColumn,1,-1);
							this._sortState.sortType = -1;
						} else if (this._sortState.sortType < 0) {
							this._updateSortUI(oColumn,-1,0);
							this._sortState.oColumn = null;
							this._sortState.sortType = 0;
						}
					}
				} else {
					if (this._sortState.oColumn) {
						this._updateSortUI(this._sortState.oColumn,this._sortState.sortType,0);
					}
					this._updateSortUI(oColumn,0,1);
					this._sortState.oColumn = oColumn;
					this._sortState.sortType = 1;
				}
				if (this._sortType == 1) {
					this._sort(this._sortState);
				} else {
					this.fire(tjs.grid.COLUMN_CLICKED,this._sortState);
				}
			}
		}
	},
	_sort:function(o) {
		if (!this.isEmpty()) {
			var datas = [];
			for (var i = 0, isize = this._oNodes.length; i < isize; i++) {
				datas[i] = this._oNodes[i].data;
			}
			datas.sort(o.oColumn.getSortHandler(o.sortType));
			this.setDatas(datas);
		}
	},
	_updateSortUI:function(oColumn,stOld,stNew) {
		if (stOld > 0) {
			if (stNew == 0) {
				tjs.dom.replaceClass(oColumn.oIconBar,'tjs_grid_iconbar_asc','tjs_grid_iconbar_normal');
			} else if (stNew < 0) {
				tjs.dom.replaceClass(oColumn.oIconBar,'tjs_grid_iconbar_asc','tjs_grid_iconbar_desc');
			}
		} else if (stOld < 0) {
			if (stNew == 0) {
				tjs.dom.replaceClass(oColumn.oIconBar,'tjs_grid_iconbar_desc','tjs_grid_iconbar_normal');
			} else if (stNew > 0) {
				tjs.dom.replaceClass(oColumn.oIconBar,'tjs_grid_iconbar_desc','tjs_grid_iconbar_asc');
			}
		} else {
			if (stNew > 0) {
				tjs.dom.replaceClass(oColumn.oIconBar,'tjs_grid_iconbar_normal','tjs_grid_iconbar_asc');
			} else if (stNew < 0) {
				tjs.dom.replaceClass(oColumn.oIconBar,'tjs_grid_iconbar_normal','tjs_grid_iconbar_desc');
			}
		}
	},
	_createNodeContent:function(oNode,refNode) {
		oNode.oRow = this._oBodyTable.insertRow(oNode.idx);
		oNode.oRow.oNode = oNode;
		oNode.oRow.className = 'tjs_grid_clickable tjs_grid_row tjs_grid_row_normal';
		if (oNode.disabled) {
			tjs.dom.addClass(oNode.oRow,'tjs_grid_row_disabled');
			oNode.oRow.style.cursor = '';
		} else {
			oNode.oRow.style.cursor = 'pointer';
		}
		oNode.oColNodes = [];
		for (var j = 0, jsize = this.aColumns.length; j < jsize; j++) {
			oColumn = this.aColumns[j];
			oColNode = {};
			oColNode.oCell = document.createElement('div');
			oColNode.oCell.className = 'pos_rel overflow_hidden tjs_grid_cell tjs_grid_cell_'+oColumn.getName();
			oColNode.oCol = oNode.oRow.insertCell(j);
			oColNode.oCol.className = 'tjs_grid_col tjs_grid_col_'+oColumn.getName();
			oColNode.oCol.appendChild(oColNode.oCell);
			oColumn.createContent(oColNode,oNode.data);
			oColumn.updateContent(oColNode,oNode.data);
			oNode.oColNodes[j] = oColNode;
		}
	},
	_updateNodeContent:function(oNode,doReset) {
		if (doReset) {
			oNode.oRow.className = 'tjs_grid_clickable tjs_grid_row tjs_grid_row_normal';
			if (oNode.disabled) {
				tjs.dom.addClass(oNode.oRow,'tjs_grid_row_disabled');
				oNode.oRow.style.cursor = '';
			} else {
				oNode.oRow.style.cursor = 'pointer';
			}
		}
		var j = this.aColumns.length;
		while (j--) {
			this.aColumns[j].updateContent(oNode.oColNodes[j],oNode.data);
		}
	},
	_destroyNodeContent:function(oNode) {
		var j = this.aColumns.length;
		while (j--) {
			oColNode = oNode.oColNodes[j];
			oNode.oColNodes[j] = null;
			this.aColumns[j].destroyContent(oColNode,oNode.data);
			oColNode.oCol.removeChild(oColNode.oCell);
			oNode.oRow.deleteCell(j);
			tjs.lang.destroyObject(oColNode);
		}
		oNode.oColNodes.length = 0;
		if (tjs.bom.isIE6 || tjs.bom.isIE7) {
			oNode.oRow.oNode = null;
		} else {
			delete oNode.oRow.oNode;
		}
		this._oBodyTable.deleteRow(oNode.idx);
		tjs.lang.destroyObject(oNode);
	},
	_detachNodeContent:function(oNode) {
		var j = this.aColumns.length,oColNode;
		while (j--) {
			oColNode = oNode.oColNodes[j];
			oColNode.oCol.removeChild(oColNode.oCell);
			delete oColNode.oCol;
			oNode.oRow.deleteCell(j);
		}
		if (tjs.bom.isIE6 || tjs.bom.isIE7) {
			oNode.oRow.oNode = null;
		} else {
			delete oNode.oRow.oNode;
		}
		delete oNode.oRow;
		this._oBodyTable.deleteRow(oNode.idx);//
	},
	_attachNodeContent:function(oNode,refNode) {
		oNode.oRow = this._oBodyTable.insertRow(oNode.idx);//
		oNode.oRow.oNode = oNode;
		oNode.oRow.className = 'tjs_grid_clickable tjs_grid_row tjs_grid_row_' + (oNode.selected ? 'selected' : 'normal');
		if (oNode.disabled) {
			tjs.dom.addClass(oNode.oRow,'tjs_grid_row_disabled');
		} else {
			oNode.oRow.style.cursor = 'pointer';
		}
		oNode.oRow.style.display = oNode.hidden ? 'none' : '';
		var oColNode;
		for (var j = 0, jsize = this.aColumns.length; j < jsize; j++) {
			oColumn = this.aColumns[j];
			oColNode = oNode.oColNodes[j];
			oColNode.oCol = oNode.oRow.insertCell(j);
			oColNode.oCol.className = 'tjs_grid_col tjs_grid_col_'+oColumn.getName();
			oColNode.oCol.appendChild(oColNode.oCell);
		}
	},
	_scrollHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		do {
			if (oTarget == this._oBodyViewport) {
				break;
			}
			oTarget = oTarget.parentNode;
		} while (oTarget && oTarget != this.oElement);
		if (oTarget == this._oBodyViewport) {
			this._oHeaderTable.style.left = (0 - this._oBodyViewport.scrollLeft)+'px';
		}
	},
	_fColResizeDragStartHandler:function(dndData) {
		var dragData = this.oMap.get('dragData');
		if (!dragData) {
			dragData = {};
			this.oMap.put('dragData',dragData);
		}
		var pos = tjs.css.toLocalPosition(this.oElement,dndData.startX,dndData.startY);
		dragData.x0 = pos.x;
		pos.destroy();
		this._oResizer.style.left = dragData.x0 + 'px';
		this._oResizer.style.display = '';
		var oSpliter = this._oDraggable4ColResize.getCurrHandle();
		var oColumn = tjs.dom.getAncestorByTagName(oSpliter,'td',this._oHeaderTable).oColumn;
		dragData.idx = oColumn.idx;
		var w = parseInt(oColumn.oCellStyle.width);
		dragData.minX = dragData.x0 - w + 40;
		dragData.maxX = dragData.x0 - w + 800;
	},
	_fColResizeDragHandler:function(dndData) {
		var dragData = this.oMap.get('dragData');
		var x = tjs.lang.boundedValue(dragData.x0 + dndData.x - dndData.startX, dragData.minX, dragData.maxX);
		this._oResizer.style.left = x + 'px';
	},
	_fColResizeDragEndHandler:function(dndData) {
		this._oResizer.style.display = 'none';
		var dragData = this.oMap.get('dragData');
		var x = tjs.lang.boundedValue(dragData.x0 + dndData.x - dndData.startX, dragData.minX, dragData.maxX);
		var wDelta = x - dragData.x0;
		var idx = dragData.idx;
		tjs.lang.destroyObject(dragData);
		var oS = this.aColumns[idx].oCellStyle;
		var w = parseInt(oS.width) + wDelta;
		oS.width = w+'px';
		//this.aColumns[idx].setWidth(w);
		if (this._colAuto > -1) {
			oS = this.aColumns[this._colAuto].oCellStyle;
			w = parseInt(oS.width) - wDelta;
			oS.width = w+'px';
			//this.aColumns[this._colAuto].setWidth(w);
			this._layoutCol(this._colAuto);
		}
		this._layoutCol(idx);
		this._oHeaderTable.style.left = (0 - this._oBodyViewport.scrollLeft)+'px';
	},
	_mouseoverHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		oTarget = tjs.dom.getAncestorByTagName(oTarget,'tr',this._oBodyTable);
		if (oTarget && oTarget.oNode) {
			var oRelatedTarget = oEvent.relatedTarget || oEvent.fromElement;
			if (oRelatedTarget && tjs.dom.isAncestorOf(oTarget,oRelatedTarget)) {
				return;
			}
			var oNode = oTarget.oNode;
			if (!oNode.disabled) {
				if (oNode.selected) {
					tjs.dom.replaceClass(oTarget,'tjs_grid_row_selected','tjs_grid_row_selected_hover');
				} else {
					tjs.dom.replaceClass(oTarget,'tjs_grid_row_normal','tjs_grid_row_normal_hover');
				}
			}
		}
	},
	_mouseoutHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		oTarget = tjs.dom.getAncestorByTagName(oTarget,'tr',this._oBodyTable);
		if (oTarget && oTarget.oNode) {
			var oRelatedTarget = oEvent.relatedTarget || oEvent.toElement;
			if (oRelatedTarget && tjs.dom.isAncestorOf(oTarget,oRelatedTarget)) {
				return;
			}
			var oNode = oTarget.oNode;
			if (!oNode.disabled) {
				if (oNode.selected) {
					tjs.dom.replaceClass(oTarget,'tjs_grid_row_selected_hover','tjs_grid_row_selected');
				} else {
					tjs.dom.replaceClass(oTarget,'tjs_grid_row_normal_hover','tjs_grid_row_normal');
				}
			}
		}
	},
	_clickHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		//tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		oTarget = tjs.dom.getAncestorByTagName(oTarget,'tr',this._oBodyTable);
		if (oTarget && oTarget.oNode) {
			var oNode = oTarget.oNode;
			if (!oNode.disabled) {
				this.currClickedNode = oNode;
				this.fire(tjs.data.DATA_CLICKED,oNode);
				this._onClicked(oNode);
			}
		}
	},
	_onClicked:function(oNode){
	},
	_updateSelection:function(oNode){
		if (oNode.selected) {
			if (tjs.dom.hasClass(oNode.oRow,'tjs_grid_row_normal_hover')) {
				tjs.dom.replaceClass(oNode.oRow,'tjs_grid_row_normal_hover','tjs_grid_row_selected_hover');
			} else {
				tjs.dom.replaceClass(oNode.oRow,'tjs_grid_row_normal','tjs_grid_row_selected');
			}
		} else {
			if (tjs.dom.hasClass(oNode.oRow,'tjs_grid_row_selected_hover')) {
				tjs.dom.replaceClass(oNode.oRow,'tjs_grid_row_selected_hover','tjs_grid_row_normal_hover');
			} else {
				tjs.dom.replaceClass(oNode.oRow,'tjs_grid_row_selected','tjs_grid_row_normal');
			}
		}
	},
	_updateWidgetDisabled:function(){
		if (this._widgetDisabled) {
			tjs.event.removeListener(this._oBodyTable,'mouseover',this._mouseoverHandler_);
			tjs.event.removeListener(this._oBodyTable,'mouseout',this._mouseoutHandler_);
			tjs.event.removeListener(this._oBodyTable,'click',this._clickHandler_);
		} else {
			tjs.event.addListener(this._oBodyTable,'mouseover',this._mouseoverHandler_);
			tjs.event.addListener(this._oBodyTable,'mouseout',this._mouseoutHandler_);
			tjs.event.addListener(this._oBodyTable,'click',this._clickHandler_);
		}
	},
	_updateDisabled:function(oNode){
		if (oNode.disabled) {
			oNode.oRow.style.cursor = '';
			tjs.dom.addClass(oNode.oRow,'tjs_grid_row_disabled');
		} else {
			oNode.oRow.style.cursor = 'pointer';
			tjs.dom.removeClass(oNode.oRow,'tjs_grid_row_disabled');
		}
	},
	_updateHidden:function(oNode){
		oNode.oRow.style.display = oNode.hidden ? 'none' : '';
	},
	_updateAlterable:function(oNode){
		if (oNode.isEven) {
			tjs.dom.replaceClass(oNode.oRow,'tjs_grid_row_odd','tjs_grid_row_even');
		} else {
			tjs.dom.replaceClass(oNode.oRow,'tjs_grid_row_even','tjs_grid_row_odd');
		}
	},
	_checkUI:function(iBeg,iEnd) {
		if (this._layouted) {
			this._layoutRows(iBeg,iEnd - iBeg);
		}
	},
	layout:function() {
		var tjs_css = tjs.css;
		var w = tjs_css.getContentBoxWidth(this.oElement);
		var h = tjs_css.getContentBoxHeight(this.oElement);
		if (this._hasHeader) {
			tjs_css.setOffsetWidth(this._oHeaderViewport,w);
			h -= this._oHeaderViewport.offsetHeight;
		}
		tjs_css.setOffsetDimension(this._oBodyViewport,w,h);
		if (this._hasHeader && this._colAuto > -1) {
			w -= tjs.bom.getVScrollBarWidth();
			var j = this.aColumns.length;
			while (j--) {
				w -= this.aColumns[j].oCol.offsetWidth;
			}
			var oS = this.aColumns[this._colAuto].oCellStyle;
			w = parseInt(oS.width) + w;
			oS.width = w+'px';
			//this.aColumns[this._colAuto].setWidth(w);
		}
		if (!this._layouted) {
			this._layouted = true;
		}
		this._layoutRows(0,this.getDataSize());
		tjs.html.forceRedraw();
	},
	_layoutRows:function(row,count){
		if (count > 0) {
			var jsize = this.aColumns.length, j;
			var tjs_html = tjs.html, oNode;
			for (var i = row, isize = row+count; i < isize; i++) {
				oNode = this._oNodes[i];
				for (j = 0; j < jsize; j++) {
					tjs_html.evalLayouts(oNode.oColNodes[j].oCell);
				}
			}
		}
	},
	_layoutCol:function(idx){
		var tjs_html = tjs.html;
		for (var i = 0, isize = this._oNodes.length; i < isize; i++) {
			tjs_html.evalLayouts(this._oNodes[i].oColNodes[idx].oCell);
		}
	}
});

tjs.lang.defineClass('tjs.grid.SListGrid',tjs.grid.ListGrid,
function(o) {
	tjs.grid.ListGrid.call(this,o);
},tjs.data.SList,{
	_checkAll:function() {
		tjs.grid.ListGrid.prototype._checkAll.call(this);
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

tjs.lang.defineClass('tjs.grid.MListGrid',tjs.grid.ListGrid,
function(o) {
	tjs.grid.ListGrid.call(this,o);
},tjs.data.MList,{
	_onClicked:function(oNode){
		this.setNodeSelection(oNode,!oNode.selected,true);
	}
});
