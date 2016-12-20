if (typeof(Node) == 'undefined') {
	var Node = {
		ELEMENT_NODE: 1,
		ATTRIBUTE_NODE: 2,
		TEXT_NODE: 3,
		CDATA_SECTION_NODE: 4,
		ENTITY_REFERENCE_NODE: 5,
		ENTITY_NODE: 6,
		PROCESSING_INSTRUCTION_NODE: 7,
		COMMENT_NODE: 8,
		DOCUMENT_NODE: 9,
		DOCUMENT_TYPE_NODE: 10,
		DOCUMENT_FRAGMENT_NODE: 11,
		NOTATION_NODE: 12
	};
}
tjs.dom = (function(){
	var _parseXML = function(xml) {
		throw new Error('No support for parseXML!');
	};
	var _serializeXML = function(xmldom) {
		throw new Error('No support for serializeXML!');
	};
	if (window.DOMParser) {
		var _DOMParser = new DOMParser();
		var _XMLSerializer = new XMLSerializer();
		_parseXML = function(xml) {
			var xmldom = _DOMParser.parseFromString(xml,"text/xml");
			var errors = xmldom.getElementsByTagName("parsererror");
			if (errors.length > 0) {
				return null;
			} else {
				return xmldom;
			}
		};
		_serializeXML = function(xmldom) {
			return _XMLSerializer.serializeToString(xmldom);
		};
	} else if (window.ActiveXObject) {
		var _MSXMLDOM = function() {
			var msXMLDOMs = ['MSXML2.DOMDocument.6.0','MSXML2.DOMDocument.3.0','MSXML2.DOMDocument','Microsoft.XmlDom'];
			for (var i = 0, isize = msXMLDOMs.length; i < isize; i++) {
				try {
					new ActiveXObject(msXMLDOMs[i]);
					return msXMLDOMs[i];
				} catch (oError) {
				}
			}
			return null;
		}();
		if (_MSXMLDOM) {
			_parseXML = function(xml) {
				var xmldom = new ActiveXObject(_MSXMLDOM);
				//xmldom.async = false;
				xmldom.loadXML(xml);
				if (xmldom.parseError != 0) {
					return null;
				} else {
					return xmldom;
				}
			};
		}
		_serializeXML = function(xmldom) {
			return xmldom.xml;
		};
	}
return {
	parseXML:_parseXML,
	serializeXML:_serializeXML,
	/**
	 * @method tjs.dom.isNode
	 * Determines whether a given object is a DOM Node.
	 *
	 * @param oNode: Any
	 * The given object to test
	 *
	 * @return Boolean
	 * Return true if node's nodeType equals Node.ELEMENT_NODE.
	 */
	isNode:function(oNode) {
		return oNode && oNode.nodeType;
	},

	/**
	 * @method tjs.dom.isElement
	 * Determines whether a given object is a DOM Node with nodeType equals Node.ELEMENT_NODE.
	 *
	 * @param oNode: Any
	 * The given object to test
	 *
	 * @return Boolean
	 * Return true if node's nodeType equals Node.ELEMENT_NODE.
	 */
	isElement:function(oNode) {
		return oNode && oNode.nodeType && oNode.nodeType == Node.ELEMENT_NODE;
	},

	/**
	 * @method tjs.dom.isAncestorOf
	 * Determines whether a given node is a ancestor of another given node.
	 *
	 * @param oNode: Node
	 * The ancestor Node to test
	 * @param oDescendant: Node
	 * The descendant Node to test
	 * @return Boolean
	 * Return true if oNode is a ancestor of oDescendant, false otherwise.
	 */
	isAncestorOf:function(oNode,oDescendant) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.isAncestorOf');
		tjs.lang.assert(this.isNode(oDescendant),'!this.isNode(oDescendant) @'+this.classname+'.isAncestorOf');
//tjs_debug_end
		do {
			if (oDescendant === oNode) {
				return true;
			}
			oDescendant = oDescendant.parentNode;
		} while (oDescendant);
		return false;
	},
	/**
	 * @method tjs.dom.isDescendantOf
	 * Determines whether a given node is a descendant of another given node.
	 *
	 * @param oNode: Node
	 * The descendant Node to test
	 * @param oAncestor: Node
	 * The ancestor Node to test
	 * @return Boolean
	 * Return true if oNode is a descendant of oAncestor, false otherwise.
	 */
	isDescendantOf:function(oNode,oAncestor) {
		return this.isAncestorOf(oAncestor,oNode);
	},

	/**
	 * Determines whether a node is present in the current document.
	 *
	 * @param	{Node} oNode:
	 * The Node to search for
	 * @return	{boolean}
	 * Return true if the oNode is present in the current document, false otherwise.
	 */
	inDocument:function(oNode) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.inDocument');
//tjs_debug_end
		return this.isAncestorOf(document.documentElement,oNode);
		//return Boolean(oNode.ownerDocument);
	},

	/**
	 * Clean unnecessary TextNode from a given node.
	 *
	 * @param	{Node} oNode:
	 * The given node
	 */
	cleanWhiteSpace:function(oNode) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.cleanWhiteSpace');
//tjs_debug_end
		var nonWhite = /\S/,oChild,currChild;
		oNode.normalize();
		if (oNode.hasChildNodes()) {
			var s = [oNode];
			while (s.length > 0) {
				oNode = s.pop();
				oChild = oNode.lastChild;
				do {
					currChild = oChild;
					oChild = oChild.previousSibling;
					if (currChild.nodeType == Node.TEXT_NODE && !nonWhite.test(currChild.nodeValue)) {
						oNode.removeChild(currChild);
					} else if (currChild.hasChildNodes()) {
						s[s.length] = currChild;
					}
				} while (oChild);
			}
		}
	},

	/**
	 * Move all children nodes from a node to another node.
	 *
	 * @param	{Node} srcNode:
	 * The Node to remove children from
	 * @param	{Node} dstNode:
	 * The Node to insert children to
	 */
	moveChildren:function(srcNode,dstNode) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(srcNode),'!this.isNode(srcNode) @'+this.classname+'.moveChildren');
		tjs.lang.assert(this.isNode(dstNode),'!this.isNode(dstNode) @'+this.classname+'.moveChildren');
