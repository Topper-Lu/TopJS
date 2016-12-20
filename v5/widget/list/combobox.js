tjs.lang.defineClass('tjs.widget.Combobox',tjs.widget.Widget,
function(obj) {
	tjs.widget.Widget.call(this,obj);
},tjs.data.List,tjs.data.SList,{
	_checkAll:function() {
		//tjs.widget.List.prototype._checkAll.call(this);
		this._selectOnInserted = Boolean(this.oMap.remove('selectOnInserted'));
		this._alwaysSelected = Boolean(this.oMap.remove('alwaysSelected'));
		this._noUnselection = this._alwaysSelected || Boolean(this.oMap.remove('noUnselection'));
	},
	_construct:function() {
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'span','tagName != "span" @'+this.classname+'._construct');
//tjs_debug_end
			if (this.oElement.hasChildNodes()) {
				this.oElement.innerHTML = '';
			}
		} else {
			this.oElement = document.createElement('span');
			var oParent = this.oMap.remove('oParent');
			if (oParent) {
				oParent.appendChild(this.oElement);
			}
		}
		tjs.dom.addClass(this.oElement,'combobox');

		this.oSelect = document.createElement('select');
		this.oElement.appendChild(this.oSelect);
		var name = this.oMap.remove('name');
		if (name) {
			this.oSelect.name = name;
			if (tjs.bom.isIE) {
				var oForm = this.oSelect.form;
				if (oForm && !oForm[name]) {
					oForm[name] = this.oSelect;
				}
			}
		}
		var width = this.oMap.remove('width');
		if (tjs.lang.isNumber(width)) {
			this.oSelect.style.width = width+'px';
		}
		this.oSelect.multiple = false;
		this.oSelect.size = 1;
		this.oSelect.selectedIndex = -1;
		this._changeHandler_ = this._changeHandler.bindAsEventListener(this);
		tjs.event.addListener(this.oSelect,'change',this._changeHandler_);

		this._checkSelectedIndex_ = this._checkSelectedIndex.bind(this);
		this.addHandler(tjs.data.AFTER_RESTRUCTURE,this._onAfterRestructure.bind(this));

		this._checkDatas();//
	},
	_destroy:function() {
		tjs.event.removeListener(this.oSelect,'change',this._changeHandler_);
		delete this._changeHandler_;
		if (!this.isEmpty()) {
			var i = this._oNodes.length;
			while (i--) {
				this._destroyNodeContent(this._oNodes[i]);
				this._oNodes[i] = null;
			}
			this._oNodes.length = 0;
		}
		this.oSelect.options.length = 0;
	},
	_destroyNodeContent:function(oNode) {
		if (oNode.oOption) {
			this.oSelect.removeChild(oNode.oOption);
			//this.oSelect.remove(oNode.idx);
		}
		tjs.lang.destroyObject(oNode);
	},
	_updateNodeContent:function(oNode,doReset) {
		oNode.oOption.innerHTML = tjs.str.escapeXML(oNode.data.toString());
		if (tjs.lang.isFunction(oNode.data.getTooltip)) {
			oNode.oOption.title = oNode.data.getTooltip();
		}
	},
	_createNodeContent:function(oNode,refNode) {
		oNode.oOption = document.createElement('option');
		if (refNode) {
			this.oSelect.insertBefore(oNode.oOption,refNode.oOption);
		} else {
			this.oSelect.appendChild(oNode.oOption);
		}
		this._updateNodeContent(oNode,false);
	},
	_detachNodeContent:function(oNode) {
		this.oSelect.removeChild(oNode.oOption);
	},
	_attachNodeContent:function(oNode,refNode) {
		if (refNode) {
			this.oSelect.insertBefore(oNode.oOption,refNode.oOption);
		} else {
			this.oSelect.appendChild(oNode.oOption);
		}
	},
	_onAfterRestructure:function(source,type) {
		if (!this.isEmpty()) {
			tjs.lang.invokeLater(this._checkSelectedIndex_);
		}
	},
	_checkSelectedIndex:function() {
		this.oSelect.selectedIndex = this.getSelectedIndex();
	},
	_changeHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		//tjs.event.preventDefault(oEvent);
		var idx = this.oSelect.selectedIndex;
		this.setSelectedNode(idx > -1 ? this._oNodes[idx] : null,true);
	},
	_updateWidgetDisabled:function(){
		this.oSelect.disabled = this._widgetDisabled;
	},
	_updateSelection:function(oNode){
		this.oSelect.selectedIndex = oNode.selected ? oNode.idx : -1;
	}
});
