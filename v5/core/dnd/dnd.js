tjs.dnd = {
	// dnd effect
	EFFECT_NONE:0,
	EFFECT_COPY:1,
	EFFECT_MOVE:2,
	EFFECT_LINK:4,
	EFFECT_COPY_MOVE:3,
	EFFECT_COPY_LINK:5,
	EFFECT_LINK_MOVE:6,
	EFFECT_ALL:7,
	// event type
	DRAG_START:'DRAG_START',
	DRAG:'DRAG',
	DRAG_END:'DRAG_END',
	DRAG_ENTER:'DRAG_ENTER',
	DRAG_OVER:'DRAG_OVER',
	DRAG_LEAVE:'DRAG_LEAVE',
	DROP:'DROP',
	// dndOptions
	DRAGGABLE: 1,
	DROPPABLE: 2,
	REORDERABLE: 4,
	// data type
	TYPE_URL:'URL',
	TYPE_TEXT:'TEXT',
	TYPE_HTML:'HTML',
	TYPE_ELEMENT:'ELEMENT',
	TYPE_CONTENT:'CONTENT',
	TYPE_DATA:'DATA',
	//
	classname:'tjs.dnd'
};

/**
 * @class tjs.dnd.DataTransfer
 */
tjs.lang.defineTopClass('tjs.dnd.DataTransfer',
function() {
	this.effectAllowed = tjs.dnd.EFFECT_NONE;//uninitialized
	this.dropEffect = tjs.dnd.EFFECT_NONE;
	this.group = null;
	this.datas = new tjs.util.Map();
	this.dataCount = 0;
},{
	destroy:function(){
		if (this.datas) {
			this.datas.destroy();
			tjs.lang.destroyObject(this);
		}
	},
	recycle:function(){
		this.dataCount = 0;
		this.datas.clear();
		this.group = null;
		this.effectAllowed = tjs.dnd.EFFECT_NONE;//uninitialized
		this.dropEffect = tjs.dnd.EFFECT_NONE;
	},
	/**
	 * @method tjs.dnd.DataTransfer.prototype.hasData
	 * @return Boolean
	 */
	hasData:function(){
		return this.dataCount > 0;
	},
	/**
	 * @method tjs.dnd.DataTransfer.prototype.getData
	 * @param type: String
	 * @return Any
	 */
	getData:function(type){
//tjs_debug_start
		tjs.lang.assert(type && tjs.lang.isString(type),'!tjs.lang.isString(type) @'+this.classname+'.getData');
//tjs_debug_end
		return this.datas.get(type);
	},
	/**
	 * @method tjs.dnd.DataTransfer.prototype.setData
	 * @param type: String
	 * @param data: Any
	 */
	setData:function(type,data){
//tjs_debug_start
		tjs.lang.assert(type && tjs.lang.isString(type),'!tjs.lang.isString(type) @'+this.classname+'.setData');
//tjs_debug_end
		if (data) {
			data = this.datas.put(type,data);
			if (!data) {
				this.dataCount++;
			}
		} else {
			data = this.datas.remove(type);
			if (data) {
				this.dataCount--;
			}
		}
	},
	/**
	 * @method tjs.dnd.DataTransfer.prototype.clearData
	 * @param type: String
	 */
	clearData:function(type){
//tjs_debug_start
		tjs.lang.assert(!type || tjs.lang.isString(type),'!tjs.lang.isString(type) @'+this.classname+'.clearData');
//tjs_debug_end
		if (type) {
			var data = this.datas.remove(type);
			if (data) {
				this.dataCount--;
			}
		} else {
			this.dataCount = 0;
			this.datas.clear();
		}
	}
});

