tjs.lang.defineClass('tjs.widget.FlowLayout',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},{
	_construct:function() {
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'div','tagName != "div" @'+this.classname);
//tjs_debug_end
			if (this.oElement.hasChildNodes()) {
				this.oElement.innerHTML = '';
			}
			var oCS = tjs.css.getComputedStyle(this.oElement);
			if (oCS.overflow != 'visible') {
				this.oElement.style.overflow = 'visible';
			}
		} else {
			this.oElement = document.createElement('div');
			var oParent = this.oMap.remove('oParent');
			if (tjs.dom.isElement(oParent)) {
				oParent.appendChild(this.oElement);
			}
		}

		this.oMask = document.createElement('div');
		this.oMask.className = 'pos_abs pos_tl tjs_disabled_mask';
		this.oMask.style.visibility = 'hidden';
		this.oElement.appendChild(this.oMask);

		this.oContainers = [];
		var aChildren = this.oMap.remove('aChildren');
		if (aChildren && aChildren.length > 0) {
			for (var i = 0, isize = aChildren.length; i < isize; i++) {
				this.addContainer(aChildren[i]);
				aChildren[i] = null;
			}
			aChildren.length = 0;
		}
	},
	_destroy:function() {
		tjs.lang.destroyArray(this.oContainers);
	},
	layout:function() {// override
		for (var i = 0, isize = this.oContainers.length; i < isize; i++) {
			tjs.html.evalLayouts(this.oContainers[i]);
		}
		var tjs_css = tjs.css;
		var w = tjs_css.getPaddingBoxWidth(this.oElement);
		var h = tjs_css.getPaddingBoxHeight(this.oElement);
		tjs_css.setOffsetDimension(this.oMask,w,h);
	},
	addContainer:function(o) {
		if (!tjs.lang.isObject(o)) {
			o = {};
		}
		var oContainer = tjs.widget.createContainer(o,'span');
		tjs.dom.addClass(oContainer,'flow_layout_container');
		this.oElement.appendChild(oContainer);
		this.oContainers.push(oContainer);
		if (o.url && tjs.lang.isString(o.url)) {
			tjs.html.loadElementContent(o.url,oContainer);
		}
		tjs.lang.destroyObject(o);
	},
	removeContainer:function(idx) {
		if (tjs.lang.isNumber(idx) && idx >= 0 && idx < this.oContainers.length) {
			var a = this.oContainers.splice(idx,1);
			var oContainer = a[0];
			a[0] = null;
			a.length = 0;
			tjs.html.destroyElementContent(oContainer);
			this.oElement.removeChild(oContainer);
		}
	},
	getContainer:function(idx) {
		return (tjs.lang.isNumber(idx) && idx >= 0 && idx < this.oContainers.length) ? this.oContainers[idx] : null;
	},
	getLastContainer:function() {
		return this.oContainers.length > 0 ? this.oContainers[this.oContainers.length - 1] : null;
	},
	setDisabled:function(disabled) {
		this.oMask.style.visibility = disabled ? '' : 'hidden';
	},
	showContainer:function(idx) {
		if (tjs.lang.isNumber(idx) && idx >= 0 && idx < this.oContainers.length) {
			this.oContainers[idx].style.display = '';
		}
	},
	hideContainer:function(idx) {
		if (tjs.lang.isNumber(idx) && idx >= 0 && idx < this.oContainers.length) {
			this.oContainers[idx].style.display = 'none';
		}
	}
});
