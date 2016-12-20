tjs.lang.defineClass('tjs.editor.Color27Chooser',tjs.widget.Widget,
function(obj) {
	tjs.widget.Widget.call(this,obj);
},tjs.editor.Editor,{
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
		tjs.dom.addClass(this.oElement,'tjs_color_27');

		var a = ['00','80','ff'];
		var ac = [
			[[1,0,0],[2,0,0],[2,0,1],[2,1,0],[2,1,1],[1,1,1],[1,2,2],[0,2,2],[0,1,1]],
			[[0,1,0],[0,2,0],[0,2,1],[1,2,0],[1,2,1],[2,2,2],[2,1,2],[2,0,2],[1,0,1]],
			[[0,0,1],[0,0,2],[0,1,2],[1,0,2],[1,1,2],[0,0,0],[2,2,1],[2,2,0],[1,1,0]]
		];
		var buf = [], k = 0;
		buf[k++] = '<table border="0" cellpadding="0" cellspacing="1">';
		buf[k++] = '<tbody>';
		var i,j,isize,jsize,row,col,c;
		for (i = 0, isize = ac.length; i < isize; i++) {
			buf[k++] = '<tr>';
			row = ac[i];
			for (j = 0, jsize = row.length; j < jsize; j++) {
				col = row[j];
				c = a[col[0]]+a[col[1]]+a[col[2]];
				buf[k++] = '<td class="#'+c+'" style="background-color:#'+c+'">&nbsp;</td>';
			}
			buf[k++] = '</tr>';
		}
		buf[k++] = '</tbody>';
		buf[k++] = '</table>';
		this.oElement.innerHTML = buf.join('');
		tjs.lang.destroyArray(buf);
		this.oTable = tjs.dom.getFirstChildByTagName(this.oElement,'table');

		var oStyle = this.oElement.style;
		oStyle.width = this.oTable.offsetWidth + 'px';
		oStyle.height = this.oTable.offsetHeight + 'px';

		this.value = null;
		this.setValue(this.oMap.remove('value'));
		this._clickHandler_ = this._clickHandler.bindAsEventListener(this);
		tjs.event.addListener(this.oTable,'click',this._clickHandler_);
	},
	_destroy :function() {
		tjs.event.removeListener(this.oTable,'click',this._clickHandler_);
	},
	_clickHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		oTarget = tjs.dom.getAncestorByTagName(oTarget,'td',this.oTable);
		if (oTarget) {
			this._setValue(oTarget.className,true);
		}
	},
	_setValue:function(value,fireEvent){
		if (this.value != value) {
			this.value = value;
			if (fireEvent) {
				this.fire(tjs.data.VALUE_CHANGED);
			}
		}
	},
	hasValue:function() {
		return Boolean(this.value);
	},
	getValue:function() {
		return this.value;
	},
	setValue:function(value,fireEvent){
		if (!tjs.lang.isString(value) || value == '') {
			value = null;
		}
		this._setValue(value,fireEvent);
	}
});
