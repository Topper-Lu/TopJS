/* ColumnsEditor */
tjs.lang.defineTopClass('tjs.grid.ColumnsEditor',
function(oView) {
//tjs_debug_start
	tjs.lang.assert(oView instanceof tjs.grid.ListGrid,'!(oView instanceof tjs.grid.ListGrid) @'+this.classname);
//tjs_debug_end
	this.oView = oView;
	this._construct();
},{
	_construct:function() {
		this.oDialog = new tjs.widget.Dialog({
			caption:'Columns Configuration',
			content:{cls:'padding_2 overflow_auto'},
			textCmds:['confirm'],
			contW:250,
			contH:200
		});
		this.oDialog.addHandler('confirm',this._confirmHandler.bind(this));

		var aColumns = this.oView.aColumns;
		this.oCheckboxes = new tjs.widget.CheckboxList({
			oParent:this.oDialog.getContent(),
			hv:'v',
			alternate:true,
			dndOptions:tjs.dnd.REORDERABLE,
			datas:aColumns
		});
		this.oCheckboxes.oElement.setAttribute('autoFill','11');
		this.oCheckboxes.addHandler(tjs.data.BEFORE_MOVE,this._onBeforeMove.bind(this));
		this.oCheckboxes.addHandler(tjs.data.AFTER_MOVE,this._onAfterMove.bind(this));
		this.oCheckboxes.addHandler(tjs.data.DATA_SELECTED,this._onDataSelected.bind(this));
		this.oCheckboxes.addHandler(tjs.data.DATA_UNSELECTED,this._onDataUnselected.bind(this));
		for (var i = 0, isize = aColumns.length; i < isize; i++) {
			if (!aColumns[i].isHidden()) {
				this.oCheckboxes.setIndexSelection(i,true,true);
			}
		}
		if (this._hasHidden()) {
			this.oCheckboxes.oListDnDable.setEnabled(false);
		}
	},
	destroy:function(){
		this.oDialog.finalize();
	},
	show:function(){
		this.oDialog.show();
	},
	_hasHidden:function(){
		var aColumns = this.oView.aColumns;
		for (var i = 0, isize = aColumns.length; i < isize; i++) {
			if (aColumns[i].isHidden()) {
				return true;
			}
		}
		return false;
	},
	_confirmHandler:function(source,type) {
		this.oDialog.hide();
	},
	_onBeforeMove:function(source,type,o) {
		this.oView._beforeColumnMove(o.idx1,o.idx2);
	},
	_onAfterMove:function(source,type,o) {
		this.oView._afterColumnMove(o.idx1,o.idx2);
	},
	_onDataSelected:function(source,type,oNode) {
		this.oView.setColumnHidden(oNode.idx,false);
		if (!this._hasHidden()) {
			this.oCheckboxes.oListDnDable.setEnabled(true);
		}
	},
	_onDataUnselected:function(source,type,oNode) {
		this.oView.setColumnHidden(oNode.idx,true);
		this.oCheckboxes.oListDnDable.setEnabled(false);
	}
});

