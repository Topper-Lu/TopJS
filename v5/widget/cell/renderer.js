tjs.renderer = {
	getTextFromList:function(datas,v){
		var s = '';
		if (v != null && datas && datas.length > 0) {
			var data;
			for (var i = 0, isize = datas.length; i < isize; i++) {
				data = datas[i];
				if (data != null && data.getKey() == v) {
					s = data.toString();
					break;
				}
			}
		}
		return s;
	},
	getMTextFromList:function(datas,a){
		var s = '';
		if (tjs.lang.isArray(a) && a.length > 0 && datas && datas.length > 0) {
			var o = {}, b = [], k = 0, i, isize, data;
			i = a.length;
			while (i--) {
				o[a[i]] = true;
			}
			isize = datas.length;
			for (i = 0; i < isize; i++) {
				data = datas[i];
				if ((data != null) && (data.getKey() in o)) {
					b[k++] = data.toString();
				}
			}
			tjs.lang.destroyObject(o);
			if (b.length > 0) {
				s = b.join(',');
				tjs.lang.destroyArray(b);
			}
		}
		return s;
	},
	getBitTextFromList:function(datas,v){
		var s = '';
		if (isFinite(v) && v > 0) {
			var b = [],k = 0,data;
			for (var i = 0, isize = datas.length; i < isize; i++) {
				data = datas[i];
				if (data != null && (data.getKey() & v) != 0) {
					b[k++] = data.toString();
				}
			}
			if (b.length > 0) {
				s = b.join(',');
				tjs.lang.destroyArray(b);
			}
		}
		return s;
	},
	getTextFromTree:function(root,v){
		var s = '';
		if (v != null && root) {
			var oNode = tjs.data.TreeNode.search(root,tjs.data.searchByKey,v);
			s = oNode ? oNode.data.toString() : '';
		}
		return s;
	},
	getMTextFromTree:function(root,a){
		var s = '';
		if (tjs.lang.isArray(a) && a.length > 0 && root) {
			var b = [], k = 0;
			var oNode;
			for (var i = 0, isize = a.length; i < isize; i++) {
				oNode = tjs.data.TreeNode.search(root,tjs.data.searchByKey,a[i]);
				if (oNode) {
					b[k++] = oNode.data.toString();
				}
			}
			if (b.length > 0) {
				s = b.join(',');
				tjs.lang.destroyArray(b);
			}
		}
		return s;
	},
	classname:'tjs.renderer'
};

tjs.lang.defineClass('tjs.renderer.ImgRenderer',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},{
	_construct:function() {
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'img','tagName != "img" @'+this.classname);
//tjs_debug_end
		} else {
			this.oElement = document.createElement('img');
			var oParent = this.oMap.remove('oParent');
			if (tjs.dom.isElement(oParent)) {
				oParent.appendChild(this.oElement);
			}
		}
		this.oElement.className = 'tjs_img_renderer';
		this.setValue(this.oMap.remove('value'));
	},
	_setEmptyValue:function(){
		var s = this.oElement.style;
		s.width = '1px';
		s.height = '1px';
		this.oElement.alt = '';
		this.oElement.title = '';
		this.oElement.src = tjs.config.get('srcSpacer');
	},
	_setStringValue:function(v){
		var s = this.oElement.style;
		s.width = '';
		s.height = '';
		this.oElement.src = v;
	},
	_setObjectValue:function(v){
		var s = this.oElement.style;
		s.width = (tjs.lang.isNumber(v.width) && v.width) ? (v.width+'px') : '';
		s.height = (tjs.lang.isNumber(v.height) && v.height) ? (v.height+'px') : '';
		this.oElement.alt = (tjs.lang.isString(v.alt) && v.alt) ? v.alt : '';
		this.oElement.title = (tjs.lang.isString(v.title) && v.title) ? v.title : this.oElement.alt;
		this.oElement.src = v.src;
	},
	setValue:function(v) {
		if (tjs.lang.isString(v) && v) {
			this._setStringValue(v);
		} else if (tjs.lang.isObject(v) && tjs.lang.isString(v.src) && v.src) {
			this._setObjectValue(v);
		} else {
			this._setEmptyValue();
		}
	}
});

