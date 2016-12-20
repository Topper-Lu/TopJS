tjs.css.styleSheet = function(){
	var _getRules,_insertRule,_appendRule,_removeRule,_removeAllRules;
	if (window.getComputedStyle) { // W3C, All browsers but IE 6, 7, 8
		_getRules = function(oStyleSheet) {
//tjs_debug_start
		    tjs.lang.assert(Boolean(oStyleSheet),'!oStyleSheet @'+this.classname+'._getRules');
//tjs_debug_end
			return oStyleSheet.cssRules;
		};
		_insertRule = function(oStyleSheet,selector,cssText,idx) {
//tjs_debug_start
		    tjs.lang.assert(Boolean(oStyleSheet),'!oStyleSheet @'+this.classname+'._insertRule');
		    tjs.lang.assert(selector && tjs.lang.isString(selector),'!selector || !tjs.lang.isString(selector) @'+this.classname+'._insertRule');
		    tjs.lang.assert(cssText && tjs.lang.isString(cssText),'!cssText || !tjs.lang.isString(cssText) @'+this.classname+'._insertRule');
		    tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'._insertRule');
		    tjs.lang.assert(idx >= 0 && idx <= oStyleSheet.cssRules.length,'idx out of bounds @'+this.classname+'._insertRule');
//tjs_debug_end
	        oStyleSheet.insertRule(selector+'{'+cssText+'}',idx);
		};
		_appendRule = function(oStyleSheet,selector,cssText) {
//tjs_debug_start
		    tjs.lang.assert(Boolean(oStyleSheet),'!oStyleSheet @'+this.classname+'._appendRule');
		    tjs.lang.assert(selector && tjs.lang.isString(selector),'!selector || !tjs.lang.isString(selector) @'+this.classname+'._appendRule');
		    tjs.lang.assert(cssText && tjs.lang.isString(cssText),'!cssText || !tjs.lang.isString(cssText) @'+this.classname+'._appendRule');
//tjs_debug_end
	        return oStyleSheet.insertRule(selector+'{'+cssText+'}',oStyleSheet.cssRules.length);
		};
		_removeRule = function(oStyleSheet,idx) {
//tjs_debug_start
		    tjs.lang.assert(Boolean(oStyleSheet),'!oStyleSheet @'+this.classname+'._removeRule');
		    tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'._removeRule');
		    tjs.lang.assert(idx >= 0 && idx < oStyleSheet.cssRules.length,'idx out of bounds @'+this.classname+'._removeRule');
//tjs_debug_end
	    	oStyleSheet.deleteRule(idx);
		};
		_removeAllRules = function(oStyleSheet) {
//tjs_debug_start
	    	tjs.lang.assert(Boolean(oStyleSheet),'!oStyleSheet @'+this.classname+'._removeAllRules');
//tjs_debug_end
			var i = oStyleSheet.cssRules.length;
	    	while (i--) {
		    	oStyleSheet.deleteRule(i);
	    	}
		};
	} else if (tjs.bom.isOldIE) { // IE
		_getRules = function(oStyleSheet) {
//tjs_debug_start
		    tjs.lang.assert(Boolean(oStyleSheet),'!oStyleSheet @'+this.classname+'._getRules');
//tjs_debug_end
			return oStyleSheet.rules;
		};
		_insertRule = function(oStyleSheet,selector,cssText,idx) {
//tjs_debug_start
		    tjs.lang.assert(Boolean(oStyleSheet),'!oStyleSheet @'+this.classname+'._insertRule');
		    tjs.lang.assert(selector && tjs.lang.isString(selector),'!selector || !tjs.lang.isString(selector) @'+this.classname+'._insertRule');
		    tjs.lang.assert(cssText && tjs.lang.isString(cssText),'!cssText || !tjs.lang.isString(cssText) @'+this.classname+'._insertRule');
		    tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'._insertRule');
		    tjs.lang.assert(idx >= 0 && idx <= oStyleSheet.cssRules.length,'idx out of bounds @'+this.classname+'._insertRule');
//tjs_debug_end
	        oStyleSheet.addRule(selector,cssText,idx);
		};
		_appendRule = function(oStyleSheet,selector,cssText) {
//tjs_debug_start
		    tjs.lang.assert(Boolean(oStyleSheet),'!oStyleSheet @'+this.classname+'._appendRule');
		    tjs.lang.assert(selector && tjs.lang.isString(selector),'!selector || !tjs.lang.isString(selector) @'+this.classname+'._appendRule');
		    tjs.lang.assert(cssText && tjs.lang.isString(cssText),'!cssText || !tjs.lang.isString(cssText) @'+this.classname+'._appendRule');
//tjs_debug_end
	        var idx = oStyleSheet.rules.length;
	        oStyleSheet.addRule(selector,cssText,idx);
	        return idx;
		};
		_removeRule = function(oStyleSheet,idx) {
//tjs_debug_start
		    tjs.lang.assert(Boolean(oStyleSheet),'!oStyleSheet @'+this.classname+'._removeRule');
		    tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'._removeRule');
		    tjs.lang.assert(idx >= 0 && idx < oStyleSheet.rules.length,'idx out of bounds @'+this.classname+'._removeRule');
