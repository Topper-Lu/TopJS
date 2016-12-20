tjs.lang.defineClass('tjs.sql.ListController',tjs.sql.AbstractLTController,
function(o) {
	tjs.sql.AbstractLTController.call(this,o);
},{
	_checkAll:function() {
		tjs.sql.AbstractLTController.prototype._checkAll.call(this);
		this._clickCountName = this.oMap.remove('clickCountName');
	},
	_construct:function() {
		tjs.sql.AbstractLTController.prototype._construct.call(this);
		if (this._clickCountName) {
			this.oView.addHandler(tjs.data.DATA_CLICKED,this._onDataClicked.bind(this));
		}

		var pagged = this.oToolBar && this.oMap.remove('pagged');
		if (pagged) {
			this.oPageManager = new tjs.sql.PageManager(this);
		}

		var oSearcher;
		var aSearchFields = this._createSearchFields();
		if (aSearchFields) {
			oSearcher = this.oMap.remove('oSearcher');
			if (tjs.lang.isObject(oSearcher) && tjs.dom.isElement(oSearcher.oContainer) && oSearcher.oTrigger) {
				oSearcher.aFields = aSearchFields;
			} else if (this.oIconList) {
				oSearcher = {aFields:aSearchFields,noDelay:Boolean(this.oMap.remove('forceSearcher'))};
				this.oIconList.addCmd('search');
			} else {
				oSearcher = null;
			}
		}
		var oKeyword = this.oMap.remove('oKeyword');
		if (tjs.lang.isObject(oKeyword) && tjs.lang.isArray(oKeyword.aFields)) {
			if (!tjs.dom.isElement(oKeyword.oContainer)) {
				var oResource = tjs.config.oResource;
				var label = oResource.get('keyword')+oResource.get('colon');
				this.oToolBar.addContainer({cls:'tjs_toolbar_container'});
				var oLabeledContainer = new tjs.widget.LabeledContainer({oElement:this.oToolBar.getLastContainer(),label:label});
				oKeyword.oContainer = oLabeledContainer.getContent();
			}
		} else {
			oKeyword = null;
		}
		if (oSearcher || oKeyword) {
			this.oSearchManager = new tjs.sql.SearchManager({
				oController:this,
				oEncoder:this.oMap.get('oEncoder'),
				oSearcher:oSearcher,
				oKeyword:oKeyword
			});
		}

		if (this.oView._sortType != 1) {
			var aSortDatas = this._createSortDatas(this._sortType);
			if (aSortDatas) {
				if (this.oView._sortType == 2) {
					this.oView.addHandler(tjs.grid.COLUMN_CLICKED,this._onGridColumnClicked.bind(this));
				} else if (this.oIconList) {
					this.oIconList.addCmd('sort');
					var o = {oController:this,datas:aSortDatas};
					this.oSortManager = new tjs.sql.SortManager(o);
				} else {
					tjs.lang.destroyArray(aSortDatas);
				}
			}
		}
	},
	_destroy:function(){
		if (this.oSortManager) {
			this.oSortManager.destroy();
		}
		if (this.oSearchManager) {
			this.oSearchManager.destroy();
		}
		if (this.oPageManager) {
			this.oPageManager.destroy();
		}
		tjs.sql.AbstractLTController.prototype._destroy.call(this);
	},
	_fViewClass:tjs.grid.ListGrid,
	_createView:function(){
		var oView = this.oMap.remove('oView');
		var fClass = oView.fClass;
		delete oView.fClass;
		if (!tjs.lang.isFunction(fClass)) {
			fClass = this._fViewClass;
		}
		if (tjs.lang.isSubClassOf(fClass,tjs.grid.ListGrid)) {
			if (!tjs.lang.isArray(oView.aColumns)) {
				oView.aColumns = this._createColumns();
			}
		}
		oView = new fClass(oView);
		return oView;
	},
	_createColumns:function(){
		var a;
		var b = this.oMap.remove('aGridNames');
		if (tjs.lang.isArray(b)) {
			a = this.viewFactory.getGridColumnFields(b);
			var i = a.length;
			while (i--) {
				a[i] = a[i].createGridColumn();
			}
		} else {
			a = [];
		}
		return a;
	},
	_conditionChanged:function(){
		if (!this.oPageManager || !this.oPageManager.resetCurrPage()) {
			this.loadDatas();
		}
	},
	loadDatas:function(){
		var offset = this.oPageManager ? this.oPageManager.getOffset() : 0;
		var length = this.oPageManager ? this.oPageManager.getLength() : 0;
		this.oProxy.selectJson(this._getWhere(),this._getOrderby(),offset,length,this._getPart());
	},
	_emptyDatas:function(){
		this._selectJsonHandler(0,null);
	},
	find:function(){
		this.oProxy.find(this._getWhere());
	},
	_findHandler:function(count){
		if (this.oPageManager) {
			this.oPageManager.setTotalRows(count);
		}
	},
	_selectJsonHandler:function(totalRows,datas){
		if (this.oPageManager) {
			this.oPageManager.setTotalRows(totalRows);
		}
		this.oView.setDatas(datas);
	},
	_onDataClicked:function(source,type,oNode){
		this.oProxy.addClickCount(this._clickCountName,oNode.data.getKey());
	},
	_addClickCountHandler:function(count){
		var oNode = this.oView.currClickedNode;
		oNode.data[this._clickCountName] = count;
		this.oView.updateData(oNode.data,oNode.idx);
	},
	search:function(){
		this.oSearchManager.search();
	},
	setSearchValue:function(v){
		if (this.oSearchManager) {
			this.oSearchManager.setSearchValue(v);
		}
	},
	hasSearchValue:function(){
		return this.oSearchManager ? this.oSearchManager.hasSearchValue() : false;
	},
	getSearchValue:function(){
		return this.oSearchManager ? this.oSearchManager.getSearchValue() : null;
	},
	sort:function(){
		this.oSortManager.sort();
	},
	setSortValue:function(v){
		if (this.oSortManager) {
			this.oSortManager.setSortValue(v);
		}
	},
	hasSortValue:function(){
		return this.oSortManager ? this.oSortManager.hasSortValue() : false;
	},
	getSortValue:function(){
		return this.oSortManager ? this.oSortManager.getSortValue() : null;
	},
	_createSearchFields:function(){
		var a = null;
		var oEncoder = this.oMap.get('oEncoder');
		if (oEncoder instanceof tjs.sql.Encoder) {
			a = this.oMap.remove('aSearchFields');
			if (!tjs.lang.isArray(a)) {
				a = null;
				var b = this.oMap.remove('aSearchNames');
				if (tjs.lang.isArray(b) && b.length > 0) {
					a = this.viewFactory.getSearchFields(b);
					if (a && a.length == 0) {
						a = null;
					}
				}
			}
		}
		return a;
	},
	_onGridColumnClicked:function(source,type,o) {
		if (o.sortType > 0) {
			this.setOrderby(o.oColumn.getKey());
		} else if (o.sortType < 0) {
			this.setOrderby(o.oColumn.getKey()+' DESC');
		} else {
			this.setOrderby(null);
		}
	},
	_createSortDatas:function(sortType){
		var r, a;
		if (sortType == 2) {
			var c = this.oView.aColumns;
			if (c && c.length > 0) {
				a = [];
				for (var i = 0, isize = c.length; i < isize; i++) {
					a[i] = c[i].getKey();
				}
			}
		} else {
			a = this.oMap.remove('aSortNames');
		}
		if (tjs.lang.isArray(a) && a.length > 0) {
			r = this.viewFactory.getSortFields(a);
			if (r && r.length > 0) {
				var i = r.length, fkd = tjs.data.KeyedData, o;
				while (i--) {
					o = r[i];
					r[i] = new fkd(o.getKey(),o.toString());
				}
			} else {
				r = null;
			}
			tjs.lang.destroyArray(a);
		}
		return r;
	}
});

