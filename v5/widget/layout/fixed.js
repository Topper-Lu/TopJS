tjs.lang.defineClass('tjs.widget.FixedLayout',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},tjs.widget.hvWidget,{
	_checkAll:function(){
		this._checkHV();
	},
	_construct:function() {
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'div','tagName != "div" @'+this.classname);
//tjs_debug_end
			if (this.oElement.hasChildNodes()) {
				this.oElement.innerHTML = '';
			}
		} else {
			this.oElement = document.createElement('div');
			var oParent = this.oMap.remove('oParent');
			if (tjs.dom.isElement(oParent)) {
				oParent.appendChild(this.oElement);
			}
		}
		tjs.dom.addClass(this.oElement,'overflow_hidden');

		var aChildren = this.oMap.remove('aChildren');
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isArray(aChildren) && aChildren.length > 1,'!tjs.lang.isArray(aChildren) @'+this.classname);
//tjs_debug_end
		this.oContainers = [];
		var isH = this._hv == 'h';
		var o,oContainer;
		for (var i = 0, isize = aChildren.length; i < isize; i++) {
			o = aChildren[i];
			aChildren[i] = null;
			oContainer = tjs.widget.createContainer(o);
			if (isH) {
				tjs.css.setFloat(oContainer,'left');
				tjs.dom.addClass(oContainer,'pos_rel');
				if (tjs.lang.isNumber(o.width) && o.width > 0) {
					oContainer.style.width = o.width+'px';
					oContainer.fixedSize = true;
				} else {
					oContainer.fixedSize = false;
				}
			} else {
				if (tjs.lang.isNumber(o.height)) {
					oContainer.style.height = o.height > 0 ? (o.height+'px') : '';
					oContainer.fixedSize = true;
				} else {
					oContainer.fixedSize = false;
				}
			}
			this.oElement.appendChild(oContainer);
			this.oContainers.push(oContainer);
			if (o.url && tjs.lang.isString(o.url)) {
				tjs.html.loadElementContent(o.url,oContainer);
			}
			tjs.lang.destroyObject(o);
		}
		aChildren.length = 0;
		if (isH) {
			var oClearFloat = document.createElement('div');
			oClearFloat.className = 'clear_float';
			this.oElement.appendChild(oClearFloat);
		}
	},
	_destroy:function() {
		tjs.lang.destroyArray(this.oContainers);
	},
	layout:function() {
		var tjs_css = tjs.css;
		var w = tjs_css.getContentBoxWidth(this.oElement);
		var h = tjs_css.getContentBoxHeight(this.oElement);
		var isH = this._hv == 'h';
		var isize = this.oContainers.length;
		var cnt = 0;
		var i,oContainer;
		for (i = 0; i < isize; i++) {
			oContainer = this.oContainers[i];
			if (oContainer.fixedSize) {
				if (isH) {
					tjs_css.setOffsetHeight(oContainer,h);
					w -= oContainer.offsetWidth;
				} else {
					tjs_css.setOffsetWidth(oContainer,w);
					h -= oContainer.offsetHeight;
				}
			} else {
				cnt++;
			}
		}
		var s = cnt > 0 ? Math.floor((isH ? w : h)/cnt) : 0;
		for (i = 0; i < isize; i++) {
			oContainer = this.oContainers[i];
			if (!oContainer.fixedSize) {
				cnt--;
				if (cnt > 0) {
					if (isH) {
						tjs_css.setOffsetDimension(oContainer,s,h);
						w -= s;
					} else {
						tjs_css.setOffsetDimension(oContainer,w,s);
						h -= s;
					}
				} else {
					tjs_css.setOffsetDimension(oContainer,w,h);
				}
			}
		}
		for (i = 0; i < isize; i++) {
			oContainer = this.oContainers[i];
			tjs.html.evalLayouts(oContainer);
		}
	},
	getContainer:function(idx) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.getContainer');
		tjs.lang.assert(idx >= 0 && idx < this.oContainers.length,'idx is out of bounds @'+this.classname+'.getContainer');
//tjs_debug_end
		return this.oContainers[idx];
	}
});

tjs.lang.defineClass('tjs.widget.HFixedLayout',tjs.widget.FixedLayout,
function(o) {
	tjs.widget.FixedLayout.call(this,o);
},{
	_hv:'h'
});

tjs.lang.defineClass('tjs.widget.VFixedLayout',tjs.widget.FixedLayout,
function(o) {
	tjs.widget.FixedLayout.call(this,o);
},{
	_hv:'v'
});
