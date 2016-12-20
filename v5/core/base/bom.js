tjs.bom = function() {
	var _ua = window.navigator.userAgent.toLowerCase();
	var _isOpera = Boolean(window.opera) || _ua.indexOf('opera') > -1;
	var _isWebKit = (/khtml|webkit/).test(_ua);
	var _isIE = _ua.indexOf('msie') > -1;
	var _isIE6 = _ua.indexOf('msie 6') > -1;
	var _isIE7 = _ua.indexOf('msie 7') > -1;
	var _isIE8 = _ua.indexOf('msie 8') > -1;
	var _isOldIE = _isIE6 || _isIE7 || _isIE8;
	var _isIE9 = _ua.indexOf('msie 9') > -1;
	var _isIE10 = _ua.indexOf('msie 10') > -1;
	var _isIE11 = _ua.indexOf('msie 11') > -1;
	var _isGecko = !_isWebKit && (_ua.indexOf('gecko') > -1);
	var _isWindows = (_ua.indexOf('windows') != -1 || _ua.indexOf('win32') != -1);
	var _isMac = (_ua.indexOf('"macintosh') != -1 || _ua.indexOf('mac os x') != -1);
	var _isLinux = (_ua.indexOf('linux') != -1);
	var _isSecure = window.location.href.toLowerCase().indexOf('https') === 0;
	var _getViewPortWidth,_getViewPortHeight;
	if ('innerWidth' in window) { // All browsers but IE 6, 7, 8
		_getViewPortWidth = function(){
			return window.innerWidth;
		};
		_getViewPortHeight = function(){
			return window.innerHeight;
		};
	} else {
		_getViewPortWidth = function(){
			return document.documentElement.offsetWidth;
		};
		_getViewPortHeight = function(){
			return document.documentElement.offsetHeight;
		};
	}
	if (_isIE6){
	    // remove flicker on anchor tag background images
        try{
            document.execCommand('BackgroundImageCache',false,true);
        }catch(e){}
    }
	if (_isOldIE){
		if (document.namespaces['v'] == null) {
			if (_isIE8) {
				document.namespaces.add('v','urn:schemas-microsoft-com:vml','#default#VML');
				document.namespaces.add('o','urn:schemas-microsoft-com:office:office','#default#VML');
			} else {
				document.namespaces.add('v','urn:schemas-microsoft-com:vml');
				document.namespaces.add('o','urn:schemas-microsoft-com:office:office');
			}
			if (!document.styleSheets['tjs_vml']) {
				var s = document.createStyleSheet();
				s.owningElement.id = 'tjs_vml';
				s.cssText = 'v\\: *{behavior:url(#default#VML);} o\\: *{behavior:url(#default#VML);} canvas{display:inline-block;overflow:hidden;text-align:left;line-height:0px;font-size:0px;}';
			}
		}
	}

return {
	isOpera:_isOpera,
	isWebKit:_isWebKit,
	isIE:_isIE,
	isIE6:_isIE6,
	isIE7:_isIE7,
	isIE8:_isIE8,
	isOldIE:_isOldIE,
	isIE9:_isIE9,
	isIE10:_isIE10,
	isIE11:_isIE11,
	isGecko:_isGecko,
	isWindows:_isWindows,
	isMac:_isMac,
	isLinux:_isLinux,
	isSecure:_isSecure,
	getViewPortWidth:_getViewPortWidth,
	getViewPortHeight:_getViewPortHeight,
	getViewportXY:function(){
		if (!this.oViewportXY) {
			this.oViewportXY = new tjs.geo.Point();
			if (this.isOldIE) {
				this.oViewportXY.x = document.documentElement.clientLeft;
				this.oViewportXY.y = document.documentElement.clientTop;
			}
			this.getViewportXY = function(){
				return this.oViewportXY;
			};
		}
		return this.oViewportXY;
	},
	getViewportX:function(){
		return this.getViewportXY().x;
	},
	getViewportY:function(){
		return this.getViewportXY().y;
	},
	convertW2D:function(pos){
		if (_isOldIE) {
			var xy = this.getViewportXY();
			pos.x -= xy.x;
			pos.y -= xy.y;
		}
		//pos.x += this.getPageXOffset();
		//pos.y += this.getPageYOffset();
		return pos;
	},
	convertD2W:function(pos){
		if (_isOldIE) {
			var xy = this.getViewportXY();
			pos.x += xy.x;
			pos.y += xy.y;
		}
		//pos.x -= this.getPageXOffset();
		//pos.y -= this.getPageYOffset();
		return pos;
	},
	scrollTo:function(oElement,x,y) {
//tjs_debug_start
		tjs.lang.assert(Boolean(oElement),'!oElement @'+this.classname+'.scrollTo');
//tjs_debug_end
		oElement.scrollLeft = (oElement.scrollWidth > oElement.clientWidth) ? x : 0;
		oElement.scrollTop = (oElement.scrollHeight > oElement.clientHeight) ? y : 0;
	},
	getScrollLeft:function(oElement) {
//tjs_debug_start
		tjs.lang.assert(Boolean(oElement),'!oElement @'+this.classname+'.getScrollLeft');
//tjs_debug_end
		return oElement.scrollLeft;
	},
	getScrollTop:function(oElement) {
//tjs_debug_start
		tjs.lang.assert(Boolean(oElement),'!oElement @'+this.classname+'.getScrollTop');
//tjs_debug_end
		return oElement.scrollTop;
	},
	getScrollWidth:function(oElement) {
//tjs_debug_start
		tjs.lang.assert(Boolean(oElement),'!oElement @'+this.classname+'.getScrollWidth');
//tjs_debug_end
		return Math.max(oElement.scrollWidth,oElement.clientWidth);
	},
	getScrollHeight:function(oElement) {
//tjs_debug_start
		tjs.lang.assert(Boolean(oElement),'!oElement @'+this.classname+'.getScrollHeight');
//tjs_debug_end
		return Math.max(oElement.scrollHeight,oElement.clientHeight);
	},
	getHScrollBarWidth:function() {
		return this.hScrollBarWidth;
	},
	getVScrollBarWidth:function() {
		return this.vScrollBarWidth;
	},
	classname:'tjs.bom'
};
}();