/**
@class tjs.dnd.AbstractDraggable
*/
tjs.lang.defineTopClass('tjs.dnd.AbstractDraggable',
function() {
},{
	/**
	@method tjs.dnd.AbstractDraggable.prototype.getDragElement
	Get the oElement saved previously.
	Required method for some subclass: tjs.dnd.DefaultDraggable, tjs.dnd.Movable, tjs.dnd.Resizable
	@return Element
	Return the oElement saved previously or null.
	*/
	getDragElement:function(){
		return this.oMap.get('oDragElement');
	},
	/**
	@method tjs.dnd.AbstractDraggable.prototype.isEnabled
	@return Boolean
	*/
	isEnabled:function(){
		return this.oMap.get('enabled');
	},
	/**
	 * @method tjs.dnd.AbstractDraggable.prototype.setEnabled
	 * @param enabled: Boolean
	 */
	setEnabled:function(enabled) {
		enabled = Boolean(enabled);
		if (this.isEnabled() != enabled) {
			this.oMap.put('enabled',enabled);
			var oHandles = this.oMap.get('oHandles');
			var i = oHandles.length;
			while (i--) {
				if (enabled) {
					this._attachHandle(oHandles[i]);
				} else {
					this._detachHandle(oHandles[i]);
				}
			}
		}
	},
	_attachHandle:function(oHandle){
		var dragCursor = this.getDragCursor();
		if (dragCursor) {
			oHandle.style.cursor = dragCursor;
		}
		oHandle.oDraggable = this;
		tjs.event.addListener(oHandle,'mousedown',tjs.dnd.oDragDropManager.mousedownHandler);
	},
	_detachHandle:function(oHandle){
		var dragCursor = this.getDragCursor();
		if (dragCursor) {
			oHandle.style.cursor = '';
		}
		oHandle.oDraggable = null;
		tjs.event.removeListener(oHandle,'mousedown',tjs.dnd.oDragDropManager.mousedownHandler);
	},
	/**
	 * @method tjs.dnd.AbstractDraggable.prototype.getCurrHandle
	 * @return Element
	 */
	getCurrHandle:function(){
		return this.oMap.get('currHandle');
	},
	/**
	 * @method tjs.dnd.AbstractDraggable.prototype.setCurrHandle
	 * @param oHandle: Element
	 */
	setCurrHandle:function(oHandle){
		if (oHandle) {
			this.oMap.put('currHandle',oHandle);
		} else {
			this.oMap.remove('currHandle');
		}
	},
	/**
	 * @method tjs.dnd.AbstractDraggable.prototype.addHandle
	 * @param oHandle: Element
	 */
	addHandle:function(oHandle){
//tjs_debug_start
		tjs.lang.assert(tjs.dom.isElement(oHandle),'!tjs.dom.isElement(oHandle) @'+this.classnamr+'.addHandle');
//tjs_debug_end
		var oHandles = this.oMap.get('oHandles');
		oHandles[oHandles.length] = oHandle;
		if (this.isEnabled()) {
			this._attachHandle(oHandle);
		}
	},
	/**
	 * @method tjs.dnd.AbstractDraggable.prototype.addHandle
	 * @param oHandle: Element
	 */
	addHandleAt:function(idx,oHandle){
		var oHandles = this.oMap.get('oHandles');
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.addHandleAt');
		tjs.lang.assert(idx >= 0 && idx <= oHandles.length,'idx is out of bounds @'+this.classname+'.addHandleAt');
		tjs.lang.assert(tjs.dom.isElement(oHandle),'!tjs.dom.isElement(oHandle) @'+this.classnamr+'.addHandleAt');
//tjs_debug_end
		if (idx == oHandles.length) {
			oHandles[idx] = oHandle;
		} else if (idx == 0) {
			oHandles.unshift(oHandle);
		} else {
			oHandles.splice(idx,0,oHandle);
		}
		if (this.isEnabled()) {
			this._attachHandle(oHandle);
		}
	},
	/**
	 * @method tjs.dnd.AbstractDraggable.prototype.removeHandle
	 * @param oHandle: Element
	 */
	removeHandle:function(oHandle){
//tjs_debug_start
		tjs.lang.assert(tjs.dom.isElement(oHandle),'!tjs.dom.isElement(oHandle) @'+this.classnamr+'.removeHandle');
//tjs_debug_end
		var oHandles = this.oMap.get('oHandles');
		var idx = oHandles.indexOf(oHandle);
		if (idx > -1) {
			if (this.isEnabled()) {
				this._detachHandle(oHandle);
			}
			oHandles.splice(idx,1);
		}
	},
	/**
	 * @method tjs.dnd.AbstractDraggable.prototype.removeHandleAt
	 * @param idx: Integer
	 */
	removeHandleAt:function(idx){
		var oHandles = this.oMap.get('oHandles');
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.removeHandleAt');
		tjs.lang.assert(idx >= 0 && idx < oHandles.length,'idx is out of bounds @'+this.classname+'.removeHandleAt');
//tjs_debug_end
		if (this.isEnabled()) {
			this._detachHandle(oHandles[idx]);
		}
		oHandles.splice(idx,1);
	},
	/**
	@method tjs.dnd.AbstractDraggable.prototype._onDragStart
	Called by tjs.dnd.oDragDropManager when drag start (mousedown).
	@param dndData: Object
	The dnd infomation supplied by tjs.dnd.oDragDropManager.
	*/
	_onDragStart:function(dndData){
		this.onDragStart(dndData);
		this.fire(tjs.dnd.DRAG_START,dndData);
	},
	/**
	@method tjs.dnd.AbstractDraggable.prototype._onDrag
	Called by tjs.dnd.oDragDropManager when dragging (mousemove).
	@param dndData: Object
	The dnd infomation supplied by tjs.dnd.oDragDropManager.
	*/
	_onDrag:function(dndData){
		this.onDrag(dndData);
		this.fire(tjs.dnd.DRAG,dndData);
	},
	/**
	@method tjs.dnd.AbstractDraggable.prototype._onDragEnd
	Called by tjs.dnd.oDragDropManager when drag end (mouseup).
	@param dndData: Object
	The dnd infomation supplied by tjs.dnd.oDragDropManager.
	*/
	_onDragEnd:function(dndData){
		this.onDragEnd(dndData);
		this.fire(tjs.dnd.DRAG_END,dndData);
	},
	/**
	@method tjs.dnd.AbstractDraggable.prototype.getDragCursor
	@return String
	*/
	getDragCursor:function(){
		return this.oMap.get('dragCursor');
	},
	showDragImage:function(dndData){
	},
	hideDragImage:function(dndData){
	},
	/**
	@method tjs.dnd.AbstractDraggable.prototype.onDragStart
	To be overrided by subclass to handle _onDragStart event.
	Default implementaion is an empty method.
	@param dndData: Object
	The dnd infomation supplied by tjs.dnd.oDragDropManager.
	*/
	onDragStart:function(dndData){
	},
	/**
	@method tjs.dnd.AbstractDraggable.prototype.onDrag
	To be overrided by subclass to handle _onDrag event.
	Default implementaion is an empty method.
	@param dndData: Object
	The dnd infomation supplied by tjs.dnd.oDragDropManager.
	*/
	onDrag:function(dndData){
	},
	/**
	@method tjs.dnd.AbstractDraggable.prototype.onDragEnd
	To be overrided by subclass to handle _onDragEnd event.
	Default implementaion is an empty method.
	@param dndData: Object
	The dnd infomation supplied by tjs.dnd.oDragDropManager.
	*/
	onDragEnd:function(dndData){
	}
});
tjs.lang.extend(tjs.dnd.AbstractDraggable,{
	initInstance:function(obj){
		var oHandles = obj.oMap.get('oHandles');
		if (tjs.lang.isArray(oHandles)) {
			var i = oHandles.length;
			while (i--) {
				oHandle = oHandles[i];
				if (!tjs.dom.isElement(oHandles[i])) {
					oHandles.splice(i,1);
				}
			}
			obj.oMap.put('oHandles',oHandles);
		} else {
			obj.oMap.put('oHandles',[]);
		}
		obj.oMap.put('enabled',false);
		tjs.dnd.oDragDropManager.addDraggable(obj);
	},
	destroyInstance:function(obj){
		tjs.dnd.oDragDropManager.removeDraggable(obj);
		tjs.lang.destroyArray(obj.oMap.get('oHandles'));
	}
});