//tjs_debug_end
	    	oStyleSheet.removeRule(idx);
		};
		_removeAllRules = function(oStyleSheet) {
//tjs_debug_start
	    	tjs.lang.assert(Boolean(oStyleSheet),'!oStyleSheet @'+this.classname+'._removeAllRules');
//tjs_debug_end
			var i = oStyleSheet.rules.length;
	    	while (i--) {
		    	oStyleSheet.removeRule(i);
	    	}
		};
	} else {
		throw new Error('No support for window.getComputedStyle! @tjs.css');
	}
return {
	/**
	 * Get the rules for the specified stylesheet.
	 *
	 * @param	{CSSStyleSheet} oStyleSheet:
	 * the specified stylesheet
	 * @return	{CSSRuleList}
	 * the rules of the specified stylesheet
	 */
	getRules: _getRules,

	/**
	 * Get the rule for the specified stylesheet.
	 *
	 * @param	{CSSStyleSheet} oStyleSheet:
	 * the specified stylesheet
	 * @param	{number} idx:
	 * index of rule
	 * @return	{CSSRule}
	 * the rule of the specified stylesheet at index
	 * @throws	{Error}
	 * if idx is out of bounds
	 */
	getRule:function(oStyleSheet,idx) {
//tjs_debug_start
	    tjs.lang.assert(Boolean(oStyleSheet),'!oStyleSheet @'+this.classname+'.getRule');
	    tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.getRule');
//tjs_debug_end
	    var rules = _getRules(oStyleSheet);
//tjs_debug_start
	    tjs.lang.assert(idx >= 0 && idx < rules.length,'idx out of bounds @'+this.classname+'.getRule');
//tjs_debug_end
    	return rules[idx];
	},

	/**
	 * Get the rule for the specified stylesheet.
	 *
	 * @param	{CSSStyleSheet} oStyleSheet:
	 * the specified stylesheet
	 * @param	{string} selector:
	 * selectorText of rule
	 * @return	{CSSRule}
	 * the rule matches the specified selector of the stylesheet, otherwise null.
	 * If there is more than one rule that matches selector, we find the one
	 * with the highest precedence(i.e. look up backward).
	 */
	getRuleBySelector:function(oStyleSheet,selector) {
//tjs_debug_start
	    tjs.lang.assert(Boolean(oStyleSheet),'!oStyleSheet @'+this.classname+'.getRuleBySelector');
	    tjs.lang.assert(selector && tjs.lang.isString(selector),'!selector || !tjs.lang.isString(selector) @'+this.classname+'.getRuleBySelector');
//tjs_debug_end
	    var rules = _getRules(oStyleSheet);
	    selector = selector.toLowerCase();
	    var i = rules.length;
	    while (i--) {
	        if (rules[i].selectorText && rules[i].selectorText.toLowerCase() == selector) {
	        	return rules[i];
	        }
	    }
    	return null;
	},
	getRuleIndexBySelector:function(oStyleSheet,selector) {
//tjs_debug_start
	    tjs.lang.assert(Boolean(oStyleSheet),'!oStyleSheet @'+this.classname+'._getRuleIndexBySelector');
	    tjs.lang.assert(selector && tjs.lang.isString(selector),'!selector || !tjs.lang.isString(selector) @'+this.classname+'._getRuleIndexBySelector');
//tjs_debug_end
	    var rules = _getRules(oStyleSheet);
	    selector = selector.toLowerCase();
	    var i = rules.length;
	    while (i--) {
	        if (rules[i].selectorText && rules[i].selectorText.toLowerCase() == selector) {
	        	return i;
	        }
	    }
    	return -1;
	},

	/**
	 * Append a rule into the specified stylesheet.
	 *
	 * @param	{CSSStyleSheet} oStyleSheet:
	 * the specified stylesheet
	 * @param	{string} selector:
	 * selectorText of rule
	 * @param	{string} cssText:
	 * cssText of rule
	 * @return	{Integer}
	 * the index of rule
	 */
	appendRule: _appendRule,// updated 2009-03-19 09:34

	/**
	 * Add a rule into the specified stylesheet.
	 *
	 * @param	{CSSStyleSheet} oStyleSheet:
	 * the specified stylesheet
	 * @param	{string} selector:
	 * selectorText of rule
	 * @param	{string} cssText:
	 * cssText of rule
	 * @return	{Integer}
	 * the index of rule
	 */
	addRule:function(oStyleSheet,selector,cssText) {
//tjs_debug_start
	    tjs.lang.assert(Boolean(oStyleSheet),'!oStyleSheet @'+this.classname+'.addRule');
	    tjs.lang.assert(selector && tjs.lang.isString(selector),'!selector || !tjs.lang.isString(selector) @'+this.classname+'.addRule');
	    tjs.lang.assert(cssText && tjs.lang.isString(cssText),'!cssText || !tjs.lang.isString(cssText) @'+this.classname+'.addRule');
//tjs_debug_end
	    var idx = this.getRuleIndexBySelector(oStyleSheet,selector);
	    if (idx < 0) {
	    	return _appendRule(oStyleSheet,selector,cssText);
	    } else {
	    	var oRule = this.getRule(oStyleSheet,idx);
	    	oRule.style.cssText = oRule.style.cssText + cssText;
	    	return idx;
	    }
	},

	/**
	 * Add rules into the specified stylesheet.
	 *
	 * @param	{CSSStyleSheet} oStyleSheet:
	 * the specified stylesheet
	 * @param	{string} styleText:
	 * text of rules including selector and cssText for each rule
	 */
	addRules:function(oStyleSheet,styleText) {
//tjs_debug_start
	    tjs.lang.assert(Boolean(oStyleSheet),'!oStyleSheet @'+this.classname+'.addRules');
	    tjs.lang.assert(styleText && tjs.lang.isString(styleText),'!selector || !tjs.lang.isString(selector) @'+this.classname+'.addRules');
//tjs_debug_end
		var oMap = new tjs.util.Map();
		var ruleTexts = styleText.split('}');
		var js_str = tjs.str;
		var ruleText,ruleStrs,ruleStr,selectors,selector,cssText,ruleContent;
		for (var i = 0, isize = ruleTexts.length; i < isize; i++) {
			ruleText = ruleTexts[i].trim();
			if (ruleText) {
				ruleStrs = ruleText.split('{');
				if (ruleStrs.length == 2) {
					ruleStr = js_str.normalizeOneLine(ruleStrs[0]);
					cssText = js_str.normalizeMultiLine(ruleStrs[1],'');
					if (ruleStr && cssText) {
						selectors = ruleStr.split(',');
						for (var j = 0, jsize = selectors.length; j < jsize; j++) {
							selector = selectors[j].trim();
							ruleContent = oMap.get(selector);
							if (ruleContent) {
								oMap.put(selector,ruleContent + cssText);
							} else {
								oMap.put(selector,cssText);
							}
						}
					}
				}
			}
		}
		var oItems = oMap.items;
		for (var x in oItems) {
			this.addRule(oStyleSheet,x,oItems[x]);
		}
		oMap.destroy();
		oMap = null;
	},

	/**
	 * Remove the rule from the specified position in the stylesheet.
	 *
	 * @param	{CSSStyleSheet} oStyleSheet:
	 * the specified stylesheet
	 * @param	{number} idx:
	 * the index of rule
	 */
	removeRule: _removeRule,

	/**
	 * Remove all rulea from the specified stylesheet.
	 *
	 * @param	{CSSStyleSheet} oStyleSheet:
	 * the specified stylesheet
	 */
	removeAllRules: _removeAllRules,

	classname:'tjs.css.styleSheet'
};
}();