tjs.lang.defineClass('tjs.renderer.URLRenderer',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},{
	_construct:function() {
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'div','tagName != "div" @'+this.classname);
//tjs_debug_end
		} else {
			this.oElement = document.createElement('div');
			var oParent = this.oMap.remove('oParent');
			if (tjs.dom.isElement(oParent)) {
				oParent.appendChild(this.oElement);
			}
		}
		this.oElement.className = 'tjs_url_renderer';
		this.setValue(this.oMap.remove('value'));
	},
	setValue:function(url) {
		if (tjs.lang.isString(url) && url != '') {
			tjs.html.loadElementContent(url,this.oElement);
		} else {
			tjs.html.destroyElementContent(this.oElement);
		}
	}
});

tjs.lang.defineClass('tjs.renderer.HTMLRenderer',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},{
	_construct:function() {
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'div','tagName != "div" @'+this.classname);
//tjs_debug_end
		} else {
			this.oElement = document.createElement('div');
			var oParent = this.oMap.remove('oParent');
			if (tjs.dom.isElement(oParent)) {
				oParent.appendChild(this.oElement);
			}
		}
		this.oElement.className = 'tjs_html_renderer tjs_html_container';
		this.setValue(this.oMap.remove('value'));
	},
	setValue:function(html) {
		if (tjs.lang.isString(html) && html != '') {
			this.oElement.innerHTML = html;
			//tjs.html.evalElementContent(this.oElement);
		} else {
			this.oElement.innerHTML = '';
			//tjs.html.destroyElementContent(this.oElement);
		}
	}
});

tjs.lang.defineClass('tjs.renderer.Checkbox',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},{
	_construct:function() {
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'span','tagName != "span" @'+this.classname);
//tjs_debug_end
		} else {
			this.oElement = document.createElement('span');
			var oParent = this.oMap.remove('oParent');
			if (tjs.dom.isElement(oParent)) {
				oParent.appendChild(this.oElement);
			}
		}
		this.oElement.className = 'tjs_checkbox tjs_checkbox_normal';
		this.value = false;
		this.setValue(this.oMap.remove('value'));
	},
	setValue:function(value) {
		value = Boolean(value);
		if (this.value != value) {
			this.value = value;
			if (value) {
				tjs.dom.replaceClass(this.oElement,'tjs_checkbox_normal','tjs_checkbox_selected');
			} else {
				tjs.dom.replaceClass(this.oElement,'tjs_checkbox_selected','tjs_checkbox_normal');
			}
		}
	}
});

tjs.lang.defineClass('tjs.renderer.OneLineText',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},{
	_construct:function() {
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'span','tagName != "span" @'+this.classname);
//tjs_debug_end
			if (this.oElement.hasChildNodes()) {
				this.oElement.innerHTML = '';
			}
		} else {
			this.oElement = document.createElement('span');
			var oParent = this.oMap.remove('oParent');
			if (tjs.dom.isElement(oParent)) {
				oParent.appendChild(this.oElement);
			}
		}
		this.oElement.className = 'tjs_oneline_text';
		this.oText = document.createTextNode('');
		this.oElement.appendChild(this.oText);
		this.setValue(this.oMap.remove('value'));
	},
	setValue:function(value) {
		this.oText.nodeValue = tjs.data.toText(value);
	}
});

tjs.lang.defineClass('tjs.renderer.Number',tjs.renderer.OneLineText,
function(o) {
	tjs.renderer.OneLineText.call(this,o);
},{
	setValue:function(value) {
		this.oText.nodeValue = tjs.lang.isNumber(value) ? tjs.str.escapeNumber(value) : '';
	}
});

tjs.lang.defineClass('tjs.renderer.Color',tjs.renderer.OneLineText,
function(o) {
	tjs.renderer.OneLineText.call(this,o);
},{
	setValue:function(value) {
		if (tjs.lang.isString(value) && value) {
			this.oText.nodeValue = value;
			this.oElement.backgroundColor = value;
		} else {
			this.oText.nodeValue = '';
			this.oElement.backgroundColor = 'transparent';
		}
	}
});

