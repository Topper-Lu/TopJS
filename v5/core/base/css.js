tjs.css = function(){
	var tl = tjs.lang,td = tjs.dom,_getComputedStyle,_getFloat,_setFloat,_getOpacity,_setOpacity;
	var _lengthFactor = {
		'in':96,
		'cm':96/2.54,
		'mm':96/25.4,
		'pt':4/3,
		'pc':16
	};
	var _fontSize = {
		'small':13,
		'medium':16,
		'large':18,
		'x-small':10,
		'xx-small':9,
		'x-large':24,
		'xx-large':32
	};

	if (window.getComputedStyle) { // W3C, All browsers but IE 6, 7, 8
		_getComputedStyle = function(oElement) {
//tjs_debug_start
			tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'._getComputedStyle');
//tjs_debug_end
			return window.getComputedStyle(oElement,null);
		};
		_getFloat = function(oElement){
//tjs_debug_start
			tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'._getFloat');
//tjs_debug_end
			return _getComputedStyle(oElement).cssFloat;
		};
		_setFloat = function(oElement,sFloat){
//tjs_debug_start
			tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'._setFloat');
			tl.assert(tjs.lang.isString(sFloat),'!tjs.lang.isString(sFloat) @'+this.classname+'._setFloat');
//tjs_debug_end
			oElement.style.cssFloat = sFloat;
		};
		_getOpacity = function(oElement) {
//tjs_debug_start
			tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'._getOpacity');
//tjs_debug_end
			return _getComputedStyle(oElement).opacity;
		};
		_setOpacity = function(oElement,opacity) {
//tjs_debug_start
			tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'._setOpacity');
			tl.assert(tl.isNumber(opacity),'!tjs.lang.isNumber(opacity) @'+this.classname+'._setOpacity');
			tl.assert(opacity >= 0 && opacity <= 1,'opacity out of bounds @'+this.classname+'._setOpacity');
//tjs_debug_end
			oElement.style.opacity = opacity;
		};
	} else if (tjs.bom.isOldIE) { // IE
		_getComputedStyle = function(oElement) {
//tjs_debug_start
			tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'._getComputedStyle');
//tjs_debug_end
			return oElement.currentStyle;
		};
		_getFloat = function(oElement){
//tjs_debug_start
			tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'._getFloat');
//tjs_debug_end
			return _getComputedStyle(oElement).styleFloat;
		};
		_setFloat = function(oElement,sFloat){
//tjs_debug_start
			tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'._setFloat');
			tl.assert(tl.isString(sFloat),'!tjs.lang.isString(sFloat) @'+this.classname+'._setFloat');
//tjs_debug_end
			oElement.style.styleFloat = sFloat;
		};
		var re_opacity = /opacity=([^)]*)/;
		_getOpacity = function(oElement) {
//tjs_debug_start
			tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'._getOpacity');
//tjs_debug_end
			var filter = _getComputedStyle(oElement).filter;
			if (filter && filter.indexOf("opacity=") >= 0) {
				return parseFloat(re_opacity.exec(filter)[1]) / 100;
			} else {
				return 1;
			}
		};
		_setOpacity = function(oElement,opacity) {
//tjs_debug_start
			tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'._setOpacity');
			tl.assert(tl.isNumber(opacity),'!tjs.lang.isNumber(opacity) @'+this.classname+'._setOpacity');
			tl.assert(opacity >= 0 && opacity <= 1,'opacity out of bounds @'+this.classname+'._setOpacity');
//tjs_debug_end
			if (opacity >= 1) {
				oElement.style.filter = '';
			} else {
				oElement.style.filter = 'alpha(opacity='+Math.round(opacity*100)+')';
			}
		};
	} else {
		throw new Error('No support for window.getComputedStyle! @tjs.css');
	}

return {
	/**
	 * Retrieve the computed style object of a Element.
	 *
	 * @param	{Element} oElement:
	 * A DOM element.
	 * @return	{CSSStyleDeclaration}
	 * The computed style object of oElement.
	 */
	getComputedStyle: _getComputedStyle,

	/**
	 * Convert a camel string to a css property string.
	 * for example:
	 * 'backgroundColor' -> 'background-color'
	 * 'borderLeftWidth' -> 'border-left-width'
	 *
	 * @param	sName: A string.
	 * @return	A string.
	 */
	toHyphenCase:function(sName) {
//tjs_debug_start
		tl.assert(sName && tjs.lang.isString(sName),'!sName || !tjs.lang.isString(sName) @'+this.classname+'.toHyphenCase');
//tjs_debug_end
		return sName.replace(/([A-Z])/g,'-$1').toLowerCase();
	},
	/**
	 * Convert a css property string to a camel string.
	 * for example:
	 * 'background-color' -> 'backgroundColor'
	 * 'border-left-width' -> 'borderLeftWidth'
	 *
	 * @param	sName: A string.
	 * @return	A string.
	 */
	toCamelCase:function(sName) {
//tjs_debug_start
		tl.assert(sName && tjs.lang.isString(sName),'!sName || !tjs.lang.isString(sName) @'+this.classname+'.toCamelCase');
//tjs_debug_end
		return sName.replace(/-(\w)/g,function(all,letter){return letter.toUpperCase();});
	},
	getColor:function(oElement) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getColor');
//tjs_debug_end
		var sV = _getComputedStyle(oElement).color;
		return tjs.color.parseComputedColor(sV);
	},
	getBackgroundColor:function(oElement,deep) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getBackgroundColor');
