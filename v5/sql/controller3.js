tjs.lang.defineClass('tjs.sql.TreeController',tjs.sql.AbstractLTController,
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
	},
	_fViewClass:tjs.widget.IconTextTree,
	_createView:function(){
		var oMap = tjs.util.toMap(this.oMap.remove('oView'));
		var fClass = oMap.remove('fClass');
		if (!tjs.lang.isFunction(fClass)) {
			fClass = this._fViewClass;//
		}
		var oView = new fClass(oMap);
		return oView;
	},
	_onDataClicked:function(source,type,oNode){
		this.oProxy.addClickCount(this._clickCountName,oNode.data.getKey());
	},
	_addClickCountHandler:function(count){
		var oNode = this.oView.currClickedNode;
		oNode.data[this._clickCountName] = count;
		this.oView.updateData(oNode.data,oNode.path);
	},
	loadDatas:function(){
		//this.oProxy.locateJsonTree(this._pkRoot,this._getOrderby());
		this.oProxy.selectJsonTree(this._getWhere(),this._getOrderby());
	},
	_emptyDatas:function(){
		this._locateJsonTreeHandler(null);
	},
	_locateJsonTreeHandler:function(root){
		this.oView.setRoot(root);
	},
	_selectJsonTreeHandler:function(root){
		this.oView.setRoot(root);
	}
});

tjs.lang.defineClass('tjs.sql.TreeSController',tjs.sql.TreeController,
function(o) {
	tjs.sql.TreeController.call(this,o);
},tjs.sql.SelectableController,{
	_construct:function() {
		tjs.sql.TreeController.prototype._construct.call(this);
		if (this.oIconList) {
			this.oIconList.setCmdDisabled('mail',true);
			this.oIconList.setCmdDisabled('pdf',true);
		}
	},
	_fViewClass:tjs.widget.RadioTree,
	_createView:function(){
		var oView = tjs.sql.TreeController.prototype._createView.call(this);
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
	}
});