//tjs_debug_end
		var nonWhite = /\S/,count = 0,oChild,currChild;
		if (srcNode.hasChildNodes()) {
			oChild = srcNode.firstChild;
			do {
				currChild = oChild;
				oChild = oChild.nextSibling;
				srcNode.removeChild(currChild);
				if (currChild.nodeType != Node.TEXT_NODE || nonWhite.test(currChild.nodeValue)) {
					dstNode.appendChild(currChild);
					count++;
				}
			} while (oChild);
		}
		return count;
	},

	/**
	 * Copy all children nodes from a node to another node.
	 *
	 * @param	{Node} srcNode:
	 * The Node to copy children from
	 * @param	{Node} dstNode:
	 * The Node to insert children to
	 */
	copyChildren:function(srcNode,dstNode) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(srcNode),'!this.isNode(srcNode) @'+this.classname+'.copyChildren');
		tjs.lang.assert(this.isNode(dstNode),'!this.isNode(dstNode) @'+this.classname+'.copyChildren');
//tjs_debug_end
		var count = 0;
		if (srcNode.hasChildNodes()) {
			var oNode = srcNode.firstChild;
			do {
				dstNode.appendChild(this.cloneNode(oNode,true));
				count++;
				oNode = oNode.nextSibling;
			} while (oNode);
		}
		return count;
	},

	/**
	 * Remove all children nodes from a given node.
	 *
	 * @param	{Node} oNode:
	 * The Node to remove children from
	 */
	removeChildren:function(oNode) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.removeChildren');
//tjs_debug_end
		if (oNode.hasChildNodes()) {
			var count = oNode.childNodes.length;
			//oNode.innerHTML = '';
			var i = count;
			while (i--) {
				oNode.removeChild(oNode.childNodes[i]);
			}
			return count;
		} else {
			return 0;
		}
	},

	/**
	 * Remove a node from parent Node.
	 *
	 * @param	{Node} oNode:
	 * The Node to be removed
	 */
	removeNode:function(oNode) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.removeNode');
//tjs_debug_end
		var p = oNode.parentNode;
		if (p && p.nodeType != Node.DOCUMENT_FRAGMENT_NODE) {
			p.removeChild(oNode);
		}
	},
	replaceNode:function(newNode,oldNode) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(newNode),'!this.isNode(newNode) @'+this.classname+'.replaceNode');
		tjs.lang.assert(this.isNode(oldNode),'!this.isNode(oldNode) @'+this.classname+'.replaceNode');
//tjs_debug_end
		var p = newNode.parentNode;
		if (p && p.nodeType != Node.DOCUMENT_FRAGMENT_NODE) {
			p.removeChild(newNode);
		}
		p = oldNode.parentNode;
		if (p && p.nodeType != Node.DOCUMENT_FRAGMENT_NODE) {
			p.replaceChild(newNode,oldNode);
		}
	},
	moveNode:function(oNode,toParentNode) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.moveNode');
		tjs.lang.assert(this.isNode(toParentNode),'!this.isNode(toParentNode) @'+this.classname+'.moveNode');
//tjs_debug_end
		var p = oNode.parentNode;
		if (p != toParentNode) {
			if (p && p.nodeType != Node.DOCUMENT_FRAGMENT_NODE) {
				p.removeChild(oNode);
			}
			toParentNode.appendChild(oNode);
		}
	},

	/**
	 * Prepend a node to the given parent Node.
	 *
	 * @param	{Node} oNode:
	 * The Node to be inserted
	 * @param	{Node} parentNode:
	 * The parent Node
	 */
	prependChild:function(oNode,parentNode) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.prependChild');
		tjs.lang.assert(this.isNode(parentNode),'!this.isNode(parentNode) @'+this.classname+'.prependChild');
		tjs.lang.assert(parentNode != oNode,'parentNode == oNode @'+this.classname+'.prependChild');
//tjs_debug_end
		if (parentNode.hasChildNodes()) {
			parentNode.insertBefore(oNode,parentNode.firstChild);
		} else {
			parentNode.appendChild(oNode);
		}
	},

	/**
	 * Insert a node before the given reference node.
	 *
	 * @param	{Node} oNode:
	 * The Node to be inserted
	 * @param	{Node} refNode:
	 * The reference Node
	 */
	insertBefore:function(oNode,refNode) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.insertBefore');
		tjs.lang.assert(this.isNode(refNode),'!this.isNode(refNode) @'+this.classname+'.insertBefore');
		tjs.lang.assert(Boolean(refNode.parentNode),'!refNode.parentNode @'+this.classname+'.insertBefore');
		tjs.lang.assert(refNode != oNode,'refNode == oNode @'+this.classname+'.insertBefore');
//tjs_debug_end
		refNode.parentNode.insertBefore(oNode,refNode);
	},

	/**
	 * Insert a node after the given reference node.
	 *
	 * @param	{Node} oNode:
	 * The Node to be inserted
	 * @param	{Node} refNode:
	 * The reference Node
	 */
	insertAfter:function(oNode,refNode) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.insertAfter');
		tjs.lang.assert(this.isNode(refNode),'!this.isNode(refNode) @'+this.classname+'.insertAfter');
		tjs.lang.assert(Boolean(refNode.parentNode),'!refNode.parentNode @'+this.classname+'.insertAfter');
		tjs.lang.assert(refNode != oNode,'refNode == oNode @'+this.classname+'.insertAfter');
//tjs_debug_end
		if (refNode.nextSibling) {
			 refNode.parentNode.insertBefore(oNode,refNode.nextSibling);
		} else {
		 	refNode.parentNode.appendChild(oNode);
		}
	},
	getIndex:function(oNode){
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.getIndex');
		tjs.lang.assert(Boolean(oNode.parentNode),'!refNode.parentNode @'+this.classname+'.getIndex');
//tjs_debug_end
		var a = oNode.parentNode.childNodes;
		for (var i = 0, isize = a.length; i < isize; i++) {
			if (oNode == a[i]) {
				return i;
			}
		}
		return -1;
	},

	_stackChildren:function(oNode,s) {
		var k = s.length;
		if (oNode.children) {
			var a = oNode.children, i = a.length;
			while (i--) {
				s[k++] = a[i];
			}
		} else {
			var o = oNode.lastChild;
			while (o) {
				if (o.nodeType == Node.ELEMENT_NODE) {
					s[k++] = o;
				}
				o = o.previousSibling;
			}
		}
	},
	_queueChildren:function(oNode,q) {
		var k = q.length;
		if (oNode.children) {
			var a = oNode.children;
			for (var i = 0, isize = a.length; i < isize; i++) {
				q[k++] = a[i];
			}
		} else {
			var o = oNode.firstChild;
			while (o) {
				if (o.nodeType == Node.ELEMENT_NODE) {
					q[k++] = o;
				}
				o = o.nextSibling;
			}
		}
	},

	visitPreOrder:function(oNode,fHandler) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.visitPreOrder');
		tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.visitPreOrder');