/* ListDnDTarget */
tjs.lang.defineClass('tjs.grid.ListDnDTarget',tjs.dnd.ListDnDTarget,
function(obj) {
	tjs.dnd.ListDnDTarget.call(this,obj);
},{
	_construct:function(){
		var oView = this._getView();
//tjs_debug_start
		tjs.lang.assert(oView instanceof tjs.grid.ListGrid,'!(oView instanceof tjs.grid.ListGrid) @'+this.classname);
//tjs_debug_end
		this.oMap.put('dataType',tjs.html.TYPE_DATA);
		//this.oMap.put('dataGroup',this._getView().viewClass);//
		tjs.dnd.ListDnDTarget.prototype._construct.call(this);
		var tjs_data = tjs.data, tjs_widget = tjs.widget;
		oView.addHandler(tjs_data.BEFORE_RESTRUCTURE,this._onBeforeRestructure.bind(this));
		oView.addHandler(tjs_data.AFTER_RESTRUCTURE,this._onAfterRestructure.bind(this));
		oView.addHandler(tjs_data.AFTER_INSERT,this._onAfterInsert.bind(this));
		oView.addHandler(tjs_data.BEFORE_DELETE,this._onBeforeDelete.bind(this));
		oView.addHandler(tjs_data.BEFORE_MOVE,this._onBeforeMove.bind(this));
		oView.addHandler(tjs_data.AFTER_MOVE,this._onAfterMove.bind(this));
		oView.addHandler([
			tjs_data.AFTER_DELETE,
			tjs_data.AFTER_REPLACE,
			tjs_widget.HIDE_ITEM,
			tjs_widget.SHOW_ITEM,
			tjs_widget.SHOW_COLUMN,
			tjs_widget.HIDE_COLUMN
		],this._dirtyHandler.bind(this));
	},
	_getView:function(){
		return this.oMap.get('oView');
	},
	_dirtyHandler:function(source,type){
		this.dirty = true;
	},
	_onBeforeRestructure:function(source,type){
		this._removeHandles(0,this._getView().getDataSize());
	},
	_onAfterRestructure:function(source,type){
		this._addHandles(0,this._getView().getDataSize());
	},
	_onAfterInsert:function(source,type,o){
		this._addHandles(o.idx,o.count);
		this.dirty = true;
	},
	_onBeforeDelete:function(source,type,o){
		this._removeHandles(o.idx,o.count);
	},
	_onBeforeMove:function(source,type,o){
		this._removeHandles(o.idx1,o.count);
	},
	_onAfterMove:function(source,type,o){
		this._addHandles(o.idx2,o.count);
		this.dirty = true;
	},
	_removeHandles:function(idx,count){
		var oView = this._getView();
		for (var i = idx, isize = idx + count; i < isize; i++) {
			oView._oListDnDable.removeHandle(oView.getNode(i).oRow);
		}
	},
	_addHandles:function(idx,count){
		var oView = this._getView();
		for (var i = idx, isize = idx + count; i < isize; i++) {
			oView._oListDnDable.addHandle(oView.getNode(i).oRow);
		}
	},
	getHandleViewport:function(){
		return this._getView()._oBodyViewport;
	},
	showDropIndicator:function(oLocation,offset){
		var oView = this._getView();
		var oNode = oLocation.oNode;
		var oDropIndicator = this.oMap.get('oDropIndicator');
		var oStyle = oDropIndicator.style;
		oStyle.display = '';
		if (offset < Math.ceil(oNode.oRow.offsetHeight/2)) {
			oStyle.top = oLocation.s+'px';
		} else {
			oStyle.top = (oLocation.sh - oDropIndicator.offsetHeight)+'px';
		}
		//oStyle.left = tjs.css.getPaddingWidth(this.getHandleViewport(),'l')+'px';
		oStyle.left = '0px';
		oStyle.width = oView._oBodyTable.offsetWidth+'px';
	},
	selectHandle:function(oHandle){
		tjs.dom.addClass(oHandle,'tjs_grid_row_dragging');
		return oHandle.oNode;
	},
	unselectHandle:function(oHandle){
		tjs.dom.removeClass(oHandle,'tjs_grid_row_dragging');
	},
	getData:function(oNode){
		return oNode.data;
	},
	removeData:function(oNode){
		this._getView().deleteData(oNode.idx);
	},
	moveData:function(oNode1,oNode2,offset){
		if (oNode1 != oNode2) {
			var idx1 = oNode1.idx;
			var idx2 = offset < Math.ceil(oNode2.oRow.offsetHeight/2) ? oNode2.idx : (oNode2.idx + 1);
			this._getView().moveData(idx1,idx2);
		}
	},
	addData:function(oNode,offset,data){
		if (offset < Math.ceil(oNode.oRow.offsetHeight/2)) {
			this._getView().insertData(oNode.idx,data);
		} else {
			this._getView().insertData(oNode.idx + 1,data);
		}
	},
	createLocations:function(){
		var oNodes = this._getView().getNodes();
		var h,sh,oNode;
		//var s = tjs.css.getPaddingWidth(this.getHandleViewport(),'t');
		var s = 0;
		for (var i = 0,isize = oNodes.length; i < isize; i++) {
			oNode = oNodes[i];
			if (!oNode.hidden) {
				h = oNode.oRow.offsetHeight;
				sh = s + h;
				this.oLocations[i] = {s:s,sh:sh,oNode:oNode};
				s = sh;
			}
		}
	}
});

tjs.lang.defineClass('tjs.editor.ListGrid',tjs.grid.ListGrid,
function(obj) {
	tjs.grid.ListGrid.call(this,obj);
},tjs.editor.SListEditor,{
	_construct:function() {
		tjs.grid.ListGrid.prototype._construct.call(this);
		this._checkValue();
	}
});

tjs.lang.defineClass('tjs.editor.ListGridDialog',tjs.editor.DataSetDialog,
function(obj) {
	tjs.editor.DataSetDialog.call(this,obj);
},{
	_construct:function() {
		this.oMap.put('caption','Single Selection List');
		tjs.editor.DataSetDialog.prototype._construct.call(this);
	},
	_createEditor:function() {
		var obj = {oParent:this.oDialog.getContent()};
		var aColumns = this.oMap.remove('aColumns');
		if (tjs.lang.isArray(aColumns)) {
			obj.aColumns = aColumns;
		}
		obj.alternate = Boolean(this.oMap.remove('alternate'));
		obj.sortable = Boolean(this.oMap.remove('sortable'));
		obj.noHeader = Boolean(this.oMap.remove('noHeader'));

		var datas = this.oMap.remove('datas');
		var cache = this.oMap.remove('cache');
		if (tjs.lang.isArray(datas)) {
			obj.datas = datas;
		} else if (tjs.lang.isObject(cache)) {
			obj.cache = cache;
		}
		var oEditor = new tjs.editor.ListGrid(obj);
		tjs.html.evalLayouts(oEditor.oElement);
		//this.oDialog.setContentSize(oEditor.oElement.offsetWidth,oEditor.oElement.offsetHeight);
		return oEditor;
	}
});