// Single Selection
tjs.lang.defineClass('tjs.sql.ListSController',tjs.sql.ListController,
function(o) {
	tjs.sql.ListController.call(this,o);
},tjs.sql.SelectableController,{
	_construct:function() {
		tjs.sql.ListController.prototype._construct.call(this);
		if (this.oIconList) {
			this.oIconList.setCmdDisabled('mail',true);
			this.oIconList.setCmdDisabled('pdf',true);
		}
	},
	_fViewClass:tjs.grid.SListGrid,
	_createView:function(){
		var oView = tjs.sql.ListController.prototype._createView.call(this);
		oView.addHandler(tjs.data.SELECTEDDATA_CHANGED,this.onSelectedDataChanged.bind(this));
		return oView;
	},
	onSelectedDataChanged:function(source,type,oNode){
		var data = source.getSelectedData();
		if (this.oRenderer) {
			this.oRenderer.renderData(data);
		}
		if (this.oIconList) {
			this.oIconList.setCmdDisabled('mail',!data);
			this.oIconList.setCmdDisabled('pdf',!data);
		}
	},
	_locateJsonHandler:function(data){
		if (data){
			var idx = this.oView.getSelectedIndex();
			this.oView.updateData(data,idx);
		}
	}
});

// Single Selection and Mutable
tjs.lang.defineClass('tjs.sql.ListMController',tjs.sql.ListSController,
function(o) {
	tjs.sql.ListSController.call(this,o);
},tjs.sql.MutableController,{
	_checkAll:function() {
		tjs.sql.ListSController.prototype._checkAll.call(this);
		var oView = this.oMap.get('oView');
		oView.selectOnInserted = true;
		if (!this.oMap.get('pagged')) {
			this._idxName = this.oMap.remove('idxName');
			if (this._idxName) {
				oView.dndOptions = tjs.dnd.REORDERABLE;
			}
		}
		this._insertAtLast = Boolean(this._idxName) || Boolean(this.oMap.remove('insertAtLast'));
	},
	_fViewClass:tjs.grid.SListGrid,
	_construct:function() {
		tjs.sql.ListSController.prototype._construct.call(this);
		tjs.sql.MutableController.initInstance(this);
		if (this.oIconList) {
			//this.oIconList.setCmdDisabled('add',false);
			this.oIconList.setCmdDisabled('modify',true);
			this.oIconList.setCmdDisabled('delete',true);
			this.oIconList.setCmdDisabled('clone',true);
		}
		if (this._idxName) {
			var tjs_data = tjs.data;
			this.oView.addHandler([tjs_data.AFTER_INSERT,tjs_data.AFTER_DELETE,tjs_data.AFTER_MOVE],this._reidx.bind(this));
		}
	},
	_destroy:function(){
		tjs.sql.MutableController.destroyInstance(this);
		tjs.sql.ListSController.prototype._destroy.call(this);
	},
	onSelectedDataChanged:function(source,type,oNode){
		var data = source.getSelectedData();
		if (this.oRenderer) {
			this.oRenderer.renderData(data);
		}
		if (this.oIconList) {
			this.oIconList.setCmdDisabled('modify',!data);
			this.oIconList.setCmdDisabled('delete',!data);
			this.oIconList.setCmdDisabled('clone',!data);
			this.oIconList.setCmdDisabled('mail',!data);
			this.oIconList.setCmdDisabled('pdf',!data);
		}
	},
	_insertHandler:function(data){
		if (data){
			if (this.oPageManager) {
				this.oPageManager.setTotalRows(this.oPageManager.getTotalRows() + 1);
			}
			var idx = this._insertAtLast ? null : 0;
			this.oView.insertData(data,idx);
		}
	},
	_updateHandler:function(data){
		if (data){
			var idx = this.oView.getSelectedIndex();
			this.oView.updateData(data,idx);
		}
	},
	_deleteHandler:function(result){
		if (result){
			if (this.oPageManager) {
				this.oPageManager.setTotalRows(this.oPageManager.getTotalRows() - 1);
			}
			var idx = this.oView.getSelectedIndex();
			this.oView.deleteData(idx);
		}
	},
	_cloneHandler:function(data){
		if (data){
			if (this.oPageManager) {
				this.oPageManager.setTotalRows(this.oPageManager.getTotalRows() + 1);
			}
			var idx = this._insertAtLast ? null : 0;
			this.oView.insertData(data,idx);
		}
	},
	_reidx:function(source,type){
		var oNodes = this.oView._oNodes;
		var a = [], k = 0, data;
		for (var i = 0, isize = oNodes.length; i < isize; i++) {
			data = oNodes[i].data;
			if (data[this._idxName] != i) {
				a[k++] = {pk:data.getKey(),value:i};
			}
		}
		if (a.length > 0) {
			this.oProxy.reidx(this._idxName,a);
			var tjs_lang = tjs.lang;
			i = a.length;
			while (i--) {
				tjs_lang.destroyObject(a[i]);
				a[i] = null;
			}
			a.length = 0;
		}
	},
	_reidxHandler:function(result){
		if (result) {
			var oNodes = this.oView._oNodes,oNode;
			for (var i = 0, isize = oNodes.length; i < isize; i++) {
				oNode = oNodes[i];
				if (oNode.data[this._idxName] != i) {
					oNode.data[this._idxName] = i;
					this.oView._updateNodeContent(oNode);
				}
			}
		}
	}
});

