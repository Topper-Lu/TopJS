tjs.grid = {
	COLUMN_CLICKED:'COLUMN_CLICKED',
	classname:'tjs.grid'
};

tjs.lang.defineClass('tjs.grid.Column',tjs.data.KeyedObject,
function(o) {
	this.oMap = tjs.util.toMap(o);
	this.construct();
},{
	construct:function(){
		this._checkAll();
		this._construct();
	},
	destroy:function() {
		if (this.oMap) {
			this._destroy();
			this.oMap.destroy();
			tjs.lang.destroyObject(this);
		}
	},
	_checkAll:function(){
		var name = this.oMap.get('name');
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(name) && name,'!tjs.lang.isString(name) @'+this.classname);
//tjs_debug_end
		this.oMap.put('key',name);
		this.oMap.putIfUndefined('caption',name);
		this.oMap.putIfUndefined('hidden',false);
		this.oMap.putIfUndefined('width',128);
		this.oMap.putIfUndefined('sortable',false);
		var oDataHandler = this.oMap.remove('oDataHandler');
		if (tjs.lang.isObject(oDataHandler) && tjs.lang.isFunction(oDataHandler.toGridColumnValue)) {
			this.oDataHandler = oDataHandler;
		}
	},
	getName:function(){
		return this.oMap.get('name');
	},
	getCaption:function(){
		return this.oMap.get('caption');
	},
	getKey:function(){
		return this.oMap.get('key');
	},
	toString:function() {
		return this.oMap.get('caption');
	},
	getTooltip:function() {
		return this.oMap.get('tooltip') || '';
	},
	getDataType:function(){
		return this.oMap.get('dataType');
	},
	setSortable:function(sortable){
		return this.oMap.put('sortable',sortable);
	},
	isSortable:function(){
		return this.oMap.get('sortable');
	},
	createSortHandlers:function(){
		var f = tjs.data.getSortHandler(this.getDataType());
		if (f) {
			var key = this.getKey();
			if (!this.oMap.get('fSortHandler4Asc')) {
				this.oMap.put('fSortHandler4Asc',function(a,b){return f(a[key],b[key]);});
			}
			if (!this.oMap.get('fSortHandler4Desc')) {
				this.oMap.put('fSortHandler4Desc',function(a,b){return f(b[key],a[key]);});
			}
			return true;
		} else {
			return false;
		}
	},
	getSortHandler:function(sortType){
		if (sortType > 0) {
			return this.oMap.get('fSortHandler4Asc');
		} else if (sortType < 0) {
			return this.oMap.get('fSortHandler4Desc');
		} else {
			return null;
		}
	},
	setHidden:function(hidden){
		this.oMap.put('hidden',Boolean(hidden));
	},
	isHidden:function(){
		return this.oMap.get('hidden');
	},
	setWidth:function(width){
		this.oMap.put('width',width);
	},
	getWidth:function(){
		return this.oMap.get('width');
	},
	getValue:function(data){
		if (this.oDataHandler) {
			return this.oDataHandler.toGridColumnValue(data);
		} else {
			return data ? data[this.getName()] : null;
		}
	},
	// to be overrided
	_construct:function(){
	},
	_destroy:function() {
	},
	createContent:function(oNode,data){
	},
	updateContent:function(oNode,data){
	},
	destroyContent:function(oNode,data){
	}
});

tjs.lang.defineClass('tjs.grid.URLColumn',tjs.grid.Column,
function(o) {
	tjs.grid.Column.call(this,o);
},{
	updateContent:function(oNode,data){
		var url = this.getValue(data);
		if (tjs.lang.isString(url) && url != '') {
			tjs.html.loadElementContent(url,oNode.oCell);
		} else {
			tjs.html.destroyElementContent(oNode.oCell);
		}
	},
	destroyContent:function(oNode,data){
		tjs.html.destroyElementContent(oNode.oCell);
	}
});

