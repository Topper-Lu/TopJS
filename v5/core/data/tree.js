tjs.lang.defineTopClass('tjs.data.Tree',
function() {
},{
	_cacheLoadedHandler:function(source,type){
		delete this.oCache;
		this.setRoot(source.cloneDatas());
	},
	_checkDatas:function() {
		var root = this.oMap.remove('root');
		var cache = this.oMap.remove('cache');
		if (root instanceof tjs.data.TreeNode) {
			this.setRoot(root);
		} else if (tjs.lang.isObject(cache) && cache.url && tjs.lang.isString(cache.url) && tjs.lang.isFunction(cache.fClass)) {
			var oCache = tjs.data.TreeCache.get(cache.url,cache.fClass);
			if (oCache) {
				if (oCache.isLoading()) {
					this.oCache = oCache;
					oCache.addHandler(tjs.data.CACHE_LOADED,this._cacheLoadedHandler.bind(this));
				} else {
					this.setRoot(oCache.cloneDatas());
				}
			}
		} else {
			this.setRoot(null);
		}
	},
	isEmpty:function() {
		return !this._root;
	},
	setRoot:function(root) {
		this._beforeRestructure();
		if (this._root) {
			this._destroyNodeContent(this._root);
			delete this._root;
		}
		if (root instanceof tjs.data.TreeNode) {
			this._root = root;
			this._createRootContent(this._root);
		}
		this._checkUI();
		this._afterRestructure();
	},
	getRoot:function() {
		return this._root;
	},
	getNode:function(path) {
		if (tjs.lang.isArray(path)) {
			var oNode = this._root;
			for (var i = 0, isize = path.length; i < isize; i++) {
				oNode = oNode.children[path[i]];
			}
			return oNode;
		} else {
			return null;
		}
	},
	getData:function(path) {
		var oNode = this.getNode(path);
		return oNode ? oNode.data : null;
	},
	getNodeByKey:function(key) {
		return this.search(tjs.data.searchByKey,key);
	},
	getDataByKey:function(key) {
		var oNode = this.getNodeByKey(key);
		return oNode ? oNode.data : null;
	},
	getPathByKey:function(key) {
		var oNode = this.getNodeByKey(key);
		return oNode ? oNode.getPath() : null;
	},
	getNodeByKeyPath:function(keyPath) {
		if (tjs.lang.isString(keyPath) && keyPath.length > 2 && keyPath.charAt(0) == '/' && keyPath.charAt(keyPath.length-1) == '/') {
			var s = [this_root], i, k;
			while (s.length > 0) {
				oNode = s.pop();
				if (oNode.getKeyPath() == keyPath) {
					tjs.lang.destroyArray(s);
					return oNode;
				}
				if (!oNode.isLeaf()) {
					k = s.length;
					i = oNode.children.length;
					while (i--) {
						s[k++] = oNode.children[i];
					}
				}
			}
		}
		return null;
	},
	search:function(fHandler,value,oThis) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.search');
//tjs_debug_end
		if (value == null || this._root == null) {
			return null;
		}
		return tjs.data.TreeNode.search(this._root,fHandler,value,oThis);
	},
	insertData:function(data,path) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isArray(path) && path.length > 0,'!tjs.lang.isArray(path) @'+this.classname+'.insertData');
		tjs.lang.assert(data != null,'data == null @'+this.classname+'.insertData');
//tjs_debug_end
		var idx = path.pop();
		var oParent = this.getNode(path);
		path[path.length] = idx;
		if (oParent) {
			if (oParent.isLeaf()) {
				this._Leaf2Folder(oParent);//
			}
			var refNode = oParent.getChildCount() > idx ? oParent.getChildAt(idx) : null;

			var oNode = oParent.addChildData(data,idx);
			this._createNodeContent(oNode,refNode);//

			this._checkUI();//
			this._afterInsert(path,1);
		}
	},
	insertDatas:function(datas,path){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isArray(path) && path.length > 0,'!tjs.lang.isArray(path) @'+this.classname+'.insertDatas');
		tjs.lang.assert(tjs.lang.isArray(datas) && datas.length > 0,'!tjs.lang.isArray(datas) @'+this.classname+'.insertDatas');