/**
 * @class tjs.dnd.AbstractDroppable
 * @param obj: Object | tjs.util.Map
 */
tjs.lang.defineTopClass('tjs.dnd.AbstractDroppable',
function() {
},{
	/**
	 * @method tjs.dnd.AbstractDroppable.prototype.getDropElement
	 * @return Element
	 */
	getDropElement:function(){
		return this.oMap.get('oDropElement');
	},
	/**
	 * @method tjs.dnd.AbstractDroppable.prototype._onDragEnter
	 * @param dndData: Object
	 */
	_onDragEnter:function(dndData){
		this.onDragEnter(dndData);
		var dataTransfer = dndData.dataTransfer;
		dataTransfer.dropEffect &= tjs.dnd.EFFECT_ALL;
		if ((dataTransfer.effectAllowed & dataTransfer.dropEffect) != 0) {
			this.showDropIndicator(dndData);
			this.fire(tjs.dnd.DRAG_ENTER,dndData);
		} else {
			dataTransfer.dropEffect = tjs.dnd.EFFECT_NONE;
		}
	},
	/**
	 * @method tjs.dnd.AbstractDroppable.prototype._onDragOver
	 * @param dndData: Object
	 */
	_onDragOver:function(dndData){
		this.onDragOver(dndData);
		this.showDropIndicator(dndData);
		this.fire(tjs.dnd.DRAG_OVER,dndData);
	},
	/**
	 * @method tjs.dnd.AbstractDroppable.prototype._onDragLeave
	 * @param dndData: Object
	 */
	_onDragLeave:function(dndData){
		this.hideDropIndicator(dndData);
		this.onDragLeave(dndData);
		this.fire(tjs.dnd.DRAG_LEAVE,dndData);
	},
	/**
	 * @method tjs.dnd.AbstractDroppable.prototype._onDrop
	 * @param dndData: Object
	 */
	_onDrop:function(dndData){
		this.hideDropIndicator(dndData);
		this.onDrop(dndData);
		this.fire(tjs.dnd.DROP,dndData);
	},
	// to be overrided
	showDropIndicator:function(dndData){
	},
	hideDropIndicator:function(dndData){
	},
	/**
	 * @method tjs.dnd.AbstractDroppable.prototype.onDragEnter
	 * @param dndData: Object
	 */
	onDragEnter:function(dndData){
	},
	/**
	 * @method tjs.dnd.AbstractDroppable.prototype.onDragOver
	 * @param dndData: Object
	 */
	onDragOver:function(dndData){
	},
	/**
	 * @method tjs.dnd.AbstractDroppable.prototype.onDragLeave
	 * @param dndData: Object
	 */
	onDragLeave:function(dndData){
	},
	/**
	 * @method tjs.dnd.AbstractDroppable.prototype.onDrop
	 * @param dndData: Object
	 */
	onDrop:function(dndData){
	}
});
tjs.lang.extend(tjs.dnd.AbstractDroppable,{
	initInstance:function(obj){
		var oDropElement = obj.getDropElement();
//tjs_debug_start
		tjs.lang.assert(tjs.dom.isElement(oDropElement),'!tjs.dom.isElement(oDropElement) @'+obj.classname);
//tjs_debug_end
		oDropElement.oDroppable = obj;
		tjs.dnd.oDragDropManager.addDroppable(obj);
	},
	destroyInstance:function(obj){
		tjs.dnd.oDragDropManager.removeDroppable(obj);
		var oDropElement = obj.getDropElement();
		oDropElement.oDroppable = null;
	}
});