tjs.lang.defineClass('tjs.grid.HTMLColumn',tjs.grid.Column,
function(o) {
	tjs.grid.Column.call(this,o);
},{
	createContent:function(oNode,data){
		oNode.oCell.className = 'tjs_html_renderer tjs_html_container';
	},
	updateContent:function(oNode,data){
		var html = this.getValue(data);
		if (tjs.lang.isString(html) && html != '') {
			oNode.oCell.innerHTML = html;
			//tjs.html.evalElementContent(oNode.oCell);
		} else {
			oNode.oCell.innerHTML = '';
			//tjs.html.destroyElementContent(oNode.oCell);
		}
	},
	destroyContent:function(oNode,data){
		oNode.oCell.innerHTML = '';
		//tjs.html.destroyElementContent(oNode.oCell);
	}
});

tjs.lang.defineClass('tjs.grid.LinkColumn',tjs.grid.Column,
function(o) {
	tjs.grid.Column.call(this,o);
},{
	_construct:function(){
		var defaultText = this.oMap.remove('defaultText');
		if (defaultText && tjs.lang.isString(defaultText)) {
			this.defaultText = defaultText;
		} else {
			this.defaultText = '';
		}
	},
	createContent:function(oNode,data){
		var o = {};
		o.oTextNode = document.createTextNode('');
		o.oLink = document.createElement('a');
		o.oLink.target = '_blank';
		o.oLink.className = 'tjs_grid_cell_link';
		o.oLink.appendChild(o.oTextNode);
		oNode.oCell.appendChild(o.oLink);
		oNode.oCellContent = o;
	},
	updateContent:function(oNode,data){
		var o = oNode.oCellContent;
		var v = this.getValue(data);
		var href,text;
		if (tjs.lang.isString(v)) {
			if (v) {
				href = v;
				text = this.defaultText ? this.defaultText : v;
			}
		} else if (tjs.lang.isObject(v)) {
			if (v.href && tjs.lang.isString(v.href)) {
				href = v.href;
			}
			if (v.text && tjs.lang.isString(v.text)) {
				text = v.text;
			} else {
				text = this.defaultText ? this.defaultText : href;
			}
		}
		if (!tjs.lang.isString(href) || href == '') {
			href = 'about:blank';
		}
		o.oLink.href = href ? href : 'about:blank';;
		o.oTextNode.nodeValue = text ? text : this.defaultText;
	},
	destroyContent:function(oNode,data){
		tjs.lang.destroyObject(oNode.oCellContent);
		delete oNode.oCellContent;
	}
});

tjs.lang.defineClass('tjs.grid.ImgColumn',tjs.grid.Column,
function(o) {
	tjs.grid.Column.call(this,o);
},{
	_setEmptyValue:function(oImg){
		var s = oImg.style;
		s.width = '1px';
		s.height = '1px';
		oImg.alt = '';
		oImg.title = '';
		oImg.src = tjs.config.get('srcSpacer');
	},
	_setStringValue:function(oImg,v){
		var s = oImg.style;
		s.width = 'auto';
		s.height = 'auto';
		oImg.src = v;
	},
	_setObjectValue:function(oImg,v){
		var s = oImg.style;
		s.width = (tjs.lang.isNumber(v.width) && v.width) ? (v.width+'px') : '';
		s.height = (tjs.lang.isNumber(v.height) && v.height) ? (v.height+'px') : '';
		oImg.alt = (tjs.lang.isString(v.alt) && v.alt) ? v.alt : '';
		oImg.title = (tjs.lang.isString(v.title) && v.title) ? v.title : oImg.alt;
		oImg.src = v.src;
	},
	createContent:function(oNode,data){
		var o = {};
		o.oImg = document.createElement('img');
		o.oImg.className = 'tjs_grid_cell_img';
		this._setEmptyValue(o.oImg);
		oNode.oCell.appendChild(o.oImg);
		oNode.oCellContent = o;
	},
	updateContent:function(oNode,data){
		var o = oNode.oCellContent;
		var v = this.getValue(data);
		if (tjs.lang.isString(v) && v) {
			this._setStringValue(o.oImg,v);
		} else if (tjs.lang.isObject(v) && tjs.lang.isString(v.src) && v.src) {
			this._setObjectValue(o.oImg,v);
		} else {
			this._setEmptyValue(o.oImg);
		}
	},
	destroyContent:function(oNode,data){
		tjs.lang.destroyObject(oNode.oCellContent);
		delete oNode.oCellContent;
	}
});