//tjs_debug_end
		var idx = path.pop();
		var oParent = this.getNode(path);
		path[path.length] = idx;
		if (oParent) {
			if (oParent.isLeaf()) {
				this._Leaf2Folder(oParent);//
			}
			var refNode = oParent.getChildCount() > idx ? oParent.getChildAt(idx) : null;

			var oNodes = oParent.addChildrenDatas(datas);
			count = oNodes.length;
			for (var i = 0; i < count; i++) {
				this._createNodeContent(oNodes[i],refNode);//
				oNodes[i] = null;
			}
			oNodes.length = 0;

			this._checkUI();//
			this._afterInsert(path,count);
		}
	},
	updateData:function(data,path) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isArray(path),'!tjs.lang.isArray(path) @'+this.classname+'.updateData');
		tjs.lang.assert(data != null,'data == null @'+this.classname+'.updateData');
//tjs_debug_end
		var oNode = this.getNode(path);
		if (oNode) {
			oNode.setData(data);
			this._updateNodeContent(oNode);//

			this._checkUI();//
			this._afterUpdate(path,1);
		}
	},
	updateDatas:function(datas,path){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isArray(path) && path.length > 0,'!tjs.lang.isArray(path) @'+this.classname+'.updateDatas');
		tjs.lang.assert(tjs.lang.isArray(datas) && datas.length > 0,'!tjs.lang.isArray(datas) @'+this.classname+'.updateDatas');
//tjs_debug_end
		var idx = path.pop();
		var oParent = this.getNode(path);
		path[path.length] = idx;
		if (oParent) {
			var count = datas.length;
			var oNodes = oParent.getChildrenAt(idx,count);
			count = oNodes.length;
			var i = count;
			while (i--) {
				oNode = oNodes[i];
				oNodes[i] = null;
				oNode.setData(datas[i]);
				this._updateNodeContent(oNode);//
			}
			oNodes.length = 0;

			this._checkUI();//
			this._afterUpdate(path,count);
		}
	},
	deleteData:function(path) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isArray(path),'!tjs.lang.isArray(path) @'+this.classname+'.deleteData');
//tjs_debug_end
		var oNode = this.getNode(path);
		if (oNode) {
			var oParent = oNode.parent;
			if (oParent) {
				this._beforeDelete(path,1);
				oNode.removeFromParent();
				this._destroyNodeContent(oNode);//
				oNode.destroyed = true;
				if (oParent.isLeaf()) {
					this._Folder2Leaf(oParent);
				}
				this._checkUI();//
				this._afterDelete(path,1);
			}
		}
	},
	deleteDatas:function(path,count){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isArray(path) && path.length > 0,'!tjs.lang.isArray(path) @'+this.classname+'.deleteDatas');
		tjs.lang.assert(tjs.lang.isNumber(count) && count > 0,'!tjs.lang.isNumber(count) @'+this.classname+'.deleteDatas');
//tjs_debug_end
		var idx = path.pop();
		var oParent = this.getNode(path);
		path[path.length] = idx;
		if (oParent) {
			this._beforeDelete(path,count);
			var oNodes = oParent.removeChildren(idx,count);
			count = oNodes.length;
			var i = count, oNode;
			while (i--) {
				oNode = oNodes[i];
				oNodes[i] = null;
				this._destroyNodeContent(oNode);//
				oNode.destroyed = true;
			}
			oNodes.length = 0;
			if (oParent.isLeaf()) {
				this._Folder2Leaf(oParent);
			}
			this._checkUI();//
			this._afterDelete(path,count);
		}
	},
	moveData:function(path1,path2) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isArray(path1),'!tjs.lang.isArray(path1) @'+this.classname+'.moveData');
		tjs.lang.assert(tjs.lang.isArray(path2),'!tjs.lang.isArray(path2) @'+this.classname+'.moveData');
//tjs_debug_end
		if (path1.length == 0 || path2.length == 0 || tjs.data.TreeNode.isAncestorPathOf(path1,path2)) {
			return false;
		}
		var idx1 = path1.pop();
		var oParent1 = this.getNode(path1);
		path1[path1.length] = idx1;
		var idx2 = path2.pop();
		var oParent2 = this.getNode(path2);
		path2[path2.length] = idx2;
		if (oParent1 && oParent2) {
			this._beforeMove(path1,path2,1);
			if (oParent1 == oParent2 && idx2 > idx1) {
				idx2--;
			}
			// remove
			var oNode = oParent1.removeChild(idx1);
			this._detachNodeContent(oNode);//
			if (oParent1.isLeaf()) {
				this._Folder2Leaf(oParent1);
			}
			// add
			if (oParent2.isLeaf()) {
				this._Leaf2Folder(oParent2);
			}
			var refNode = oParent2.getChildCount() > idx2 ? oParent2.getChildAt(idx2) : null;
			oParent2.addChild(oNode,idx2);
			this._attachNodeContent(oNode,refNode);//
			path2 = oNode.getPath().concat();
			this._checkUI();//
			this._afterMove(path1,path2,1);
			tjs.lang.destroyArray(path2);
		}
	},
	moveDatas:function(path1,path2,count){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isArray(path1) && path1.length > 0,'!tjs.lang.isArray(path1) @'+this.classname+'.moveDatas');
		tjs.lang.assert(tjs.lang.isArray(path2) && path2.length > 0,'!tjs.lang.isArray(path2) @'+this.classname+'.moveDatas');
