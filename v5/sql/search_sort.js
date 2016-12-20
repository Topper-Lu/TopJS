tjs.lang.defineClass('tjs.sql.AbstractSearchSort',tjs.widget.Widget,
function(obj) {
	tjs.widget.Widget.call(this,obj);
},tjs.widget.clsWidget,{
	_checkAll:function(){
		this._checkClsId();
	},
	_construct:function() {
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'div','tagName != "div" @'+this.classname);
//tjs_debug_end
			if (this.oElement.hasChildNodes()) {
				oFragment = document.createDocumentFragment();
				tjs.dom.moveChildren(this.oElement,oFragment);
			}
		} else {
			this.oElement = document.createElement('div');
			var oParent = this.oMap.remove('oParent');
			if (tjs.dom.isElement(oParent)) {
				oParent.appendChild(this.oElement);
			}
		}
		tjs.dom.addClass(this.oElement,'pos_rel');
		tjs.dom.addClass(this.oElement,'overflow_hidden');
		tjs.dom.addClass(this.oElement,'tjs_search_sort');
		tjs.dom.addClass(this.oElement,'tjs_search_sort_'+this._clsId);

		this.oContentL = document.createElement('div');
		this.oContentL.className = 'float_left tjs_search_sort_left';
		this.oContentR = document.createElement('div');
		this.oContentR.className = 'float_left tjs_search_sort_right';
		var oClearFloat = document.createElement('div');
		oClearFloat.className = 'clear_float';
		this.oElement.appendChild(this.oContentL);
		this.oElement.appendChild(this.oContentR);
		this.oElement.appendChild(oClearFloat);

		var wLeft = this.oMap.get('wLeft');
		if (!tjs.lang.isNumber(wLeft) || wLeft < 100) {
			this.oMap.put('wLeft',200);
		}
	},
	layout:function(){
		var tjs_css = tjs.css;
		var w = tjs_css.getContentBoxWidth(this.oElement);
		var h = tjs_css.getContentBoxHeight(this.oElement);
		var wLeft = this.oMap.get('wLeft');
		tjs_css.setOffsetDimension(this.oContentL,wLeft,h);
		tjs_css.setOffsetDimension(this.oContentR,w - wLeft,h);
	}
});
