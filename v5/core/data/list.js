tjs.lang.defineTopClass('tjs.data.List',
function() {
},{
	_cacheLoadedHandler:function(source,type){
		delete this.oCache;
		this.setDatas(source.cloneDatas());
	},
	_checkDatas:function() {
		if (!this._oNodes) {
			this._oNodes = [];
		}
		var datas = this.oMap.remove('datas');
		var cache = this.oMap.remove('cache');
		if (tjs.lang.isArray(datas)) {
			this.setDatas(datas);
		} else if (tjs.lang.isObject(cache) && cache.url && tjs.lang.isString(cache.url) && tjs.lang.isFunction(cache.fClass)) {
			var oCache = tjs.data.ListCache.get(cache.url,cache.fClass);
			if (oCache.isLoading()) {
				this.oCache = oCache;
				oCache.addHandler(tjs.data.CACHE_LOADED,this._cacheLoadedHandler.bind(this));
			} else {
				this.setDatas(oCache.cloneDatas());
			}
		} else {
			this.setDatas(null);
		}
	},
	isEmpty:function() {
		return !this._oNodes || this._oNodes.length == 0;
	},
	getDataSize:function() {
		return this._oNodes ? this._oNodes.length : 0;
	},
	getNodes:function() {
		return this._oNodes;
	},
	getNode:function(idx) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.getNode');
//tjs_debug_end
		return (idx > -1 && idx < this.getDataSize()) ? this._oNodes[idx] : null;
	},
	getData:function(idx) {
		var oNode = this.getNode(idx);
		return oNode ? oNode.data : null;
	},
	getNodeByKey:function(key) {
		var o = null;
		if (key != null && !this.isEmpty()) {
			var i = this._oNodes.length, oNode;
			while (i--) {
				oNode = this._oNodes[i];
				if (oNode.data && oNode.data.getKey && oNode.data.getKey() == key) {
					o = oNode;
					break;
				}
			}
		}
		return o;
	},
	getIndexByKey:function(key) {
		var o = this.getNodeByKey(key);
		return o ? o.idx : -1;
	},
	getDataByKey:function(key) {
		var o = this.getNodeByKey(key);
		return o ? o.data : null;
	},
	search:function(fHandler,value) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.search');
//tjs_debug_end
		var idx = -1;
		if (value != null && !this.isEmpty()) {
			var i = this._oNodes.length;
			while (i--) {
				if (fHandler(this._oNodes[i].data,value)) {
					idx = i;
					break;
				}
			}
		}
		return idx;
	},
	setDatas:function(datas) {
		//this._hideUI();
		this._beforeRestructure();
		var oNodes = this._oNodes;
		var rowsNew = datas ? datas.length : 0;
		var rowsOld = oNodes.length;
		var rows, i, oNode;
		if (rowsOld > rowsNew) {
			rows = rowsNew;
			for (i = rowsOld - 1; i >= rowsNew; i--) {
				oNode = oNodes[i];
				oNodes[i] = null;
				this._destroyNodeContent(oNode);//
			}
			oNodes.length = rowsNew;
		} else if (rowsOld < rowsNew) {
			rows = rowsOld;
			for (i = rowsOld; i < rowsNew; i++) {
				oNode = {data:datas[i],idx:i,selected:false,hidden:false,isEven:null,disabled:this._widgetDisabled};
				oNodes[i] = oNode;
				this._createNodeContent(oNode,null);//
			}
		} else {
			rows = rowsNew;
		}
		if (rows > 0) {
			i = rows;
			while (i--) {
				oNode = oNodes[i];
				oNode.data = datas[i];
				oNode.selected = false;
				oNode.hidden = false;
				oNode.isEven = null;
				oNode.disabled = this._widgetDisabled;
				this._updateNodeContent(oNode,true);//
			}
		}
		this._checkAlterable(0);
		this._checkUI(0,oNodes.length);//
		this._afterRestructure();
		//this._showUI();
	},
	insertData:function(data,idx) {
		//this._hideUI();
		var oNodes = this._oNodes;
		var len = oNodes.length;
		if (!tjs.lang.isNumber(idx) || idx < 0 || idx >= len) {
			idx = len;
		}
		this._beforeInsert(idx,1);
		var i, j, oNode, refNode;
		if (idx < len) {
			for (i = len - 1, j = len; i >= idx; i--, j--) {
				oNode = oNodes[i];
				oNode.idx = j;
				oNodes[j] = oNode;
			}
			refNode = oNode;
		}
		oNode = {data:data,idx:idx,selected:false,hidden:false,isEven:null,disabled:this._widgetDisabled};
		oNodes[idx] = oNode;
		this._createNodeContent(oNode,refNode);//
		this._checkAlterable(idx);
		this._checkUI(idx,oNodes.length);//
		this._afterInsert(idx,1);
		//this._showUI();
	},
	insertDatas:function(datas,idx) {
		//this._hideUI();
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isArray(datas) && datas.length > 0,'!tjs.lang.isArray(datas) @'+this.classname+'.insertDatas');
//tjs_debug_end
		var oNodes = this._oNodes;
		var len = oNodes.length;
		if (!tjs.lang.isNumber(idx) || idx < 0 || idx >= len) {
			idx = len;
		}
		var count = datas.length;
		this._beforeInsert(idx,count);
		var i,j,oNode,refNode;
		if (idx < len) {
			for (i = len - 1, j = len - 1 + count; i >= idx; i--, j--) {
				oNode = oNodes[i];
				oNode.idx = j;
				oNodes[j] = oNode;
			}
			refNode = oNode;
		}
		for (i = 0, j = idx; i < count; i++, j++) {
			oNode = {data:datas[i],idx:j,selected:false,hidden:false,isEven:null,disabled:this._widgetDisabled};
			oNodes[j] = oNode;
			this._createNodeContent(oNode,refNode);//
		}
		this._checkAlterable(idx);
		this._checkUI(idx,oNodes.length);//
		this._afterInsert(idx,count);
	},
	updateData:function(data,idx) {
		//this._hideUI();
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.updateData');
		tjs.lang.assert(idx >= 0 && idx < this.getDataSize(),'idx is out of bounds @'+this.classname+'.updateData');
//tjs_debug_end
		this._beforeUpdate(idx,1);
		var oNode = this._oNodes[idx];
		oNode.data = data;
		this._updateNodeContent(oNode);//
		this._checkUI(idx,idx);//
		this._afterUpdate(idx,1);
		//this._showUI();
	},
	updateDatas:function(datas,idx) {
		//this._hideUI();
		var oNodes = this._oNodes;
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.updateDatas');
		tjs.lang.assert(tjs.lang.isArray(datas) && datas.length > 0,'!tjs.lang.isArray(datas) @'+this.classname+'.updateDatas');
		tjs.lang.assert(idx >= 0 && (idx+datas.length) <= oNodes.length,'idx is out of bounds @'+this.classname+'.updateDatas');
//tjs_debug_end
		var count = datas.length;
		this._beforeUpdate(idx,count);
		var i,j,oNode;
		for (i = 0, j = idx; i < count; i++, j++) {
			oNode = oNodes[j];
			oNode.data = datas[i];
			this._updateNodeContent(oNode);//
		}
		this._checkUI(idx,idx);//
		this._afterUpdate(idx,count);
		//this._showUI();
	},
	deleteData:function(idx) {
		//this._hideUI();
		var oNodes = this._oNodes;
		var len = oNodes.length;
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.deleteData');
		tjs.lang.assert(idx >= 0 && idx < len,'idx is out of bounds @'+this.classname+'.deleteData');
//tjs_debug_end
		this._beforeDelete(idx,1);
		var oNode = oNodes[idx];
		this._destroyNodeContent(oNode);//
		oNode.destroyed = true;
		var isize = idx + 1,i,j;
		for (j = idx, i = isize; i < len; i++, j++) {
			oNode = oNodes[i];
			oNode.idx = j;
			oNodes[j] = oNode;
		}
		oNodes[j] = null;
		oNodes.length = len - 1;
		this._checkAlterable(idx);//
		this._checkUI(idx,oNodes.length);//
		this._afterDelete(idx,1);
		//this._showUI();
	},
	deleteDatas:function(idx,count) {
		//this._hideUI();
		var oNodes = this._oNodes;
		var len = oNodes.length;
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.deleteDatas');
		tjs.lang.assert(idx >= 0 && count > 0 && (idx+count) <= len,'idx is out of bounds @'+this.classname+'deleteDatas');
//tjs_debug_end
		this._beforeDelete(idx,count);
		var isize = idx + count,i,j,oNode;
		for (i = isize - 1; i >= idx; i--) {
			oNode = oNodes[i];
			this._destroyNodeContent(oNode);//
			oNode.destroyed = true;
		}
		for (j = idx, i = isize; i < len; i++, j++) {
			oNode = oNodes[i];
			oNode.idx = j;
			oNodes[j] = oNode;
		}
		for (; j < len; j++) {
			oNodes[j] = null;
		}
		oNodes.length = len - count;
		this._checkAlterable(idx);//
		this._checkUI(idx,oNodes.length);//
		this._afterDelete(idx,count);
		//this._showUI();
	},
	moveData:function(idx1,idx2) {
		//this._hideUI();
		var oNodes = this._oNodes;
		var len = oNodes.length;
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx1),'!tjs.lang.isNumber(idx1) @'+this.classname+'.moveData');
		tjs.lang.assert(tjs.lang.isNumber(idx2),'!tjs.lang.isNumber(idx2) @'+this.classname+'.moveData');
		tjs.lang.assert(idx1 >= 0 && idx1 < len,'idx1 is out of bounds @'+this.classname+'.moveData');
		tjs.lang.assert(idx2 >= 0 && idx2 <= len,'idx2 is out of bounds @'+this.classname+'.moveData');