//tjs_debug_end
		var idx1 = path1.pop();
		var oParent1 = this.getNode(path1);
		path1[path1.length] = idx1;
		var idx2 = path2.pop();
		var oParent2 = this.getNode(path2);
		path2[path2.length] = idx2;
		if (oParent1 && oParent2) {
			var result = true;
			if (oParent1 == oParent2) {
				if (idx2 >= idx1) {
					idx2 -= count;
					if (idx2 <= idx1) {
						result = false;
					}
				}
			} else {
				if (tjs.data.TreeNode.isAncestorPathOf(oParent1.getPath(),oParent2.getPath())) {
					var idx = oParent2.getPath()[path1.length - 1];
					if (idx >= idx1 && idx < (idx1 + count)) {
						result = false;
					}
				}
			}
			if (result) {
				this._beforeMove(path1,path2,count);
				// remove
				var oNodes = oParent1.removeChildren(idx1,count);
				var isize = oNodes.length,i;
				for (i = 0; i < isize; i++) {
					this._detachNodeContent(oNodes[i]);//
				}
				if (oParent1.isLeaf()) {
					this._Folder2Leaf(oParent1);
				}
				// add
				if (oParent2.isLeaf()) {
					this._Leaf2Folder(oParent2);
				}
				var refNode = oParent2.getChildCount() > idx2 ? oParent2.getChildAt(idx2) : null;
				oParent2.addChildren(oNodes,idx2);
				for (i = 0; i < isize; i++) {
					this._attachNodeContent(oNodes[i],refNode);//
					oNodes[i] = null;
				}
				oNodes.length = 0;
				path2 = oNodes[0].getPath().concat();
				this._checkUI();//
				this._afterMove(path1,path2,count);
				tjs.lang.destroyArray(path2);
			}
		}
	},
	_beforeRestructure:function(){
		this.fire(tjs.data.BEFORE_RESTRUCTURE);
	},
	_afterRestructure:function(){
		this.fire(tjs.data.AFTER_RESTRUCTURE);
	},
	_afterInsert:function(path,count){
		this.fire(tjs.data.AFTER_INSERT,{path:path,count:count});
	},
	_afterUpdate:function(path,count){
		this.fire(tjs.data.AFTER_REPLACE,{path:path,count:count});
	},
	_beforeDelete:function(path,count){
		this.fire(tjs.data.BEFORE_DELETE,{path:path,count:count});
	},
	_afterDelete:function(path,count){
		this.fire(tjs.data.AFTER_DELETE,{path:path,count:count});
	},
	_beforeMove:function(path1,path2,count){
		this.fire(tjs.data.BEFORE_MOVE,{path1:path1,path2:path2,count:count});
	},
	_afterMove:function(path1,path2,count){
		this.fire(tjs.data.AFTER_MOVE,{path1:path1,path2:path2,count:count});
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
	_updateSelection:function(oNode){},
	_createRootContent:function(oNode){},
	_createNodeContent:function(oNode,refNode){},
	_updateNodeContent:function(oNode){},
	_destroyNodeContent:function(oNode){},
	_attachNodeContent:function(oNode,refNode){},
	_detachNodeContent:function(oNode){},
	_Folder2Leaf:function(oNode){},
	_Leaf2Folder:function(oNode){},
	_checkUI:function(){}
});