//tjs_debug_end
		var s = [oNode];
		while (s.length > 0) {
			oNode = s.pop();
			fHandler(oNode);
			if (oNode.hasChildNodes()) {
				this._stackChildren(oNode,s);
			}
		}
	},

	visitPostOrder:function(oNode,fHandler) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.visitPostOrder');
		tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.visitPostOrder');
//tjs_debug_end
		var s = [oNode];
		var pop = false;
		while (s.length > 0) {
			oNode = s[s.length - 1];
			if (oNode.getAttribute('childrenHandled')) {
				oNode.removeAttribute('childrenHandled');
				pop = true;
			} else {
				if (oNode.hasChildNodes()) {
					oNode.setAttribute('childrenHandled','1');
					this._stackChildren(oNode,s);
				} else {
					pop = true;
				}
			}
			if (pop) {
				s.length--;
				fHandler(oNode);
				pop = false;
			}
		}
	},

	visitLevelOrder:function(oNode,fHandler) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.visitLevelOrder');
		tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.visitLevelOrder');
//tjs_debug_end
		var q = [oNode];
		while (q.length > 0) {
			oNode = q.shift();
			fHandler(oNode);
			if (oNode.hasChildNodes()) {
				this._queueChildren(oNode,q);
			}
		}
	},

	visitRoundTrip:function(oNode,fPreHandler,fPostHandler) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.visitRoundTrip');
		tjs.lang.assert(tjs.lang.isFunction(fPreHandler),'!tjs.lang.isFunction(fPreHandler) @'+this.classname+'.visitRoundTrip');
		tjs.lang.assert(tjs.lang.isFunction(fPostHandler),'!tjs.lang.isFunction(fPostHandler) @'+this.classname+'.visitRoundTrip');
//tjs_debug_end
		var s = [oNode];
		var pop = false;
		while (s.length > 0) {
			oNode = s[s.length - 1];
			if (oNode.getAttribute('childrenHandled')) {
				oNode.removeAttribute('childrenHandled');
				pop = true;
			} else {
				fPreHandler(oNode);
				if (oNode.hasChildNodes()) {
					oNode.setAttribute('childrenHandled','1');
					this._stackChildren(oNode,s);
				} else {
					pop = true;
				}
			}
			if (pop) {
				s.length--;
				fPostHandler(oNode);
				pop = false;
			}
		}
	},

	/**
	 * Filter the subtree of a given Node.
	 *
	 * @param	{Node} oNode:
	 * A given DOM Node.
	 * @param	{function} fFilter:
	 * The filter function, boolean (Node)
	 * @return	{Array}
	 * An array of DOM Nodes, may be empty.
	 */
	filterPreOrder:function(oNode,fFilter) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.filterPreOrder');
		tjs.lang.assert(tjs.lang.isFunction(fFilter),'!tjs.lang.isFunction(fFilter) @'+this.classname+'.filterPreOrder');
//tjs_debug_end
		var a = [];
		var s = [oNode];
		while (s.length > 0) {
			oNode = s.pop();
			if (fFilter(oNode)) {
				a[a.length] = oNode;
			}
			if (oNode.hasChildNodes()) {
				this._stackChildren(oNode,s);
			}
		}
		return a;
	},

	/**
	 * Filter the subtree of a given Node.
	 *
	 * @param	{Node} oNode:
	 * A given DOM Node.
	 * @param	{function} fFilter:
	 * The filter function, boolean (Node)
	 * @return	{Array}
	 * An array of DOM Nodes, may be empty.
	 */
	filterPostOrder:function(oNode,fFilter) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.filterPostOrder');
		tjs.lang.assert(tjs.lang.isFunction(fFilter),'!tjs.lang.isFunction(fFilter) @'+this.classname+'filterPostOrder');
//tjs_debug_end
		var a = [];
		var s = [oNode];
		var pop = false;
		while (s.length > 0) {
			oNode = s[s.length - 1];
			if (oNode.getAttribute('childrenHandled')) {
				oNode.removeAttribute('childrenHandled');
				pop = true;
			} else {
				if (oNode.hasChildNodes()) {
					oNode.setAttribute('childrenHandled','1');
					this._stackChildren(oNode,s);
				} else {
					pop = true;
				}
			}
			if (pop) {
				s.length--;
				if (fFilter(oNode)) {
					a[a.length] = oNode;
				}
				pop = false;
			}
		}
		return a;
	},

	/**
	 * Filter the subtree of a given Node.
	 *
	 * @param	{Node} oNode:
	 * A given DOM Node.
	 * @param	{function} fFilter:
	 * The filter function, boolean (Node)
	 * @return	{Array}
	 * An array of DOM Nodes, may be empty.
	 */
	filterLevelOrder:function(oNode,fFilter) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.filterLevelOrder');
		tjs.lang.assert(tjs.lang.isFunction(fFilter),'!tjs.lang.isFunction(fFilter) @'+this.classname+'.filterLevelOrder');
//tjs_debug_end
		var a = [];
		var q = [oNode];
		while (q.length > 0) {
			oNode = q.shift();
			if (fFilter(oNode)) {
				a[a.length] = oNode;
			}
			if (oNode.hasChildNodes()) {
				this._queueChildren(oNode,q);
			}
		}
		return a;
	},

	/**
	 * Search the subtree of a given Node.
	 *
	 * @param	{Node} oNode:
	 * A given DOM Node.
	 * @param	{function} fFilter:
	 * The filter function, boolean (Node)
	 * @return	{Node}
	 * A DOM Node, may be null.
	 */
	searchPreOrder:function(oNode,fFilter) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.searchPreOrder');
		tjs.lang.assert(tjs.lang.isFunction(fFilter),'!tjs.lang.isFunction(fFilter) @'+this.classname+'.searchPreOrder');
