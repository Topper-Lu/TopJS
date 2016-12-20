tjs.lang.defineClass('tjs.widget.List.ListDnDTarget',tjs.dnd.ListDnDTarget,
function(obj) {
	tjs.dnd.ListDnDTarget.call(this,obj);
},{
	_construct:function(){
		var oView = this._getView();
//tjs_debug_start
		tjs.lang.assert(oView instanceof tjs.widget.List,'!(oView instanceof tjs.widget.List) @'+this.classname);
//tjs_debug_end
		var oCS = tjs.css.getComputedStyle(oView.oElement);
		if (oCS.position == 'static') {
			oView.oElement.style.position = 'relative';
		}
		this.oMap.put('dataType',tjs.html.TYPE_DATA);//
		//this.oMap.put('dataGroup',this._getView().viewClass);//
		this.oMap.put('vertical',oView._hv == 'v');
		tjs.dnd.ListDnDTarget.prototype._construct.call(this);
		var tjs_data = tjs.data, tjs_widget = tjs.widget;
		oView.addHandler(tjs_data.BEFORE_RESTRUCTURE,this._onBeforeRestructure.bind(this));
		oView.addHandler(tjs_data.AFTER_RESTRUCTURE,this._onAfterRestructure.bind(this));
		oView.addHandler(tjs_data.AFTER_INSERT,this._onAfterInsert.bind(this));
		oView.addHandler(tjs_data.BEFORE_DELETE,this._onBeforeDelete.bind(this));
		oView.addHandler(tjs_widget.HV_CHANGED,this._onHVChanged.bind(this));
		oView.addHandler([
			tjs_data.AFTER_DELETE,
			tjs_data.AFTER_REPLACE,
			tjs_data.AFTER_MOVE,
			tjs_widget.HIDE_ITEM,
			tjs_widget.SHOW_ITEM
		],this._dirtyHandler.bind(this));
	},
	_dirtyHandler:function(source,type){
		this.dirty = true;
	},
	_onBeforeRestructure:function(source,type){
		this._removeHandles(0,this._getView().getDataSize());
	},
	_onAfterRestructure:function(source,type){
		this._addHandles(0,this._getView().getDataSize());
		this.dirty = true;
	},
	_onAfterInsert:function(source,type,o){
		this._addHandles(o.idx,o.count);
		this.dirty = true;
	},
	_onBeforeDelete:function(source,type,o){
		this._removeHandles(o.idx,o.count);
	},
	_onHVChanged:function(source,type,o){
		var hvOld = o.hvOld;
		var hvNew = o.hvNew;
		this.oMap.put('vertical',hvNew == 'v');
		var oDropIndicator = this.getDropIndicator();
		if (oDropIndicator) {
			tjs.dom.replaceClass(oDropIndicator,'tjs_drop_indicator_'+hvOld,'tjs_drop_indicator_'+hvNew);
			this.dirty = true;
		}
	},
	_getView:function(){
		return this.oMap.get('oView');
	},
	_removeHandles:function(idx,count){
		var oView = this._getView();
		for (var i = idx, isize = idx + count; i < isize; i++) {
			oView._oListDnDable.removeHandle(oView.getNode(i).oCell);
		}
	},
	_addHandles:function(idx,count){
		var oView = this._getView();
		for (var i = idx, isize = idx + count; i < isize; i++) {
			oView._oListDnDable.addHandle(oView.getNode(i).oCell);
		}
	},
	isVertical:function(){
		return this.oMap.get('vertical');
	},
	getHandleViewport:function(){
		return this._getView().oElement;
	},
	showDropIndicator:function(oLocation,offset){
		var oHandleViewport = this.getHandleViewport();
		var oNode = oLocation.oNode;
		var oDropIndicator = this.getDropIndicator();
		var oStyle = oDropIndicator.style;
		oStyle.display = '';
		if (this.isVertical()) {
			if (offset < Math.ceil(oNode.oCell.offsetHeight/2)) {
				oStyle.top = oLocation.s+'px';
			} else {
				oStyle.top = (oLocation.sh - oDropIndicator.offsetHeight)+'px';
			}
			oStyle.left = tjs.css.getPaddingWidth(oHandleViewport,'l')+'px';
			oStyle.width = oNode.oCell.offsetWidth+'px';
		} else {
			if (offset < Math.ceil(oNode.oCell.offsetWidth/2)) {
				oStyle.left = oLocation.s+'px';
			} else {
				oStyle.left = (oLocation.sh - oDropIndicator.offsetWidth)+'px';
			}
			oStyle.top = tjs.css.getPaddingWidth(oHandleViewport,'t')+'px';
			oStyle.height = oNode.oCell.offsetHeight+'px';
		}
	},
	selectHandle:function(oHandle){
		var listType = this._getView()._listType;
		tjs.dom.addClass(oHandle,listType+'_cell_dragging');
		return oHandle.oNode;//
	},
	unselectHandle:function(oHandle){
		var listType = this._getView()._listType;
		tjs.dom.removeClass(oHandle,listType+'_cell_dragging');
	},
	getData:function(oNode){
		oNode.data;
	},
	addData:function(oNode,offset,data){
		if (offset < Math.ceil((this.isVertical() ? oNode.oCell.offsetHeight : oNode.oCell.offsetWidth)/2)) {
			this._getView().insertData(data,oNode.idx);
		} else {
			this._getView().insertData(data,oNode.idx + 1);
		}
	},
	removeData:function(oNode){
		this._getView().deleteData(oNode.idx);
	},
	moveData:function(oNode1,oNode2,offset){
		if (oNode1 == oNode2) {
			return;
		}
		var idx1 = oNode1.idx;
		var idx2 = offset < Math.ceil((this.isVertical() ? oNode2.oCell.offsetHeight : oNode2.oCell.offsetWidth)/2) ? oNode2.idx : (oNode2.idx + 1);
		this._getView().moveData(idx1,idx2);
	},
	createLocations:function(){
		var oHandleViewport = this.getHandleViewport();
		var oNodes = this._getView().getNodes();
		var h,sh,oNode;
		var s = tjs.css.getPaddingWidth(oHandleViewport,this.isVertical() ? 't' : 'l');
		for (var i = 0,isize = oNodes.length; i < isize; i++) {
			oNode =  oNodes[i];
			if (!oNode.hidden) {
				h = this.isVertical() ? oNode.oCell.offsetHeight : oNode.oCell.offsetWidth;
				sh = s + h;
				this.oLocations[i] = {s:s,sh:sh,oNode:oNode};
				s = sh;
			}
		}
	}
});