tjs.lang.defineTopClass('tjs.data.STree',
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
	setSelectedPath:function(path,fireEvent) {
		this.setSelectedNode(this.getNode(path),fireEvent);
	},
	setSelectedKey:function(key,fireEvent) {
		this.setSelectedNode(this.getNodeByKey(key),fireEvent);
	},
	setSelectedKeyPath:function(keyPath,fireEvent) {
		this.setSelectedNode(this.getNodeByKeyPath(keyPath),fireEvent);
	},
	getSelectedNode:function() {
		return this._selectedNode;
	},
	getSelectedData:function() {
		return this._selectedNode ? this._selectedNode.data : null;
	},
	getSelectedPath:function() {
		return this._selectedNode ? this._selectedNode.getPath() : null;
	},
	getSelectedKey:function() {
		return this._selectedNode ? this._selectedNode.data.getKey() : null;
	},
	getSelectedKeyPath:function() {
		return this._selectedNode ? this._selectedNode.getKeyPath() : null;
	},
	getSelectedText:function() {
		return this._selectedNode ? this._selectedNode.data.toString() : '';
	},
	_afterRestructure:function(){
		var selectedNodeOld = this._selectedNode;
		this._selectedNode = null;
		if (!this.isEmpty() && this._alwaysSelected) {
			if (this._hideRoot) {
				if (!this._root.isLeaf()) {
					this._selectedNode = this._root.children[0];
					this._setNodeSelection(this._selectedNode,true,true);
				}
			} else {
				this._selectedNode = this._root;
				this._setNodeSelection(this._selectedNode,true,true);
			}
		}
		if (this._selectedNode != selectedNodeOld) {
			this.fire(tjs.data.SELECTEDDATA_CHANGED,this._selectedNode);
			this.fire(tjs.data.VALUE_CHANGED);
		}
		this.fire(tjs.data.AFTER_RESTRUCTURE);
	},
	_afterInsert:function(path,count){
		if (this._selectOnInserted) {
			if (this._selectedNode) {
				this._setNodeSelection(this._selectedNode,false,true);
			}
			this._selectedNode = this.getNode(path);
			this._setNodeSelection(this._selectedNode,true,true);
			this.fire(tjs.data.SELECTEDDATA_CHANGED,this._selectedNode);
			this.fire(tjs.data.VALUE_CHANGED);
		}
		this.fire(tjs.data.AFTER_INSERT,{path:path,count:count});
	},
	_afterUpdate:function(path,count){
		if (this._selectedNode) {
			var selectedPath = this._selectedNode.getPath();
			if (tjs.data.TreeNode.sameParentPath(selectedPath,path)) {
				var idx1 = path[path.length - 1];
				var idx2 = selectedPath[selectedPath.length - 1];
				if (idx2 >= idx1 && idx2 < (idx1 + count)) {
					this.fire(tjs.data.SELECTEDDATA_CHANGED,this._selectedNode);
					this.fire(tjs.data.VALUE_CHANGED);
				}
			}
		}
		this.fire(tjs.data.AFTER_REPLACE,{path:path,count:count});
	},
	_afterDelete:function(path,count){
		if (this._selectedNode && this._selectedNode.destroyed) {
			this._selectedNode = null;
			if (this._alwaysSelected && path.length > 0) {
				if (this._hideRoot && path.length == 1) {
					if (!this._root.isLeaf()) {
						this._selectedNode = this._root.children[0];
						this._setNodeSelection(this._selectedNode,true,true);
					}
				} else {
					var idx = path.pop();
					this._selectedNode = this.getNode(path);
					path[path.length] = idx;
					this._setNodeSelection(this._selectedNode,true,true);
				}
			}
			this.fire(tjs.data.SELECTEDDATA_CHANGED,this._selectedNode);
			this.fire(tjs.data.VALUE_CHANGED);
		}
		this.fire(tjs.data.AFTER_DELETE,{path:path,count:count});
	}
});

tjs.lang.defineTopClass('tjs.data.MTree',
function() {
},{
	hasSelection:function(oNode) {
		return tjs.data.TreeNode.some(oNode || this._root, this.isNodeSelected, this);
	},
	unselectAll:function(fireEvent,oNode) {
		if (!this.isEmpty()) {
			if (!oNode) {
				oNode = this._root;
			}
			var s = [oNode];
			var changed = false, i;
			while (s.length > 0) {
				oNode = s.pop();
				if (this._setNodeSelection(oNode,false,fireEvent)) {
					changed = true;
				}
				if (!oNode.isLeaf()) {
					i = oNode.children.length;
					while (i--) {
						s[s.length] = oNode.children[i];
					}
				}
			}
			if (changed && fireEvent) {
				this.fire(tjs.data.VALUE_CHANGED);
			}
		}
	},
	_hasSelectedAncestor:function(oNode){
		var p = oNode.parent;
		while (p) {
			if (p.selected) {
				return true;
			}
			p = p.parent;
		}
		return false;
	},
	setNodeSelection:function(oNode,selected,fireEvent) {
		if (!oNode || oNode.selected == selected) {
			return;
		}
		if (selected && this._excludeDescendants) {
			if (this._hasSelectedAncestor(oNode)) {
				return;
			}
			this.unselectAll(false,oNode);
		}
		this._setNodeSelection(oNode,selected,fireEvent);
		if (fireEvent) {
			this.fire(tjs.data.VALUE_CHANGED);
		}
	},
	setPathSelection:function(path,selected,fireEvent) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isArray(path),'!tjs.lang.isArray(path) @'+this.classname+'.setPathSelection');
//tjs_debug_end
		this.setNodeSelection(this.getNode(path),selected,fireEvent);
	},
	setKeySelection:function(key,selected,fireEvent) {
		this.setNodeSelection(this.getNodeByKey(key),selected,fireEvent);
	},
	setKeyPathSelection:function(keyPath,selected,fireEvent) {
		this.setNodeSelection(this.getNodeByKeyPath(keyPath),selected,fireEvent);
	},
	isNodeSelected:function(oNode) {
		return oNode && oNode.selected;
	},
	isPathSelected:function(path){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isArray(path),'!tjs.lang.isArray(path) @'+this.classname+'.isPathSelected');