//tjs_debug_end
		var s = [oNode];
		while (s.length > 0) {
			oNode = s.pop();
			if (fFilter(oNode)) {
				tjs.lang.destroyArray(s);
				return oNode;
			}
			if (oNode.hasChildNodes()) {
				this._stackChildren(oNode,s);
			}
		}
		return null;
	},

	/**
	 * Filter the ancestor of a given Node.
	 *
	 * @param	{Node} oNode:
	 * A given DOM Node.
	 * @param	{function} fFilter:
	 * The filter function, boolean (Node)
	 * @return	{Element}
	 * A DOM Element, may be null.
	 */
	getAncestor:function(oNode,fFilter,stopAncestor) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.getAncestor');
		tjs.lang.assert(tjs.lang.isFunction(fFilter),'!tjs.lang.isFunction(fFilter) @'+this.classname+'.getAncestor');
//tjs_debug_end
		if (!this.isNode(stopAncestor)) {
			stopAncestor = document.documentElement;
		}
		while(oNode && oNode != stopAncestor) {
			if (fFilter(oNode)) {
				return oNode;
			}
			oNode = oNode.parentNode;
		}
		return null;
	},

	/**
	 * Filter the children of a given Node.
	 *
	 * @param	{Node} oNode:
	 * A given DOM Node.
	 * @param	{function} fFilter:
	 * The filter function, boolean (Node)
	 * @return	{Array}
	 * An array of DOM Nodes, may be empty.
	 */
	getChildren:function(oNode,fFilter) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.getChildren');
		tjs.lang.assert(tjs.lang.isFunction(fFilter),'!tjs.lang.isFunction(fFilter) @'+this.classname+'.getChildren');
//tjs_debug_end
		var a = [], k = 0, o;
		if (oNode.hasChildNodes()) {
			if (oNode.children) {
				var chs = oNode.children;
				for (var i = 0, isize = chs.length; i < isize; i++) {
					o = chs[i];
					if (fFilter(o)) {
						a[k++] = o;
					}
				}
			} else {
				o = oNode.firstChild;
				do {
					if (o.nodeType == Node.ELEMENT_NODE && fFilter(o)) {
						a[k++] = o;
					}
					o = o.nextSibling;
				} while(o);
			}
		}
		return a;
	},

	/**
	 * Filter the children of a given Node.
	 *
	 * @param	{Node} oNode:
	 * A given DOM Node.
	 * @param	{function} fFilter:
	 * The filter function, boolean (Node)
	 * @return	{Array}
	 * An array of DOM Nodes, may be empty.
	 */
	getFirstChild:function(oNode,fFilter) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.getFirstChild');
		tjs.lang.assert(tjs.lang.isFunction(fFilter),'!tjs.lang.isFunction(fFilter) @'+this.classname+'.getFirstChild');
//tjs_debug_end
		if (oNode.hasChildNodes()) {
			var o;
			if (oNode.children) {
				var chs = oNode.children;
				for (var i = 0, isize = chs.length; i < isize; i++) {
					o = chs[i];
					if (fFilter(o)) {
						return o;
					}
				}
			} else {
				o = oNode.firstChild;
				do {
					if (o.nodeType == Node.ELEMENT_NODE && fFilter(o)) {
						return o;
					}
					o = o.nextSibling;
				} while(o);
			}
		}
		return null;
	},

	/**
	 * Filter the children of a given Node.
	 *
	 * @param	{Node} oNode:
	 * A given DOM Node.
	 * @param	{function} fFilter:
	 * The filter function, boolean (Node)
	 * @return	{Array}
	 * An array of DOM Nodes, may be empty.
	 */
	getLastChild:function(oNode,fFilter) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.getLastChild');
		tjs.lang.assert(tjs.lang.isFunction(fFilter),'!tjs.lang.isFunction(fFilter) @'+this.classname+'.getLastChild');
//tjs_debug_end
		if (oNode.hasChildNodes()) {
			var o;
			if (oNode.children) {
				var chs = oNode.children;
				var i = chs.length;
				while (i--) {
					o = chs[i];
					if (fFilter(o)) {
						return o;
					}
				}
			} else {
				o = oNode.lastChild;
				do {
					if (o.nodeType == Node.ELEMENT_NODE && fFilter(o)) {
						return o;
					}
					o = o.previousSibling;
				} while(o);
			}
		}
		return null;
	},

	_getTagNameFilter:function(tagName) {
		if (tagName && tagName != '*') {
			tagName = tagName.toLowerCase();
			return function(o) {
				return o.tagName.toLowerCase() == tagName;
			};
		} else {
			return function(o) {
				return true;
			};
		}
	},

	/**
	 * Return DOM Element that have the specified tagName,
	 * and is the nearest ancestor of the specified DOM Node.
	 *
	 * @param	{Node} oNode:
	 * the specified DOM Node
	 * @param	{string} tagName:
	 * the specified tagName
	 * @return	{Element}
	 * A DOM Element, may be null.
	 */
	getAncestorByTagName:function(oNode,tagName,stopAncestor) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.getElementsByTagName');
		tjs.lang.assert(tagName && tjs.lang.isString(tagName) && tagName != '*','!tjs.lang.isString(tagName) @'+this.classname+'.getNearestAncestorByTagName');
//tjs_debug_end
		return this.getAncestor(oNode,this._getTagNameFilter(tagName),stopAncestor);
	},

	/**
	 * Return an array of DOM Elements that have the specified tagName,
	 * and are descendants of the specified DOM Node.
	 *
	 * @param	{Node} oNode:
	 * the specified DOM Node
	 * @param	{string} tagName:
	 * the specified tagName
	 * @return	{Array}
	 * An array of DOM Elements, may be empty.
	 */
	getElementsByTagName:function(oNode,tagName) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.getElementsByTagName');
		tjs.lang.assert(tagName && tjs.lang.isString(tagName) && tagName != '*','!tjs.lang.isString(tagName) @'+this.classname+'.getElementsByTagName');
//tjs_debug_end
		return oNode.getElementsByTagName ? oNode.getElementsByTagName(tagName) : this.filterPreOrder(oNode,this._getTagNameFilter(tagName));
	},

	/**
	 * Return the first DOM Element that have the specified tagName,
	 * and is descendant of the specified DOM Node.
	 *
	 * @param	{Node} oNode:
	 * the specified DOM Node
	 * @param	{string} tagName:
	 * the specified tagName
	 * @return	{Element}
	 * A DOM Element, may be null.
	 */
	getElementByTagName:function(oNode,tagName) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.getElementByTagName');
		tjs.lang.assert(tagName && tjs.lang.isString(tagName) && tagName != '*','!tjs.lang.isString(tagName) @'+this.classname+'.getElementByTagName');