//tjs_debug_end
		this._beforeMove(idx1,idx2,1);
		var i, j, o, oNode;
		var iBeg,iEnd;
		if ((idx2 - 1) > idx1) {
			idx2--;
			o = oNodes[idx1];
			this._detachNodeContent(o);//
			for (i = idx1, j = idx1 + 1; j <= idx2; i++, j++) {
				oNode = oNodes[j];
				oNodes[i] = oNode;
				oNode.idx = i;
			}
			oNode = j < len ? oNodes[j] : null;
			oNodes[idx2] = o;
			o.idx = idx2;
			this._attachNodeContent(o,oNode);//
			iBeg = idx1;
			iEnd = idx2 + 1;
		} else if (idx2 < idx1) {
			o = oNodes[idx1];
			this._detachNodeContent(o);//
			for (i = idx1, j = idx1 - 1; j >= idx2; i--, j--) {
				oNode = oNodes[j];
				oNodes[i] = oNode;
				oNode.idx = i;
			}
			oNodes[idx2] = o;
			o.idx = idx2;
			this._attachNodeContent(o,oNode);//
			iBeg = idx2;
			iEnd = idx1 + 1;
		} else {
			return;
		}
		this._checkAlterable(iBeg);//
		this._checkUI(iBeg,iEnd);//
		this._afterMove(idx1,idx2,1);
		//this._showUI();
	},
	moveDatas:function(idx1,idx2,count) {
		//this._hideUI();
		var oNodes = this._oNodes;
		var len = oNodes.length;
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx1),'!tjs.lang.isNumber(idx1) @'+this.classname+'.moveDatas');
		tjs.lang.assert(tjs.lang.isNumber(idx2),'!tjs.lang.isNumber(idx2) @'+this.classname+'.moveDatas');
		tjs.lang.assert(idx1 >= 0 && count > 0 && (idx1+count) <= len,'idx1 is out of bounds @'+this.classname+'.moveDatas');
		tjs.lang.assert(idx2 >= 0 && idx2 <= len,'idx2 is out of bounds @'+this.classname+'.moveDatas');
