tjs.html = (function(){
//var _emptyTags = {'area':true,'base':true,'basefont':true,'br':true,'col':true,'frame':true,'hr':true,'img':true,'input':true,'isindex':true,'link':true,'meta':true,'param':true};
var _embedTags = {'object':true,'embed':true,'applet':true};
var _doContent = function(o){
	var n = o.tagName.toLowerCase();
	return !(n in _embedTags);
};
var _canLayout = function(o){
	return _doContent(o) && tjs.css.getComputedStyle(o).display != 'none';
};
var _lifeMethods = {onPreConstruct:true,onPostConstruct:true,onLoaded:true,onDestroy:true};
var _createLifecycle = function(oElement) {
	var oTextarea = tjs.dom.getLastChildByClassName(oElement,'textarea','lifecycle');
	if (oTextarea) {
		var value = oTextarea.value;
		oElement.removeChild(oTextarea);
		if (value) {
			var oLifecycle;
			eval('oLifecycle = '+value+';');
			if (tjs.lang.isObject(oLifecycle)) {
				var b = false, o = {};
				for (var x in oLifecycle) {
					if ((x in _lifeMethods) && oLifecycle.hasOwnProperty(x) && tjs.lang.isFunction(oLifecycle[x])) {
						o[x] = oLifecycle[x];
						b = true;
					}
				}
				if (b) {
					oElement.oLifecycle = o;
				}
				tjs.lang.destroyObject(oLifecycle);
			}
		}
	}
};
var _createWidget = function(oElement) {
	var widget = oElement.getAttribute('widget');
	if (!widget) {
		return;
	}
	oElement.removeAttribute('widget');
	try {
		eval('widget = '+widget+';');
	} catch(oError) {
		tjs.loger.log(oError.message);
	}
	if (!tjs.lang.isFunction(widget)) {
		return;
	}
	var v;
	var oConfig = {oElement:oElement};
	var parameters = oElement.getAttribute('parameters');
	if (parameters) {
		oElement.removeAttribute('parameters');
		try {
			eval('parameters = '+parameters+';');
			if (tjs.lang.isObject(parameters)) {
				for (v in parameters) {
					oConfig[v] = parameters[v];
					delete parameters[v];
				}
			}
		} catch(oError) {
			tjs.loger.log(oError.message);
		}
		parameters = null;
	}
	var oTextArea = tjs.dom.getLastChildByClassName(oElement,'textarea','widget_data');
	if (oTextArea) {
		oElement.removeChild(oTextArea);
		try {
			eval('parameters = '+oTextArea.value+';');
			if (tjs.lang.isObject(parameters)) {
				for (v in parameters) {
					oConfig[v] = parameters[v];
					delete parameters[v];
				}
			}
		} catch(oError) {
			tjs.loger.log(oError.message);
		}
		parameters = null;
		oTextArea = null;
	}
	var aChilds = tjs.dom.getChildrenByAttribute(oElement,null,'widget_child');
	var isize = aChilds ? aChilds.length : 0;
	if (isize > 0) {
		var aChildren = [],k = 0,oChild,obj;
		for (var i = 0; i < isize; i++) {
			oChild = aChilds[i];
			aChilds[i] = null;
			oElement.removeChild(oChild);
			obj = oChild.getAttribute('widget_child');
			oChild.removeAttribute('widget_child');
			try {
				eval('obj = '+obj+';');
			} catch(oError) {}
			if (!tjs.lang.isObject(obj)) {
				obj = {};
			}
			obj.oElement = oChild;
			aChildren[k++] = obj;
		}
		aChilds.length = 0;
		if (k > 0) {
			oConfig.aChildren = aChildren;
		}
	}
	widget = new widget(oConfig);
	widget = null;
};
var _stackChildren = function(oNode,s,f) {
	var k = s.length, o;
	if (oNode.children) {
		var a = oNode.children, i = a.length;
		while (i--) {
			o = a[i];
			if (f(o)) {
				s[k++] = o;
			}
		}
	} else {
		o = oNode.lastChild;
		while (o) {
			if (o.nodeType == Node.ELEMENT_NODE && f(o)) {
				s[k++] = o;
			}
			o = o.previousSibling;
		}
	}
};
var _evalContent = function(oElement) {
	var s = [oElement],pop = false,o;
	while (s.length > 0) {
		oElement = s[s.length - 1];
		if (oElement.getAttribute('childrenHandled')) {
			oElement.removeAttribute('childrenHandled');
			pop = true;
			o = oElement.oLifecycle;
		} else {
			_createLifecycle(oElement);
			o = oElement.oLifecycle;
			if (o && o.onPreConstruct) {
				o.onPreConstruct(oElement);
				delete o.onPreConstruct;
			}
			_createWidget(oElement);
			if (oElement.hasChildNodes()) {
				oElement.setAttribute('childrenHandled','1');
				_stackChildren(oElement,s,_doContent);
			} else {
				pop = true;
			}
		}
		if (pop) {
			s.length--;
			if (o && o.onPostConstruct) {
				o.onPostConstruct(oElement);
				delete o.onPostConstruct;
			}
			pop = false;
		}
	}
};
var _autoFill = function(oElement) {
	var autoFill = oElement.getAttribute('autoFill');
	if (autoFill) {
		var tjs_css = tjs.css;
		var doit = autoFill != '00';
		if (doit) {
			var position = tjs_css.getComputedStyle(oElement).position;
			doit = position != 'fixed' && position != 'absolute';
		}
		if (doit) {
			var oParent = oElement.parentNode;
			var overflow = tjs_css.getComputedStyle(oParent).overflow;
			var tjs_bom = tjs.bom;
			var wf = autoFill.charAt(0), hf = autoFill.charAt(1), w, h;
			if (hf == '0') {
				w = tjs_css.getContentBoxWidth(oParent);
				if (wf == '2' || (wf == '1' && overflow == 'scroll')) {
					w -= tjs_bom.vScrollBarWidth;
				}
				tjs_css.setOffsetWidth(oElement,w);
			} else if (wf == '0') {
				h = tjs_css.getContentBoxHeight(oParent);
				if (hf == '2' || (hf == '1' && overflow == 'scroll')) {
					h -= tjs_bom.hScrollBarWidth;
				}
				tjs_css.setOffsetHeight(oElement,h);
			} else {
				w = tjs_css.getContentBoxWidth(oParent);
				h = tjs_css.getContentBoxHeight(oParent);
				if (wf == '2' || (wf == '1' && overflow == 'scroll')) {
					w -= tjs_bom.vScrollBarWidth;
				}
				if (hf == '2' || (hf == '1' && overflow == 'scroll')) {
					h -= tjs_bom.hScrollBarWidth;
				}
				tjs_css.setOffsetDimension(oElement,w,h);
			}
		} else {
			oElement.removeAttribute('autoFill');
		}
	}
};
var _evalLayouts = function(oElement) {
	var s = [oElement], o;
	while (s.length > 0) {
		oElement = s.pop();
		_autoFill(oElement);
		o = oElement.oWidget;
		if (o instanceof tjs.widget.Widget) {
			o.layout();
		} else if (oElement.hasChildNodes()) {
			_stackChildren(oElement,s,_canLayout);
		}
	}
};
return {
	getHtml:function(doc) {
		if (!doc) {
			doc = document;
		}
		return doc.documentElement;
	},
	getHead:function(doc) {
		return tjs.dom.getFirstChildByTagName(this.getHtml(doc),'head');
	},
	getBody:function(doc) {
		if (!doc) {
			doc = document;
		}
		return doc.body;
	},
	getBodyWrapper:function() {
		return this._bodyWrapper;
	},
	getHiddenContainer:function() {
		return this._hiddenContainer;
	},
	getHiddenWindow:function(name) {
//tjs_debug_start
		tjs.lang.assert(name && tjs.lang.isString(name),'!tjs.lang.isString(name) @'+this.classname+'.getHiddenWindow');
//tjs_debug_end
		var oWindow = window.frames[name];
		if (!oWindow) {
			var oIFrame;
			oIFrame = document.createElement('iframe');
			oIFrame.setAttribute('id',name);
			oIFrame.setAttribute('name',name);
			if (tjs.bom.isIE6 || tjs.bom.isIE7 || tjs.bom.isIE8) {
				oIFrame.setAttribute('frameborder','0');
				oIFrame.setAttribute('marginwidth','0');
				oIFrame.setAttribute('marginheight','0');
				oIFrame.setAttribute('scrolling','no');
			}
			oIFrame.style.cssText = 'overflow:hidden;margin:0;padding:0;border:0 none;position:absolute;left:0;top:0;width:100%;height:100%;';
			this.getHiddenContainer().appendChild(oIFrame);
			oWindow = oIFrame.contentWindow;
		}
		return oWindow;
	},
	getVirtualWindow:function() {
		if (!this._virtualWindow) {
			this._virtualWindow = this.getHiddenWindow('virtualWindow');
		}
		return this._virtualWindow;
	},
	forceRedraw:function(){
		var tjs_bom = tjs.bom;
		if (tjs_bom.isIE6 || tjs_bom.isIE7) {
			if (!this._forceRedraw_) {
				this._forceRedraw_ = function() {
					var s = document.body.style;
					s.display = 'none';
					s.display = '';
				};
			}
			window.setTimeout(this._forceRedraw_,50);
		}
	},
	showLoading:function(){
		if (this._loadingCount == 0) {
			this._loadingLayer.style.visibility = 'visible';
		}
		this._loadingCount++;
	},
	hideLoading:function(){
		if (this._loadingCount > 0) {
			this._loadingCount--;
			if (this._loadingCount == 0) {
				this._loadingLayer.style.visibility = 'hidden';
			}
		}
	},

	/**
	 * Get the stylesheet matches the specified id.
	 *
	 * @param	{string} id:
	 * the specified id
	 * @return	{CSSStyleSheet}
	 * the stylesheet matches the specified id, or null if no stylesheet
	 * matches the specified id
	 */
	getStyleSheet:function(id,doc) {
//tjs_debug_start
	    tjs.lang.assert(id && tjs.lang.isString(id),'!id || !tjs.lang.isString(id) @'+this.classname+'.getStyleSheet');
//tjs_debug_end
		if (!doc) {
			doc = document;
		}
		var oStyleSheet,ownerNode;
		var i = doc.styleSheets.length;
		while (i--) {
			oStyleSheet = doc.styleSheets[i];
			ownerNode = oStyleSheet.ownerNode || oStyleSheet.owningElement;
			if (ownerNode && ownerNode.id == id) {
				return oStyleSheet;
			}
		}
		return null;
	},
	/**
	 * Get the stylesheet matches the specified href.
	 *
	 * @param	{string} href:
	 * the specified href
	 * @return	{CSSStyleSheet}
	 * the stylesheet matches the specified href, or null if no stylesheet
	 * matches the specified href
	 */
	getStyleSheetByHref:function(href,doc) {
//tjs_debug_start
	    tjs.lang.assert(href && tjs.lang.isString(href),'!href || !tjs.lang.isString(href) @'+this.classname+'.getStyleSheetByHref');
//tjs_debug_end
		if (!doc) {
			doc = document;
		}
		var oStyleSheet;
		var i = doc.styleSheets.length;
		while (i--) {
			oStyleSheet = doc.styleSheets[i];
			if (oStyleSheet.href && oStyleSheet.href == href) {
				return oStyleSheet;
			}
		}
		return null;
	},
	removeStyleSheet:function(id,doc) {
//tjs_debug_start
		tjs.lang.assert(id && tjs.lang.isString(id),'!id || !tjs.lang.isString(id) @'+this.classname+'.removeStyleSheet');
//tjs_debug_end
		if (!doc) {
			doc = document;
		}
		var oHead = this.getHead(doc);
		var oElement = tjs.dom.getFirstChildByAttribute(oHead,'*','id',id);
		if (oElement) {
			var tagName = oElement.tagName.toLowerCase();
			if (tagName == 'style' || tagName == 'link') {
				oHead.removeChild(oElement);
			}
		}
	},
	loadStyleSheet:function(url,id,media,doc) {
//tjs_debug_start
		tjs.lang.assert(Boolean(url) && tjs.lang.isString(url),'!url || !tjs.lang.isString(url) @'+this.classname+'.loadStyleSheet');
		tjs.lang.assert(Boolean(id) && tjs.lang.isString(id),'!id || !tjs.lang.isString(id) @'+this.classname+'.loadStyleSheet');
//tjs_debug_end
		if (!doc) {
			doc = document;
		}
		var oStyleSheet = this.getStyleSheet(id,doc);
		if (!oStyleSheet) {
			var oLink = doc.createElement('link');
			oLink.type = 'text/css';
			oLink.rel = 'stylesheet';
			oLink.id = id;
			oLink.href = url;
			if (media) {
				oLink.media = media;
			}
			this.getHead(doc).appendChild(oLink);
			oStyleSheet = doc.styleSheets[doc.styleSheets.length - 1];
		} else if (oStyleSheet.href != url) {
			var ownerNode = oStyleSheet.ownerNode || oStyleSheet.owningElement;
			ownerNode.href = url;
		}
		return oStyleSheet;
	},
	createStyleSheet:function(id,media,sText,doc) {
//tjs_debug_start
		tjs.lang.assert(Boolean(id) && tjs.lang.isString(id),'!id || !tjs.lang.isString(id) @'+this.classname+'.createStyleSheet');
		tjs.lang.assert(!media  || tjs.lang.isString(media),'!tjs.lang.isString(media) @'+this.classname+'.createStyleSheet');
		tjs.lang.assert(!sText  || tjs.lang.isString(sText),'!tjs.lang.isString(sText) @'+this.classname+'.createStyleSheet');
//tjs_debug_end
		if (!doc) {
			doc = document;
		}
		var oStyleSheet = this.getStyleSheet(id,doc);
		if (!oStyleSheet) {
			var oStyle = doc.createElement('style');
			oStyle.type = 'text/css';
			oStyle.id = id;
			if (media) {
				oStyle.media = media;
			}
			if (sText) {
				if (oStyle.styleSheet) {
					oStyle.styleSheet.cssText = sText;
				} else {
					oStyle.appendChild(document.createTextNode(sText));
				}
			}
			this.getHead(doc).appendChild(oStyle);
			oStyleSheet = doc.styleSheets[doc.styleSheets.length - 1];
		}
		return oStyleSheet;
	},

	_jsURLs: [],
	_fLoadJSHandler:function(xhr) {
		if (xhr.status == 200) {
			eval('(function(){'+xhr.responseText+'})();');
		}
	},
	loadJS:function(url) {
//tjs_debug_start
		tjs.lang.assert(Boolean(url) && tjs.lang.isString(url),'!url || !tjs.lang.isString(url) @'+this.classname+'.loadJS');
//tjs_debug_end
		if (this._jsURLs.indexOf(url) < 0) {
			this._jsURLs.push(url);
			tjs.net.httpGET(url,this._fLoadJSHandler,true);
		}
	},

	loadElementContent:function(url,oElement,fHandler) {
//tjs_debug_start
		tjs.lang.assert(url && tjs.lang.isString(url),'!url || !tjs.lang.isString(url) @'+this.classname+'.loadElementContent');
		tjs.lang.assert(tjs.dom.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.loadElementContent');
		tjs.lang.assert(fHandler == null || tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.loadElementContent');
//tjs_debug_end
		this.destroyElementContent(oElement);
		tjs.net.httpGET(url,function(xhr){
			if (xhr.status != 200) {
				oElement.innerHTML = 'Error: xhr.status != 200 @tjs.html._loadElementContent';
			} else {
				var html = xhr.responseText;
				tjs.lang.invokeLater(function(){
					oElement.innerHTML = html;
					tjs.html.evalElementContent(oElement);
					if (fHandler) {
						tjs.lang.invokeLater(fHandler);
					}
				});
			}
		});
	},
	evalElementContent:function(oElement) {
//tjs_debug_start
		tjs.lang.assert(tjs.dom.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.evalElementContent');
//tjs_debug_end
		if (_doContent(oElement)) {
			this.evalStyles(oElement);
			_evalContent(oElement);
			if (tjs.css.getComputedStyle(oElement).display != 'none') {
				tjs.lang.invokeLater(function(){
					_evalLayouts(oElement);
				});
			}
			var o = oElement.oLifecycle;
			if (o && o.onLoaded) {
				tjs.lang.invokeLater(function(){
					o.onLoaded(oElement);
					delete o.onLoaded;
				});
			}
		}
	},
	evalStyles:function(oElement) {
		var els = tjs.dom.getChildrenByClassName(oElement,'textarea','css');
		if (els && els.length > 0) {
			var styles = [], k = 0, css, el;
			var i = els.length;
			while (i--) {
				el = els[i];
				els[i] = null;
				if (el.id && el.value && !this.getStyleSheet(el.id)) {
					css = {};
					css.id = el.id;
					css.value = el.value;
					css.media = el.getAttribute('media');
					styles[k++] = css;
				}
				oElement.removeChild(el);
			}
			els.length = 0;
			els = null;
			if (styles.length > 0) {
				var oStyleSheet;
				i = styles.length;
				while (i--) {
					css = styles[i];
					styles[i] = null;
					oStyleSheet = this.createStyleSheet(css.id, css.media, css.value);
					delete css.value;
					delete css.media;
					delete css.id;
				}
				styles.length = 0;
			}
			styles = null;
		}
	},
	evalLayouts:function(oElement) {
//tjs_debug_start
		tjs.lang.assert(tjs.dom.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.evalLayouts');
		tjs.lang.assert(tjs.dom.isDescendantOf(oElement,document.body),'!tjs.dom.isDescendantOf(oElement,document.body) @'+this.classname+'.evalLayouts');
//tjs_debug_end
		if (_canLayout(oElement)) {
			_evalLayouts(oElement);
		}
	},
	destroyElementContent:function(oElement) {
//tjs_debug_start
		tjs.lang.assert(tjs.dom.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.destroyElementContent');
//tjs_debug_end
		if (_doContent(oElement)) {
			var s = [oElement], oNode, o;
			var pop = false;
			while (s.length > 0) {
				oNode = s[s.length - 1];
				if (oNode.getAttribute('childrenHandled')) {
					oNode.removeAttribute('childrenHandled');
					pop = true;
				} else {
					if (oNode.hasChildNodes()) {
						oNode.setAttribute('childrenHandled','1');
						_stackChildren(oNode,s,_doContent);
					} else {
						pop = true;
					}
				}
				if (pop) {
					s.length--;
					o = oNode.oLifecycle;
					if (o) {
						if (o.onDestroy) {
							o.onDestroy(oNode);
						}
						tjs.lang.destroyObject(o);
						if (tjs.bom.isOldIE) {
							oNode.oLifecycle = null;
						} else {
							delete oNode.oLifecycle;
						}
					}
					o = oNode.oWidget;
					if (o && o.autoDestroy) {
						o.destroy();
					}
					pop = false;
				}
			}
			if (oElement.hasChildNodes()) {
				oElement.innerHTML = '';
			}
		}
	},

	destroy:function() {
		tjs.lang.destroyArray(this._jsURLs);
		tjs.lang.destroyObject(this);
	},
	init:function() {
		var oHtml = document.documentElement;
		var oHead = tjs.dom.getFirstChildByTagName(oHtml,'head');
		if (!oHead) {
			oHead = document.createElement('head');
			tjs.dom.prependChild(oHead,oHtml);
		}
		var oBody = document.body;
		if (!oBody) {
			oBody = document.createElement('body');
			oHtml.appendChild(oBody);
		} else {
			oBody.normalize();
		}
		var cssText = 'display:block;border:0px none;margin:0px;padding:0px;width:100%;height:100%;';
		oHtml.style.cssText = cssText+'overflow:hidden;position:static;';
		oBody.style.cssText = cssText+'overflow:hidden;position:relative;left:0px;top:0px;';

		this._loadingCount = 0;
		this._loadingLayer = tjs.dom.getFirstChildByAttribute(oBody,'div','id','tjs_loading_layer');
		if (!this._loadingLayer) {
			this._loadingLayer = document.createElement('div');
			this._loadingLayer.setAttribute('id','tjs_loading_layer');
			this._loadingLayer.innerHTML = '<div id="tjs_loading_mask"></div><div id="tjs_loading_container"><div class="tjs_loading_img"></div><div class="tjs_loading_content">Loading ...</div></div>';
		} else {
			oBody.removeChild(this._loadingLayer);
		}
		this._loadingLayer.style.visibility = 'hidden';

		this._hiddenContainer = document.createElement('div');
		this._hiddenContainer.style.cssText = cssText+'z-index:0;visibility:hidden;position:absolute;left:-10000px;top:-10000px;';

		this._bodyWrapper = tjs.dom.getFirstChildByAttribute(oBody,'div','id','tjs_body_wrapper');
		if (!this._bodyWrapper) {
			this._bodyWrapper = document.createElement('div');
			this._bodyWrapper.setAttribute('id','tjs_body_wrapper');
		} else {
			oBody.removeChild(this._bodyWrapper);
		}
		this._bodyWrapper.style.cssText = cssText+'overflow:auto;position:relative;left:0px;top:0px;z-index:1000;';

		tjs.dom.moveChildren(oBody,this._bodyWrapper);
		oBody.appendChild(this._bodyWrapper);
		oBody.appendChild(this._loadingLayer);
		oBody.appendChild(this._hiddenContainer);

		var oTmp = document.createElement('div');
		oTmp.style.cssText = 'width:10000px;height:10000px';
		this._hiddenContainer.style.overflow = 'auto';
		this._hiddenContainer.appendChild(oTmp);
		tjs.bom.hScrollBarWidth = this._hiddenContainer.offsetHeight - this._hiddenContainer.clientHeight;
		tjs.bom.vScrollBarWidth = this._hiddenContainer.offsetWidth - this._hiddenContainer.clientWidth;
		this._hiddenContainer.removeChild(oTmp);
		this._hiddenContainer.style.overflow = 'hidden';
	},
	classname:'tjs.html'
};
})();