/**
@class tjs.dnd.Draggable: tjs.util.Map.prototype,tjs.util.Trigger.prototype,tjs.dnd.AbstractDraggable.prototype
@param obj: Object | tjs.util.Map
*/
tjs.lang.defineClass('tjs.dnd.Draggable',tjs.util.Trigger,
function(obj) {
	this.oMap = tjs.util.toMap(obj);
	this._construct();
},tjs.dnd.AbstractDraggable,{
	_construct:function() {
		tjs.util.Trigger.initInstance(this);
		tjs.dnd.AbstractDraggable.initInstance(this);
	},
	/**
	@method tjs.dnd.Draggable.prototype.destroy
	Destroy this object
	*/
	destroy:function() {
		if (this.oMap) {
			this._destroy();
			tjs.dnd.AbstractDraggable.destroyInstance(this);
			tjs.util.Trigger.destroyInstance(this);
			this.oMap.destroy();
			delete this.oMap;
			tjs.lang.destroyObject(this);
		}
	},
	_destroy:function() {
	}
});

/**
 * @class tjs.dnd.Droppable: tjs.util.Map.prototype,tjs.util.Trigger.prototype,tjs.dnd.AbstractDroppable.prototype
 * @param obj: Object | tjs.util.Map
 */
tjs.lang.defineClass('tjs.dnd.Droppable',tjs.util.Trigger,
function(obj) {
	this.oMap = tjs.util.toMap(obj);
//tjs_debug_start
	tjs.lang.assert(Boolean(this.oMap),'illegal argument obj @'+this.classname);
//tjs_debug_end
	this._construct();
},tjs.dnd.AbstractDroppable,{
	_construct:function() {
		tjs.util.Trigger.initInstance(this);
		tjs.dnd.AbstractDroppable.initInstance(this);
	},
	/**
	 * @method tjs.dnd.Droppable.prototype.destroy
	 */
	destroy:function() {
		if (this.oMap) {
			this._destroy();
			tjs.dnd.AbstractDroppable.destroyInstance(this);
			tjs.util.Trigger.destroyInstance(this);
			this.oMap.destroy();
			delete this.oMap;
			tjs.lang.destroyObject(this);
		}
	},
	_destroy:function() {
	}
});

