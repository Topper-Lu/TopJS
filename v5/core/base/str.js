/** @namespace */
tjs.str = function() {
	var _regexp_email = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
	var _regexp_date = /^[+\-]?[1-9][0-9]{3}-(0?[1-9]|1[0-2])-(0?[1-9]|[1-2][0-9]|3[0-1])$/;
	var _regexp_integer = /^(([+\-]?\d+)|((0[xX])+[0-9a-fA-F]+))$/;
	var _regexp_float = /^[+\-]?((\d+(\.\d*)?)|(\.\d+))([eE][+\-]?\d+)?$/;
	var _regexp_bounding_spaces = /(^\s+)|(\s+$)/g;
	var _regexp_spaces = /\s+/g;
	var _regexp_LineTerminator = /(\r\n)|[\n\r]/g;
	var _regexp_pid = /^([A-Z])(\d{9})$/;

	var _normalizeOneLine = function(s) {
		if (s) {
			s = s.replace(_regexp_bounding_spaces,'').replace(_regexp_spaces,' ');
		}
		return s;
	};

	var _regexp_str_1 = /[\x00-\x1f"\\]/;
	var _regexp_str_2 = /[\x00-\x1f"\\]/g;
    var _strMap = {
		'\b': '\\b',
		'\t': '\\t',
		'\n': '\\n',
		'\f': '\\f',
		'\r': '\\r',
		'"' : '\\"',
		'\\': '\\\\'
	};
	var _strHandler = function(s) {
		var c = _strMap[s];
		if (c) {
			return c;
		}
		c = s.charCodeAt(0);
		return '\\u00' + ((c & 0xf0) >>> 4).toString(16) + (c & 0x0f).toString(16);
	};
	var _escapeString = function(s) {
		if (s && _regexp_str_1.test(s)) {
			s = s.replace(_regexp_str_2,_strHandler);
		}
		return '"'+s+'"';
	};

	var _regexp_js_1 = /[\x00-\x1f"']/;
	var _regexp_js_2 = /[\x00-\x1f"']/g;
    var _jsMap = {
		'\b': '\\b',
		'\t': '\\t',
		'\n': '\\n',
		'\f': '\\f',
		'\r': '\\r',
		'"': '\\"',
		"'": "\\'"
	};
	var _jsHandler = function(s) {
		var c = _jsMap[s];
		if (c) {
			return c;
		}
		c = s.charCodeAt(0);
		return '\\u00' + ((c & 0xf0) >>> 4).toString(16) + (c & 0x0f).toString(16);
	};
	var _escapeJS = function(s) {
		if (s && _regexp_js_1.test(s)) {
			s = s.replace(_regexp_js_2,_jsHandler);
		}
		return s;
	};

	var _regexp_xml_1 = /[&<>"']/;
	var _regexp_xml_2 = /[&<>"']/g;
	var _xmlMap = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;'
	};
	var _xmlHandler = function(s) {
		var c = _xmlMap[s];
		return c ? c : s;
	};
	var _escapeXML = function(s) {
		if (s) {
			s = s.replace(_regexp_bounding_spaces,'').replace(_regexp_spaces,' ');
		}
		if (s && _regexp_xml_1.test(s)) {
			s = s.replace(_regexp_xml_2,_xmlHandler);
		}
		return s;
	};
/** @scope tjs.str */
return {
	/**
	 * Tests if string str starts with the specified string prefix.
	 *
	 * @param	{String} str:
	 * The string to be tested
	 * @param	{String} prefix:
	 * the prefix
	 * @returns	{Boolean}
	 * true if the argument prefix is a prefix of the argument str, false otherwise.
	 */
	startsWith:function(str,prefix) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(str),'!tjs.lang.isString(str) @'+this.classname+'.startsWith');
		tjs.lang.assert(tjs.lang.isString(prefix),'!tjs.lang.isString(prefix) @'+this.classname+'.startsWith');
//tjs_debug_end
		return str.indexOf(prefix) == 0;
	},
	/**
	 * Tests if string str starts with the any specified strings p1,p2,...
	 *
	 * @param	{String} str:
	 * The string to be tested
	 * @param	{String} p1,p2,...:
	 * the prefixes
	 * @returns	{Boolean}
	 * true if any argument p1,p2,... is a prefix of the argument str, false otherwise.
	 */
	startsWithAny:function(str/*,p1,p2,...*/) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(str),'!tjs.lang.isString(str) @'+this.classname+'.startsWithAny');
//tjs_debug_end
		for (var i = 1, isize = arguments.length; i < isize; i++) {
			if (str.indexOf(arguments[i]) == 0) {
				return true;
			}
		}
		return false;
	},
	/**
	 * Tests if string str ends with the specified string suffix.
	 *
	 * @param	{String} str:
	 * The string to be tested
	 * @param	{String} suffix:
	 * the suffix
	 * @returns	{Boolean}
	 * true if the argument suffix is a suffix of the argument str, false otherwise.
	 */
	endsWith:function(str,suffix) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(str),'!tjs.lang.isString(str) @'+this.classname+'.endsWith');
		tjs.lang.assert(tjs.lang.isString(suffix),'!tjs.lang.isString(suffix) @'+this.classname+'.endsWith');
//tjs_debug_end
		return str.lastIndexOf(suffix) == (str.length - suffix.length);
	},
	/**
	 * Tests if string str ends with the any specified string p1,p2,...
	 *
	 * @param	{String} str:
	 * The string to be tested
	 * @param	{String} p1,p2,...:
	 * the suffixes
	 * @returns	{Boolean}
	 * true if any argument p1,p2,... is a suffix of the argument str, false otherwise.
	 */
	endsWithAny:function(str/*,p1,p2,...*/) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(str),'!tjs.lang.isString(str) @'+this.classname+'.endsWithAny');
