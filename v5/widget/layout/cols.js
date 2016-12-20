tjs.lang.defineClass('tjs.widget.ColsLayout',tjs.widget.Widget,
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
		tjs.dom.addClass(this.oElement,'tjs_colslayout');
		var buf = [], k = 0;
		buf[k++] = '<table border="0" cellpadding="0" cellspacing="0">';
		buf[k++] = '<tbody>';
		buf[k++] = '<tr></tr>';
		buf[k++] = '</tbody>';
		buf[k++] = '</table>';
		this.oElement.innerHTML = buf.join('');
		tjs.lang.destroyArray(buf);
		this.oTable = this.oElement.firstChild;
		this.oTable.className = 'tjs_colslayout_table';

		var aChildren = this.oMap.remove('aChildren');
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isArray(aChildren) && aChildren.length > 1,'!tjs.lang.isArray(aChildren) @'+this.classname);
//tjs_debug_end
		var oRow = this.oTable.rows[0];
		this.oContainers = [];
		var o,oContainer,oCell;
		for (var i = 0, isize = aChildren.length; i < isize; i++) {
			o = aChildren[i];
			aChildren[i] = null;
			oContainer = tjs.widget.createContainer(o);
			tjs.dom.addClass(oContainer,'pos_rel');
			if (tjs.lang.isNumber(o.width) && o.width > 0) {
				oContainer.style.width = o.width+'px';
				oContainer.fixedSize = true;
			} else {
				oContainer.fixedSize = false;
			}
			this.oContainers.push(oContainer);

			oCell = oRow.insertCell(i);
			oCell.className = 'vertical_align_top tjs_colslayout_col tjs_colslayout_col_'+i;
			oCell.appendChild(oContainer);

			if (o.url && tjs.lang.isString(o.url)) {
				tjs.html.loadElementContent(o.url,oContainer);
			}
			tjs.lang.destroyObject(o);
		}
		aChildren.length = 0;
	},
	_destroy:function() {
		tjs.lang.destroyArray(this.oContainers);
	},
	layout:function() {
		if (tjs.bom.isIE6) {
			this.oElement.style.height = '1px';
		}
		this.oElement.style.height = 'auto';
		var tjs_css = tjs.css;
		var w = tjs_css.getContentBoxWidth(this.oElement);
		var cnt = 0,isize = this.oContainers.length,i,oContainer;
		for (i = 0; i < isize; i++) {
			oContainer = this.oContainers[i];
			if (oContainer.fixedSize) {
				w -= oContainer.offsetWidth;
			} else {
				cnt++;
			}
		}
		var s = cnt > 0 ? Math.round(w/cnt) : 0;
		for (i = 0; i < isize; i++) {
			oContainer = this.oContainers[i];
			if (!oContainer.fixedSize) {
				cnt--;
				if (cnt > 0) {
					tjs_css.setOffsetWidth(oContainer,s);
					w -= s;
				} else {
					tjs_css.setOffsetWidth(oContainer,w);
				}
			}
			if (tjs.bom.isIE6) {
				oContainer.style.height = '1px';
			}
			oContainer.style.height = 'auto';
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