//tjs_debug_end
		var sV = _getComputedStyle(oElement).backgroundColor;
		if (sV != 'transparent') {
			return tjs.color.parseComputedColor(sV);
		} else if (deep) {
			return this.getBackgroundColor(oElement.parentNode);
		} else {
			return null;//transparent
		}
	},
	getBackgroundImage:function(oElement) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getBackgroundImage');
//tjs_debug_end
		return _getComputedStyle(oElement).backgroundImage;
	},
	getBackgroundRepeat:function(oElement) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getBackgroundRepeat');
//tjs_debug_end
		return _getComputedStyle(oElement).backgroundRepeat;
	},
	getBackgroundAttachment:function(oElement) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getBackgroundAttachment');
//tjs_debug_end
		return _getComputedStyle(oElement).backgroundAttachment;
	},
	getBackgroundPosition:function(oElement) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getBackgroundPosition');
//tjs_debug_end
		return _getComputedStyle(oElement).backgroundPosition;
	},
	setOpacity:_setOpacity,
	getOpacity:_getOpacity,
	setFloat:_setFloat,
	getFloat:_getFloat,
	getZIndex:function(oElement) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getZIndex');
//tjs_debug_end
		return _getComputedStyle(oElement).zIndex;
	},
	getFontSize:function(oElement){
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getFontSize');
//tjs_debug_end
		var sV = _getComputedStyle(oElement).fontSize;
		var nV = parseFloat(sV);
		if (isNaN(nV)) {
			if (sV in _fontSize) {
				return _fontSize[sV];
			} else {
				return this.getFontSize(oElement.parentNode);
			}
		} else {
			if (nV == 0) {
				return 0;
			}
			if (sV.charAt(sV.length - 1) == '%') {
				nV *= this.getFontSize(oElement.parentNode)/100;
			} else {
				var unit = sV.substring(sV.length - 2);
				if (unit != 'px') {
					nV = this._convert(oElement,nV,unit);
				}
			}
			return Math.round(nV);
		}
	},
	_convert:function(oElement,value,unit){
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'._convert');
		tl.assert(value && tl.isNumber(value),'!tjs.lang.isNumber(value) @'+this.classname+'._convert');
		tl.assert(unit && tl.isString(unit),'!tjs.lang.isString(unit) @'+this.classname+'._convert');