//tjs_debug_end
		for (var i = 1,isize = arguments.length; i < isize; i++) {
			if (str.lastIndexOf(arguments[i]) == (str.length - arguments[i].length)) {
				return true;
			}
		}
		return false;
	},
	padLeft:function(str,len,ch) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(str),'!tjs.lang.isString(str) @'+this.classname+'.padLeft');
		tjs.lang.assert(tjs.lang.isNumber(len),'!tjs.lang.isNumber(len) @'+this.classname+'.padLeft');
//tjs_debug_end
		var count = len - str.length;
		if (count <= 0) {
			return str;
		}
		if (!ch) {
			ch = '0';
		}
		var b = [], k = 0;
		for (var i = 0; i < count; i++) {
			b[k++] = ch;
		}
		b[k++] = str;
		var s = b.join('');
		b.length = 0;
		return s;
	},
	padRight:function(str,len,ch) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(str),'!tjs.lang.isString(str) @'+this.classname+'.padRight');
		tjs.lang.assert(tjs.lang.isNumber(len),'!tjs.lang.isNumber(len) @'+this.classname+'.padRight');
//tjs_debug_end
		var count = len - str.length;
		if (count <= 0) {
			return str;
		}
		if (!ch) {
			ch = '0';
		}
		var b = [], k = 0;
		b[k++] = str;
		for (var i = 0; i < count; i++) {
			b[k++] = ch;
		}
		var s = b.join('');
		b.length = 0;
		return s;
	},
	normalizeOneLine:function(str) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(str),'!tjs.lang.isString(str) @'+this.classname+'.normalizeOneLine');
//tjs_debug_end
		return _normalizeOneLine(str);
	},
	normalizeMultiLine:function(str,sp) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(str),'!tjs.lang.isString(str) @'+this.classname+'.normalizeMultiLine');
		tjs.lang.assert(!sp || tjs.lang.isString(sp),'!tjs.lang.isString(sp) @'+this.classname+'.normalizeMultiLine');
//tjs_debug_end
		if (!str) {
			return str;
		}
		if (tjs.lang.isUndefined(sp)) {
			sp = '\n';
		}
		var lines = str.split(_regexp_LineTerminator);
		if (lines.length > 0) {
			var buf = [],line;
			for (var i = 0; i < lines.length; i++) {
				line = lines[i];
				lines[i] = null;
				if (line) {
					line = _normalizeOneLine(line);
					if (line) {
						buf[buf.length] = line;
					}
				}
			}
			lines.length = 0;
			var v = buf.join(sp);
			tjs.lang.destroyArray(buf);
			return v;
		} else {
			return '';
		}
	},
	escapeNumber:function(n,decIn,decOut,sep) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(n),'!tjs.lang.isNumber(n) @'+this.classname+'.escapeNumber');
		tjs.lang.assert(!decIn || tjs.lang.isString(decIn),'!tjs.lang.isString(decIn) @'+this.classname+'.escapeNumber');
		tjs.lang.assert(!decOut || tjs.lang.isString(decOut),'!tjs.lang.isString(decOut) @'+this.classname+'.escapeNumber');
		tjs.lang.assert(!sep || tjs.lang.isString(sep),'!tjs.lang.isString(sep) @'+this.classname+'.escapeNumber');