//tjs_debug_end
		this._beforeMove(idx1,idx2,count);
		var a = [], i, j, jsize, oNode, refNode;
		var iBeg,iEnd;
		if ((idx2 - count) > idx1) {
			idx2 -= count;
			for (i = 0, j = idx1; i < count; i++, j++) {
				oNode = oNodes[j];
				a[i] = oNode;
				this._detachNodeContent(oNode);//
			}
			for (i = idx1, jsize = idx2 + count; j < jsize; i++, j++) {
				oNode = oNodes[j];
				oNodes[i] = oNode;
				oNode.idx = i;
			}
			refNode = j < len ? oNodes[j] : null;
			for (j =0; j < count; i++, j++) {
				oNode = a[j];
				oNodes[i] = oNode;
				oNode.idx = i;
				this._attachNodeContent(oNode,refNode);//
			}
			iBeg = idx1;
			iEnd = idx2 + 1;
		} else if (idx2 < idx1) {
			for (i = count - 1, j = idx1 + count - 1; i >= 0; i--, j--) {
				oNode = oNodes[j];
				a[i] = oNode;
				this._detachNodeContent(oNode);//
			}
			for (i = idx1 + count - 1; j >= idx2; i--, j--) {
				oNode = oNodes[j];
				oNodes[i] = oNode;
				oNode.idx = i;
			}
			refNode = oNode;
			for (j = count - 1; j >= 0; i--, j--) {
				oNode = a[j];
				oNodes[i] = oNode;
				oNode.idx = i;
				this._attachNodeContent(oNode,refNode);//
				refNode = oNode;
			}
			iBeg = idx2;
			iEnd = idx1 + 1;
		} else {
			return;
		}
		this._checkAlterable(iBeg);
		this._checkUI(iBeg,iEnd);//
		this._afterMove(idx1,idx2,count);
		//this._showUI();
	},
	_beforeRestructure:function(){
		this.fire(tjs.data.BEFORE_RESTRUCTURE);
	},
	_afterRestructure:function(){
		this.fire(tjs.data.AFTER_RESTRUCTURE);
	},
	_beforeInsert:function(idx,count) {
		this.fire(tjs.data.BEFORE_INSERT,{idx:idx,count:count});
	},
	_afterInsert:function(idx,count){
		this.fire(tjs.data.AFTER_INSERT,{idx:idx,count:count});
	},
	_beforeUpdate:function(idx,count) {
		this.fire(tjs.data.BEFORE_REPLACE,{idx:idx,count:count});
	},
	_afterUpdate:function(idx,count){
		this.fire(tjs.data.AFTER_REPLACE,{idx:idx,count:count});
	},
	_beforeDelete:function(idx,count){
		this.fire(tjs.data.BEFORE_DELETE,{idx:idx,count:count});
	},
	_afterDelete:function(idx,count){
		this.fire(tjs.data.AFTER_DELETE,{idx:idx,count:count});
	},
	_beforeMove:function(idx1,idx2,count){
		this.fire(tjs.data.BEFORE_MOVE,{idx1:idx1,idx2:idx2,count:count});
	},
	_afterMove:function(idx1,idx2,count){
		this.fire(tjs.data.AFTER_MOVE,{idx1:idx1,idx2:idx2,count:count});
	},
	isWidgetDisabled:function(){
		return this._widgetDisabled;
	},
	setWidgetDisabled:function(disabled,fireEvent){
		disabled = Boolean(disabled);
		if (this._widgetDisabled != disabled) {
			this._widgetDisabled = disabled;
			this._updateWidgetDisabled();//
			this.setAllDisabled(this._widgetDisabled);
			if (fireEvent) {
				this.fire(disabled ? tjs.widget.DISABLE_WIDGET : tjs.widget.ENABLE_WIDGET);
			}
		}
	},
	isDisabled:function(idx){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.isDisabled');
//tjs_debug_end
		var oNodes = this._oNodes;
		var oNode = idx > -1 && idx < oNodes.length ? oNodes[idx] : null;
		return oNode ? oNode.disabled : false;
	},
	_setNodeDisabled:function(oNode,disabled,fireEvent){
		if (oNode.disabled != disabled) {
			oNode.disabled = disabled;
			this._updateDisabled(oNode);
			if (fireEvent) {
				this.fire(disabled ? tjs.widget.DISABLE_ITEM : tjs.widget.ENABLE_ITEM,oNode);
			}
		}
	},
	setDisabled:function(idx,disabled,fireEvent){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.setDisabled');
//tjs_debug_end
		var oNodes = this._oNodes;
		var oNode = idx > -1 && idx < oNodes.length ? oNodes[idx] : null;
		if (oNode) {
			this._setNodeDisabled(oNode,Boolean(disabled),fireEvent);
		}
	},
	setAllDisabled:function(disabled,fireEvent){
		if (!this.isEmpty()) {
			var oNodes = this._oNodes;
			disabled = Boolean(disabled);
			var i = oNodes.length,oNode;
			while (i--) {
				oNode = oNodes[i];
				this._setNodeDisabled(oNode,disabled,fireEvent);
			}
		}
	},
	isHidden:function(idx){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.isHidden');
//tjs_debug_end
		var oNodes = this._oNodes;
		var oNode = idx > -1 && idx < oNodes.length ? oNodes[idx] : null;
		return oNode ? oNode.hidden : false;
	},
	_setNodeHidden:function(oNode,hidden,fireEvent){
		if (oNode.hidden != hidden) {
			oNode.hidden = hidden;
			this._updateHidden(oNode);
			if (fireEvent) {
				this.fire(hidden ? tjs.widget.HIDE_ITEM : tjs.widget.SHOW_ITEM,oNode);
			}
			return true;
		}
		return false;
	},
	setHidden:function(idx,hidden,fireEvent){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.setHidden');
//tjs_debug_end
		var oNodes = this._oNodes;
		var oNode = idx > -1 && idx < oNodes.length ? oNodes[idx] : null;
		if (oNode) {
			if (this._setNodeHidden(oNode,Boolean(hidden),fireEvent)) {
				this._checkAlterable(idx);
				this._checkUI(idx,idx+1);
			}
		}
	},
	setAllHidden:function(hidden,fireEvent){
		if (!this.isEmpty()) {
			hidden = Boolean(hidden);
			var idx = -1,oNodes = this._oNodes;
			var i = oNodes.length,oNode;
			while (i--) {
				oNode = oNodes[i];
				if (this._setNodeHidden(oNode,hidden,fireEvent)) {
					idx = i;
				}
			}
			if (idx > -1) {
				this._checkAlterable(idx);
				this._checkUI(idx,oNodes.length);
			}
		}
	},
	_checkAlterable:function(idx){
		if (this._alternate) {
			var oNodes = this._oNodes,isEven = true,i,isize,oNode;
			if (idx > 0) {
				i = idx;
				while (i--) {
					oNode = oNodes[i];
					if (!oNode.hidden) {
						isEven = !oNode.isEven;
						break;
					}
				}
			}
			for (i = idx, isize = oNodes.length; i < isize; i++) {
				oNode = oNodes[i];
				if (!oNode.hidden) {
					if (oNode.isEven == null || oNode.isEven != isEven) {
						oNode.isEven = isEven;
						this._updateAlterable(oNode);
					}
					isEven = !isEven;
				}
			}
		}
	},
	_setNodeSelection:function(oNode,selected,fireEvent) {
		if (oNode.selected != selected) {
			oNode.selected = selected;
			this._updateSelection(oNode);
			if (fireEvent) {
				this.fire(selected ? tjs.data.DATA_SELECTED : tjs.data.DATA_UNSELECTED,oNode);
			}
			return true;
		}
		return false;
	},
	// to be overrided
	_createNodeContent:function(oNode,refNode){},
	_destroyNodeContent:function(oNode){},
	_updateNodeContent:function(oNode){},
	_attachNodeContent:function(oNode,refNode){},
	_detachNodeContent:function(oNode){},
	_updateWidgetDisabled:function(){},
	_updateDisabled:function(oNode){},
	_updateHidden:function(oNode){},
	_updateAlterable:function(oNode){},
	_updateSelection:function(oNode){},
	_checkUI:function(iBeg,iEnd){}
});