tjs.lang.defineClass('tjs.grid.CheckboxColumn',tjs.grid.Column,
function(o) {
	tjs.grid.Column.call(this,o);
},{
	createContent:function(oNode,data){
		var o = {};
		o.oElement = document.createElement('span');
		o.oElement.className = 'tjs_checkbox tjs_checkbox_normal';
		oNode.oCell.appendChild(o.oElement);
		oNode.oCellContent = o;
	},
	updateContent:function(oNode,data){
		var o = oNode.oCellContent;
		var v = this.getValue(data);
		if (v) {
			tjs.dom.replaceClass(o.oElement,'tjs_checkbox_normal','tjs_checkbox_selected');
		} else {
			tjs.dom.replaceClass(o.oElement,'tjs_checkbox_selected','tjs_checkbox_normal');
		}
	},
	destroyContent:function(oNode,data){
		tjs.lang.destroyObject(oNode.oCellContent);
		delete oNode.oCellContent;
	}
});

tjs.lang.defineClass('tjs.grid.TextColumn',tjs.grid.Column,
function(o) {
	tjs.grid.Column.call(this,o);
},{
	_align:'l',
	createContent:function(oNode,data){
		tjs.dom.addClass(oNode.oCell,tjs.widget.alignMap[this._align]);
		var o = {};
		o.oTextNode = document.createTextNode('');
		o.oText = document.createElement('span');
		o.oText.className = 'tjs_grid_cell_text';
		o.oText.appendChild(o.oTextNode);
		oNode.oCell.appendChild(o.oText);
		oNode.oCellContent = o;
	},
	updateContent:function(oNode,data){
		oNode.oCellContent.oTextNode.nodeValue = tjs.data.toText(this.getValue(data));
	},
	destroyContent:function(oNode,data){
		tjs.lang.destroyObject(oNode.oCellContent);
		delete oNode.oCellContent;
		tjs.dom.removeClass(oNode.oCell,tjs.widget.alignMap[this._align]);
	}
});

// @tjs.sql.sort only
tjs.lang.defineClass('tjs.grid.ToStringColumn',tjs.grid.TextColumn,
function(o) {
	tjs.grid.TextColumn.call(this,o);
},{
	getValue:function(data){
		return tjs.lang.isObject(data) ? data.toString() : '';
	}
});

tjs.lang.defineClass('tjs.grid.NumberColumn',tjs.grid.TextColumn,
function(o) {
	tjs.grid.TextColumn.call(this,o);
},{
	_align:'r',
	updateContent:function(oNode,data){
		var value = this.getValue(data);
		oNode.oCellContent.oTextNode.nodeValue = tjs.lang.isNumber(value) ? tjs.str.escapeNumber(value) : '';
	}
});

tjs.lang.defineClass('tjs.grid.DateTimeColumn',tjs.grid.TextColumn,
function(o) {
	tjs.grid.TextColumn.call(this,o);
},{
	_align:'c',
	updateContent:function(oNode,data){
		var value = this.getValue(data);
		oNode.oCellContent.oTextNode.nodeValue = tjs.lang.isString(value) ? value : '';
	}
});

tjs.lang.defineClass('tjs.grid.ColorColumn',tjs.grid.TextColumn,
function(o) {
	tjs.grid.TextColumn.call(this,o);
},{
	_align:'c',
	updateContent:function(oNode,data){
		var o = oNode.oCellContent;
		var value = this.getValue(data);
		if (tjs.lang.isString(value) && value) {
			o.oTextNode.nodeValue = value;
			oNode.oCell.backgroundColor = value;
		} else {
			o.oTextNode.nodeValue = '';
			oNode.oCell.backgroundColor = 'transparent';
		}
	}
});