tjs.lang.defineClass('tjs.widget.ListController',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},{
	_checkAll:function(){
//tjs_debug_start
		var fController = this.oMap.get('fController');
		tjs.lang.assert(tjs.lang.isSubClassOf(fController,tjs.sql.ListController),'fController is not a tjs.sql.Controller subclass@'+this.classname);
//tjs_debug_end
	},
	_construct:function(){
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
		//
		this.oToolBarElement = document.createElement('div');
		this.oElement.appendChild(this.oToolBarElement);

		this.oViewElement = document.createElement('div');
		this.oElement.appendChild(this.oViewElement);

		var fController = this.oMap.remove('fController');
		var oController = this.oMap.remove('oController') || {};
		oController.oToolBar = this.oToolBarElement;
		oController.oView = {oElement:this.oViewElement,alternate:true};
		this.oController = new fController(oController);
		this.dataLoaded = false;
	},
	_destroy:function(){
		this.oController.destroy();
	},
	layout:function(){
		var tjs_css = tjs.css;
		var w = tjs_css.getContentBoxWidth(this.oElement);
		var h = tjs_css.getContentBoxHeight(this.oElement);

		tjs_css.setOffsetWidth(this.oToolBarElement,w);
		tjs.html.evalLayouts(this.oToolBarElement);
		h -= this.oToolBarElement.offsetHeight;

		tjs_css.setOffsetDimension(this.oViewElement,w,h);
		tjs.html.evalLayouts(this.oViewElement);

		this.loadDatas();
	},
	loadDatas:function(){
		if (!this.dataLoaded) {
			this.oController.loadDatas();
		}
	}
});