//tjs_debug_end
		return this.searchPreOrder(oNode,this._getTagNameFilter(tagName));
	},
	/**
	 * Return an array of DOM Elements that have the specified tagName,
	 * and are children of the specified DOM Node.
	 *
	 * @param	{Node} oNode:
	 * the specified DOM Node
	 * @param	{string} tagName:
	 * the specified tagName
	 * @return	{Array}
	 * An array of DOM Elements, may be empty.
	 */
	getChildrenByTagName:function(oNode,tagName) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.getChildrenByTagName');
		tjs.lang.assert(tagName && tjs.lang.isString(tagName) && tagName != '*','!tjs.lang.isString(tagName) @'+this.classname+'.getChildrenByTagName');
//tjs_debug_end
		return this.getChildren(oNode,this._getTagNameFilter(tagName));
	},
	/**
	 * Return the first DOM Element that have the specified tagName,
	 * and is child of the specified DOM Node.
	 *
	 * @param	{Node} oNode:
	 * the specified DOM Node
	 * @param	{string} tagName:
	 * the specified tagName
	 * @return	{Element}
	 * A DOM Element, may be null.
	 */
	getFirstChildByTagName:function(oNode,tagName) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.getFirstChildByTagName');
		tjs.lang.assert(tagName && tjs.lang.isString(tagName) && tagName != '*','!tjs.lang.isString(tagName) @'+this.classname+'.getFirstChildByTagName');
//tjs_debug_end
		return this.getFirstChild(oNode,this._getTagNameFilter(tagName));
	},
	/**
	 * Return the last DOM Element that have the specified tagName,
	 * and is child of the specified DOM Node.
	 *
	 * @param	{Node} oNode:
	 * the specified DOM Node
	 * @param	{string} tagName:
	 * the specified tagName
	 * @return	{Element}
	 * A DOM Element, may be null.
	 */
	getLastChildByTagName:function(oNode,tagName) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.getLastChildByTagName');
		tjs.lang.assert(tagName && tjs.lang.isString(tagName) && tagName != '*','!tjs.lang.isString(tagName) @'+this.classname+'.getLastChildByTagName');
//tjs_debug_end
		return this.getLastChild(oNode,this._getTagNameFilter(tagName));
	},

 	_getAttributeFilter:function(tagName,attrName,attrValue) {
 		var f = this._getTagNameFilter(tagName);
		return function(oElement) {
			if (f(oElement)) {
				var oAttr = oElement.getAttributeNode(attrName);
				if (oAttr == null || !oAttr.specified) {
					return false;
				} else if (attrValue == null || attrValue == '*') {
					return true;
				} else if (tjs.lang.isString(attrValue)) {
					return oAttr.value == attrValue;
				} else if (attrValue instanceof RegExp) {
					return attrValue.test(oAttr.value);
				} else {
					return false;
				}
			} else {
				return false;
			}
		};
	},
	/**
	 * Return the DOM Element that have the specified tagName, attribute name,
	 * attribute value, and is the nearest ancestor of the specified DOM Node.
	 *
	 * @param	{Node} oNode:
	 * the specified DOM Node
	 * @param	{string} tagName:
	 * the specified tagName
	 * @param	{string} attrName:
	 * the specified attribute name, required
	 * @param	{string/RegExp} attrValue:
	 * The specified attribute value
	 * @return	{Element}
	 * A DOM Element, may be null.
	 */
	getAncestorByAttribute:function(oNode,tagName,attrName,attrValue,stopAncestor) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.getAncestorByAttribute');
		tjs.lang.assert(!tagName || tjs.lang.isString(tagName),'!tjs.lang.isString(tagName) @'+this.classname+'.getAncestorByAttribute');
		tjs.lang.assert(Boolean(attrName) && tjs.lang.isString(attrName),'!tjs.lang.isString(attrName) @'+this.classname+'.getAncestorByAttribute');
		tjs.lang.assert(attrValue == null || tjs.lang.isString(attrValue) || (attrValue instanceof RegExp),'!tjs.lang.isString(attrValue) && !(attrValue instanceof RegExp) @'+this.classname+'.getAncestorByAttribute');
//tjs_debug_end
		return this.getAncestor(oNode,this._getAttributeFilter(tagName,attrName,attrValue),stopAncestor);
	},
	/**
	 * Return an array of DOM Elements that have the specified tagName, attribute name,
	 * attribute value, and are descendants of the specified DOM Node.
	 *
	 * @param	{Node} oNode:
	 * the specified DOM Node
	 * @param	{string} tagName:
	 * the specified tagName
	 * @param	{string} attrName:
	 * the specified attribute name, required
	 * @param	{string/RegExp} attrValue:
	 * The specified attribute value
	 * @return	{Array}
	 * An array of DOM Elements, may be empty.
	 */
	getElementsByAttribute:function(oNode,tagName,attrName,attrValue) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.getElementsByAttribute');
		tjs.lang.assert(!tagName || tjs.lang.isString(tagName),'!tjs.lang.isString(tagName) @'+this.classname+'.getElementsByAttribute');
		tjs.lang.assert(attrName && tjs.lang.isString(attrName),'!tjs.lang.isString(attrName) @'+this.classname+'.getElementsByAttribute');
		tjs.lang.assert(attrValue == null || tjs.lang.isString(attrValue) || (attrValue instanceof RegExp),'!tjs.lang.isString(attrValue) && !(attrValue instanceof RegExp) @'+this.classname+'.getElementsByAttribute');
//tjs_debug_end
		return this.filterPreOrder(oNode,this._getAttributeFilter(tagName,attrName,attrValue));
	},
	/**
	 * Return the first DOM Element that have the specified tagName, attribute name,
	 * attribute value, and is descendant of the specified DOM Node.
	 *
	 * @param	{Node} oNode:
	 * the specified DOM Node
	 * @param	{string} tagName:
	 * the specified tagName
	 * @param	{string} attrName:
	 * the specified attribute name, required
	 * @param	{string/RegExp} attrValue:
	 * The specified attribute value
	 * @return	{Element}
	 * A DOM Element, may be null.
	 */
	getElementByAttribute:function(oNode,tagName,attrName,attrValue) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.getElementByAttribute');
		tjs.lang.assert(!tagName || tjs.lang.isString(tagName),'!tjs.lang.isString(tagName) @'+this.classname+'.getElementByAttribute');
		tjs.lang.assert(Boolean(attrName) && tjs.lang.isString(attrName),'!tjs.lang.isString(attrName) @'+this.classname+'.getElementByAttribute');
		tjs.lang.assert(attrValue == null || tjs.lang.isString(attrValue) || (attrValue instanceof RegExp),'!tjs.lang.isString(attrValue) && !(attrValue instanceof RegExp) @'+this.classname+'.getElementByAttribute');
