tjs.net = function() {
	var _doNothing = null;
	var _getXHR = function() {
		throw new Error('No support for XMLHttpRequest!');
	};
	if (window.XMLHttpRequest) {
		_getXHR = function() {
			return new XMLHttpRequest();
		};
	} else if (window.ActiveXObject) {
		var _MSXMLHttp = function() {
			var msXMLHttps = ['MSXML2.XMLHTTP.6.0','MSXML2.XMLHTTP.4.0','MSXML2.XMLHTTP.3.0','MSXML2.XMLHTTP','Microsoft.XMLHTTP'];
			for (var i = 0, isize = msXMLHttps.length; i < isize; i++) {
				try {
					new ActiveXObject(msXMLHttps[i]);
					return msXMLHttps[i];
				} catch (oError) {
				}
			}
			return null;
		}();
		if (_MSXMLHttp) {
			_getXHR = function() {
				return new ActiveXObject(_MSXMLHttp);
			};
		}
		_doNothing = function(){};
	}
	var _pageId = (window.name && window.name.indexOf('tjs.') == 0) ? window.name : null;
return {
	getPageId:function(){
		return _pageId;
	},
	getXHR: _getXHR,
	httpPOST:function(url,content,fHandler,contentType,syn,noAnimation) {
//tjs_debug_start
		tjs.lang.assert(Boolean(url) && tjs.lang.isString(url),'!tjs.lang.isString(url) @'+this.classname+'.httpPOST');
		tjs.lang.assert(Boolean(content) && tjs.lang.isString(content),'!tjs.lang.isString(content) @'+this.classname+'.httpPOST');
		tjs.lang.assert(!fHandler || tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.httpPOST');
//tjs_debug_end
		var hasHandler = Boolean(fHandler);
		if (!contentType) {
			contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
		}
		var asyn = !syn;
		var doAnimation = !noAnimation;
		var xhr = _getXHR();
		xhr.open('POST',url,asyn);
		if (_pageId) {
			xhr.setRequestHeader('Page-Id',_pageId);
		}
		//xhr.setRequestHeader("Connection", "close");//
		xhr.setRequestHeader('Content-Type',contentType);
		xhr.setRequestHeader('Content-length', content.length);//
		if (asyn) {
			var oThis = this;
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					if (doAnimation) {
						oThis.hideAnimation();
					}
					xhr.onreadystatechange = _doNothing;
					if (hasHandler) {
						fHandler(xhr);
					}
				}
			};
			if (doAnimation) {
				this.showAnimation();
			}
			xhr.send(content);
		} else {
			if (doAnimation) {
				this.showAnimation();
			}
			xhr.send(content);
			if (doAnimation) {
				this.hideAnimation();
			}
			if (hasHandler) {
				fHandler(xhr);
			}
		}
	},
	httpGET:function(url,fHandler,syn,noAnimation) {
//tjs_debug_start
		tjs.lang.assert(Boolean(url) && tjs.lang.isString(url),'!tjs.lang.isString(url) @'+this.classname+'.httpGET');
		tjs.lang.assert(!fHandler || tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.httpGET');
//tjs_debug_end
		var hasHandler = Boolean(fHandler);
		var asyn = !syn;
		var doAnimation = !noAnimation;
		var xhr = _getXHR();
		xhr.open('GET',url,asyn);
		if (_pageId) {
			xhr.setRequestHeader('Page-Id',_pageId);
		}
		//xhr.setRequestHeader("Connection", "close");//
		if (asyn) {
			var oThis = this;
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					if (doAnimation) {
						oThis.hideAnimation();
					}
					xhr.onreadystatechange = _doNothing;
					if (hasHandler) {
						fHandler(xhr);
					}
				}
			};
			if (doAnimation) {
				this.showAnimation();
			}
			xhr.send(null);
		} else {
			if (doAnimation) {
				this.showAnimation();
			}
			xhr.send(null);
			if (doAnimation) {
				this.hideAnimation();
			}
			if (hasHandler) {
				fHandler(xhr);
			}
		}
	},
	_handleJSONResponse:function(xhr,fHandler,doAnimation){
		if (doAnimation) {
			this.hideAnimation();
		}
		if (xhr.status == 200) {
			fHandler(JSON.parse(xhr.responseText));
		} else {
			fHandler({result:false,message:'Error: HTTP status = '+xhr.status});
		}
	},
	_handleJSONResponse2:function(xhr,fHandler,doAnimation){
		if (xhr.readyState == 4) {
			xhr.onreadystatechange = _doNothing;
			this._handleJSONResponse(xhr,fHandler,doAnimation);
		}
	},
	httpPOST4Json:function(url,content,fHandler,contentType,syn,noAnimation) {
//tjs_debug_start
		tjs.lang.assert(Boolean(url) && tjs.lang.isString(url),'!tjs.lang.isString(url) @'+this.classname+'.httpPOST4Json');
		tjs.lang.assert(Boolean(content) && tjs.lang.isString(content),'!tjs.lang.isString(content) @'+this.classname+'.httpPOST4Json');
		tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.httpPOST4Json');
//tjs_debug_end
		if (!contentType) {
			contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
		}
		var asyn = !syn;
		var doAnimation = !noAnimation;
		var xhr = _getXHR();
		xhr.open('POST',url,asyn);
		if (_pageId) {
			xhr.setRequestHeader('Page-Id',_pageId);
		}
		//xhr.setRequestHeader("Connection", "close");//
		xhr.setRequestHeader('Content-Type',contentType);
		xhr.setRequestHeader("Content-length", content.length);//
		if (asyn) {
			var oThis = this;
			xhr.onreadystatechange = function() {
				oThis._handleJSONResponse2(xhr,fHandler,doAnimation);
			};
			if (doAnimation) {
				this.showAnimation();
			}
			xhr.send(content);
		} else {
			if (doAnimation) {
				this.showAnimation();
			}
			xhr.send(content);
			this._handleJSONResponse(xhr,fHandler,doAnimation);
		}
	},
	httpGET4Json:function(url,fHandler,syn,noAnimation) {
//tjs_debug_start
		tjs.lang.assert(Boolean(url) && tjs.lang.isString(url),'!tjs.lang.isString(url) @'+this.classname+'.httpGET4Json');
		tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.httpGET4Json');
//tjs_debug_end
		var asyn = !syn;
		var doAnimation = !noAnimation;
		var xhr = _getXHR();
		xhr.open('GET',url,asyn);
		if (_pageId) {
			xhr.setRequestHeader('Page-Id',_pageId);
		}
		//xhr.setRequestHeader("Connection", "close");//
		if (asyn) {
			var oThis = this;
			xhr.onreadystatechange = function() {
				oThis._handleJSONResponse2(xhr,fHandler,doAnimation);
			};
			if (doAnimation) {
				this.showAnimation();
			}
			xhr.send(null);
		} else {
			if (doAnimation) {
				this.showAnimation();
			}
			xhr.send(null);
			this._handleJSONResponse(xhr,fHandler,doAnimation);
		}
	},
	// to be overrided
	showAnimation:function(){
	},
	hideAnimation:function(){
	},
	classname:'tjs.net'
};
}();