//tjs_debug_end
		if (!decIn) {
			decIn = '.';
		}
		if (!decOut) {
			decOut = '.';
		}
		if (!sep) {
			sep = ',';
		}
		var str = String(n);
		var idx = str.indexOf(decIn);
		var strEnd = '';
		if (idx != -1) {
			strEnd = decOut + str.substring(idx + 1, str.length);
			str = str.substring(0, idx);
		}
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(str)) {
			str = str.replace(rgx, '$1' + sep + '$2');
		}
		return str + strEnd;
	},
	escapeString:function(str) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(str),'!tjs.lang.isString(str) @'+this.classname+'.escapeString');
//tjs_debug_end
		return _escapeString(str);
	},
	escapeJS:function(str) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(str),'!tjs.lang.isString(str) @'+this.classname+'.escapeJS');
//tjs_debug_end
		return _escapeJS(str);
	},
	escapeXML:function(str) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(str),'!tjs.lang.isString(str) @'+this.classname+'.escapeXML');
//tjs_debug_end
		return _escapeXML(str);
	},
	escapeHTMLMultiLine:function(str,className) {
//tjs_debug_start
		tjs.lang.assert(!str || tjs.lang.isString(str),'!tjs.lang.isString(str) @'+this.classname+'.escapeHTMLMultiLine');
		tjs.lang.assert(!className || tjs.lang.isString(className),'className && !tjs.lang.isString(className) @'+this.classname+'.escapeHTMLMultiLine');
//tjs_debug_end
		if (!str) {
			return '';
		}
		var lines = str.split(_regexp_LineTerminator);
		var p0 = className ? ('<p class="'+className+'">') : '<p>';
		var b = [], k = 0;
		var line;
		for (var i = 0; i < lines.length; i++) {
			if (lines[i] && (line = _escapeXML(lines[i]))) {
				b[k++] = p0;
				b[k++] = line;
				b[k++] = '</p>';
			}
		}
		var s = b.join('');
		b.length = 0;
		return s;
	},
	toHTMLText:function(x){
		switch (typeof(x)) {
			case 'boolean':
				return String(x);
			case 'number':
				return isFinite(x) ? String(x) : '';
			case 'string':
				return _escapeXML(x);
			case 'object':
				if (!x) {
					return '';
				} else if (x instanceof Boolean) {
					return x.toString();
				} else if (x instanceof Number) {
					return isFinite(x) ? x.toString() : '';
				} else if (x instanceof String) {
					return _escapeXML(x);
				} else if (x instanceof Object) {
					return x.toString();
				} else {
					return '';
				}
			default:
				return '';
		}
	},
	isEmail:function(str){
		if (!str || !tjs.lang.isString(str)) {
			return false;
		}
		return _regexp_email.test(str);
	},
	isNumber:function(str) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(str),'!tjs.lang.isString(str) @'+this.classname+'.isNumber');
//tjs_debug_end
		return _regexp_integer.test(str) || _regexp_float.test(str);
	},
	isInteger:function(str) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(str),'!tjs.lang.isString(str) @'+this.classname+'.isInteger');
//tjs_debug_end
		return _regexp_integer.test(str);
	},
	isDate:function(str) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(str),'!tjs.lang.isString(str) @'+this.classname+'.isDate');
//tjs_debug_end
		return _regexp_date.test(str);
	},
	isPid:function(value) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(value),'!tjs.lang.isString(value) @'+this.classname+'.isPid');
//tjs_debug_end
		_regexp_pid.lastIndex = 0;
		if (_regexp_pid.test(value)) {
			var areaCode = value.charCodeAt(0);
			if (areaCode < 73) areaCode -= 55;
			else if (areaCode == 73) areaCode = 34;
			else if (areaCode < 79) areaCode -= 56;
			else if (areaCode == 79) areaCode = 35;
			else if (areaCode < 87) areaCode -= 57;
			else if (areaCode == 87) areaCode = 32;
			else if (areaCode < 90) areaCode -= 58;
			else areaCode = 33;
			var sum = (areaCode%10)*9 + Math.floor((areaCode/10));
			for (var i = 1; i < 9; i++) {
				sum += (value.charCodeAt(i) - 48)*(9 - i);
			}
			var mod = sum%10;
			var ch9 = mod == 0 ? 48 : (58 - mod);
			return value.charCodeAt(9) == ch9;
		} else {
			return false;
		}
	},
	classname:'tjs.str'
};
}();