tjs.lang.defineClass('tjs.renderer.MultiLineText',tjs.widget.Widget,
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
		} else {
			this.oElement = document.createElement('div');
			var oParent = this.oMap.remove('oParent');
			if (tjs.dom.isElement(oParent)) {
				oParent.appendChild(this.oElement);
			}
		}
		this.oElement.className = 'tjs_multiline_text';
		//tjs.dom.addClass(this.oElement,'tjs_multiline_text');
		this.setValue(this.oMap.remove('value'));
	},
	setValue:function(value) {
		this.oElement.innerHTML = tjs.lang.isString(value) ? tjs.str.escapeHTMLMultiLine(value) : '';
	}
});

tjs.lang.defineTopClass('tjs.renderer.TreeTextRenderer',
function() {
},{
	_checkDatas:function() {
		var root = this.oMap.remove('root');
		var cache = this.oMap.remove('cache');
		if (root instanceof tjs.data.TreeNode) {
			this._setRoot(root);
		} else if (tjs.lang.isObject(cache) && cache.url && tjs.lang.isString(cache.url) && tjs.lang.isFunction(cache.fClass)) {
			var oCache = tjs.data.TreeCache.get(cache.url,cache.fClass);
			if (oCache.isLoading()) {
				this._loading = true;
				var o = this;
				oCache.addHandler(tjs.data.CACHE_LOADED,function(oEvent){
					o._setRoot(oCache.cloneDatas());
				});
			} else {
				this._setRoot(oCache.cloneDatas());
			}
		}
	},
	_setRoot:function(root) {
		if (this._loading) {
			delete this._loading;
		}
		this.root = root;
		var value = this.oMap.remove('value');
		if (value != null) {
			this._setValue(value);
		}
	},
	setValue:function(value) {
		if (this.root) {
			this._setValue(value);
		} else if (this._loading && value != null) {
			this.oMap.put('value',value);
		}
	},
	_setValue:function(value) {
	}
});

tjs.lang.defineClass('tjs.renderer.TextFromTree',tjs.renderer.OneLineText,
function(o) {
	tjs.renderer.OneLineText.call(this,o);
},tjs.renderer.TreeTextRenderer,{
	_checkAll:function() {
		this._checkDatas();
	},
	_setValue:function(value) {
		this.oText.nodeValue = tjs.renderer.getTextFromTree(this.root,value);
	}
});

tjs.lang.defineClass('tjs.renderer.MTextFromTree',tjs.renderer.OneLineText,
function(o) {
	tjs.renderer.OneLineText.call(this,o);
},tjs.renderer.TreeTextRenderer,{
	_checkAll:function() {
		this._checkDatas();
	},
	_setValue:function(value) {
		this.oText.nodeValue = tjs.renderer.getTextFromTree(this.root,value);
	}
});

tjs.lang.defineTopClass('tjs.renderer.ListTextRenderer',
function() {
},{
	_cacheLoadedHandler:function(source,type){
		this._setDatas(source.cloneDatas());
	},
	_checkDatas:function() {
		var datas = this.oMap.remove('datas');
		var cache = this.oMap.remove('cache');
		if (tjs.lang.isArray(datas)) {
			this._setDatas(datas);
		} else if (tjs.lang.isObject(cache) && cache.url && tjs.lang.isString(cache.url) && tjs.lang.isFunction(cache.fClass)) {
			var oCache = tjs.data.ListCache.get(cache.url,cache.fClass);
			if (oCache.isLoading()) {
				this._loading = true;
				oCache.addHandler(tjs.data.CACHE_LOADED,this._cacheLoadedHandler.bind(this));
			} else {
				this._setDatas(oCache.cloneDatas());
			}
		}
	},
	_setDatas:function(datas) {
		if (this._loading) {
			delete this._loading;
		}
		if (datas && datas.length > 0) {
			this.datas = datas;
			var value = this.oMap.remove('value');
			if (value != null) {
				this._setValue(value);
			}
		}
	},
	setValue:function(value) {
		if (this.datas) {
			this._setValue(value);
		} else if (this._loading && value != null) {
			this.oMap.put('value',value);
		}
	},
	_setValue:function(value){
	}
});