tjs.lang.defineClass('tjs.grid.MultiLineTextColumn',tjs.grid.Column,
function(o) {
	tjs.grid.Column.call(this,o);
},{
	createContent:function(oNode,data){
		var o = {};
		o.oElement = document.createElement('div');
		o.oElement.className = 'tjs_multiline_text';
		oNode.oCell.appendChild(o.oElement);
		oNode.oCellContent = o;
	},
	updateContent:function(oNode,data){
		var v = this.getValue(data);
		oNode.oCellContent.oElement.innerHTML = tjs.lang.isString(v) ? tjs.str.escapeHTMLMultiLine(v) : '';
	},
	destroyContent:function(oNode,data){
		tjs.lang.destroyObject(oNode.oCellContent);
		delete oNode.oCellContent;
	}
});

/* TreeTextColumn */
tjs.lang.defineTopClass('tjs.grid.TreeTextColumn',
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
				this._aPendding = [];
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
		this.root = root;
		if (this._aPendding) {
			var i = this._aPendding.length, o;
			while (i--) {
				o = this._aPendding[i];
				this._aPendding[i] = null;
				this._updateContent(o.oNode,o.data);
				delete o.oNode;
				delete o.data;
			}
			this._aPendding.length = 0;
			delete this._aPendding;
		}
	},
	updateContent:function(oNode,data){
		if (this.root) {
			this._updateContent(oNode,data);
		} else {
			this._aPendding.push({oNode:oNode,data:data});
		}
	},
	_updateContent:function(oNode,data){
	}
});

tjs.lang.defineClass('tjs.grid.TextFromTreeColumn',tjs.grid.TextColumn,
function(o) {
	tjs.grid.TextColumn.call(this,o);
},tjs.grid.TreeTextColumn,{
	_checkAll:function() {
		tjs.grid.TextColumn.prototype._checkAll.call(this);
		this._checkDatas();
	},
	_updateContent:function(oNode,data){
		oNode.oCellContent.oTextNode.nodeValue = tjs.renderer.getTextFromTree(this.root,this.getValue(data));
	}
});

tjs.lang.defineClass('tjs.grid.MTextFromTreeColumn',tjs.grid.TextColumn,
function(o) {
	tjs.grid.TextColumn.call(this,o);
},tjs.grid.TreeTextColumn,{
	_checkAll:function() {
		tjs.grid.TextColumn.prototype._checkAll.call(this);
		this._checkDatas();
	},
	_updateContent:function(oNode,data){
		oNode.oCellContent.oTextNode.nodeValue = tjs.renderer.getMTextFromTree(this.root,this.getValue(data));
	}
});

/* ListTextColumn */
tjs.lang.defineTopClass('tjs.grid.ListTextColumn',
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
				this._aPendding = [];
				oCache.addHandler(tjs.data.CACHE_LOADED,this._cacheLoadedHandler.bind(this));
			} else {
				this._setDatas(oCache.cloneDatas());
			}
		}
	},
	_setDatas:function(datas) {
		this.datas = datas;
		if (this._aPendding) {
			var i = this._aPendding.length, o;
			while (i--) {
				o = this._aPendding[i];
				this._aPendding[i] = null;
				this._updateContent(o.oNode,o.data);
				delete o.oNode;
				delete o.data;
			}
			this._aPendding.length = 0;
			delete this._aPendding;
		}
	},
	updateContent:function(oNode,data){
		if (this.datas) {
			this._updateContent(oNode,data);
		} else if (this._aPendding) {
			this._aPendding.push({oNode:oNode,data:data});
		}
	},
	_updateContent:function(oNode,data){
	}
});