//tjs_debug_end
		return this.isNodeSelected(this.getNode(path));
	},
	isKeySelected:function(key) {
		return this.isNodeSelected(this.getNodeByKey(key));
	},
	setSelectedKeys:function(a, fireEvent) {
		if (!this.isEmpty()) {
			if (tjs.lang.isArray(a) && a.length > 0) {
				var o = {}, s = [this._root], i = a.length, changed = false, key, oNode, x, selected;
				while (i--) {
					key = a[i];
					o[String(key)] = key;
				}
				while (s.length > 0) {
					oNode = s.pop();
					key = oNode.data.getKey();
					x = String(key);
					selected = (x in o) && (o[x] == key);
					if (this._setNodeSelection(oNode,selected,fireEvent)) {
						changed = true;
					}
					if (!oNode.isLeaf()) {
						i = oNode.children.length;
						while (i--) {
							s[s.length] = oNode.children[i];
						}
					}
				}
				tjs.lang.destroyObject(o);
				if (changed && fireEvent) {
					this.fire(tjs.data.VALUE_CHANGED);
				}
			} else {
				this.unselectAll(fireEvent);
			}
		}
	},
	setSelectedKeyPaths:function(a, fireEvent) {
		if (!this.isEmpty()) {
			if (tjs.lang.isArray(a) && a.length > 0) {
				var o = {}, s = [this._root], i = a.length, changed = false, oNode;
				while (i--) {
					o[a[i]] = true;
				}
				while (s.length > 0) {
					oNode = s.pop();
					if (this._setNodeSelection(oNode,oNode.getKeyPath() in o,fireEvent)) {
						changed = true;
					}
					if (!oNode.isLeaf()) {
						i = oNode.children.length;
						while (i--) {
							s[s.length] = oNode.children[i];
						}
					}
				}
				tjs.lang.destroyObject(o);
				if (changed && fireEvent) {
					this.fire(tjs.data.VALUE_CHANGED);
				}
			} else {
				this.unselectAll(fireEvent);
			}
		}
	},
	getSelectedNodes:function(oNode) {
		return tjs.data.TreeNode.filter(oNode || this._root, this.isNodeSelected, this);
	},
	_selectData_:function(a,oNode){
		if (oNode.selected) {
			a[a.length] = oNode.data;
		}
		return a;
	},
	getSelectedDatas:function(){
		if (!this.isEmpty()) {
			var a = tjs.data.TreeNode.reduce(this._root,this._selectData_,[],this);
			if (a.length == 0) {
				a = null;
			}
			return a;
		}
		return null;
	},
	_selectKey_:function(a,oNode){
		if (oNode.selected) {
			a[a.length] = oNode.data.getKey();
		}
		return a;
	},
	getSelectedKeys:function(){
		if (!this.isEmpty()) {
			var a = tjs.data.TreeNode.reduce(this._root,this._selectKey_,[],this);
			if (a.length == 0) {
				a = null;
			}
			return a;
		}
		return null;
	},
	_selectKeyPath_:function(a,oNode){
		if (oNode.selected) {
			a[a.length] = oNode.getKeyPath();
		}
		return a;
	},
	getSelectedKeyPaths:function(){
		if (!this.isEmpty()) {
			var a = tjs.data.TreeNode.reduce(this._root,this._selectKeyPath_,[],this);
			if (a.length == 0) {
				a = null;
			}
			return a;
		}
		return null;
	},
	_selectText_:function(a,oNode) {
		if (oNode.selected) {
			a[a.length] = oNode.data.toString();
		}
		return a;
	},
	getSelectedText:function() {
		if (!this.isEmpty()) {
			var a = tjs.data.TreeNode.reduce(this._root,this._selectText_,[],this);
			if (a.length > 0) {
				var result = a.join(',');
				tjs.lang.destroyArray(a);
				return result;
			} else {
				return '';
			}
		}
		return '';
	}
});