/**
 * @class tjs.dnd.DnDable: tjs.util.Map.prototype,tjs.util.Trigger.prototype,tjs.dnd.AbstractDraggable.prototype,tjs.dnd.AbstractDroppable.prototype
 * @param obj: Object | tjs.util.Map
 */
tjs.lang.defineClass('tjs.dnd.DnDable',tjs.util.Trigger,
function(obj) {
	this.oMap = tjs.util.toMap(obj);
//tjs_debug_start
	tjs.lang.assert(Boolean(this.oMap),'illegal argument obj @'+this.classname);
//tjs_debug_end
	this._construct();
},tjs.dnd.AbstractDraggable,tjs.dnd.AbstractDroppable,{
	_construct:function() {
		tjs.util.Trigger.initInstance(this);
		tjs.dnd.AbstractDraggable.initInstance(this);
		tjs.dnd.AbstractDroppable.initInstance(this);
	},
	/**
	 * @method tjs.dnd.Droppable.prototype.destroy
	 */
	destroy:function() {
		if (this.oMap) {
			this._destroy();
			tjs.dnd.AbstractDroppable.destroyInstance(this);
			tjs.dnd.AbstractDraggable.destroyInstance(this);
			tjs.util.Trigger.destroyInstance(this);
			this.oMap.destroy();
			delete this.oMap;
			tjs.lang.destroyObject(this);
		}
	},
	_destroy:function() {
	}
});