tjs.lang.defineClass('tjs.grid.TextFromListColumn',tjs.grid.TextColumn,
function(o) {
	tjs.grid.TextColumn.call(this,o);
},tjs.grid.ListTextColumn,{
	_checkAll:function() {
		tjs.grid.TextColumn.prototype._checkAll.call(this);
		this._checkDatas();
	},
	_updateContent:function(oNode,data){
		oNode.oCellContent.oTextNode.nodeValue = tjs.renderer.getTextFromList(this.datas,this.getValue(data));
	}
});

tjs.lang.defineClass('tjs.grid.MTextFromListColumn',tjs.grid.TextColumn,
function(o) {
	tjs.grid.TextColumn.call(this,o);
},tjs.grid.ListTextColumn,{
	_checkAll:function() {
		tjs.grid.TextColumn.prototype._checkAll.call(this);
		this._checkDatas();
	},
	_updateContent:function(oNode,data){
		oNode.oCellContent.oTextNode.nodeValue = tjs.renderer.getMTextFromList(this.datas,this.getValue(data));
	}
});

tjs.lang.defineClass('tjs.grid.BitTextFromListColumn',tjs.grid.TextColumn,
function(o) {
	tjs.grid.TextColumn.call(this,o);
},tjs.grid.ListTextColumn,{
	_checkAll:function() {
		tjs.grid.TextColumn.prototype._checkAll.call(this);
		this._checkDatas();
	},
	_updateContent:function(oNode,data){
		oNode.oCellContent.oTextNode.nodeValue = tjs.renderer.getBitTextFromList(this.datas,this.getValue(data));
	}
});

/* ListColumn */
tjs.lang.defineClass('tjs.grid.ListColumn',tjs.grid.Column,
function(o) {
	tjs.grid.Column.call(this,o);
},tjs.widget.clsWidget,tjs.widget.hvWidget,{
	_hv:'h',
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
		tjs.grid.Column.prototype._checkAll.call(this);
		this._checkHV();
		this._checkClsId();
		this._checkListType();
		this._checkCellHandler();
	},
	_construct:function(){
		//tjs.grid.Column.prototype._construct.call(this);
		this._checkDatas();
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
				this._aPendding = [];
				oCache.addHandler(tjs.data.CACHE_LOADED,this._cacheLoadedHandler.bind(this));
			} else {
				this._setDatas(oCache.cloneDatas());
			}
		}
	},
	_setDatas:function(datas) {
		if (datas && datas.length > 0) {
			this.datas = datas;
			if (this._aPendding) {
				if (this._aPendding.length > 0) {
					for (var i = 0, isize = this._aPendding.length, o; i < isize; i++) {
						o = this._aPendding[i];
						this._aPendding[i] = null;
						this._createContent(o.oNode,o.data);
						this._updateContent(o.oNode,o.data);
						delete o.oNode;
						delete o.data;
					}
					this._aPendding.length = 0;
				}
				delete this._aPendding;
			}
		}
	},
	createContent:function(oNode,data){
		if (this.datas) {
			this._createContent(oNode,data);
		} else if (this._aPendding) {
			this._aPendding.push({oNode:oNode,data:data});
		}
	},
	_createContent:function(oNode,data){
		var o = {_oNodes:[]};
		o.oElement = document.createElement('span');
		o.oElement.className = this._listType+' '+this._listType+'_'+this._clsId+' '+this._listType+'_'+this._hv+' '+this._listType+'_'+this._clsId+'_'+this._hv;
		//tjs.dom.addClass(o.oElement,this._listType);
		//tjs.dom.addClass(o.oElement,this._listType+'_'+this._clsId);
		//tjs.dom.addClass(o.oElement,this._listType+'_'+this._hv);
		//tjs.dom.addClass(o.oElement,this._listType+'_'+this._clsId+'_'+this._hv);

		oNode.oCell.appendChild(o.oElement);
		oNode.oCellContent = o;
		for (var i = 0, isize = this.datas.length, n; i < isize; i++) {
			n = {data:this.datas[i],selected:false};
			o._oNodes[i] = n;
			n.oCell = document.createElement('span');
			n.oCell.className = this._listType+'_cell '+this._listType+'_cell_normal';
			o.oElement.appendChild(n.oCell);
			this._oCellHandler.createContent(n,n.data);
			this._oCellHandler.updateContent(n,n.data);
		}
	},
	updateContent:function(oNode,data){
		if (oNode.oCellContent) {
			this._updateContent(oNode,data);
		}
	},
	_updateContent:function(oNode,data){
	},
	destroyContent:function(oNode,data){
		var o = oNode.oCellContent;
		if (o._oNodes) {
			var i = o._oNodes.length,n;
			while (i--) {
				n = o._oNodes[i];
				o._oNodes[i] = null;
				this._oCellHandler.destroyContent(n,n.data);
				tjs.lang.destroyObject(n);
			}
			o._oNodes.length = 0;
		}
	},
	_getNodeByKey:function(oNodes,key) {
		var o;
		if (key != null && oNodes) {
			var i = oNodes.length, n;
			while (i--) {
				n = oNodes[i];
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
	}
});