//tjs_debug_end
		return this.searchPreOrder(oNode,this._getAttributeFilter(tagName,attrName,attrValue));
	},
	/**
	 * Return an array of DOM Elements that have the specified tagName, attribute name,
	 * attribute value, and are children of the specified DOM Node.
	 *
	 * @param	{Node} oNode:
	 * the specified DOM Node
	 * @param	{string} tagName:
	 * the specified tagName
	 * @param	{string} attrName:
	 * the specified attribute name, required
	 * @param	{string/RegExp} attrValue:
	 * The specified attribute value
	 * @return	{Array}
	 * An array of DOM Elements, may be empty.
	 */
	getChildrenByAttribute:function(oNode,tagName,attrName,attrValue) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.getChildrenByAttribute');
		tjs.lang.assert(!tagName || tjs.lang.isString(tagName),'!tjs.lang.isString(tagName) @'+this.classname+'.getChildrenByAttribute');
		tjs.lang.assert(Boolean(attrName) && tjs.lang.isString(attrName),'!tjs.lang.isString(attrName) @'+this.classname+'.getChildrenByAttribute');
		tjs.lang.assert(attrValue == null || tjs.lang.isString(attrValue) || (attrValue instanceof RegExp),'!tjs.lang.isString(attrValue) && !(attrValue instanceof RegExp) @'+this.classname+'.getChildrenByAttribute');
//tjs_debug_end
		return this.getChildren(oNode,this._getAttributeFilter(tagName,attrName,attrValue));
	},
	/**
	 * Return the first DOM Element that have the specified tagName, attribute name,
	 * attribute value, and is child of the specified DOM Node.
	 *
	 * @param	{Node} oNode:
	 * the specified DOM Node
	 * @param	{string} tagName:
	 * the specified tagName
	 * @param	{string} attrName:
	 * the specified attribute name, required
	 * @param	{string/RegExp} attrValue:
	 * The specified attribute value
	 * @return	{Element}
	 * A DOM Element, may be null.
	 */
	getFirstChildByAttribute:function(oNode,tagName,attrName,attrValue) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.getFirstChildByAttribute');
		tjs.lang.assert(!tagName || tjs.lang.isString(tagName),'!tjs.lang.isString(tagName) @'+this.classname+'.getFirstChildByAttribute');
		tjs.lang.assert(Boolean(attrName) && tjs.lang.isString(attrName),'!tjs.lang.isString(attrName) @'+this.classname+'.getFirstChildByAttribute');
		tjs.lang.assert(attrValue == null || tjs.lang.isString(attrValue) || (attrValue instanceof RegExp),'!tjs.lang.isString(attrValue) && !(attrValue instanceof RegExp) @'+this.classname+'.getFirstChildByAttribute');
//tjs_debug_end
		return this.getFirstChild(oNode,this._getAttributeFilter(tagName,attrName,attrValue));
	},
	/**
	 * Return the last DOM Element that have the specified tagName, attribute name,
	 * attribute value, and is child of the specified DOM Node.
	 *
	 * @param	{Node} oNode:
	 * the specified DOM Node
	 * @param	{string} tagName:
	 * the specified tagName
	 * @param	{string} attrName:
	 * the specified attribute name, required
	 * @param	{string/RegExp} attrValue:
	 * The specified attribute value
	 * @return	{Element}
	 * A DOM Element, may be null.
	 */
	getLastChildByAttribute:function(oNode,tagName,attrName,attrValue) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.getLastChildByAttribute');
		tjs.lang.assert(!tagName || tjs.lang.isString(tagName),'!tjs.lang.isString(tagName) @'+this.classname+'.getLastChildByAttribute');
		tjs.lang.assert(Boolean(attrName) && tjs.lang.isString(attrName),'!tjs.lang.isString(attrName) @'+this.classname+'.getLastChildByAttribute');
		tjs.lang.assert(attrValue == null || tjs.lang.isString(attrValue) || (attrValue instanceof RegExp),'!tjs.lang.isString(attrValue) && !(attrValue instanceof RegExp) @'+this.classname+'.getLastChildByAttribute');
//tjs_debug_end
		return this.getLastChild(oNode,this._getAttributeFilter(tagName,attrName,attrValue));
	},

	_oREClassNameCache:{},
	_getClassNameRegExp:function(sClassName){
        var o = this._oREClassNameCache[sClassName];
        if (!o) {
            o = new RegExp('(^|\\s+)' + sClassName + '(\\s+|$)');
            this._oREClassNameCache[sClassName] = o;
        }
        return o;
	},
	_getClassNameFilter:function(tagName,sClassName) {
 		var f = this._getTagNameFilter(tagName);
		var p = this._getClassNameRegExp(sClassName);
		return function(oElement) {
			return f(oElement) && oElement.className && p.test(oElement.className);
		};
	},
	/**
	 * Return the DOM Element that have the specified tagName, class name,
	 * and is the nearest ancestor of the specified DOM Node.
	 *
	 * @param	{Node} oNode:
	 * the specified DOM Node
	 * @param	{string} tagName:
	 * the specified tagName
	 * @param	{string} sClassName:
	 * The specified class name, required
	 * @return	{Element}
	 * A DOM Element, may be null.
	 */
	getAncestorByClassName:function(oNode,tagName,sClassName,stopAncestor) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.getAncestorByClassName');
		tjs.lang.assert(!tagName || tjs.lang.isString(tagName),'!tjs.lang.isString(oldClassName) @'+this.classname+'.getAncestorByClassName');
		tjs.lang.assert(sClassName && tjs.lang.isString(sClassName),'!tjs.lang.isString(sClassName) @'+this.classname+'.getAncestorByClassName');
//tjs_debug_end
		return this.getAncestor(oNode,this._getClassNameFilter(tagName,sClassName),stopAncestor);
	},
	/**
	 * Return an array of DOM Elements that have the specified tagName, class name,
	 * and are descendants of the specified DOM HTMLElement.
	 *
	 * @param	{HTMLElement} oElement:
	 * The given HTMLElement, required
	 * @param	{string} tagName:
	 * The specified tagName, optional
	 * If no tagName is specified, elements are returned regardless of tagName.
	 * @param	{string} sClassName:
	 * The specified class name, required
	 * @return	{Array}
	 * An array of DOM Elements, may be empty.
	 */
	getElementsByClassName:function(oNode,tagName,sClassName) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.getElementsByClassName');
		tjs.lang.assert(!tagName || tjs.lang.isString(tagName),'!tjs.lang.isString(oldClassName) @'+this.classname+'.getElementsByClassName');
		tjs.lang.assert(sClassName && tjs.lang.isString(sClassName),'!tjs.lang.isString(sClassName) @'+this.classname+'.getElementsByClassName');