//tjs_debug_end
		if (unit in _lengthFactor) {
			return value*_lengthFactor[unit];
		} else if (unit == 'em') {
			return value*this.getFontSize(oElement);
		} else if (unit == 'ex') {
			return value*this.getFontSize(oElement)/2;
		} else {
			throw new Error('Can not convert value for unit:'+unit+' @'+this.classname+'._convert');
		}
	},
	getFontWeight:function(oElement){
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getFontWeight');
//tjs_debug_end
		var sV = _getComputedStyle(oElement).fontWeight;
		var nV = parseInt(sV);
		if (isNaN(nV)) {
			switch (sV) {
				case 'normal':
					return 400;
				case 'bold':
					return 700;
				case 'bolder':
					nV = this.getFontWeight(oElement.parentNode);
					return nV < 900 ? nV : 900;
				case 'lighter':
					nV = this.getFontWeight(oElement.parentNode);
					return nV > 100 ? nV : 100;
				default:
					return this.getFontWeight(oElement.parentNode);
			}
		} else {
			return nV;
		}
	},
	getFontStyle:function(oElement){
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getFontStyle');
//tjs_debug_end
		return _getComputedStyle(oElement).fontStyle;
	},
	getFontVariant:function(oElement){
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getFontVariant');
//tjs_debug_end
		return _getComputedStyle(oElement).fontStyle;
	},
	getLineHeight:function(oElement){
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getFontStyle');
//tjs_debug_end
		var sV = _getComputedStyle(oElement).lineHeight;
		var nV = Number(sV);
		if (isFinite(nV)) {
			return Math.round(nV*this.getFontSize(oElement));
		}
		nV = parseFloat(sV);
		if (isNaN(nV)) {
			switch (sV) {
				case 'normal':
					return Math.round(this.getFontSize(oElement)*1.2);
				default:
					return this.getFontSize(oElement.parentNode);
			}
		} else {
			if (nV == 0) {
				return 0;
			}
			if (sV.charAt(sV.length - 1) == '%') {
				nV *= this.getFontSize(oElement)/100;
			} else {
				var unit = sV.substring(sV.length - 2);
				if (unit != 'px') {
					nV = this._convert(oElement,nV,unit);
				}
			}
			return Math.round(nV);
		}
	},
	hasHScrollBar:function(oElement){
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.hasHScrollBar');
//tjs_debug_end
		var oCS = _getComputedStyle(oElement);
		if (oCS.overflow == 'scroll') {
			return true;
		} else if (oCS.overflow == 'auto') {
			return oElement.scrollWidth > oElement.clientWidth;
		} else {
			return false;
		}
	},
	hasVScrollBar:function(oElement){
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.hasVScrollBar');
//tjs_debug_end
		var oCS = _getComputedStyle(oElement);
		if (oCS.overflow == 'scroll') {
			return true;
		} else if (oCS.overflow == 'auto') {
			return oElement.scrollHeight > oElement.clientHeight;
		} else {
			return false;
		}
	},
	getBorderWidth:function(oElement,dir){
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getBorderWidth');
		tl.assert(dir && tl.isString(dir),'!tjs.lang.isString(dir) @'+this.classname+'.getBorderWidth');
//tjs_debug_end
		var oHtml = document.documentElement;
		var oBody = document.body;
		if (oElement == oHtml || oElement == oBody) {
			return 0;
		}
		var sV, sT, oCS = _getComputedStyle(oElement);
		switch (dir) {
			case 'l':
				sV = oCS.borderLeftWidth;
				sT = oCS.borderLeftStyle;
				break;
			case 't':
				sV = oCS.borderTopWidth;
				sT = oCS.borderTopStyle;
				break;
			case 'r':
				sV = oCS.borderRightWidth;
				sT = oCS.borderRightStyle;
				break;
			case 'b':
				sV = oCS.borderBottomWidth;
				sT = oCS.borderBottomStyle;
				break;
			default:
				throw new Error('Wrong dir @'+this.classname+'.getBorderWidth');
		}
		if (sT == 'none' || sT == 'hidden') {
			return 0;
		}
		var nV = parseFloat(sV);
		// Gecko, Opera, WebKit always return px
		if (isNaN(nV)) {
			switch (sV) {
				case 'thin':
					if (tjs.bom.isIE) {
						return 2;
					} else {// Gecko, WebKit, Opera
						return 1;
					}
				case 'medium':
					if (tjs.bom.isIE) {
						return 4;
					} else {// Gecko, WebKit, Opera
						return 3;
					}
				case 'thick':
					if (tjs.bom.isIE || tjs.bom.isOpera) {
						return 6;
					} else {// Gecko, WebKit, Opera
						return 5;
					}
				default:
					return 0;
			}
		} else if (nV == 0) {
			return 0;
		} else {
			var unit = sV.substring(sV.length - 2);
			if (unit != 'px') {
				nV = this._convert(oElement,nV,unit);
			}
			return Math.round(nV);
		}
	},
	getHBorders:function(oElement){
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getHBorders');
//tjs_debug_end
		return this.getBorderWidth(oElement,'l')+this.getBorderWidth(oElement,'r');
	},
	getVBorders:function(oElement){
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getVBorders');
//tjs_debug_end
		return this.getBorderWidth(oElement,'t')+this.getBorderWidth(oElement,'b');
	},
	getMarginWidth:function(oElement,dir){
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getMarginWidth');
		tl.assert(dir && tl.isString(dir),'!tjs.lang.isString(dir) @'+this.classname+'.getMarginWidth');
//tjs_debug_end
		var oHtml = document.documentElement;
		var oBody = document.body;
		if (oElement == oHtml || oElement == oBody) {
			return 0;
		}
		var sV, oCS = _getComputedStyle(oElement);
		switch (dir) {
			case 'l':
				sV = oCS.marginLeft;
				break;
			case 't':
				sV = oCS.marginTop;
				break;
			case 'r':
				sV = oCS.marginRight;
				break;
			case 'b':
				sV = oCS.marginBottom;
				break;
			default:
				throw new Error('Wrong dir @'+this.classname+'.getMarginWidth');
		}
		var nV = parseFloat(sV);
		if (isNaN(nV) || nV == 0) {
			return 0;
		}
		// Gecko, Opera, WebKit return px
		if (sV.charAt(sV.length - 1) == '%') {// IE only
			switch (oCS.position) {
				case 'fixed':
					nV *= tjs.bom.getViewPortWidth();
					break;
				case 'absolute':
					nV *= this.getPaddingBoxWidth(oElement.offsetParent);
					break;
				case 'relative':
				case 'static':
					nV *= this.getContentBoxWidth(oElement.parentNode);
					break;
			}
		} else {
			var unit = sV.substring(sV.length - 2);
			if (unit != 'px') {
				nV = this._convert(oElement,nV,unit);
			}
		}
		return Math.round(nV);
	},
	getHMargins:function(oElement){
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getHMargins');
//tjs_debug_end
		return this.getMarginWidth(oElement,'l')+this.getMarginWidth(oElement,'r');
	},
	getVMargins:function(oElement){
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getVMargins');
//tjs_debug_end
		return this.getMarginWidth(oElement,'t')+this.getMarginWidth(oElement,'b');
	},
	getPaddingWidth:function(oElement,dir){
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getPaddingWidth');
		tl.assert(dir && tl.isString(dir),'!tjs.lang.isString(dir) @'+this.classname+'.getPaddingWidth');
//tjs_debug_end
		var oHtml = document.documentElement;
		var oBody = document.body;
		if (oElement == oHtml || oElement == oBody) {
			return 0;
		}
		var sV, oCS = _getComputedStyle(oElement);
		switch (dir) {
			case 'l':
				sV = oCS.paddingLeft;
				break;
			case 't':
				sV = oCS.paddingTop;
				break;
			case 'r':
				sV = oCS.paddingRight;
				break;
			case 'b':
				sV = oCS.paddingBottom;
				break;
			default:
				throw new Error('Wrong dir @'+this.classname+'.getPaddingWidth');
		}
		var nV = parseFloat(sV);
		if (isNaN(nV) || nV == 0) {
			return 0;
		}
		// Gecko, Opera, WebKit (return px)
		if (sV.charAt(sV.length - 1) == '%') {// IE only
			switch (oCS.position) {
				case 'fixed':
					nV *= tjs.bom.getViewPortWidth();
					break;
				case 'absolute':
					nV *= this.getPaddingBoxWidth(oElement.offsetParent);
					break;
				case 'relative':
				case 'static':
					nV *= this.getContentBoxWidth(oElement.parentNode);
					break;
			}
		} else {
			var unit = sV.substring(sV.length - 2);
			if (unit != 'px') {
				nV = this._convert(oElement,nV,unit);
			}
		}
		return Math.round(nV);
	},
	getHPaddings:function(oElement){
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getHPaddings');
//tjs_debug_end
		return this.getPaddingWidth(oElement,'l')+this.getPaddingWidth(oElement,'r');
	},
	getVPaddings:function(oElement){
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getVPaddings');
//tjs_debug_end
		return this.getPaddingWidth(oElement,'t')+this.getPaddingWidth(oElement,'b');
	},

	getMarginBoxWidth:function(oElement) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getMarginBoxWidth');
