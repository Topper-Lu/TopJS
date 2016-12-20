tjs.lang.defineTopClass('tjs.data.TreeNode',
function(data) {
	if (data != null) {
		this.data = data;
	}
},{
	destroy:function() {
		if (!this.destroyed) {
			this._removePath(this);
			this._removeAncestors();
			if (this.children) {
				tjs.lang.destroyArray(this.children);
				delete this.children;
			}
			tjs.lang.destroyObject(this);
		}
	},
	clone:function(fClass,noData) {
//tjs_debug_start
		tjs.lang.assert(!fClass || tjs.lang.isSubClassOf(fClass,this.constructor),'!tjs.lang.isSubClassOf(fClass,this.constructor) @'+this.classname+'.clone');
//tjs_debug_end
		if (!fClass) {
			fClass = this.constructor;
		}
		var copyData = !noData;
		var oNode = new fClass();
		if (copyData) {
			oNode.data = this.data;
		}
		if (!this.isLeaf()) {
			var q = [this,oNode],currSrc,currDst,childSrc,childDst,i,isize;
			while (q.length > 0){
				currSrc = q.shift();
				currDst = q.shift();
				for (i = 0,isize = currSrc.children.length; i < isize; i++){
					childSrc = currSrc.children[i];
					childDst = new fClass();
					if (copyData) {
						childDst.data = childSrc.data;
					}
					currDst.addChild(childDst);
					if (!childSrc.isLeaf()) {
						q[q.length] = childSrc;
						q[q.length] = childDst;
					}
				}
			}
		}
		return oNode;
	},
	cloneChildren:function(idx,count,fClass,noData) {
//tjs_debug_start
		var len = this.getChildCount();
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.removeChildren');
		tjs.lang.assert(idx >= 0 && idx < len,'idx out of bounds! @'+this.classname+'.removeChildren');
		tjs.lang.assert(tjs.lang.isNumber(count),'!tjs.lang.isNumber(count) @'+this.classname+'.removeChildren');
		tjs.lang.assert(count > 0 && (idx + count) <= len,'count out of bounds! @'+this.classname+'.removeChildren');
		tjs.lang.assert(!fClass || tjs.lang.isSubClassOf(fClass,this.constructor),'!tjs.lang.isSubClassOf(fClass,this.constructor) @'+this.classname+'.clone');
//tjs_debug_end
		if (!fClass) {
			fClass = this.constructor;
		}
		var oNodes = this.children.slice(idx,idx + count);
		for (var i = 0; i < count; i++) {
			oNodes[i] = oNodes[i].clone(fClass,noData);
		}
		return oNodes;
	},
	setData:function(data) {
		this.data = data;
	},
	getData:function() {
		return this.data;
	},
	isLeaf:function() {
		return !this.children || this.children.length == 0;
	},
	isRoot:function() {
		return !this.parent;
	},
	isLastChild:function() {
		if (!this.parent) {
			return true;
		}
		var a = this.parent.children;
		return a[a.length - 1] == this;
	},
	isDescendant:function(oNode) {
//tjs_debug_start
		tjs.lang.assert(oNode instanceof tjs.data.TreeNode,'!(oNode instanceof tjs.data.TreeNode) @'+this.classname+'.isDescendant');
//tjs_debug_end
		do {
			if (this === oNode) {
				return true;
			}
			oNode = oNode.parent;
		} while (oNode);
		return false;
	},
	isAncestor:function(oNode) {
//tjs_debug_start
		tjs.lang.assert(oNode instanceof tjs.data.TreeNode,'!(oNode instanceof tjs.data.TreeNode) @'+this.classname+'.isAncestor');
//tjs_debug_end
		return oNode.isDescendant(this);
	},
	isSibling:function(oNode) {
//tjs_debug_start
		tjs.lang.assert(oNode instanceof tjs.data.TreeNode,'!(oNode instanceof tjs.data.TreeNode) @'+this.classname+'.isSibling');
//tjs_debug_end
		return oNode != this && oNode.parent && this.parent == oNode.parent;
	},
	getKeyPath:function() {
		if (!this.keyPath) {
			//this.keyPath = !this.parent ? ('/'+this.data.getKey()+'/') : (this.parent.getKeyPath()+this.data.getKey()+'/');
			this.keyPath = (!this.parent ? '/' : this.parent.getKeyPath()) + this.data.getKey() + '/';
		}
		return this.keyPath;
	},
	getPath:function() {
		if (!this.path) {
			this.path = !this.parent ? [] : this.parent.getPath().concat(this.parent.children.indexOf(this));
		}
		return this.path;
	},
	_removePath:function() {
		if (this.path) {
			tjs.lang.destroyArray(this.path);
			delete this.path;
		}
		if (this.keyPath) {
			delete this.keyPath;
		}
	},
	getAncestors:function() {
		if (!this.ancestors) {
			this.ancestors = !this.parent ? [this] : this.parent.getAncestors().concat(this);
		}
		return this.ancestors;
	},
	_removeAncestors:function() {
		if (this.ancestors) {
			tjs.lang.destroyArray(this.ancestors);
			delete this.ancestors;
		}
	},
	getParent:function() {
		return this.parent;
	},
	getChildren:function() {
		return this.children;
	},
	getChildCount:function() {
		return !this.children ? 0 : this.children.length;
	},
	getChildIndex:function(child) {
//tjs_debug_start
		tjs.lang.assert(child instanceof tjs.data.TreeNode,'!(child instanceof tjs.data.TreeNode) @'+this.classname+'.getChildIndex');
//tjs_debug_end
		return this.isLeaf() ? -1 : this.children.indexOf(child);
	},
	getChildAt:function(idx) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.getChildAt');
		tjs.lang.assert(idx >= 0 && idx < this.getChildCount(),'idx out of bounds! @'+this.classname+'.getChildAt');
//tjs_debug_end
		return this.children[idx];
	},
	getChildrenAt:function(idx,count) {
//tjs_debug_start
		var len = this.getChildCount();
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.removeChildren');
		tjs.lang.assert(idx >= 0 && idx < len,'idx out of bounds! @'+this.classname+'.removeChildren');
		tjs.lang.assert(tjs.lang.isNumber(count),'!tjs.lang.isNumber(count) @'+this.classname+'.removeChildren');
		tjs.lang.assert(count > 0 && (idx + count) <= len,'count out of bounds! @'+this.classname+'.removeChildren');
//tjs_debug_end
		return this.children.slice(idx,idx + count);
	},
	_removePaths:function(idx){
		for (var i = idx, isize = this.getChildCount(); i < isize; i++) {
			tjs.data.TreeNode._removePath(this.children[i]);
		}
	},
	addChildrenDatas:function(datas,idx) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isArray(datas) && datas.length > 0,'!tjs.lang.isArray(datas) @'+this.classname+'.addChildren');