tjs.lang.defineClass('tjs.grid.RadioListColumn',tjs.grid.ListColumn,
function(o) {
	tjs.grid.ListColumn.call(this,o);
},{
	_listType:'tjs_radio_list',
	_updateContent:function(oNode,data){
		var o = oNode.oCellContent;
		var v = this.getValue(data);

		var n = this._getNodeByKey(o._oNodes,v);
		if (o._selectedNode != n) {
			if (o._selectedNode) {
				this._setNodeSelection(o._selectedNode,false);
			}
			o._selectedNode = n;
			if (o._selectedNode) {
				this._setNodeSelection(o._selectedNode,true);
			}
		}
	}
});

tjs.lang.defineClass('tjs.grid.CheckboxListColumn',tjs.grid.ListColumn,
function(o) {
	tjs.grid.ListColumn.call(this,o);
},{
	_listType:'tjs_checkbox_list',
	_updateContent:function(oNode,data){
		var o = oNode.oCellContent;
		var a = this.getValue(data);

		var i;
		if (tjs.lang.isArray(a) && a.length > 0) {
			var o = {},key,n,x;
			i = a.length;
			while (i--) {
				key = a[i];
				o[String(key)] = key;
			}
			i = o._oNodes.length;
			while (i--) {
				n = o._oNodes[i];
				key = n.data.getKey();
				x = String(key);
				this._setNodeSelection(n,(x in o) && (o[x] == key));
			}
			tjs.lang.destroyObject(o);
		} else {
			i = o._oNodes.length;
			while (i--) {
				this._setNodeSelection(o._oNodes[i],false);
			}
		}
	}
});

tjs.lang.defineClass('tjs.grid.BitCheckboxListColumn',tjs.grid.ListColumn,
function(o) {
	tjs.grid.ListColumn.call(this,o);
},{
	_listType:'tjs_checkbox_list',
	_updateContent:function(oNode,data){
		var o = oNode.oCellContent;
		var v = this.getValue(data);

		var i = o._oNodes.length;
		if (tjs.lang.isNumber(v) && isFinite(v) && v > 0) {
			var n;
			while (i--) {
				n = o._oNodes[i];
				this._setNodeSelection(n,(Number(n.data.getKey()) & v) != 0);
			}
		} else {
			while (i--) {
				this._setNodeSelection(o._oNodes[i],false);
			}
		}
	}
});

/* WidgetColumn */
tjs.lang.defineClass('tjs.grid.WidgetColumn',tjs.grid.Column,
function(o) {
	tjs.grid.Column.call(this,o);
},{
	_fWidgetClass:null,
	_construct:function(){
		this.cellContent = this.oMap.remove('cellContent');
		if (!tjs.lang.isObject(this.cellContent)) {
			this.cellContent = {};
		}
	},
	_destroy:function() {
		tjs.lang.destroyObject(this.cellContent);
	},
	createContent:function(oNode,data){
		var o = tjs.lang.copyObject(this.cellContent,{oParent:oNode.oCell});
		oNode.oWidget = new this._fWidgetClass(o);
	},
	destroyContent:function(oNode,data){
		delete oNode.oWidget;
		tjs.html.destroyElementContent(oNode.oCell);
	}
});