//tjs_debug_end
		if (oElement == document.documentElement || oElement == document.body) {
			return tjs.bom.getViewPortWidth();
		}
		return oElement.offsetWidth + this.getHMargins(oElement);
	},
	getMarginBoxHeight:function(oElement) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getMarginBoxHeight');
//tjs_debug_end
		if (oElement == document.documentElement || oElement == document.body) {
			return tjs.bom.getViewPortHeight();
		}
		return oElement.offsetHeight + this.getVMargins(oElement);
	},
	getPaddingBoxWidth:function(oElement) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getPaddingBoxWidth');
//tjs_debug_end
		if (oElement == document.documentElement || oElement == document.body) {
			return tjs.bom.getViewPortWidth();
		}
		if (oElement.clientWidth && !this.hasVScrollBar(oElement)) {
			return oElement.clientWidth;
		} else {
			return oElement.offsetWidth - this.getHBorders(oElement);
		}
	},
	getPaddingBoxHeight:function(oElement) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getPaddingBoxHeight');
//tjs_debug_end
		if (oElement == document.documentElement || oElement == document.body) {
			return tjs.bom.getViewPortHeight();
		}
		if (oElement.clientHeight && !this.hasHScrollBar(oElement)) {
			return oElement.clientHeight;
		} else {
			return oElement.offsetHeight - this.getVBorders(oElement);
		}
	},
	getContentBoxWidth:function(oElement) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getContentBoxWidth');
//tjs_debug_end
		if (oElement == document.documentElement || oElement == document.body) {
			return tjs.bom.getViewPortWidth();
		}
		var sv = _getComputedStyle(oElement).width;
		if (tjs.bom.isOldIE) {
			if (sv && sv.length > 2 && sv.lastIndexOf('px') == (sv.length - 2)) {
				return Math.round(parseFloat(sv));
			} else {
				return this.getPaddingBoxWidth(oElement) - this.getHPaddings(oElement);
			}
		} else {
			return Math.round(parseFloat(sv));
		}
	},
	getContentBoxHeight:function(oElement) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getContentBoxHeight');
//tjs_debug_end
		if (oElement == document.documentElement || oElement == document.body) {
			return tjs.bom.getViewPortHeight();
		}
		var sv = _getComputedStyle(oElement).height;
		if (tjs.bom.isOldIE) {
			if (sv && sv.length > 2 && sv.lastIndexOf('px') == (sv.length - 2)) {
				return Math.round(parseFloat(sv));
			} else {
				return this.getPaddingBoxHeight(oElement) - this.getVPaddings(oElement);
			}
		} else {
			return Math.round(parseFloat(sv));
		}
	},

	setMarginDimension:function(oElement,w,h) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.setMarginDimension');
		tl.assert(tl.isNumber(w),'!tjs.lang.isNumber(w) @'+this.classname+'.setMarginDimension');
		tl.assert(tl.isNumber(h),'!tjs.lang.isNumber(h) @'+this.classname+'.setMarginDimension');