//tjs_debug_end
		var len = this.getChildCount();
		if (idx == null) {
			idx = len;
		}
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.addChildren');
		tjs.lang.assert(idx >= 0 && idx <= len,'idx out of bounds! @'+this.classname+'.addChildren');
//tjs_debug_end
		if (!this.children) {
			this.children = [];
		}
		var a = this.children;
		var isize = datas.length;
		var i,j,oNode;
		if (idx < len) {
			this._removePaths(idx);
			for (i = len - 1; i >= idx; i--) {
				a[i+isize] = a[i];
			}
		}
		var oNodes = [];
		for (i = 0, j = idx; i < isize; i++, j++) {
			oNode = new tjs.data.TreeNode(datas[i]);
			oNode.parent = this;
			a[j] = oNode;
			oNodes[i] = oNode;
		}
		return oNodes;
	},
	addChildren:function(oNodes,idx) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isArray(oNodes) && oNodes.length > 0,'!tjs.lang.isArray(oNodes) @'+this.classname+'.addChildren');
//tjs_debug_end
		var len = this.getChildCount();
		if (idx == null) {
			idx = len;
		}
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.addChildren');
		tjs.lang.assert(idx >= 0 && idx <= len,'idx out of bounds! @'+this.classname+'.addChildren');
//tjs_debug_end
		if (!this.children) {
			this.children = [];
		}
		var a = this.children;
		var isize = oNodes.length;
		var i,j,oNode;
		if (idx < len) {
			this._removePaths(idx);
			for (i = len - 1; i >= idx; i--) {
				a[i+isize] = a[i];
			}
		}
		for (i = 0, j = idx; i < isize; i++, j++) {
			oNode = oNodes[i];
			oNode.parent = this;
			a[j] = oNode;
		}
	},
	addChildData:function(data,idx) {
		var oNode = new tjs.data.TreeNode(data);
		this.addChild(oNode,idx);
		return oNode;
	},
	addChild:function(child,idx) {
//tjs_debug_start
		tjs.lang.assert(child instanceof tjs.data.TreeNode,'!(child instanceof tjs.data.TreeNode) @'+this.classname+'.addChild');
//tjs_debug_end
		var len = this.getChildCount();
		if (idx == null) {
			idx = len;
		}
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.addChild');
		tjs.lang.assert(idx >= 0 && idx <= len,'idx out of bounds! @'+this.classname+'.addChild');
//tjs_debug_end
		if (!this.children) {
			this.children = [];
		}
		var a = this.children;
		child.parent = this;
		if (idx == len) {
			a[a.length] = child;
		} else if (idx == 0) {
			this._removePaths(idx);
			a.unshift(child);
		} else {
			this._removePaths(idx);
			a.splice(idx,0,child);
		}
	},
	removeChildren:function(idx,count) {
//tjs_debug_start
		var len = this.getChildCount();
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.removeChildren');
		tjs.lang.assert(idx >= 0 && idx < len,'idx out of bounds! @'+this.classname+'.removeChildren');
		tjs.lang.assert(tjs.lang.isNumber(count),'!tjs.lang.isNumber(count) @'+this.classname+'.removeChildren');
		tjs.lang.assert(count > 0 && (idx + count) <= len,'count out of bounds! @'+this.classname+'.removeChildren');
//tjs_debug_end
		this._removePaths(idx);
		var childNodes = this.children.splice(idx,count);
		if (this.children.length == 0) {
			delete this.children;
		}
		var child;
		while (count--) {
			child = childNodes[count];
			tjs.data.TreeNode._removeAncestors(child);
			delete child.parent;
		}
		return childNodes;
	},
	removeChild:function(idx) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.removeChild');
		tjs.lang.assert(idx >= 0 && idx < this.getChildCount(),'idx out of bounds! @'+this.classname+'.removeChild');