/* EditorCheckboxColumn */
tjs.lang.defineClass('tjs.grid.EditorCheckboxColumn',tjs.grid.WidgetColumn,
function(o) {
	tjs.grid.WidgetColumn.call(this,o);
},{
	_fWidgetClass:tjs.editor.Checkbox,
	_checkAll:function(){
		tjs.grid.WidgetColumn.prototype._checkAll.call(this);
		var fEventHandler = this.oMap.remove('fEventHandler');
		if (tjs.lang.isFunction(fEventHandler)) {
			this.fEventHandler = fEventHandler;
		}
	},
	updateContent:function(oNode,data){
		oNode.oWidget.setValue(this.getValue(data));
	},
	createContent:function(oNode,data){
		tjs.grid.WidgetColumn.prototype.createContent.call(this,oNode,data);
		if (this.fEventHandler) {
			oNode.oWidget.addHandler(tjs.data.VALUE_CHANGED,this.fEventHandler);
		}
	}
});

/* ListWidgetColumn */
tjs.lang.defineClass('tjs.grid.ListWidgetColumn',tjs.grid.WidgetColumn,
function(o) {
	tjs.grid.WidgetColumn.call(this,o);
},{
	_construct:function(){
		tjs.grid.WidgetColumn.prototype._construct.call(this);
		var datas = this.oMap.remove('datas');
		var cache = this.oMap.remove('cache');
		if (tjs.lang.isArray(datas)) {
			this.datas = datas;
		} else if (tjs.lang.isObject(cache)) {
			this.cache = cache;
		}
	},
	createContent:function(oNode,data){
		var o = tjs.lang.copyObject(this.cellContent,{oParent:oNode.oCell});
		if (this.datas) {
			o.datas = this.datas;
		} else if (this.cache) {
			o.cache = this.cache;
		}
		oNode.oWidget = new this._fWidgetClass(o);
	}
});

/* CmdListColumn */
tjs.lang.defineClass('tjs.grid.CmdListColumn',tjs.grid.ListWidgetColumn,
function(o) {
	tjs.grid.ListWidgetColumn.call(this,o);
},{
	_checkAll:function(){
		tjs.grid.ListWidgetColumn.prototype._checkAll.call(this);
		var fCmdHandler = this.oMap.remove('fCmdHandler');
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isFunction(fCmdHandler),'!tjs.lang.isFunction(fCmdHandler) @'+this.classname);
//tjs_debug_end
		this.fCmdHandler = fCmdHandler;
		this._cmdHandler_ = this._cmdHandler.bind(this);
	},
	_cmdHandler:function(source,type,oNode){
		this.fCmdHandler(oNode.data.getKey(),source.data);
	},
	createContent:function(oNode,data){
		tjs.grid.ListWidgetColumn.prototype.createContent.call(this,oNode,data);
		oNode.oWidget.addHandler(tjs.data.DATA_CLICKED,this._cmdHandler_);
	},
	updateContent:function(oNode,data){
		oNode.oWidget.data = data;
	},
	_fWidgetClass:tjs.widget.CmdList
});

tjs.lang.defineClass('tjs.grid.CmdTextListColumn',tjs.grid.CmdListColumn,
function(o) {
	tjs.grid.CmdListColumn.call(this,o);
},{
	_fWidgetClass:tjs.widget.CmdTextList
});

tjs.lang.defineClass('tjs.grid.IconListColumn',tjs.grid.CmdListColumn,
function(o) {
	tjs.grid.CmdListColumn.call(this,o);
},{
	_fWidgetClass:tjs.widget.IconList
});

tjs.lang.defineClass('tjs.grid.IconTextListColumn',tjs.grid.CmdListColumn,
function(o) {
	tjs.grid.CmdListColumn.call(this,o);
},{
	_fWidgetClass:tjs.widget.IconTextList
});