//tjs_debug_end
		var oStyle = oElement.style;
		w -= this.getHMargins(oElement);
		w -= this.getHBorders(oElement);
		w -= this.getHPaddings(oElement);
		if (tjs.bom.isIE6) {
			oStyle.width = '1px';
		}
		oStyle.width = w+'px';
		h -= this.getVMargins(oElement);
		h -= this.getVBorders(oElement);
		h -= this.getVPaddings(oElement);
		if (tjs.bom.isIE6) {
			oStyle.height = '1px';
		}
		oStyle.height = h+'px';
	},
	setMarginWidth:function(oElement,w) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.setMarginWidth');
		tl.assert(tl.isNumber(w),'!tjs.lang.isNumber(w) @'+this.classname+'.setMarginWidth');
//tjs_debug_end
		w -= this.getHMargins(oElement);
		w -= this.getHBorders(oElement);
		w -= this.getHPaddings(oElement);
		var oStyle = oElement.style;
		if (tjs.bom.isIE6) {
			oStyle.width = '1px';
		}
		oStyle.width = w+'px';
	},
	setMarginHeight:function(oElement,h) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.setMarginHeight');
		tl.assert(tl.isNumber(h),'!tjs.lang.isNumber(h) @'+this.classname+'.setMarginHeight');
//tjs_debug_end
		h -= this.getVMargins(oElement);
		h -= this.getVBorders(oElement);
		h -= this.getVPaddings(oElement);
		var oStyle = oElement.style;
		if (tjs.bom.isIE6) {
			oStyle.height = '1px';
		}
		oStyle.height = h+'px';
	},

	setOffsetDimension:function(oElement,w,h) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.setOffsetDimension');
		tl.assert(w == null || tl.isNumber(w),'!tjs.lang.isNumber(w) @'+this.classname+'.setOffsetDimension');
		tl.assert(h == null || tl.isNumber(h),'!tjs.lang.isNumber(h) @'+this.classname+'.setOffsetDimension');
//tjs_debug_end
		var oStyle = oElement.style;
		if (w == null) {
			w = oElement.offsetWidth;
		}
		w -= this.getHBorders(oElement);
		w -= this.getHPaddings(oElement);
		if (tjs.bom.isIE6) {
			oStyle.width = '1px';
		}
		oStyle.width = w+'px';
		if (h == null) {
			h = oElement.offsetHeight;
		}
		h -= this.getVBorders(oElement);
		h -= this.getVPaddings(oElement);
		if (tjs.bom.isIE6) {
			oStyle.height = '1px';
		}
		oStyle.height = h+'px';
	},
	setOffsetWidth:function(oElement,w) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.setOffsetWidth');
		tl.assert(w == null || tl.isNumber(w),'!tjs.lang.isNumber(w) @'+this.classname+'.setOffsetWidth');
//tjs_debug_end
		var oStyle = oElement.style;
		if (w == null) {
			w = oElement.offsetWidth;
		}
		w -= this.getHPaddings(oElement);
		w -= this.getHBorders(oElement);
		if (tjs.bom.isIE6) {
			oStyle.width = '1px';
		}
		oStyle.width = w+'px';
	},
	setOffsetHeight:function(oElement,h) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.setOffsetHeight');
		tl.assert(h == null || tl.isNumber(h),'!tjs.lang.isNumber(h) @'+this.classname+'.setOffsetHeight');
//tjs_debug_end
		var oStyle = oElement.style;
		if (h == null) {
			h = oElement.offsetHeight;
		}
		h -= this.getVPaddings(oElement);
		h -= this.getVBorders(oElement);
		if (tjs.bom.isIE6) {
			oStyle.height = '1px';
		}
		oStyle.height = h+'px';
	},

	getAncestorClientWidth:function(oElement){
		var o = oElement.parentNode;
		while(!o.clientWidth) {
			o = o.parentNode;
		}
		return o.clientWidth;
	},
	getAncestorClientHeight:function(oElement){
		var o = oElement.parentNode;
		while(!o.clientHeight) {
			o = o.parentNode;
		}
		return o.clientHeight;
	},

	getLeft:function(oElement) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getLeft');
//tjs_debug_end
		if (oElement == document.documentElement || oElement == document.body) {
			return 0;
		}
		var oCS = _getComputedStyle(oElement);
		if (oCS.position == 'static') {
			return 0;
		}
		var sV = oCS.left;
		var nV = parseFloat(sV);
		if (isNaN(nV) || nV == 0) {
			return 0;
		}
		// Gecko, WebKit, Opera always return px
		if (sV.charAt(sV.length - 1) == '%') {// OldIE
			switch (oCS.position) {
				case 'fixed':
					nV *= tjs.bom.getViewPortWidth();
					break;
				case 'absolute':
					nV *= this.getPaddingBoxWidth(oElement.offsetParent);
					break;
				case 'relative':
					if (tjs.bom.isOldIE) {
						nV *= this.getAncestorClientWidth(oElement);
					} else {
						nV *= this.getContentBoxWidth(oElement.parentNode);
					}
					break;
			}
		} else {
			var unit = sV.substring(sV.length - 2);
			if (unit != 'px') {
				nV = this._convert(oElement,nV,unit);// OldIE
			}
		}
		return Math.round(nV);
	},
	getTop:function(oElement) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getTop');