//tjs_debug_end
		this._removePaths(idx);
		var child = this.children.splice(idx,1)[0];
		if (this.children.length == 0) {
			delete this.children;
		}
		tjs.data.TreeNode._removeAncestors(child);
		delete child.parent;
		return child;
	},
	removeFromParent:function() {
		if (this.parent) {
			this.parent.removeChild(this.parent.children.lastIndexOf(this));
		}
	}
});
tjs.lang.extend(tjs.data.TreeNode,{
	some:function(oNode,fHandler,oThis) {
//tjs_debug_start
		tjs.lang.assert(!oNode || (oNode instanceof tjs.data.TreeNode),'!(oNode instanceof tjs.data.TreeNode) @'+this.classname+'.some');
		tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.some');
//tjs_debug_end
		if (oNode) {
			var s = [oNode],i;
			while (s.length > 0) {
				oNode = s.pop();
				if (fHandler.call(oThis,oNode)) {
					tjs.lang.destroyArray(s);
					return true;
				}
				if (!oNode.isLeaf()) {
					i = oNode.children.length;
					while (i--) {
						s[s.length] = oNode.children[i];
					}
				}
			}
		}
		return false;
	},
	every:function(oNode,fHandler,oThis) {
//tjs_debug_start
		tjs.lang.assert(!oNode || (oNode instanceof tjs.data.TreeNode),'!(oNode instanceof tjs.data.TreeNode) @'+this.classname+'.every');
		tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.every');
//tjs_debug_end
		if (oNode) {
			var s = [oNode],i;
			while (s.length > 0) {
				oNode = s.pop();
				if (!fHandler.call(oThis,oNode)) {
					tjs.lang.destroyArray(s);
					return false;
				}
				if (!oNode.isLeaf()) {
					i = oNode.children.length;
					while (i--) {
						s[s.length] = oNode.children[i];
					}
				}
			}
		}
		return true;
	},
	filter:function(oNode,fHandler,oThis) {
//tjs_debug_start
		tjs.lang.assert(!oNode || (oNode instanceof tjs.data.TreeNode),'!(oNode instanceof tjs.data.TreeNode) @'+this.classname+'.filter');
		tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.filter');
//tjs_debug_end
		if (oNode) {
			var a = [];
			var s = [oNode],i;
			while (s.length > 0) {
				oNode = s.pop();
				if (fHandler.call(oThis,oNode)) {
					a[a.length] = oNode;
				}
				if (!oNode.isLeaf()) {
					i = oNode.children.length;
					while (i--) {
						s[s.length] = oNode.children[i];
					}
				}
			}
			return a.length > 0 ? a : null;
		} else {
			return null;
		}
	},
	reduce:function(oNode,fHandler,value,oThis) {
//tjs_debug_start
		tjs.lang.assert(!oNode || (oNode instanceof tjs.data.TreeNode),'!(oNode instanceof tjs.data.TreeNode) @'+this.classname+'.filter');
		tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.filter');
//tjs_debug_end
		if (oNode) {
			var s = [oNode],i;
			while (s.length > 0) {
				oNode = s.pop();
				value = fHandler.call(oThis,value,oNode);
				if (!oNode.isLeaf()) {
					i = oNode.children.length;
					while (i--) {
						s[s.length] = oNode.children[i];
					}
				}
			}
		}
		return value;
	},
	visitPreOrder:function(oNode,fHandler,oThis) {
//tjs_debug_start
		tjs.lang.assert(oNode instanceof tjs.data.TreeNode,'!(oNode instanceof tjs.data.TreeNode) @'+this.classname+'.visitPreOrder');
		tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.visitPreOrder');
//tjs_debug_end
		var s = [oNode],i;
		while (s.length > 0) {
			oNode = s.pop();
			fHandler.call(oThis,oNode);
			if (!oNode.isLeaf()) {
				i = oNode.children.length;
				while (i--) {
					s[s.length] = oNode.children[i];
				}
			}
		}
	},
	visitPostOrder:function(oNode,fHandler,oThis) {
//tjs_debug_start
		tjs.lang.assert(oNode instanceof tjs.data.TreeNode,'!(oNode instanceof tjs.data.TreeNode) @'+this.classname+'.visitPostOrder');
		tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.visitPostOrder');
//tjs_debug_end
		var s = [oNode],i,isize;
		var pop = false;
		while (s.length > 0) {
			oNode = s[s.length - 1];
			if (oNode.childrenHandled) {
				delete oNode.childrenHandled;
				pop = true;
			} else {
				if (oNode.isLeaf()) {
					pop = true;
				} else {
					oNode.childrenHandled = true;
					isize = oNode.children.length;
					for (i = 0; i < isize; i++) {
						s[s.length] = oNode.children[i];
					}
				}
			}
			if (pop) {
				s.length--;
				fHandler.call(oThis,oNode);
				pop = false;
			}
		}
	},
	visitLevelOrder:function(oNode,fHandler,oThis) {
//tjs_debug_start
		tjs.lang.assert(oNode instanceof tjs.data.TreeNode,'!(oNode instanceof tjs.data.TreeNode) @'+this.classname+'.visitLevelOrder');
		tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.visitLevelOrder');
//tjs_debug_end
		var q = [oNode],i,isize;
		while (q.length > 0) {
			oNode = q.shift();
			fHandler.call(oThis,oNode);
			if (!oNode.isLeaf()) {
				isize = oNode.children.length;
				for (i = 0; i < isize; i++) {
					q[q.length] = oNode.children[i];
				}
			}
		}
	},
	visitRoundTrip:function(oNode,fPreHandler,fPostHandler,oThis) {
//tjs_debug_start
		tjs.lang.assert(oNode instanceof tjs.data.TreeNode,'!(oNode instanceof tjs.data.TreeNode) @'+this.classname+'.visitRoundTrip');
		tjs.lang.assert(tjs.lang.isFunction(fPreHandler),'!tjs.lang.isFunction(fPreHandler) @'+this.classname+'.visitRoundTrip');
		tjs.lang.assert(tjs.lang.isFunction(fPostHandler),'!tjs.lang.isFunction(fPostHandler) @'+this.classname+'.visitRoundTrip');
//tjs_debug_end
		var s = [oNode],i,isize;
		var pop = false;
		while (s.length > 0) {
			oNode = s[s.length - 1];
			if (oNode.childrenHandled) {
				delete oNode.childrenHandled;
				pop = true;
			} else {
				fPreHandler.call(oThis,oNode);
				if (oNode.isLeaf()) {
					pop = true;
				} else {
					oNode.childrenHandled = true;
					isize = oNode.children.length;
					for (i = 0; i < isize; i++) {
						s[s.length] = oNode.children[i];
					}
				}
			}
			if (pop) {
				s.length--;
				fPostHandler.call(oThis,oNode);
				pop = false;
			}
		}
	},
	destroyNode:function(oNode) {
//tjs_debug_start
		tjs.lang.assert(oNode instanceof tjs.data.TreeNode,'!(oNode instanceof tjs.data.TreeNode) @'+this.classname+'.destroyNode');
//tjs_debug_end
		this.visitPostOrder(oNode,tjs.util.destructor);
	},
	_removePathHandler:function(oNode) {
		oNode._removePath();
	},
	_removePath:function(oNode) {
		this.visitPostOrder(oNode,this._removePathHandler);
	},
	_removeAncestorsHandler:function(oNode) {
		oNode._removeAncestors();
	},
	_removeAncestors:function(oNode) {
		this.visitPostOrder(oNode,this._removeAncestorsHandler);
	},
	isAncestorPathOf:function(path1,path2){
		if (!tjs.lang.isArray(path1) || !tjs.lang.isArray(path2)) {
			return false;
		} else if (path1 === path2) {
			return true;
		} else if (path1.length <= path2.length) {
			for (var i = 0, isize = path1.length; i < isize; i++) {
				if (path1[i] != path2[i]) {
					return false;
				}
			}
			return true;
		} else {
			return false;
		}
	},
	sameParentPath:function(path1,path2){
		if (!tjs.lang.isArray(path1) || !tjs.lang.isArray(path2)) {
			return false;
		} else if (path1 === path2) {
			return true;
		} else if (path1.length == path2.length) {
			for (var i = 0, isize = path1.length - 1; i < isize; i++) {
				if (path1[i] != path2[i]) {
					return false;
				}
			}
			return true;
		} else {
			return false;
		}
	},
	samePath:function(path1,path2){
		if (!tjs.lang.isArray(path1) || !tjs.lang.isArray(path2)) {
			return false;
		} else if (path1 === path2) {
			return true;
		} else if (path1.length == path2.length) {
			for (var i = 0, isize = path1.length; i < isize; i++) {
				if (path1[i] != path2[i]) {
					return false;
				}
			}
			return true;
		} else {
			return false;
		}
	},
	search:function(oNode,fHandler,value,oThis) {
//tjs_debug_start
		tjs.lang.assert(oNode instanceof tjs.data.TreeNode,'!(oNode instanceof tjs.data.TreeNode) @'+this.classname+'.search');
		tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.search');
//tjs_debug_end
		var s = [oNode], i, k;
		while (s.length > 0) {
			oNode = s.pop();
			if (fHandler.call(oThis,oNode.data,value)) {
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
		return null;
	},
	createNode:function(oPack,fClass) {
		var isObject = tjs.lang.isObject;
//tjs_debug_start
		tjs.lang.assert(isObject(oPack),'!isObject(oPack) @'+this.classname+'.createNode');
		tjs.lang.assert(!fClass || tjs.lang.isFunction(fClass),'!tjs.lang.isFunction(fClass) @'+this.classname+'.createNode');
//tjs_debug_end
		var fn = tjs.data.TreeNode;
		var isArray = tjs.lang.isArray;
		var f;
		if (fClass) {
			f = function(data) {
				return new fn(new fClass(data));
			};
		} else {
			f = function(data) {
				return new fn(data);
			};
		}
		var oNode = oPack.data ? f(oPack.data) : new fn(null);
		delete oPack.data;
		var a = oPack.children;
		if (a) {
			delete oPack.children;
			if (isArray(a) && a.length > 0) {
				var q = [oNode,a],currNode,childNode,i,isize,b;
				while (q.length > 0){
					currNode = q.shift();
					b = q.shift();
					for (i = 0, isize = b.length; i < isize; i++){
						oPack = b[i];
						b[i] = null;
						if (isObject(oPack)) {
							childNode = f(oPack.data);
							delete oPack.data;
							a = oPack.children;
							if (a) {
								delete oPack.children;
								if (isArray(a) && a.length > 0) {
									q[q.length] = childNode;
									q[q.length] = a;
								}
							}
							currNode.addChild(childNode);
						}
					}
					b.length = 0;
				}
			}
		}
		return oNode;
	},
	createNode2:function(data,fClass) {
		var isObject = tjs.lang.isObject;
		var isArray = tjs.lang.isArray;
//tjs_debug_start
		tjs.lang.assert(isObject(data),'!isObject(data) @'+this.classname+'.createNode');
		tjs.lang.assert(!fClass || tjs.lang.isFunction(fClass),'!tjs.lang.isFunction(fClass) @'+this.classname+'.createNode');
//tjs_debug_end
		var fn = tjs.data.TreeNode;
		var f;
		if (fClass) {
			f = function(data) {
				return new fn(new fClass(data));
			};
		} else {
			f = function(data) {
				return new fn(data);
			};
		}
		var oNode = data ? f(data) : new fn(null);
		var a = oNode.data.children;
		if (a) {
			if (isArray(a) && a.length > 0) {
				var q = [oNode],b,currNode,childNode,i,isize;
				while (q.length > 0){
					currNode = q.shift();
					b = currNode.data.children;
					delete currNode.data.children;
					for (i = 0, isize = b.length; i < isize; i++){
						data = b[i];
						b[i] = null;
						if (isObject(data)) {
							childNode = f(data);
							a = childNode.data.children;
							if (a) {
								if (isArray(a) && a.length > 0) {
									q[q.length] = childNode;
								} else {
									delete childNode.data.children;
								}
							}
							currNode.addChild(childNode);
						}
					}
					b.length = 0;
				}
			} else {
				delete oNode.data.children;
			}
		}
		return oNode;
	}
});