tjs.lang.defineTopClass('tjs.data.SList',
function() {
},{
	hasSelection:function() {
		return Boolean(this._selectedNode);
	},
	unselectAll:function(fireEvent) {
		this.setSelectedNode(null,fireEvent);
	},
	setSelectedNode:function(oNode,fireEvent) {
		if (this._selectedNode != oNode) {
			if (this._selectedNode) {
				this._setNodeSelection(this._selectedNode,false,fireEvent);
			}
			this._selectedNode = oNode;
			if (this._selectedNode) {
				this._setNodeSelection(this._selectedNode,true,fireEvent);
			}
			if (fireEvent) {
				this.fire(tjs.data.SELECTEDDATA_CHANGED,this._selectedNode);
				this.fire(tjs.data.VALUE_CHANGED);
			}
		}
	},
	setSelectedIndex:function(idx,fireEvent) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.setSelectedIndex');
		tjs.lang.assert(idx > -2 && idx < this.getDataSize(),'idx is out of bounds. @'+this.classname+'.setSelectedIndex');
//tjs_debug_end
		this.setSelectedNode(idx > -1 ? this.getNode(idx) : null,fireEvent);
	},
	setSelectedKey:function(key,fireEvent) {
		this.setSelectedNode(this.getNodeByKey(key),fireEvent);
	},
	getSelectedNode:function() {
		return this._selectedNode;
	},
	getSelectedData:function() {
		return this._selectedNode ? this._selectedNode.data : null;
	},
	getSelectedIndex:function() {
		return this._selectedNode ? this._selectedNode.idx : -1;
	},
	getSelectedKey:function() {
		return this._selectedNode ? this._selectedNode.data.getKey() : null;
	},
	getSelectedText:function() {
		return this._selectedNode ? this._selectedNode.data.toString() : '';
	},
	_afterRestructure:function(){
		var selectedNodeOld = this._selectedNode;
		this._selectedNode = null;
		if (this._alwaysSelected && !this.isEmpty()) {
			this._selectedNode = this._oNodes[0];
			this._setNodeSelection(this._selectedNode,true,true);
		}
		if (this._selectedNode != selectedNodeOld) {
			this.fire(tjs.data.SELECTEDDATA_CHANGED,this._selectedNode);
			this.fire(tjs.data.VALUE_CHANGED);
		}
		this.fire(tjs.data.AFTER_RESTRUCTURE);
	},
	_afterInsert:function(idx,count){
		if (this._selectOnInserted) {
			if (this._selectedNode) {
				this._setNodeSelection(this._selectedNode,false,true);
			}
			this._selectedNode = this.getNode(idx);
			this._setNodeSelection(this._selectedNode,true,true);
			this.fire(tjs.data.SELECTEDDATA_CHANGED,this._selectedNode);
			this.fire(tjs.data.VALUE_CHANGED);
		}
		this.fire(tjs.data.AFTER_INSERT,{idx:idx,count:count});
	},
	_afterUpdate:function(idx,count){
		if (this.getSelectedIndex() >= idx && this.getSelectedIndex() < (idx+count)) {
			this.fire(tjs.data.SELECTEDDATA_CHANGED,this._selectedNode);
			this.fire(tjs.data.VALUE_CHANGED);
		}
		this.fire(tjs.data.AFTER_REPLACE,{idx:idx,count:count});
	},
	_afterDelete:function(idx,count){
		if (this._selectedNode && this._selectedNode.destroyed) {
			this._selectedNode = null;
			if (this._alwaysSelected && !this.isEmpty()) {
				this._selectedNode = this._oNodes[0];
				this._setNodeSelection(this._selectedNode,true,true);
			}
			this.fire(tjs.data.SELECTEDDATA_CHANGED,this._selectedNode);
			this.fire(tjs.data.VALUE_CHANGED);
		}
		this.fire(tjs.data.AFTER_DELETE,{idx:idx,count:count});
	},
	setDisabledAftar:function(idx,disabled,fireEvent) {
		if (!this.isEmpty()) {
			if (!tjs.lang.isNumber(idx) || idx < 1) {
				idx = 1;
			}
			disabled = Boolean(disabled);
			var oNodes = this._oNodes;
			var isize = oNodes.length,i,oNode;
			for (i = idx; i < isize; i++) {
				oNode = oNodes[i];
				this._setNodeDisabled(oNode,disabled,fireEvent);
			}
			//
			if (disabled && this._alwaysSelected && this.getSelectedIndex() >= idx) {
				this.setSelectedIndex(idx - 1,true,fireEvent);
			}
		}
	}
});

