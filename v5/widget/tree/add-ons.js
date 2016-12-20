tjs.lang.defineClass('tjs.widget.Tree.ListDnDTarget',tjs.dnd.ListDnDTarget,
function(obj) {
	tjs.dnd.ListDnDTarget.call(this,obj);
},{
	_construct:function(){
		var oView = this._getView();
//tjs_debug_start
		tjs.lang.assert(oView instanceof tjs.widget.Tree,'!(oView instanceof tjs.widget.Tree) @'+this.classname);
//tjs_debug_end
		var oCS = tjs.css.getComputedStyle(oView.oElement);
		if (oCS.position == 'static') {
			oView.oElement.style.position = 'relative';
		}
		this.oMap.put('dataType',tjs.html.TYPE_DATA);
		//this.oMap.put('dataGroup',this._getView().viewClass);//
		tjs.dnd.ListDnDTarget.prototype._construct.call(this);
		var tjs_data = tjs.data;
		oView.addHandler(tjs_data.BEFORE_RESTRUCTURE,this._onBeforeRestructure.bind(this));
		oView.addHandler(tjs_data.AFTER_RESTRUCTURE,this._onAfterRestructure.bind(this));
		oView.addHandler(tjs_data.AFTER_INSERT,this._onAfterInsert.bind(this));
		oView.addHandler(tjs_data.BEFORE_DELETE,this._onBeforeDelete.bind(this));
		oView.addHandler([
			tjs_data.AFTER_DELETE,
			tjs_data.AFTER_REPLACE,
			tjs_data.AFTER_MOVE
		],this._dirtyHandler.bind(this));
	},
	_dirtyHandler:function(source,type){
		this.dirty = true;
	},
	_onBeforeRestructure:function(source,type){
		this._removeHandle(this._getView().getRoot());
	},
	_onAfterRestructure:function(source,type){
		this._addHandle(this._getView().getRoot());
		this.dirty = true;
	},
	_onAfterInsert:function(source,type,o){
		this._addHandles(o.path,o.count);
		this.dirty = true;
	},
	_onBeforeDelete:function(source,type,o){
		this._removeHandles(o.path,o.count);
	},
	_getView:function(){
		return this.oMap.get('oView');
	},
	_removeHandles:function(path,count){
		var idx = path.pop();
		var oParentNode = this._getView().getNode(path);
		path[path.length] = idx;
		for (var i = idx, isize = idx + count; i < isize; i++) {
			this._removeHandle(oParentNode.children[i]);
		}
	},
	_removeHandle:function(oNode){
		if (oNode) {
			var oListDnDable = this._getView()._oListDnDable;
			if (oNode.oElement) {
				oListDnDable.removeHandle(oNode.oElement);
			}
			if (!oNode.isLeaf()) {
				var s = [oNode],i,oChildNode;
				while (s.length > 0) {
					oNode = s.pop();
					i = oNode.children.length;
					while (i--) {
						oChildNode = oNode.children[i];
						oListDnDable.removeHandle(oChildNode.oElement);
						if (!oChildNode.isLeaf()) {
							s[s.length] = oChildNode;
						}
					}
				}
			}
		}
	},
	_addHandles:function(path,count){
		var idx = path.pop();
		var oParentNode = this._getView().getNode(path);
		path[path.length] = idx;
		for (var i = idx, isize = idx + count; i < isize; i++) {
			this._addHandle(oParentNode.children[i]);
		}
	},
	_addHandle:function(oNode){
		if (oNode) {
			var oListDnDable = this._getView()._oListDnDable;
			if (oNode.oElement) {
				oListDnDable.addHandle(oNode.oElement);
			}
			if (!oNode.isLeaf()) {
				var s = [oNode],i,oChildNode;
				while (s.length > 0) {
					oNode = s.pop();
					i = oNode.children.length;
					while (i--) {
						oChildNode = oNode.children[i];
						oListDnDable.addHandle(oChildNode.oElement);
						if (!oChildNode.isLeaf()) {
							s[s.length] = oChildNode;
						}
					}
				}
			}
		}
	},
	getHandleViewport:function(){
		return this._getView().oElement;
	},
	showDropIndicator:function(oLocation,offset){
		var oView = this._getView();
		var oNode = oLocation.oNode;
		var oDropIndicator = this.oMap.get('oDropIndicator');
		var oStyle = oDropIndicator.style;
		oStyle.display = '';
		var w = oNode.oElement.offsetWidth;
		var y;
		if (oNode.isRoot()) {
			y = Math.ceil((oLocation.s + oLocation.sh - oDropIndicator.offsetHeight)/2);
		} else {
			var s1 = Math.ceil(oNode.oElement.offsetHeight/3);
			var s2 = s1 + s1;
			if (offset < s1) {
				y = oLocation.s;
			} else if (offset >= s2) {
				y = oLocation.sh - oDropIndicator.offsetHeight;
			} else {
				y = Math.ceil((oLocation.s + oLocation.sh - oDropIndicator.offsetHeight)/2);
				w -= oNode.oHandle.offsetWidth;
			}
		}
		var x = tjs.css.getPaddingBoxWidth(oView.oElement) - w;
		oStyle.left = x+'px';
		oStyle.top = y+'px';
		oStyle.width = w+'px';
	},
	selectHandle:function(oHandle){
		tjs.dom.addClass(oHandle,'tjs_treenode_dragging');
		return oHandle.oNode;
	},
	unselectHandle:function(oHandle){
		tjs.dom.removeClass(oHandle,'tjs_treenode_dragging');
	},
	getData:function(oNode){
		return oNode.data;
	},
	moveData:function(oNode1,oNode2,offset){
		var oRoot = this._getView().getRoot();
		if (oNode1 == oRoot || oNode1.isDescendant(oNode2)) {
			return;
		}
		var path1 = oNode1.getPath().concat();
		var path2 = oNode2.getPath().concat();
		var s1 = Math.ceil(oNode2.oElement.offsetHeight/3);
		if (oNode2 == oRoot) {
			if (offset < s1) {
				path2.push(0);
			} else {
				path2.push(oNode2.getChildCount());
			}
		} else {
			var s2 = s1 + s1;
			if (offset >= s2) {
				var idx = path2.pop() + 1;
				path2.push(idx);
			} else if (offset >= s1) {
				path2.push(oNode2.getChildCount());
			}
		}
		this._getView().moveData(path1,path2);
		tjs.lang.destroyArray(path1);
		tjs.lang.destroyArray(path2);
	},
	addData:function(oNode,offset,data){
		var path = oNode.getPath();
		var s1 = Math.ceil(oNode.oElement.offsetHeight/3);
		var s2 = s1 + s1;
		if (offset < s1) {
			path = path.concat();
		} else if (offset >= s2) {
			path = path.concat();
			path[path.length - 1]++;
		} else {
			path = path.concat(oNode.getChildCount());
		}
		this._getView().insertData(data,path);
		tjs.lang.destroyArray(path);
	},
	removeData:function(oNode){
		this._getView().deleteData(oNode.getPath());
	},
	createLocations:function(){
		var oView = this._getView();
		var oNode = oView.getRoot();
		var i,h,sh;
		var s = tjs.css.getPaddingWidth(oView.oElement,'t');
		var q = [];
		if (!oNode.oElement) {
			if (!oNode.isLeaf() && oNode.opened) {
				i = oNode.children.length;
				while (i--) {
					q[q.length] = oNode.children[i];
				}
			}
		} else {
			q[0] = oNode;
		}
		while (q.length > 0) {
			oNode = q.pop();
			h = oNode.oElement.offsetHeight;
			sh = s + h;
			this.oLocations.push({s:s,sh:sh,oNode:oNode});
			s = sh;
			if (!oNode.isLeaf() && oNode.opened) {
				i = oNode.children.length;
				while (i--) {
					q[q.length] = oNode.children[i];
				}
			}
		}
	}
});