tjs.lang.defineClass('tjs.editor.ListController',tjs.widget.ListController,
function(obj) {
	tjs.widget.ListController.call(this,obj);
},tjs.editor.ListEditor,{
	_construct:function(){
		tjs.widget.ListController.prototype._construct.call(this);
		this.oController.oView.addHandler(tjs.data.VALUE_CHANGED,this._valueChangedHandler.bind(this));
		this._checkValue();
	},
	_valueChangedHandler:function(source,type) {
		this.fire(tjs.data.VALUE_CHANGED);
	},
	// overrided
	_checkValue:function() {
		this.oController.oView.addHandler(tjs.data.AFTER_RESTRUCTURE,this._checkValueHandler.bind(this));
		this.setValue(this.oMap.remove('value'));
	},
	_isEmpty:function() {
		return this.oController.oView.isEmpty();
	},
	hasValue:function(){
		return this.oController.oView.hasSelection();
	},
	getTextValue:function() {
		return this.oController.oView.getSelectedText();
	},
	getValue:function(){
		return this.oController.oView.getSelectedKey();
	},
	_setValue:function(value,fireEvent){
		this.oController.oView.setSelectedKey(value,fireEvent);
	}
});

tjs.lang.defineClass('tjs.editor.ListControllerDialog',tjs.editor.DataSetDialog,
function(o) {
	tjs.editor.DataSetDialog.call(this,o);
},{
	_checkDialog:function() {
		this.oMap.putIfUndefined('caption','ListController Dialog');
		var oDialog = tjs.widget.Dialog.checkConfig(this.oMap.remove('oDialog'),{
			contW:800,
			contH:400,
			caption:this.oMap.get('caption')
		});
		oDialog.textCmds = ['close'];
		return oDialog;
	},
	_createEditor:function(o) {
		o = new tjs.editor.ListController(o);
		var w = this.oDialog.getContentWidth();
		var h = this.oDialog.getContentHeight();
		var oStyle = o.oElement.style;
		oStyle.width = w+'px';
		oStyle.height = h+'px';
		tjs.html.evalLayouts(o.oElement);
		return o;
	}
});
