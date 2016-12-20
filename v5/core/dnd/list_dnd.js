/**
@class tjs.dnd.ListDnDable: tjs.dnd.DnDable.prototype
@param obj: Object | tjs.util.Map
*/
tjs.lang.defineClass('tjs.dnd.ListDnDable',tjs.dnd.DnDable,
function(obj) {
	tjs.dnd.DnDable.call(this,obj);
},{
	_scrollOffset:7,
	_construct:function() {
		var oDnDTarget = this.getDnDTarget();//
//tjs_debug_start
		tjs.lang.assert(oDnDTarget instanceof tjs.dnd.ListDnDTarget,'!(oDnDTarget instanceof tjs.dnd.ListDnDTarget) @'+this.classname);
//tjs_debug_end
		if (oDnDTarget.isDraggable() || oDnDTarget.isReorderable()) {
			this.oMap.put('dragCursor',oDnDTarget.getDragCursor());
		}
		if (oDnDTarget.isDroppable() || oDnDTarget.isReorderable()) {
			this.oMap.put('oDropElement',oDnDTarget.getHandleViewport());//
			this.fScrollTL = this._fScrollTL.bind(this);
			this.fScrollBR = this._fScrollBR.bind(this);
		}
		tjs.dnd.DnDable.prototype._construct.call(this);
	},
	/**
	@method tjs.dnd.ListDnDable.prototype.destroy
	Destroy this object
	Overide tjs.dnd.ListDnDable.prototype.destroy
	*/
	_destroy:function() {
		var oDnDTarget = this.oMap.remove('oDnDTarget');
		oDnDTarget.destroy();
	},
	setDirty:function(){
		this.getDnDTarget().dirty = true;
	},
	showDragImage:function(dndData){
		this.getDnDTarget().showDragImage(dndData);
	},
	hideDragImage:function(dndData){
		this.getDnDTarget().hideDragImage(dndData);
	},
	getDnDTarget:function(){
		return this.oMap.get('oDnDTarget');
	},
	getDragData:function(){
		return this.oMap.get('dragData');
	},
	getDropData:function(){
		return this.oMap.get('dropData');
	},
	_setDropLocation:function(){
		var dropData = this.getDropData();
		var a = dropData.oLocations;
		if (a.length == 0) {
			dropData.idx = 0;
			dropData.offset = 0;
			return;
		}
		var oDnDTarget = this.getDnDTarget();
		var s = oDnDTarget.isVertical() ? dropData.y : dropData.x;
		var len_1 = a.length - 1;
		if (s < a[0].s) {
			dropData.idx = 0;
			dropData.offset = 0;
			return;
		} else if (s >= a[len_1].sh) {
			dropData.idx = len_1;
			dropData.offset = a[len_1].sh - a[len_1].s - 1;
			return;
		}
		// binary search
		var i1 = 0, i2 = len_1, i;
		while (i2 > i1) {
			i = Math.floor((i1 + i2)/2);
			if (s < a[i].s) {
				i2 = i - 1;
			} else if (s >= a[i].sh) {
				i1 = i + 1;
			} else {
				dropData.idx = i;
				dropData.offset = s - a[i].s;
				return;
			}
		}
		dropData.idx = i1;
		dropData.offset = s - a[i1].s;
	},
	showDropIndicator:function(dndData){
		var dropData = this.getDropData();
		if (dropData.timer) {
			window.clearTimeout(dropData.timer);
			delete dropData.timer;
		}
		this._setDropLocation();
		var show = true;
		var oDnDTarget = this.getDnDTarget();
		if (dndData.currDraggable == this) {
			var dragData = this.getDragData();
			if (dragData.oNode == dropData.oLocations[dropData.idx].oNode) {
				show = false;
			}
		}
		if (show) {
			oDnDTarget.showDropIndicator(dropData.oLocations[dropData.idx],dropData.offset);//
		} else {
			oDnDTarget.hideDropIndicator();
		}
		var oViewport = oDnDTarget.getHandleViewport();
		var s;
		if (oDnDTarget.isVertical()) {
			if (tjs.css.hasVScrollBar(oViewport)) {
				s = oViewport.scrollTop;
				if (s > 0 && dropData.y < (s + this._scrollOffset)) {
					dropData.timer = window.setTimeout(this.fScrollTL,300);
				} else {
					s += oViewport.clientHeight;
					if (s < oViewport.scrollHeight && dropData.y > (s - this._scrollOffset)) {
						dropData.timer = window.setTimeout(this.fScrollBR,300);
					}
				}
			}
		} else {
			if (tjs.css.hasHScrollBar(oViewport)) {
				s = oViewport.scrollLeft;
				if (s > 0 && dropData.x < (s + this._scrollOffset)) {
					dropData.timer = window.setTimeout(this.fScrollTL,300);
				} else {
					s += oViewport.clientWidth;
					if (s < oViewport.scrollWidth && dropData.x > (s - this._scrollOffset)) {
						dropData.timer = window.setTimeout(this.fScrollBR,300);
					}
				}
			}
		}
	},
	_fScrollTL:function(){
		var dropData = this.getDropData();
		if (dropData.timer) {
			window.clearTimeout(dropData.timer);
			delete dropData.timer;
		}
		if (dropData.idx > 0) {
			dropData.idx--;
			dropData.offset = 0;
		}
		var s = dropData.oLocations[dropData.idx].s;
		var oDnDTarget = this.getDnDTarget();
		oDnDTarget.showDropIndicator(dropData.oLocations[dropData.idx],dropData.offset);//
		var oViewport = oDnDTarget.getHandleViewport();
		if (oDnDTarget.isVertical()) {
			var dy = oViewport.scrollTop - s;
			oViewport.scrollTop -= dy;
			dropData.y0 -= dy;
			dropData.y -= dy;
			if (s > 0 && dropData.y < (s + this._scrollOffset)) {
				dropData.timer = window.setTimeout(this.fScrollTL,300);
			}
		} else {
			var dx = oViewport.scrollLeft - s;
			oViewport.scrollLeft -= dx;
			dropData.x0 -= dx;
			dropData.x -= dx;
			if (s > 0 && dropData.x < (s + this._scrollOffset)) {
				dropData.timer = window.setTimeout(this.fScrollTL,300);
			}
		}
	},
	_fScrollBR:function(){
		var dropData = this.getDropData();
		if (dropData.timer) {
			window.clearTimeout(dropData.timer);
			delete dropData.timer;
		}
		var a = dropData.oLocations;
		if (dropData.idx < (a.length - 1)) {
			dropData.idx++;
			dropData.offset = a[dropData.idx].sh - a[dropData.idx].s - 1;
		}
		var oDnDTarget = this.getDnDTarget();
		oDnDTarget.showDropIndicator(a[dropData.idx],dropData.offset);//
		var s = a[dropData.idx].sh;
		var oViewport = oDnDTarget.getHandleViewport();
		if (oDnDTarget.isVertical()) {
			var dy = s - oViewport.scrollTop - oViewport.clientHeight;
			oViewport.scrollTop += dy;
			dropData.y0 += dy;
			dropData.y += dy;
			if (s < oViewport.scrollHeight && dropData.y > (s - this._scrollOffset)) {
				dropData.timer = window.setTimeout(this.fScrollBR,300);
			}
		} else {
			var dx = s - oViewport.scrollLeft - oViewport.clientWidth;
			oViewport.scrollLeft += dx;
			dropData.x0 += dx;
			dropData.x += dx;
			if (s < oViewport.scrollWidth && dropData.x > (s - this._scrollOffset)) {
				dropData.timer = window.setTimeout(this.fScrollBR,300);
			}
		}
	},
	hideDropIndicator:function(dndData){
		var dropData = this.getDropData();
		if (dropData.timer) {
			window.clearTimeout(dropData.timer);
			delete dropData.timer;
		}
		this.getDnDTarget().hideDropIndicator();
	},
	/**
	 * @method tjs.dnd.AbstractDroppable.prototype.onDragEnter
	 * @param dndData: Object
	 */
	onDragEnter:function(dndData){
		var oDnDTarget = this.getDnDTarget();
		if (!oDnDTarget.isDroppable() && !oDnDTarget.isReorderable()) {
			return;
		}

		var dataTransfer = dndData.dataTransfer;
		if (dndData.currDraggable == this) {
			if (oDnDTarget.isReorderable()) {
				dataTransfer.dropEffect = tjs.dnd.EFFECT_MOVE;
			}
		} else if (oDnDTarget.isDroppable()) {
			if (oDnDTarget.isDroppable() && dataTransfer.hasData()) {
				if (!oDnDTarget.getDataGroup() || oDnDTarget.getDataGroup() == dataTransfer.group) {
					if (dataTransfer.getData(oDnDTarget.getDataType())) {
						if ((dataTransfer.effectAllowed & tjs.dnd.EFFECT_COPY) != 0) {
							dataTransfer.dropEffect = tjs.dnd.EFFECT_COPY;
						} else if ((dataTransfer.effectAllowed & tjs.dnd.EFFECT_MOVE) != 0) {
							dataTransfer.dropEffect = tjs.dnd.EFFECT_MOVE;
						}
					}
				}
			}
		}
		if (dataTransfer.dropEffect == 0) {
			return;
		}

		var dropData = this.getDropData();
		if (!dropData) {
			dropData = {};
			this.oMap.put('dropData',dropData);
		}
		var oHandleViewport = oDnDTarget.getHandleViewport();
		var pos = tjs.css.toLocalPosition(oHandleViewport, dndData.enterX, dndData.enterY);
		dropData.x0 = pos.x;
		dropData.y0 = pos.y;
		dropData.x = dropData.x0;
		dropData.y = dropData.y0;
		pos.destroy();
		dropData.oLocations = oDnDTarget.getLocations();
	},
	/**
	 * @method tjs.dnd.AbstractDroppable.prototype.onDragOver
	 * @param dndData: Object
	 */
	onDragOver:function(dndData){
		var dropData = this.getDropData();
		dropData.x = dropData.x0 + dndData.x - dndData.enterX;
		dropData.y = dropData.y0 + dndData.y - dndData.enterY;
	},
	/**
	 * @method tjs.dnd.AbstractDroppable.prototype.onDragLeave
	 * @param dndData: Object
	 */
	onDragLeave:function(dndData){
		var dropData = this.getDropData();
		tjs.lang.destroyObject(dropData);
	},
	/**
	 * @method tjs.dnd.AbstractDroppable.prototype.onDrop
	 * @param dndData: Object
	 */
	onDrop:function(dndData){
		var dropData = this.getDropData();
		dropData.x = dropData.x0 + dndData.x - dndData.enterX;
		dropData.y = dropData.y0 + dndData.y - dndData.enterY;
		var oDnDTarget = this.getDnDTarget();
		if (dndData.currDraggable == this) {
			if (oDnDTarget.isReorderable()) {
				var dragData = this.getDragData();
				oDnDTarget.moveData(dragData.oNode,dropData.oLocations[dropData.idx].oNode,dropData.offset);
			}
		} else if (oDnDTarget.isDroppable()) {
			var dataTransfer = dndData.dataTransfer;
			var data = dataTransfer.getData(oDnDTarget.getDataType());
			if (dataTransfer.dropEffect == tjs.dnd.EFFECT_MOVE) {
				dataTransfer.clearData(oDnDTarget.getDataType());
			}
			oDnDTarget.addData(dropData.oLocations[dropData.idx].oNode,dropData.offset,data);
		}
		tjs.lang.destroyObject(dropData);
	},
	/**
	@method tjs.dnd.ListDnDable.prototype.onDragStart
	Overide tjs.dnd.DnDable.prototype.onDragStart to handle _onDragStart event.
	@param dndData: Object
	The dnd infomation supplied by tjs.dnd.oDragDropManager.
	*/
	onDragStart:function(dndData){
		var oDnDTarget = this.getDnDTarget();
		if (!oDnDTarget.isDraggable() && !oDnDTarget.isReorderable()) {
			return;
		}
		if (!oDnDTarget.isDraggable()) {
			var oHandleViewport = oDnDTarget.getHandleViewport();
			var pos = tjs.bom.convertD2W(tjs.css.getPosition(oHandleViewport));
			var oConstraint = new tjs.geo.Rectangle(pos.x,pos.y,pos.x+oHandleViewport.clientWidth-1,pos.y+oHandleViewport.clientHeight-1);
			if (oDnDTarget.isVertical()) {
				oConstraint.y1 -= 10;
				oConstraint.y2 += 10;
			} else {
				oConstraint.x1 -= 10;
				oConstraint.x2 += 10;
			}
			this.oMap.put('oConstraint',oConstraint);
		}

		var dragData = this.getDragData();
		if (!dragData) {
			dragData = {};
			this.oMap.put('dragData',dragData);
		}
		dragData.oNode = oDnDTarget.selectHandle(this.getCurrHandle());

		var dataTransfer = dndData.dataTransfer;
		if (oDnDTarget.isDraggable()) {
			var data = oDnDTarget.getData(dragData.oNode);
			dataTransfer.group = oDnDTarget.getDataGroup();
			dataTransfer.setData(oDnDTarget.getDataType(),data);
			if (oDnDTarget.getDragEffect() == 'delete' || oDnDTarget.getDragEffect() == 'move') {
				dataTransfer.effectAllowed = tjs.dnd.EFFECT_MOVE;
			} else {
				dataTransfer.effectAllowed = tjs.dnd.EFFECT_COPY;
			}
		} else if (oDnDTarget.isReorderable()) {
			dataTransfer.effectAllowed = tjs.dnd.EFFECT_MOVE;
		}
	},
	/**
	@method tjs.dnd.ListDnDable.prototype.onDrag
	Overide tjs.dnd.DnDable.prototype.onDrag to handle _onDrag event.
	@param dndData: Object
	The dnd infomation supplied by tjs.dnd.oDragDropManager.
	*/
	onDrag:function(dndData){
	},
	/**
	@method tjs.dnd.ListDnDable.prototype.onDragEnd
	Overide tjs.dnd.DnDable.prototype.onDragEnd to handle _onDragEnd event.
	@param dndData: Object
	The dnd infomation supplied by tjs.dnd.oDragDropManager.
	*/
	onDragEnd:function(dndData){
		var dragData = this.getDragData();
		var oDnDTarget = this.getDnDTarget();
		oDnDTarget.unselectHandle(this.getCurrHandle());
		if (oDnDTarget.isDraggable() && !tjs.css.aboveElement(oDnDTarget.getHandleViewport(), dndData.x, dndData.y)) {
			switch (oDnDTarget.getDragEffect()) {
				case 'delete':
					oDnDTarget.removeData(dragData.oNode);
					break;
				case 'move':
					var dataTransfer = dndData.dataTransfer;
					if (!dataTransfer.getData(oDnDTarget.getDataType())) {
						oDnDTarget.removeData(dragData.oNode);
					}
					break;
				case 'copy':
				default:
					break;
			}
		}
		var oConstraint = this.oMap.remove('oConstraint');
		if (oConstraint) {
			oConstraint.destroy();
		}
		tjs.lang.destroyObject(dragData);
	}
});
