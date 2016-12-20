/**
@class tjs.dnd.ListDnDTarget: tjs.util.Map.prototype
@param obj: Object | tjs.util.Map
Configuration object
{
	dndOptions: tjs.dnd.DRAGGABLE | tjs.dnd.DROPPABLE | tjs.dnd.REORDERABLE
	direction: 'v' | 'h'
	dragCursor: null | 'move' | ...
	dragEffect: 'copy' | 'move' | 'delete'
	dataType: tjs.dnd.TYPE_URL || tjs.dnd.TYPE_TEXT || tjs.dnd.TYPE_HTML || tjs.dnd.TYPE_ELEMENT || tjs.dnd.TYPE_CONTENT || tjs.dnd.TYPE_DATA
	dataGroup: null | Any
}
*/
tjs.lang.defineTopClass('tjs.dnd.ListDnDTarget',
function(obj) {
	this.oMap = tjs.util.toMap(obj);
//tjs_debug_start
	tjs.lang.assert(Boolean(this.oMap),'illegal argument obj @'+this.classname);
//tjs_debug_end
	this._construct();
},{
	_construct:function(){
		var dndOptions = this.oMap.remove('dndOptions');
		var draggable = (dndOptions & tjs.dnd.DRAGGABLE) != 0;
		var droppable = (dndOptions & tjs.dnd.DROPPABLE) != 0;
		var reorderable = (dndOptions & tjs.dnd.REORDERABLE) != 0;
		this.oMap.put('draggable',draggable);
		this.oMap.put('droppable',droppable);
		this.oMap.put('reorderable',reorderable);
		if (draggable) {
			var dragEffect = this.oMap.get('dragEffect');
			if (dragEffect != 'copy' && dragEffect != 'move' && dragEffect != 'delete') {
				this.oMap.put('dragEffect','copy');
			}
		}
		if (droppable || reorderable) {
			this._createDropIndicator();
		}
		this.dirty = true;
		this.oLocations = [];
	},
	destroy:function() {
		if (this.oMap) {
			this._clearLocations();
			var oDropIndicator = this.oMap.remove('oDropIndicator');
			if (oDropIndicator) {
				tjs.dom.removeNode(oDropIndicator);
			}
			this.oMap.destroy();
			tjs.lang.destroyObject(this);
		}
	},
	_createDropIndicator:function() {
		var oDropIndicator = document.createElement('div');
		oDropIndicator.className = 'tjs_drop_indicator tjs_drop_indicator_'+(this.isVertical() ? 'v' : 'h');
		oDropIndicator.style.display = 'none';
		this.getHandleViewport().appendChild(oDropIndicator);
		this.oMap.put('oDropIndicator',oDropIndicator);
	},
	isDraggable:function(){
		return this.oMap.get('draggable');
	},
	isDroppable:function(){
		return this.oMap.get('droppable');
	},
	isReorderable:function(){
		return this.oMap.get('reorderable');
	},
	getDragCursor:function(){
		return this.oMap.get('dragCursor');
	},
	getDragEffect:function(){
		return this.oMap.get('dragEffect');
	},
	getDataType:function(){
		return this.oMap.get('dataType');
	},
	getDataGroup:function(){
		return this.oMap.get('dataGroup');
	},
	showDragImage:function(dndData){
		tjs.dnd.oDragImage.show(dndData.x,dndData.y);
	},
	hideDragImage:function(dndData){
		tjs.dnd.oDragImage.hide();
	},
	getDropIndicator:function(){
		return this.oMap.get('oDropIndicator');
	},
	hideDropIndicator:function(){
		this.getDropIndicator().style.display = 'none';
	},
	_clearLocations:function(){
		if (this.oLocations.length > 0) {
			var i = this.oLocations.length;
			while (i--) {
				tjs.lang.destroyObject(this.oLocations[i]);
				this.oLocations[i] = null;
			}
			this.oLocations.length = 0;
		}
	},
	getLocations:function(){
		if (this.dirty) {
			this.dirty = false;
			this._clearLocations();
			this.createLocations();
		}
		return this.oLocations;
	},
	// to be overrided
	isVertical:function(){
		return true;
	},
	getHandleViewport:function(){
	},
	showDropIndicator:function(oLocation,offset){
	},
	selectHandle:function(oHandle){
	},
	unselectHandle:function(oHandle){
	},
	getData:function(oNode){
	},
	addData:function(oNode,offset,data){
	},
	removeData:function(oNode){
	},
	moveData:function(oNode1,oNode2,offset){
	},
	createLocations:function(){
	}
});