tjs.lang.defineClass('tjs.renderer.TextFromList',tjs.renderer.OneLineText,
function(o) {
	tjs.renderer.OneLineText.call(this,o);
},tjs.renderer.ListTextRenderer,{
	_checkAll:function(){
		this._checkDatas();
	},
	_setValue:function(value) {
		this.oText.nodeValue = tjs.renderer.getTextFromList(this.datas,value);
	}
});

tjs.lang.defineClass('tjs.renderer.MTextFromList',tjs.renderer.OneLineText,
function(o) {
	tjs.renderer.OneLineText.call(this,o);
},tjs.renderer.ListTextRenderer,{
	_checkAll:function(){
		this._checkDatas();
	},
	_setValue:function(value) {
		this.oText.nodeValue = tjs.renderer.getMTextFromList(this.datas,value);
	}
});

tjs.lang.defineClass('tjs.renderer.BitTextFromList',tjs.renderer.OneLineText,
function(o) {
	tjs.renderer.OneLineText.call(this,o);
},tjs.renderer.ListTextRenderer,{
	_checkAll:function(){
		this._checkDatas();
	},
	_setValue:function(value) {
		this.oText.nodeValue = tjs.renderer.getBitTextFromList(this.datas,value);
	}
});

tjs.lang.defineClass('tjs.renderer.ListRenderer',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},tjs.widget.clsWidget,tjs.widget.hvWidget,{
	_listType:'tjs_text_list',
	_checkListType:function() {
		var listType = this.oMap.remove('listType');
		if (listType && tjs.lang.isString(listType)) {
			this._listType = listType;
		}
	},
	_cellHandler:'tjs.cell.TextHandler',
	_checkCellHandler:function() {
		var oCellHandler = this.oMap.remove('oCellHandler');
		if (oCellHandler instanceof tjs.cell.Handler) {
			this._oCellHandler = oCellHandler;
		} else {
			this._oCellHandler = tjs.cell.getHandler(this._cellHandler)
		}
	},
	_checkAll:function() {
		this._checkHV();
		this._checkClsId();
		this._checkListType();
		this._checkCellHandler();
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
			if (tjs.dom.isElement(oParent)) {
				oParent.appendChild(this.oElement);
			}
		}
		tjs.dom.addClass(this.oElement,this._listType);
		tjs.dom.addClass(this.oElement,this._listType+'_'+this._clsId);
		tjs.dom.addClass(this.oElement,this._listType+'_'+this._hv);
		tjs.dom.addClass(this.oElement,this._listType+'_'+this._clsId+'_'+this._hv);

		this._checkDatas();
	},
	_destroy:function() {
		if (this._oNodes) {
			var i = this._oNodes.length,oNode;
			while (i--) {
				oNode = this._oNodes[i];
				this._oNodes[i] = null;
				this._oCellHandler.destroyContent(oNode,oNode.data);
				tjs.lang.destroyObject(oNode);
			}
			this._oNodes.length = 0;
		}
		this._oCellHandler.destroy();
	},
	_cacheLoadedHandler:function(source,type){
		this._setDatas(source.cloneDatas());
	},
	_checkDatas:function() {
		var datas = this.oMap.remove('datas');
		var cache = this.oMap.remove('cache');
		if (tjs.lang.isArray(datas)) {
			this._setDatas(datas);
		} else if (tjs.lang.isObject(cache) && cache.url && tjs.lang.isString(cache.url) && tjs.lang.isFunction(cache.fClass)) {
			var oCache = tjs.data.ListCache.get(cache.url,cache.fClass);
			if (oCache.isLoading()) {
				this._loading = true;
				oCache.addHandler(tjs.data.CACHE_LOADED,this._cacheLoadedHandler.bind(this));
			} else {
				this._setDatas(oCache.cloneDatas());
			}
		}
	},
	_setDatas:function(datas) {
		if (this._loading) {
			delete this._loading;
		}
		if (datas && datas.length > 0) {
			this._oNodes = [];
			for (var i = 0, isize = datas.length; i < isize; i++) {
				oNode = {data:datas[i],selected:false};
				this._oNodes[i] = oNode;
				oNode.oCell = document.createElement('span');
				oNode.oCell.className = this._listType+'_cell '+this._listType+'_cell_normal';
				this.oElement.appendChild(oNode.oCell);
				this._oCellHandler.createContent(oNode,oNode.data);
				this._oCellHandler.updateContent(oNode,oNode.data);
			}
			this._afterSetDatas();
		}
	},
	_getNodeByKey:function(key) {
		var o;
		if (key != null && this._oNodes) {
			var i = this._oNodes.length, n;
			while (i--) {
				n = this._oNodes[i];
				if (n.data && n.data.getKey && n.data.getKey() == key) {
					o = n;
					break;
				}
			}
		}
		return o;
	},
	_setNodeSelection:function(oNode,selected) {
		if (oNode.selected != selected) {
			oNode.selected = selected;
			if (oNode.selected) {
				tjs.dom.replaceClass(oNode.oCell,this._listType+'_cell_normal',this._listType+'_cell_selected');
			} else {
				tjs.dom.replaceClass(oNode.oCell,this._listType+'_cell_selected',this._listType+'_cell_normal');
			}
		}
	},
	_afterSetDatas:function() {
		var value = this.oMap.remove('value');
		if (value != null) {
			this._setValue(value);
		}
	},
	setValue:function(value) {
		if (this._oNodes) {
			this._setValue(value);
		} else if (this._loading && value != null) {
			this.oMap.put('value',value);
		}
	},
	_setValue:function(value){
	}
});

