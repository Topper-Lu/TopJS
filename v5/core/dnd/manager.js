/**
 * @class tjs.dnd.DragDropManager
 */
tjs.lang.defineTopClass('tjs.dnd.DragDropManager',
function(){
	this._construct();
},{
	_construct:function() {
		this.mousedownHandler = this._mousedownHandler.bindAsEventListener(this);
		this.mousemoveHandler = this._mousemoveHandler.bindAsEventListener(this);
		this.mouseupHandler = this._mouseupHandler.bindAsEventListener(this);
		this.handleDragStart = this._handleDragStart.bind(this);
		this.oDraggables = [];
		this.oDroppables = [];
		this.dataTransfer = new tjs.dnd.DataTransfer();
		this.dndData = {};
		this.clickTimeout = 300;
		this.dragActive = false;
		this.dropActive = false;
		this.canDrop = false;
		this.cancelDrop = false;
	},
	/**
	 * @method tjs.dnd.DragDropManager.prototype.destroy
	 */
	destroy:function() {
		if (this.oDraggables) {
			tjs.lang.destroyArray(this.oDroppables);
			tjs.lang.destroyArray(this.oDraggables);
			tjs.lang.destroyObject(this.dndData);
			this.dataTransfer.destroy();
			tjs.lang.destroyObject(this);
		}
	},
	/**
	 * @method tjs.dnd.DragDropManager.prototype.addDraggable
	 * @param oDraggable: tjs.dnd.Draggable
	 */
	addDraggable:function(oDraggable) {
//tjs_debug_start
		tjs.lang.assert(oDraggable instanceof tjs.dnd.Draggable || oDraggable instanceof tjs.dnd.DnDable,'!(oDraggable instanceof tjs.dnd.Draggable) @'+this.classnamr+'.addDraggable');
//tjs_debug_end
		var idx = this.oDraggables.indexOf(oDraggable);
		if (idx == -1) {
			oDraggable.setEnabled(true);
			this.oDraggables.push(oDraggable);
		}
	},
	/**
	 * @method tjs.dnd.DragDropManager.prototype.removeDraggable
	 * @param oDraggable: tjs.dnd.Draggable
	 */
	removeDraggable:function(oDraggable) {
//tjs_debug_start
		tjs.lang.assert(oDraggable instanceof tjs.dnd.Draggable || oDraggable instanceof tjs.dnd.DnDable,'!(oDraggable instanceof tjs.dnd.Draggable) @'+this.classnamr+'.removeDraggable');
//tjs_debug_end
		var idx = this.oDraggables.indexOf(oDraggable);
		if (idx > -1) {
			this.oDraggables.splice(idx,1);
			oDraggable.setEnabled(false);
		}
	},
	/**
	 * @method tjs.dnd.DragDropManager.prototype.addDroppable
	 * @param oDroppable: tjs.dnd.Droppable
	 */
	addDroppable:function(oDroppable) {
//tjs_debug_start
		tjs.lang.assert(oDroppable instanceof tjs.dnd.Droppable || oDroppable instanceof tjs.dnd.DnDable,'!(oDroppable instanceof tjs.dnd.Droppable) @'+this.classnamr+'.addDroppable');
//tjs_debug_end
		var idx = this.oDroppables.indexOf(oDroppable);
		if (idx == -1) {
			this.oDroppables.push(oDroppable);
		}
	},
	/**
	 * @method tjs.dnd.DragDropManager.prototype.removeDroppable
	 * @param oDroppable: tjs.dnd.Droppable
	 */
	removeDroppable:function(oDroppable) {
//tjs_debug_start
		tjs.lang.assert(oDroppable instanceof tjs.dnd.Droppable || oDroppable instanceof tjs.dnd.DnDable,'!(oDroppable instanceof tjs.dnd.Droppable) @'+this.classnamr+'.removeDroppable');
//tjs_debug_end
		var idx = this.oDroppables.indexOf(oDroppable);
		if (idx > -1) {
			this.oDroppables.splice(idx,1);
		}
	},
	_getOnElement:(function(){
		if (document.elementFromPoint) {
			// IE, FireFox 3+, Chrome 4+, Safari 5+
			return function(){
				return document.elementFromPoint(this.dndData.x,this.dndData.y);
			};
		} else {
			return function(){
				return this.dndData.oTarget;
			};
		}
	})(),
	_getOnDroppable:function(){
		var oElement = this._getOnElement();
		while (oElement && oElement != document.body) {
			if (oElement.oDroppable) {
				break;
			}
			oElement = oElement.parentNode;
		}
		return (oElement && oElement.oDroppable) ? oElement.oDroppable : null;
	},
	_mousedownHandler:function(oEvent) {
		if ('buttons' in oEvent) {
			// DOM LEVEL 3
			if (oEvent.buttons != 1) {
				return;
			}
		} else if (tjs.bom.isIE) {
			if (oEvent.button != 1) {
				return;
			}
		} else {
			// DOM LEVEL 2
			if (oEvent.button != 0) {
				return;
			}
		}
		var oTarget = oEvent.target || oEvent.srcElement;
		while (!oTarget.oDraggable && oTarget != document.body) {
			oTarget = oTarget.parentNode;
		}
		if (oTarget.oDraggable) {
			tjs.event.stopPropagation(oEvent);
			tjs.event.preventDefault(oEvent);// focus, selection

			this.currDraggable = oTarget.oDraggable;
			this.currDraggable.setCurrHandle(oTarget);

			this.dndData.startX = oEvent.clientX;
			this.dndData.startY = oEvent.clientY;
			this.dndData.x = oEvent.clientX;
			this.dndData.y = oEvent.clientY;
			this.dndData.oTarget = oEvent.target || oEvent.srcElement;

			tjs.event.addListener(document.body,'mousemove',this.mousemoveHandler);
			tjs.event.addListener(document.body,'mouseup',this.mouseupHandler);
			this.dragActive = false;
			this.clickTimeoutId = window.setTimeout(this.handleDragStart,this.clickTimeout);
		}
	},
	_mousemoveHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		this.dndData.x = oEvent.clientX;
		this.dndData.y = oEvent.clientY;
		this.dndData.oTarget = oEvent.target || oEvent.srcElement;
		if (this.dragActive) {
			if (this.dndData.oConstraint.contains(this.dndData.x,this.dndData.y)) {
				this._handleDrag();
			} else {
				if (document.selection && document.selection.empty) {
					document.selection.empty();
				}
				this.cancelDrop = true;
				this._handleMouseUp();
			}
		} else {
			var dx = this.dndData.x - this.dndData.startX;
			var dy = this.dndData.y - this.dndData.startY;
			if ((dx*dx + dy*dy) > 4) {
				if (this.clickTimeoutId) {
					window.clearTimeout(this.clickTimeoutId);
					delete this.clickTimeoutId;
				}
				this._handleDragStart();
			}
		}
	},
	_mouseupHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		this.dndData.x = oEvent.clientX;
		this.dndData.y = oEvent.clientY;
		this.dndData.oTarget = oEvent.target || oEvent.srcElement;
		this._handleMouseUp();
	},
	_handleMouseUp:function(){
		tjs.event.removeListener(document.body,'mousemove',this.mousemoveHandler);
		tjs.event.removeListener(document.body,'mouseup',this.mouseupHandler);
		if (this.dragActive) {
			this._handleDragEnd();
		} else if (this.clickTimeoutId) {
			window.clearTimeout(this.clickTimeoutId);
			delete this.clickTimeoutId;
		}
		this.currDraggable.setCurrHandle(null);
		delete this.currDraggable;
		this.cancelDrop = false;
		tjs.lang.destroyObject(this.dndData);
	},
	_handleDragStart:function(){
		delete this.clickTimeoutId;
		this.dragActive = true;
		var dragCursor = this.currDraggable.getDragCursor();
		if (dragCursor) {
			document.body.style.cursor = dragCursor;
		}
		this.dndData.dataTransfer = this.dataTransfer;
		this.dndData.currDraggable = this.currDraggable;
		this.currDraggable._onDragStart(this.dndData);
		if (!(this.dndData.oConstraint instanceof tjs.geo.Rectangle)) {
			var x = tjs.bom.getViewportX();
			var y = tjs.bom.getViewportY();
			var o = document.body;
			this.dndData.oConstraint = new tjs.geo.Rectangle(x+5,y+5,x + o.clientWidth - 6,y + o.clientHeight - 6);
		}
		this.dataTransfer.effectAllowed &= tjs.dnd.EFFECT_ALL;
		this.canDrop = this.dataTransfer.effectAllowed != 0;
		if (this.canDrop) {
			var oDroppable = this._getOnDroppable();
			if (oDroppable) {
				this.currDroppable = oDroppable;
				this._handleDragEnter();
			}
		}
		this.currDraggable.showDragImage(this.dndData);
	},
	_handleDrag:function(){
		this.currDraggable._onDrag(this.dndData);
		if (this.canDrop) {
			this.currDraggable.hideDragImage(this.dndData);
			var oDroppable = this._getOnDroppable();
			if (this.currDroppable && oDroppable) {
				if (this.currDroppable == oDroppable) {
					if (this.dropActive) {
						this.currDroppable._onDragOver(this.dndData);
					}
				} else {
					if (this.dropActive) {
						this._handleDragLeave();
					}
					this.currDroppable = oDroppable;
					this._handleDragEnter();
				}
			} else if (this.currDroppable) {
				if (this.dropActive) {
					this._handleDragLeave();
				}
				delete this.currDroppable;
			} else if (oDroppable) {
				this.currDroppable = oDroppable;
				this._handleDragEnter();
			}
		}
		this.currDraggable.showDragImage(this.dndData);
	},
	_handleDragEnd:function(){
		var dragCursor = this.currDraggable.getDragCursor();
		if (dragCursor) {
			document.body.style.cursor = '';
		}
		this.currDraggable.hideDragImage(this.dndData);
		if (this.canDrop) {
			if (this.currDroppable && this.dropActive) {
				if (!this.cancelDrop) {
					var oDroppable = this._getOnDroppable();
					if (this.currDroppable == oDroppable) {
						this.currDroppable._onDrop(this.dndData);
						this.dropActive = false;
					} else {
						this._handleDragLeave();
					}
				} else {
					this._handleDragLeave();
				}
			}
			delete this.currDroppable;
			this.canDrop = false;
		}
		this.currDraggable._onDragEnd(this.dndData);
		if (this.dndData.oConstraint) {
			this.dndData.oConstraint.destroy();
			delete this.dndData.oConstraint;
		}
		this.dragActive = false;
		this.dataTransfer.recycle();
	},
	_handleDragEnter:function(){
		this.dndData.enterX = this.dndData.x;
		this.dndData.enterY = this.dndData.y;
		this.currDroppable._onDragEnter(this.dndData);
		this.dropActive = this.dataTransfer.dropEffect != 0;
	},
	_handleDragLeave:function(){
		this.currDroppable._onDragLeave(this.dndData);
		this.dataTransfer.dropEffect = tjs.dnd.EFFECT_NONE;
		this.dropActive = false;
	}
});