//tjs_debug_end
		if (oElement == document.documentElement || oElement == document.body) {
			return 0;
		}
		var oCS = _getComputedStyle(oElement);
		if (oCS.position == 'static') {
			return 0;
		}
		var sV = oCS.top;
		var nV = parseFloat(sV);
		if (isNaN(nV) || nV == 0) {
			return 0;
		}
		// Gecko, WebKit, Opera always return px
		if (sV.charAt(sV.length - 1) == '%') {// OldIE
			switch (oCS.position) {
				case 'fixed':
					nV *= tjs.bom.getViewPortHeight();
					break;
				case 'absolute':
					nV *= this.getPaddingBoxHeight(oElement.offsetParent);
					break;
				case 'relative':
					if (tjs.bom.isOldIE) {
						nV *= this.getAncestorClientHeight(oElement);
					} else {
						nV *= this.getContentBoxHeight(oElement.parentNode);
					}
					break;
			}
		} else {
			var unit = sV.substring(sV.length - 2);
			if (unit != 'px') {
				nV = this._convert(oElement,nV,unit);
			}
		}
		return Math.round(nV);
	},

	/**
	@method tjs.css.isLayouted
	 * Tests whether the specified element is layouted properly.
	 *
	 * @param	{HTMLElement} oElement:
	 * The specified element to be tested
	 * @return	{boolean}
	 * Return false if oElement is not a descendant of document.documentElement or
	 * any ancestor of oElement(include oElement) is styled improperly(for example,
	 * display:none), true ortherwise.
	 */
	isLayouted:function(oElement) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.isLayouted');
//tjs_debug_end
		var oHtml = document.documentElement;
		do {
			if (_getComputedStyle(oElement).display == 'none') {
				return false;
			}
			if (oElement == oHtml) {
				return true;
			}
			oElement = oElement.parentNode;
		} while (oElement);
		return false;
	},

	getScrollParent:function(oElement) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getScrollParent');
//tjs_debug_end
		if (tjs.bom.isOldIE) {
			return oElement.offsetParent;
		}
		var oParent;
		if (_getComputedStyle(oElement).position == 'absolute') {
			oParent = oElement.offsetParent;
		} else {
			oParent = oElement.parentNode;
			if (tjs.bom.isOpera) {
				var reg = /^inline|table-row.*$/i;
				while (oParent && reg.test(_getComputedStyle(oParent).display)) {
					oParent = oParent.parentNode;
				}
			}
		}
		return oParent;
	},

	/**
	@method tjs.css.getPosition
	Gets the current position in document or window of the specified element.
	The specified element must be part of the DOM tree and styled properly.

	@param oElement: HTMLElement
	The specified element

	@param inWindow: boolean
	true for window, false for document

	@return tjs.geo.Point
	Return the position in document of the element

	@throws Error
	If oElement is not a descendant of document.documentElement or any ancestor of
	oElement(include oElement) is styled improperly(for example: display:none).
	*/
	getPosition:function(oElement,inWindow) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getPosition');
		tl.assert(this.isLayouted(oElement),'!this.isLayouted(oElement) @'+this.classname+'.getPosition');
//tjs_debug_end
		var pos = new tjs.geo.Point();
		var oHtml = document.documentElement;
		var oBody = document.body;
		//assume (margin:0;padding:0;border:0 none;) for oHtml & oBody
		if (oElement == oHtml || oElement == oBody) {
			return pos;
		}
		var oCS = _getComputedStyle(oElement);
		if (oCS.position == 'fixed') {
			pos.x = this.getLeft(oElement);
			pos.y = this.getTop(oElement);
			pos.x += this.getMarginWidth(oElement,'l');
			pos.y += this.getMarginWidth(oElement,'t');
			return pos;
		}
		var oNode;
		if (oElement.getBoundingClientRect) { // W3C CSSOM
			var rec = oElement.getBoundingClientRect();
			pos.x = rec.left;
			pos.y = rec.top;
			if (!inWindow) {
				pos = tjs.bom.convertW2D(pos);
			}
		} else if (document.getBoxObjectFor) { // Old Gecko
			var bo = document.getBoxObjectFor(oElement);
			pos.x = bo.x;
			pos.y = bo.y;
			pos.x -= this.getBorderWidth(oElement,'l');
			pos.y -= this.getBorderWidth(oElement,'t');
			oNode = this.getScrollParent(oElement);
			while (oNode && oNode != oBody) {
				pos.x -= oNode.scrollLeft || 0;
				pos.y -= oNode.scrollTop || 0;
				//--- fix bug begin ---//
				if (_getComputedStyle(oNode).overflow != 'visible') {
					pos.x += this.getBorderWidth(oNode,'l');
					pos.y += this.getBorderWidth(oNode,'t');
				}
				//--- fix bug end ---//
				oNode = this.getScrollParent(oNode);
			}
		} else {
			pos.x += oElement.offsetLeft || 0;
			pos.y += oElement.offsetTop || 0;
			oNode = oElement.offsetParent;
			var isOpera = tjs.bom.isOpera;
			while (oNode && oNode != oBody) {
				if (!isOpera) {
					pos.x += oNode.clientLeft || 0;
					pos.y += oNode.clientTop || 0;
				}
				pos.x += oNode.offsetLeft || 0;
				pos.y += oNode.offsetTop || 0;
				oNode = oNode.offsetParent;
			}
			oNode = this.getScrollParent(oElement);
			while (oNode && oNode != oBody) {
				pos.x -= oNode.scrollLeft || 0;
				pos.y -= oNode.scrollTop || 0;
				oNode = this.getScrollParent(oNode);
			}
		}
		return pos;
	},

	/**
	@method tjs.css.setPosition
	Sets the current position in document of the specified element.
	The specified element must be part of the DOM tree and styled properly.

	@param oElement: HTMLElement
	The specified element

	@param x: Integer
	The document coordinates x
	@param y: Integer
	The document coordinates y

	@throws Error
	If oElement is not a descendant of document.documentElement or any ancestor of
	oElement(include oElement) is styled improperly(for example: display:none,
	position:relative or position:static).
	*/
	setPosition:function(oElement,x,y) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.setPosition');
		tl.assert(this.isLayouted(oElement),'!this.isLayouted(oElement) @'+this.classname+'.setPosition');
		tl.assert(tl.isNumber(x),'!tjs.lang.isNumber(x) @'+this.classname+'.setPosition');
		tl.assert(tl.isNumber(y),'!tjs.lang.isNumber(y) @'+this.classname+'.setPosition');
