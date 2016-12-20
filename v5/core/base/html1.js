tjs.lang.defineTopClass('tjs.html.StyleSheet',
function(id,styleText,doc) {
//tjs_debug_start
    tjs.lang.assert(!id || tjs.lang.isString(id),'!tjs.lang.isString(id) @'+this.classname);
    tjs.lang.assert(!styleText || tjs.lang.isString(styleText),'!tjs.lang.isString(styleText) @'+this.classname);
//tjs_debug_end
	this.doc = doc || document;
	this.id = id ? id : 'tmp-style-'+String(Math.round(Math.random()*100000000));
	this.oStyles = new tjs.util.Map();
	this.oStyleSheet = tjs.html.createStyleSheet(this.id,null,styleText,this.doc);
	if (styleText) {
		var rules = tjs.css.styleSheet.getRules(this.oStyleSheet), rule;
		var k = rules.length;
	    while (k--) {
			rule = rules[k];
			this.oStyles.put(rule.selectorText.toLowerCase(),rule.style);
		}
	}
},{
	destroy:function() {
		this.oStyles.destroy();
		tjs.html.removeStyleSheet(this.id,this.doc);
		tjs.lang.destroyObject(this);
	},
	_createStyle:function(selector,cssText) {
		var o = tjs.css.styleSheet;
		var idx = o.appendRule(this.oStyleSheet,selector,cssText);// updated 2009-03-19 09:34
		var rule = o.getRule(this.oStyleSheet,idx);
		this.oStyles.put(selector,rule.style);
	},
	_getIndex:function(oStyle) {
	    var rules = tjs.css.styleSheet.getRules(this.oStyleSheet);
	    var i = rules.length, rule;
	    while (i--) {
	    	rule = rules[i];
	        if (rule.style && rule.style == oStyle) {
	        	break;
	        }
	    }
    	return i;
	},
	getStyle:function(selector) {
//tjs_debug_start
	    tjs.lang.assert(Boolean(selector) && tjs.lang.isString(selector),'!selector || !tjs.lang.isString(selector) @'+this.classname+'.getStyle');
//tjs_debug_end
		return this.oStyles.get(selector);
	},
	_addStyle:function(selector,cssText) {
	    var oStyle = this.oStyles.get(selector);
	    if (oStyle) {
	    	oStyle.cssText = oStyle.cssText + cssText;
		} else {
			this._createStyle(selector,cssText);
		}
	},
	addStyle:function(selector,cssText) {
//tjs_debug_start
	    tjs.lang.assert(selector && tjs.lang.isString(selector),'!tjs.lang.isString(selector) @'+this.classname+'.addStyle');
	    tjs.lang.assert(cssText && tjs.lang.isString(cssText),'!tjs.lang.isString(cssText) @'+this.classname+'.addStyle');
//tjs_debug_end
		this._addStyle(selector,cssText);
	},
	addStyles:function(styleText) {
//tjs_debug_start
	    tjs.lang.assert(styleText && tjs.lang.isString(styleText),'!tjs.lang.isString(styleText) @'+this.classname+'.addStyles');
//tjs_debug_end
		var ruleTexts = styleText.split('}');
		var js_str = tjs.str;
		var ruleText,ruleStrs,ruleStr,selectors,cssText;
		//var buf = [], k = 0;
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
							this._addStyle(selectors[j].trim(),cssText);
							//buf[k++] = selectors[j].trim()+'{'+cssText+'}';
						}
					}
				}
			}
		}
		/*
		styleText = buf.join('');
		buf.length = 0;
		this.oStyleSheet.cssText = styleText;
		var rules = tjs.css.styleSheet.getRules(this.oStyleSheet), rule;
	    k = rules.length;
	    while (k--) {
			rule = rules[k];
			if (rule) {
				this.oStyles.put(rule.selectorText,rule.style);
			}
		}
		*/
	},
	replaceStyle:function(selector,cssText) {
//tjs_debug_start
	    tjs.lang.assert(selector && tjs.lang.isString(selector),'!tjs.lang.isString(selector) @'+this.classname+'.replaceStyle');
	    tjs.lang.assert(cssText && tjs.lang.isString(cssText),'!tjs.lang.isString(cssText) @'+this.classname+'.replaceStyle');
//tjs_debug_end
	    var oStyle = this.oStyles.get(selector);
	    if (oStyle) {
	    	oStyle.cssText = cssText;
		}
	},
	removeStyle:function(selector) {
//tjs_debug_start
	    tjs.lang.assert(selector && tjs.lang.isString(selector),'!tjs.lang.isString(selector) @'+this.classname+'.removeStyle');
//tjs_debug_end
	    var oStyle = this.oStyles.remove(selector);
	    if (oStyle) {
	    	var idx = this._getIndex(oStyle);
	    	if (idx > -1) {
	    		tjs.css.styleSheet.removeRule(this.oStyleSheet,idx);
	    	}
		}
	},
	removeAllStyles:function() {
		this.oStyles.clear();
		tjs.css.styleSheet.removeAllRules(this.oStyleSheet);
	}
});

tjs.lang.defineTopClass('tjs.html.ImageLoader',
function(urls) {
//tjs_debug_start
	tjs.lang.assert(tjs.lang.isArray(urls),'!tjs.lang.isArray(urls) @'+this.classname);
	tjs.lang.assert(urls.length > 0,'urls.length == 0 @'+this.classname);
//tjs_debug_end
	this.handlers = [];
	this.oImgs = [];
	this.complete = false;
	this.nLoaded = 0;
	this._loadHandler_ = this._loadHandler.bind(this);
	var isize = urls.length;
	this.oImgs.length = isize;
	for (var i = 0, o; i < isize; i++) {
		o = new Image();
		this.oImgs[i] = o;
		o.onload = this._loadHandler_;
		o.src = urls[i];
	}
},{
	destroy:function(){
		if (this.handlers) {
			tjs.lang.destroyArray(this.handlers);
		}
		tjs.lang.destroyArray(this.oImgs);
		tjs.lang.destroyObject(this);
	},
	invoke:function(fHandler){
//tjs_debug_start
	tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.execute');
//tjs_debug_end
		if (this.complete) {
			fHandler(this.oImgs);
		} else {
			this.handlers.push(fHandler);
		}
	},
	_loadHandler:function(){
		this.nLoaded++;
		if (this.nLoaded == this.oImgs.length){
			this.complete = true;
			var i = this.oImgs.length;
			while (i--) {
				this.oImgs[i].onload = null;
			}
			var isize = this.handlers.length;
			if (isize > 0) {
				for (i = 0; i < isize; i++) {
					this.handlers[i](this.oImgs);
					this.handlers[i] = null;
				}
				this.handlers.length = 0;
			}
			delete this.handlers;
			delete this.nLoaded;
		}
	}
});