tjs.lang.defineTopClass('tjs.data.MList',
function() {
},{
	hasSelection:function(){
		return this._oNodes.some(this.isNodeSelected,this);
	},
	unselectAll:function(fireEvent) {
		if (!this.isEmpty()) {
			var changed = false;
			var i = this._oNodes.length, oNode;
			while (i--) {
				oNode = this._oNodes[i];
				if (oNode.selected) {
					this._setNodeSelection(oNode,false,fireEvent);
					changed = true;
				}
			}
			if (changed && fireEvent) {
				this.fire(tjs.data.VALUE_CHANGED);
			}
		}
	},
	selectAll:function(fireEvent) {
		if (!this.isEmpty()) {
			var changed = false;
			var i = this._oNodes.length, oNode;
			while (i--) {
				oNode = this._oNodes[i];
				if (!oNode.selected) {
					this._setNodeSelection(oNode,true,fireEvent);
					changed = true;
				}
			}
			if (changed && fireEvent) {
				this.fire(tjs.data.VALUE_CHANGED);
			}
		}
	},
	setNodeSelection:function(oNode,selected,fireEvent) {
		if (oNode && this._setNodeSelection(oNode,selected,fireEvent) && fireEvent) {
			this.fire(tjs.data.VALUE_CHANGED);
		}
	},
	setIndexSelection:function(idx,selected,fireEvent) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.setIndexSelection');
//tjs_debug_end
		this.setNodeSelection(this.getNode(idx),selected,fireEvent);
	},
	setKeySelection:function(key,selected,fireEvent) {
		this.setNodeSelection(this.getNodeByKey(key),selected,fireEvent);
	},
	isNodeSelected:function(oNode) {
		return oNode && oNode.selected;
	},
	isIndexSelected:function(idx){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.isIndexSelected');
//tjs_debug_end
		return this.isNodeSelected(this.getNode(idx));
	},
	isKeySelected:function(key) {
		return this.isNodeSelected(this.getNodeByKey(key));
	},
	setSelectedKeys:function(a, fireEvent) {
		if (!this.isEmpty()) {
			if (tjs.lang.isArray(a) && a.length > 0) {
				var o = {};
				var i = a.length,key;
				while (i--) {
					key = a[i];
					o[String(key)] = key;
				}

				var changed = false,oNode,x,selected;
				i = this._oNodes.length;
				while (i--) {
					oNode = this._oNodes[i];
					key = oNode.data.getKey();
					x = String(key);
					selected = (x in o) && (o[x] == key);
					if (this._setNodeSelection(oNode,selected,fireEvent)) {
						changed = true;
					}
				}
				tjs.lang.destroyObject(o);
				if (changed && fireEvent) {this.fire(tjs.data.VALUE_CHANGED);}
			} else {
				this.unselectAll(fireEvent);
			}
		}
	},
	getSelectedNodes:function() {
		var a = this._oNodes.filter(this.isNodeSelected,this);
		if (a.length == 0) {
			a = null;
		}
		return a;
	},
	_selectData_:function(a,oNode,idx,array) {
		if (oNode.selected) {
			a[a.length] = oNode.data;
		}
		return a;
	},
	getSelectedDatas:function() {
		var a = this._oNodes.reduce(this._selectData_,[]);
		if (a.length == 0) {
			a = null;
		}
		return a;
	},
	_selectKey_:function(a,oNode,idx,array) {
		if (oNode.selected) {
			a[a.length] = oNode.data.getKey();
		}
		return a;
	},
	getSelectedKeys:function() {
		var a = this._oNodes.reduce(this._selectKey_,[]);
		if (a.length == 0) {
			a = null;
		}
		return a;
	},
	_selectText_:function(a,oNode,idx,array) {
		if (oNode.selected) {
			a[a.length] = oNode.data.toString();
		}
		return a;
	},
	getSelectedText:function() {
		var a = this._oNodes.reduce(this._selectText_,[]);
		if (a.length > 0) {
			var result = a.join(',');
			tjs.lang.destroyArray(a);
			return result;
		} else {
			return '';
		}
	}
});