tjs.lang.defineClass('tjs.sql.TreeMController',tjs.sql.TreeSController,
function(o) {
	tjs.sql.TreeSController.call(this,o);
},tjs.sql.MutableController,{
	_checkAll:function() {
		tjs.sql.TreeSController.prototype._checkAll.call(this);
		this._idxName = this.oMap.remove('idxName');
		if (this._idxName) {
			this.oMap.get('oView').dndOptions = tjs.dnd.REORDERABLE;
		}
	},
	_fViewClass:tjs.widget.RadioTree,
	_construct:function() {
		tjs.sql.TreeSController.prototype._construct.call(this);
		tjs.sql.MutableController.initInstance(this);
		if (this.oIconList) {
			this.oIconList.setCmdDisabled('add',true);
			this.oIconList.setCmdDisabled('modify',true);
			this.oIconList.setCmdDisabled('delete',true);
			//this.oIconList.setCmdDisabled('clone',true);
			this.oIconList.setCmdDisabled('mail',true);
			this.oIconList.setCmdDisabled('pdf',true);
		}
		if (this._idxName) {
			var tjs_data = tjs.data;
			this.oView.addHandler([tjs_data.AFTER_INSERT,tjs_data.AFTER_DELETE],this._reidx.bind(this));
			this.oView.addHandler(tjs_data.AFTER_MOVE,this._moveData.bind(this));
		}
	},
	_destroy:function(){
		tjs.sql.MutableController.destroyInstance(this);
		tjs.sql.AbstractLTController.prototype._destroy.call(this);
	},
	onSelectedDataChanged:function(source,type,oNode){
		if (this.oRenderer) {
			this.oRenderer.renderData(source.getSelectedData());
		}
		if (this.oIconList) {
			this.oIconList.setCmdDisabled('add',!oNode);
			this.oIconList.setCmdDisabled('modify',!oNode || oNode.isRoot());
			this.oIconList.setCmdDisabled('delete',!oNode || oNode.isRoot() || !oNode.isLeaf());
			//this.oIconList.setCmdDisabled('clone',!oNode);
			this.oIconList.setCmdDisabled('mail',!oNode);
			this.oIconList.setCmdDisabled('pdf',!oNode);
		}
	},
	createData:function(data){
		data = new this.dataClass(data);
		this._setParentData(data,this.oView.getSelectedData());
		return data;
	},
	_setParentData:function(data,parentData){
		// to be overrided
	},
	_insertHandler:function(data){
		if (data){
			var oNode = this.oView.getSelectedNode();
			var path = oNode.getPath().concat(oNode.getChildCount());
			this.oView.insertData(data,path);
			tjs.lang.destroyArray(path);
		}
	},
	_updateHandler:function(data){
		if (data){
			var path = this.oView.getSelectedPath().concat();
			this.oView.updateData(data,path);
			tjs.lang.destroyArray(path);
		}
	},
	_deleteHandler:function(result){
		if (result){
			var path = this.oView.getSelectedPath().concat();
			this.oView.deleteData(path);
			tjs.lang.destroyArray(path);
		}
	},
	_moveData:function(source,type,o){
		//o = {path1:path1,path2:path2,count:count}
		var idx1 = o.path1.pop();
		var oParent1 = this.oView.getNode(o.path1);
		o.path1[o.path1.length] = idx1;
		var idx2 = o.path2.pop();
		var oParent2 = this.oView.getNode(o.path2);
		o.path2[o.path2.length] = idx2;

		var a = [], k = 0, i, isize, oNodes, data;
		this._reidxNodes = [];
		if (oParent1 == oParent2) {
			oNodes = oParent1.children;
			for (i = 0, isize = oNodes.length; i < isize; i++) {
				data = oNodes[i].data;
				if (data[this._idxName] != i) {
					a[k++] = {pk:data.getKey(),value:i};
				}
			}
			this._reidxNodes.push(oParent1);
		} else {
			var oNode = this.oView.getNode(o.path2);//
			this.oProxy.updateParent(oNode.data.getKey(),oParent2.data.getKey());

			var b;
			if (!oParent1.isLeaf()) {
				b = false;
				oNodes = oParent1.children;
				for (i = 0, isize = oNodes.length; i < isize; i++) {
					data = oNodes[i].data;
					if (data[this._idxName] != i) {
						a[k++] = {pk:data.getKey(),value:i};
						b = true;
					}
				}
				if (b) {
					this._reidxNodes.push(oParent1);
				}
			}
			if (!oParent2.isLeaf()) {
				b = false;
				oNodes = oParent2.children;
				for (i = 0, isize = oNodes.length; i < isize; i++) {
					data = oNodes[i].data;
					if (data[this._idxName] != i) {
						a[k++] = {pk:data.getKey(),value:i};
						b = true;
					}
				}
				if (b) {
					this._reidxNodes.push(oParent2);
				}
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
	_updateParentHandler:function(result){
	},
	_reidx:function(source,type,o){
		var idx = o.path.pop();
		var oParent = this.oView.getNode(o.path);
		o.path[o.path.length] = idx;
		if (!oParent.isLeaf()) {
			var a = [], k = 0, data;
			var oNodes = oParent.children;
			for (var i = 0, isize = oNodes.length; i < isize; i++) {
				data = oNodes[i].data;
				if (data[this._idxName] != i) {
					a[k++] = {pk:data.getKey(),value:i};
				}
			}
			if (a.length > 0) {
				this._reidxNodes = [oParent];
				this.oProxy.reidx(this._idxName,a);
				var tjs_lang = tjs.lang;
				i = a.length;
				while (i--) {
					tjs_lang.destroyObject(a[i]);
					a[i] = null;
				}
				a.length = 0;
			}
		}
	},
	_reidxHandler:function(result){
		if (result) {
			var j = this._reidxNodes.length, oParent, oNodes, oNode, i, isize;
			while (j--) {
				oParent = this._reidxNodes[j];
				oNodes = oParent.children;
				for (i = 0, isize = oNodes.length; i < isize; i++) {
					oNode = oNodes[i];
					if (oNode.data[this._idxName] != i) {
						oNode.data[this._idxName] = i;
						this.oView._updateNodeContent(oNode);
					}
				}
			}
			this._reidxNodes.length = 0;
			delete this._reidxNodes;
		}
	}
});

tjs.lang.defineClass('tjs.widget.TreeController',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},{
	_checkAll:function(){
//tjs_debug_start
		var fController = this.oMap.get('fController');
		tjs.lang.assert(tjs.lang.isSubClassOf(fController,tjs.sql.TreeController),'fController is not a tjs.sql.Controller subclass@'+this.classname);
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
		tjs.dom.addClass(this.oViewElement,'overflow_auto padding_2');
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

tjs.lang.defineClass('tjs.editor.TreeController',tjs.widget.TreeController,
function(obj) {
	tjs.widget.TreeController.call(this,obj);
},tjs.editor.TreeEditor,{
	_construct:function(){
		tjs.widget.TreeController.prototype._construct.call(this);
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

tjs.lang.defineClass('tjs.editor.TreeControllerDialog',tjs.editor.DataSetDialog,
function(o) {
	tjs.editor.DataSetDialog.call(this,o);
},{
	_checkDialog:function() {
		this.oMap.putIfUndefined('caption','TreeController Dialog');
		var oDialog = tjs.widget.Dialog.checkConfig(this.oMap.remove('oDialog'),{
			contW:600,
			contH:400,
			caption:this.oMap.get('caption')
		});
		oDialog.textCmds = ['close'];
		return oDialog;
	},
	_createEditor:function(o) {
		o = new tjs.editor.TreeController(o);
		var w = this.oDialog.getContentWidth();
		var h = this.oDialog.getContentHeight();
		var oStyle = o.oElement.style;
		oStyle.width = w+'px';
		oStyle.height = h+'px';
		tjs.html.evalLayouts(o.oElement);
		return o;
	}
});