//tjs_debug_end
		var oCS = _getComputedStyle(oElement);
//tjs_debug_start
		tl.assert(oCS.position == 'absolute' || oCS.position == 'fixed','oCS.position != absolute && oCS.position != fixed @'+this.classname+'.setPosition');
//tjs_debug_end
		x -= this.getMarginLeft(oCS);
		y -= this.getMarginTop(oCS);
		if (oCS.position == 'absolute') {
			var oParent = oElement.offsetParent;
			var pos = this.getPosition(oParent);
			x -= pos.x;
			y -= pos.y;
			x -= this.getBorderWidth(oParent,'l');
			y -= this.getBorderWidth(oParent,'t');
			x += oParent.scrollLeft;
			y += oParent.scrollTop;
		}
		var oStyle = oElement.style;
		oStyle.left = x + 'px';
		oStyle.top = y + 'px';
	},

	/**
	@method tjs.css.aboveElement
	Tests whether the specified point (x,y) in document is above a given element.

	@param oElement: HTMLElement
	The given element to be tested

	@param x: Integer
	document coordinate x

	@param y: Integer
	document coordinate y

	@return Boolean
	Return true if (x,y) is above a given element, false otherwise.

	@throws Error
	If oElement is not a descendant of document.documentElement or any ancestor of
	oElement(include oElement) is styled improperly(for example: display:none).
	*/
	aboveElement:function(oElement,x,y) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.aboveElement');
		tl.assert(tl.isNumber(x),'!tjs.lang.isNumber(x) @'+this.classname+'.aboveElement');
		tl.assert(tl.isNumber(y),'!tjs.lang.isNumber(y) @'+this.classname+'.aboveElement');
//tjs_debug_end
		var pos = this.getPosition(oElement);
		var result = x >= pos.x && y >= pos.y && x < (pos.x + oElement.offsetWidth) && y < (pos.y + oElement.offsetHeight);
		pos.destroy();
		return result;
	},

	/**
	@method tjs.css.toLocalPosition
	Transfer (x,y) in window coordinate to position relative to the specified element.

	@param oElement: HTMLElement
	The specified element

	@param x: Integer
	window coordinate x

	@param y: Integer
	window coordinate y

	@return tjs.geo.Point
	The position relative to oElement
	*/
	toLocalPosition:function(oElement,x,y) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.toLocalPosition');
		tl.assert(tl.isNumber(x),'!tjs.lang.isNumber(x) @'+this.classname+'.toLocalPosition');
		tl.assert(tl.isNumber(y),'!tjs.lang.isNumber(y) @'+this.classname+'.toLocalPosition');
//tjs_debug_end
		var pos;
		if (oElement.getBoundingClientRect) {//W3C CSSOM
			var rec = oElement.getBoundingClientRect();
			pos = new tjs.geo.Point(rec.left,rec.top);
		} else {
			pos = this.getPosition(oElement);
		}
		pos.x = x - pos.x;
		pos.y = y - pos.y;
		if (!tjs.bom.isGecko || document.elementFromPoint) {
			pos.x -= oElement.clientLeft || 0;
			pos.y -= oElement.clientTop || 0;
		} else {
			pos.x -= this.getBorderWidth(oElement,'l');
			pos.y -= this.getBorderWidth(oElement,'t');
		}
		pos.x += oElement.scrollLeft || 0;
		pos.y += oElement.scrollTop || 0;
		return pos;
	},

	/**
	@method tjs.css.getRelPosition
	Gets the element's position reative to its ancestor.

	@param oElement: HTMLElement
	The specified element

	@param oAncestor: HTMLElement
	The specified element's ancestor

	@return tjs.geo.Point
	The element's position reative to its ancestor
	*/
	getRelPosition:function(oElement,oAncestor) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getRelPosition');
		tl.assert(td.isDescendantOf(oElement,oAncestor),'!tjs.dom.isDescendantOf(oElement,oAncestor) @'+this.classname+'.getRelPosition');