//tjs_debug_end
		if (oNode.getElementsByClassName) {
			// FireFox 3+, Chrome, Safari 3.1+
			var a = oNode.getElementsByClassName(sClassName);
			if (tagName && tagName != '*' && a.length > 0) {
				tagName = tagName.toLowerCase();
				var b = [], k = 0;
				for (var i = 0, isize = a.length; i < isize; i++) {
					o = a[i];
					if (o.tagName.toLowerCase() == tagName) {
						b[k++] = o;
					}
				}
				return b;
			} else {
				return a;
			}
		} else {
			return this.filterPreOrder(oNode,this._getClassNameFilter(tagName,sClassName));
		}
	},
	/**
	 * Return the first DOM Element that have the specified tagName, class name,
	 * and is descendant of the specified DOM HTMLElement.
	 *
	 * @param	{HTMLElement} oElement:
	 * The given HTMLElement, required
	 * @param	{string} tagName:
	 * The specified tagName, optional
	 * If no tagName is specified, elements are returned regardless of tagName.
	 * @param	{string} sClassName:
	 * The specified class name, required
	 * @return	{Element}
	 * A DOM Element, may be null.
	 */
	getElementByClassName:function(oNode,tagName,sClassName) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.getElementByClassName');
		tjs.lang.assert(!tagName || tjs.lang.isString(tagName),'!tjs.lang.isString(oldClassName) @'+this.classname+'.getElementByClassName');
		tjs.lang.assert(sClassName && tjs.lang.isString(sClassName),'!tjs.lang.isString(sClassName) @'+this.classname+'.getElementByClassName');
//tjs_debug_end
		return this.searchPreOrder(oNode,this._getClassNameFilter(tagName,sClassName));
	},
	/**
	 * Return an array of DOM Elements that have the specified tagName, class name,
	 * and are children of the specified DOM HTMLElement.
	 *
	 * @param	{HTMLElement} oElement:
	 * The given HTMLElement, required
	 * @param	{string} tagName:
	 * The specified tagName, optional
	 * If no tagName is specified, elements are returned regardless of tagName.
	 * @param	{string} sClassName:
	 * The specified class name, required
	 * @return	{Array}
	 * An array of DOM Elements, may be empty.
	 */
	getChildrenByClassName:function(oNode,tagName,sClassName) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.getChildrenByClassName');
		tjs.lang.assert(!tagName || tjs.lang.isString(tagName),'!tjs.lang.isString(oldClassName) @'+this.classname+'.getChildrenByClassName');
		tjs.lang.assert(sClassName && tjs.lang.isString(sClassName),'!tjs.lang.isString(sClassName) @'+this.classname+'.getChildrenByClassName');
//tjs_debug_end
		return this.getChildren(oNode,this._getClassNameFilter(tagName,sClassName));
	},
	/**
	 * Return the first DOM Element that have the specified tagName, class name,
	 * and is child of the specified DOM HTMLElement.
	 *
	 * @param	{HTMLElement} oElement:
	 * The given HTMLElement, required
	 * @param	{string} tagName:
	 * The specified tagName, optional
	 * If no tagName is specified, elements are returned regardless of tagName.
	 * @param	{string} sClassName:
	 * The specified class name, required
	 * @return	{Element}
	 * A DOM Element, may be null.
	 */
	getFirstChildByClassName:function(oNode,tagName,sClassName) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.getFirstChildByClassName');
		tjs.lang.assert(!tagName || tjs.lang.isString(tagName),'!tjs.lang.isString(oldClassName) @'+this.classname+'.getFirstChildByClassName');
		tjs.lang.assert(sClassName && tjs.lang.isString(sClassName),'!tjs.lang.isString(sClassName) @'+this.classname+'.getFirstChildByClassName');
//tjs_debug_end
		return this.getFirstChild(oNode,this._getClassNameFilter(tagName,sClassName));
	},
	/**
	 * Return the last DOM Element that have the specified tagName, class name,
	 * and is child of the specified DOM HTMLElement.
	 *
	 * @param	{HTMLElement} oElement:
	 * The given HTMLElement, required
	 * @param	{string} tagName:
	 * The specified tagName, optional
	 * If no tagName is specified, elements are returned regardless of tagName.
	 * @param	{string} sClassName:
	 * The specified class name, required
	 * @return	{Element}
	 * A DOM Element, may be null.
	 */
	getLastChildByClassName:function(oNode,tagName,sClassName) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.getLastChildByClassName');
		tjs.lang.assert(!tagName || tjs.lang.isString(tagName),'!tjs.lang.isString(oldClassName) @'+this.classname+'.getLastChildByClassName');
		tjs.lang.assert(sClassName && tjs.lang.isString(sClassName),'!tjs.lang.isString(sClassName) @'+this.classname+'.getLastChildByClassName');