tjs.lang.defineClass('tjs.renderer.RadioList',tjs.renderer.ListRenderer,
function(o) {
	tjs.renderer.ListRenderer.call(this,o);
},{
	_listType:'tjs_radio_list',
	_setValue:function(v) {
		var oNode = this._getNodeByKey(v);
		if (this._selectedNode != oNode) {
			if (this._selectedNode) {
				this._setNodeSelection(this._selectedNode,false);
			}
			this._selectedNode = oNode;
			if (this._selectedNode) {
				this._setNodeSelection(this._selectedNode,true);
			}
		}
	}
});

tjs.lang.defineClass('tjs.renderer.CheckboxList',tjs.renderer.ListRenderer,
function(obj) {
	tjs.renderer.ListRenderer.call(this,obj);
},{
	_listType:'tjs_checkbox_list',
	_setValue:function(a) {
		if (this._oNodes) {
			var i;
			if (tjs.lang.isArray(a) && a.length > 0) {
				var o = {},key,oNode,x;
				i = a.length;
				while (i--) {
					key = a[i];
					o[String(key)] = key;
				}
				i = this._oNodes.length;
				while (i--) {
					oNode = this._oNodes[i];
					key = oNode.data.getKey();
					x = String(key);
					this._setNodeSelection(oNode,(x in o) && (o[x] == key));
				}
				tjs.lang.destroyObject(o);
			} else {
				i = this._oNodes.length;
				while (i--) {
					this._setNodeSelection(this._oNodes[i],false);
				}
			}
		}
	}
});

tjs.lang.defineClass('tjs.renderer.BitCheckboxList',tjs.renderer.ListRenderer,
function(obj) {
	tjs.renderer.ListRenderer.call(this,obj);
},{
	_listType:'tjs_checkbox_list',
	_setValue:function(v) {
		if (this._oNodes) {
			var i = this._oNodes.length;
			if (tjs.lang.isNumber(v) && isFinite(v) && v > 0) {
				var n;
				while (i--) {
					n = this._oNodes[i];
					this._setNodeSelection(n,(Number(n.data.getKey()) & v) != 0);
				}
			} else {
				while (i--) {
					this._setNodeSelection(this._oNodes[i],false);
				}
			}
		}
	}
});