//tjs_debug_end
		var oHtml = document.documentElement;
		var oBody = document.body;
		if (oAncestor == oBody || oAncestor == oHtml) {
			return this.getPosition(oElement);
		}
		var pos = new tjs.geo.Point();
		var oNode;
		if (oElement.getBoundingClientRect) { // W3C CSSOM
			var recElement = oElement.getBoundingClientRect();
			var recAncestor = oAncestor.getBoundingClientRect();
			pos.x = recElement.left - recAncestor.left - oAncestor.clientLeft;
			pos.y = recElement.top - recAncestor.top - oAncestor.clientTop;
		} else if (document.getBoxObjectFor) { // Gecko
			var oCS = _getComputedStyle(oElement);
			var boElement = document.getBoxObjectFor(oElement);
			var boAncestor = document.getBoxObjectFor(oAncestor);
			pos.x = boElement.x - boAncestor.x;
			pos.y = boElement.y - boAncestor.y;
			pos.x -= this.getBorderWidth(oElement,'l');
			pos.y -= this.getBorderWidth(oElement,'t');
			oNode = this.getScrollParent(oElement);
			while (oNode && oNode != oAncestor) {
				pos.x -= oNode.scrollLeft || 0;
				pos.y -= oNode.scrollTop || 0;
				//--- fix bug begin ---//
				oCS = _getComputedStyle(oNode);
				if (oCS.overflow != 'visible') {
					pos.x += this.getBorderWidth(oNode,'l');
					pos.y += this.getBorderWidth(oNode,'t');
				}
				//--- fix bug end ---//
				oNode = this.getScrollParent(oNode);
			}
		} else {
			pos.x += oElement.offsetLeft;
			pos.y += oElement.offsetTop;
			var isOpera = tjs.bom.isOpera;
			oNode = oElement.offsetParent;
			if (isOpera) {
				pos.x -= oNode.clientLeft || 0;
				pos.y -= oNode.clientTop || 0;
			}
			while (oNode && oNode != oAncestor) {
				if (!isOpera) {
					pos.x += oNode.clientLeft || 0;
					pos.y += oNode.clientTop || 0;
				}
				pos.x += oNode.offsetLeft;
				pos.y += oNode.offsetTop;
				oNode = oNode.offsetParent;
			}
			oNode = this.getScrollParent(oElement);
			while (oNode && oNode != oAncestor) {
				pos.x -= oNode.scrollLeft || 0;
				pos.y -= oNode.scrollTop || 0;
				oNode = this.getScrollParent(oNode);
			}
		}
		pos.x += oAncestor.scrollLeft || 0;
		pos.y += oAncestor.scrollTop || 0;
		return pos;
	},

	/**
	@method tjs.css.getOffsetPosition
	Gets the element's position relative to its offsetParent.

	@param	{HTMLElement} oElement:
	The specified element
	@return	{tjs.geo.Point}
	The element's position relative to its offsetParent
	*/
	getOffsetPosition:function(oElement) {
//tjs_debug_start
		tl.assert(td.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.getOffsetPosition');
//tjs_debug_end
		var pos = new tjs.geo.Point();
		var oHtml = document.documentElement;
		var oBody = document.body;
		if (oElement == oHtml || oElement == oBody) {
			return pos;
		}
		pos.x = oElement.offsetLeft;
		pos.y = oElement.offsetTop;
		if (tjs.bom.isIE) {//IE
			return pos;
		}
		var oParentOffset = oElement.offsetParent;
		var oCS = _getComputedStyle(oElement);
		if (oCS.position == 'absolute') {
			if (tjs.bom.isGecko && oParentOffset != oBody) { // Gecko bug
				oCS = _getComputedStyle(oParentOffset);
				if (oCS.overflow != 'visible') {
					pos.x += this.getBorderWidth(oParentOffset,'l');
					pos.y += this.getBorderWidth(oParentOffset,'t');
				}
			}
			return pos;
		} else {
			var oNode;
			if (tjs.bom.isGecko) { // Gecko bug
				oNode = oElement;
				do {
					oNode = oNode.parentNode;
					oCS = _getComputedStyle(oNode);
					if (oCS.overflow != 'visible') {
						pos.x += this.getBorderWidth(oNode,'l');
						pos.y += this.getBorderWidth(oNode,'t');
					}
				} while (oNode != oParentOffset);
			}
			oNode = oElement.parentNode;
			while (oNode && oNode != oParentOffset) {
				pos.x -= node.scrollLeft || 0;
				pos.y -= oNode.scrollTop || 0;
				oNode = oNode.parentNode;
			}
			return pos;
		}
	},
	classname:'tjs.css'
};
}();