//tjs_debug_end
		return this.getLastChild(oNode,this._getClassNameFilter(tagName,sClassName));
	},

	/**
	 * Determines whether an HTMLElement has the given class name.
	 *
	 * @param	{HTMLElement} oElement:
	 * The HTMLElement to test
	 * @param	{string} sClassName:
	 * The class name to search for
	 * @return	{boolean}
	 * Return true if HTMLElement oElement has the given className, false otherwise.
	 */
	hasClass:function(oElement,sClassName) {
//tjs_debug_start
		tjs.lang.assert(this.isElement(oElement),'!this.isElement(oElement) @'+this.classname+'.hasClass');
		tjs.lang.assert(sClassName && tjs.lang.isString(sClassName),'!tjs.lang.isString(sClassName) @'+this.classname+'.hasClass');
//tjs_debug_end
	    var cn = oElement.className;
	    return Boolean(cn) && this._getClassNameRegExp(sClassName).test(cn);
	},
	/**
	 * Adds a class name to a given HTMLElement, if it is not already there.
	 *
	 * @param	{HTMLElement} oElement:
	 * The HTMLElement to add the class to
	 * @param	{string} sClassName:
	 * The class name to add to the class attribute
	 */
	addClass:function(oElement,sClassName) {
//tjs_debug_start
		tjs.lang.assert(this.isElement(oElement),'!this.isElement(oElement) @'+this.classname+'.addClass');
		tjs.lang.assert(sClassName && tjs.lang.isString(sClassName),'!tjs.lang.isString(sClassName) @'+this.classname+'.addClass');
//tjs_debug_end
	    var cn = oElement.className;
	    if (cn) {
		    var p = this._getClassNameRegExp(sClassName);
		    if (!p.test(cn)) {
			    oElement.className = cn + ' ' + sClassName;
		    }
	    } else {
	    	oElement.className = sClassName;
	    }
	},
	/**
	 * Removes a class name from a given HTMLElement.
	 *
	 * @param	{HTMLElement} oElement:
	 * The HTMLElement to remove the class from
	 * @param	{string} sClassName:
	 * The class name to remove from the class attribute
	 */
	removeClass:function(oElement,sClassName) {
//tjs_debug_start
		tjs.lang.assert(this.isElement(oElement),'!this.isElement(oElement) @'+this.classname+'.removeClass');
		tjs.lang.assert(sClassName && tjs.lang.isString(sClassName),'!tjs.lang.isString(sClassName) @'+this.classname+'.removeClass');
//tjs_debug_end
	    var cn = oElement.className;
	    if (cn) {
		    var p = this._getClassNameRegExp(sClassName);
		    if (p.test(cn)) {
		    	oElement.className = cn.replace(p,' ').trim();
		    	if (!oElement.className) {
		    		oElement.removeAttribute('class');
		    		oElement.removeAttribute('className');
		    	}
		    }
	    }
	},
	/**
	 * Replace a class with another class for a given HTMLElement.
	 * If no oldClassName is present, the newClassName is simply added.
	 *
	 * @param {HTMLElement} oElement:
	 * The HTMLElement to replace the class
	 * @param {string} oldClassName:
	 * The class name to be replaced
	 * @param {string} newClassName:
	 * The class name that will be replacing the old class name
	 */
	replaceClass:function(oElement,oldClassName,newClassName) {
//tjs_debug_start
		tjs.lang.assert(this.isElement(oElement),'!this.isElement(oElement) @'+this.classname+'.replaceClass');
		tjs.lang.assert(oldClassName && tjs.lang.isString(oldClassName),'!tjs.lang.isString(oldClassName) @'+this.classname+'.replaceClass');
		tjs.lang.assert(newClassName && tjs.lang.isString(newClassName),'!tjs.lang.isString(newClassName) @'+this.classname+'.replaceClass');
//tjs_debug_end
		if (oldClassName == newClassName) {
			return;
		}
	    var cn = oElement.className, p;
	    // remove
	    if (cn) {
		    p = this._getClassNameRegExp(oldClassName);
		    if (p.test(cn)) {
		    	oElement.className = cn.replace(p,' ').trim();
		    	cn = oElement.className;
		    }
	    }
		// add
	    if (cn) {
		    p = this._getClassNameRegExp(newClassName);
		    if (!p.test(cn)) {
			    oElement.className = cn + ' ' + newClassName;
		    }
	    } else {
	    	oElement.className = newClassName;
	    }
	},
	addClasses:function(oElement,sClassName) {
//tjs_debug_start
		tjs.lang.assert(this.isElement(oElement),'!this.isElement(oElement) @'+this.classname+'.addClass');
		tjs.lang.assert(sClassName && tjs.lang.isString(sClassName),'!tjs.lang.isString(sClassName) @'+this.classname+'.addClass');
//tjs_debug_end
		sClassName = tjs.str.normalizeOneLine(sClassName);
		if (sClassName) {
			var cn = oElement.className, p, s;
			var a = sClassName.split(' ');
			for (var i = 0, isize = a.length; i < isize; i++) {
				s = a[i];
				a[i] = null;
			    if (cn) {
				    p = this._getClassNameRegExp(s);
				    if (!p.test(cn)) {
					    cn = cn + ' ' + s;
				    }
			    } else {
			    	cn = s;
			    }
			}
			a.length = 0;
			oElement.className = cn;
		}
	},
	classname:'tjs.dom'
};
})();

if ('cloneNode' in document) {
	tjs.dom.cloneNode = function(oNode,deep){
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.cloneNode');
//tjs_debug_end
		return oNode.cloneNode(deep);
	};
} else if (tjs.bom.isOldIE) {
	tjs.dom.cloneNode = function(oNode,deep) {
//tjs_debug_start
		tjs.lang.assert(this.isNode(oNode),'!this.isNode(oNode) @'+this.classname+'.cloneNode');
//tjs_debug_end
		var nonWhite = /\S/,oNodeNew,att;
		if (oNode.nodeType == 1){
			oNodeNew = document.createElement(oNode.nodeName);
			for (var i = 0, isize = oNode.attributes.length; i < isize; i++) {
				att = oNode.attributes[i];
				oNodeNew.setAttribute(att.name, att.value);
			}
			oNodeNew.style.cssText = oNode.style.cssText;
			oNodeNew.className = oNode.className;
			oNodeNew.htmlFor = oNode.htmlFor;
			if (oNodeNew.oDraggable) {
				tjs.event.removeListener(oNodeNew,'mousedown',tjs.dnd.oDragDropManager.mousedownHandler);
				oNodeNew.oDraggable = null;
			}
			if (oNodeNew.oDroppable) {
				oNodeNew.oDroppable = null;
			}
			if (oNodeNew.oBhv) {
				oNodeNew.oBhv = null;
			}
			if (oNodeNew.oWidget) {
				oNodeNew.oWidget = null;
			}
			if (oNodeNew.oComponent) {
				oNodeNew.oComponent = null;
			}
		} else if (oNode.nodeType == 3 && nonWhite.test(node.nodeValue)) {
			oNodeNew = document.createTextNode(oNode.nodeValue);
		}
		if (deep && oNode.hasChildNodes()) {
			var oChild = oNode.firstChild;
			do {
				if (oChild.nodeType == 1) {
					oNodeNew.appendChild(this.cloneNode(oChild,true));
				} else if (oChild.nodeType == 3 && nonWhite.test(oChild.nodeValue)) {
					oNodeNew.appendChild(document.createTextNode(oChild.nodeValue));
				}
				oChild = oChild.nextSibling;
			} while (oChild);
		}
		return oNodeNew;
	};
}
