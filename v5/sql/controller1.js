tjs.lang.defineTopClass('tjs.sql.Controller',
function(o) {
	this.oMap = tjs.util.toMap(o);
	this.doConfig();
	this.construct();
},{
	destroy:function(){
		if (this.oMap) {
			this.oProxy.destroy();
			this._destroy();
			this.oMap.destroy();
			tjs.lang.destroyObject(this);
		}
	},
	construct:function() {
		this._checkAll();
		this.oProxy = new tjs.sql.Proxy(this);
		this._createToolBar();
		this._createRenderer();
		this._construct();
	},
	_checkAll:function(){
		this.url = this.oMap.remove('url');
		this.viewClass = this.oMap.remove('viewClass');
		this.viewFactory = this.oMap.remove('viewFactory');
		if (!this.viewFactory) {
			this.viewFactory = this.viewClass.oFactory;
		}
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(this.url) && this.url != '','!tjs.lang.isString(this.url) @'+this.classname);
		tjs.lang.assert(tjs.lang.isFunction(this.viewClass),'!tjs.lang.isFunction(this.viewClass) @'+this.classname);
		tjs.lang.assert(this.viewFactory instanceof tjs.sql.Factory,'!(this.viewFactory instanceof tjs.sql.Factory) @'+this.classname);
//tjs_debug_end
		this.dataClass = this.oMap.remove('dataClass');
		this.dataFactory = this.oMap.remove('dataFactory');
		if (!this.dataFactory && this.dataClass) {
			this.dataFactory = this.dataClass.oFactory;
		}
	},
	_createToolBar:function(){
		var oToolBar = this.oMap.remove('oToolBar');
		if (tjs.dom.isElement(oToolBar)) {
			this.oToolBar = new tjs.widget.FlowLayout({oElement:oToolBar});
			tjs.dom.addClass(this.oToolBar.oElement,'tjs_toolbar');

			this.oToolBar.addContainer({cls:'tjs_toolbar_container'});
			var o = {oElement:this.oToolBar.getLastContainer(),hv:'h'};
			var datas = tjs.data.convertCmds(this.oMap.remove('cmds'));
			if (datas) {
				o.datas = datas;
			}
			this.oIconList = new tjs.widget.IconList(o);
			this.oIconList.addHandler(tjs.data.DATA_CLICKED,this._cmdHandler.bind(this));
		}
	},
	_createRenderer:function(){
		var o = this.oMap.remove('oRenderer');
		var a = this.oMap.remove('aRenderNames');
		if (tjs.lang.isArray(a) && a.length > 0) {
			if (tjs.dom.isElement(o)) {
				var b = this.viewFactory.getRenderFields(a);
				if (b && b.length > 0) {
					this.oRenderer = this.createRenderer({aFields:b,oElement:o});
				}
			}
			tjs.lang.destroyArray(a);
		}
	},
	// to be overrided
	_construct:function(){},
	_destroy:function(){},
	_cmdHandler:function(source,type,oNode){},
	createRenderer:function(obj){return null;},
	doConfig:function(){}
});

tjs.lang.defineClass('tjs.sql.AbstractLTController',tjs.sql.Controller,
function(o) {
	tjs.sql.Controller.call(this,o);
},{
	_checkAll:function() {
		tjs.sql.Controller.prototype._checkAll.call(this);
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isObject(this.oMap.get('oView')),'!tjs.lang.isObject(oView) @'+this.classname);
//tjs_debug_end
		this.onCondition = this.oMap.remove('onCondition') || null;
		this.defaultWhere = this.oMap.remove('defaultWhere') || null;
		this.defaultOrderby = this.oMap.remove('defaultOrderby') || null;
		this.part = this.oMap.remove('part') || 0;
		this.where = null;
		this.orderby = null;
	},
	_destroy:function(){
		if (this.oImporter){
			this.oImporter.destroy();
		}
	},
	_construct:function() {
		this.oView = this._createView();
	},
	_getWhere:function(){
		var where = this.where ? this.where : this.defaultWhere;
		if (this.onCondition && where) {
			return this.onCondition + ' AND ' + where;
		} else if (this.onCondition) {
			return this.onCondition;
		} else if (where) {
			return where;
		} else {
			return null;
		}
	},
	setWhere:function(where){
		var changed = this.where != where;
		if (changed) {
			this.where = where;
			this._conditionChanged();
		}
		return changed;
	},
	_getOrderby:function(){
		return this.orderby ? this.orderby : this.defaultOrderby;
	},
	setOrderby:function(orderby){
		var changed = this.orderby != orderby;
		if (changed) {
			this.orderby = orderby;
			this._conditionChanged();
		}
		return changed;
	},
	_getPart:function() {
		return this.part;
	},
	_conditionChanged:function(){
		this.loadDatas();
	},
	_cmdHandler:function(source,type,oNode){
		var key = oNode.data.getKey();
		switch (key){
		case 'refresh':
			this.loadDatas();
			break;
		case 'search':
			this.search();
			break;
		case 'sort':
			this.sort();
			break;
		case 'add':
			this.addData();
			break;
		case 'modify':
			this.modifyData();
			break;
		case 'delete':
			this.deleteData();
			break;
		case 'clone':
			this.cloneData();
			break;
		case 'excel':
			this.excel();
			break;
		case 'import':
			this.importData();
			break;
		case 'mail':
			this.mail();
			break;
		case 'pdf':
			this.pdf();
			break;
		}
	},
	excel:function(){
		var where = this._getWhere();
		var orderby = this._getOrderby();
		var part = this._getPart();
		var b = [], k = 0;
		b[k++] = 'cmd=excel';
		if (where){
			b[k++] = 'where='+encodeURIComponent(where);
		}
		if (orderby){
			b[k++] = 'orderby='+encodeURIComponent(orderby);
		}
		if (part > 0 && part <= 1){
			b[k++] = 'part='+encodeURIComponent(part);
		}
		var url = this.url+'?'+b.join('&');
		tjs.lang.destroyArray(b);
		window.location.href = url;
	},
	importData:function(){
		if (!this.oImporter) {
			this.oImporter = new tjs.sql.Importer(this);
		}
		this.oImporter.doImport();
	},
	onImportCompleted:function(completed,oEditor){
		if (completed) {
			this.oProxy.importData(null,oEditor);
		}
	},
	_importHandler:function(count){
		if (count > 0){
			this.loadDatas();
		}
	},
	// to be overrided
	search:function(){},
	sort:function(){},
	loadDatas:function(){},
	addData:function(){},
	modifyData:function(){},
	deleteData:function(){},
	cloneData:function(){},
	mail:function(){},
	pdf:function(){},
	_createView:function(){return null;}
});

tjs.lang.defineTopClass('tjs.sql.SelectableController',
function() {
},{
	mail:function(){
		var pk = this.oView.getSelectedKey();
		if (pk) {
			var result = window.confirm(tjs.config.oResource.get('mail_data')+'?');
			if (result){
				this.oProxy.mail(pk);
			}
		}
	},
	_mailHandler:function(data){
		if (data){
			var idx = this.oView.getSelectedIndex();
			this.oView.updateData(data,idx);
		}
	},
	pdf:function(){
		window.location.href = this.url+'?cmd=pdf&pk='+this.oView.getSelectedKey();
	},
	unselectAll:function(fireEvent) {
		return this.oView.unselectAll(fireEvent);
	},
	getSelectedData:function(){
		return this.oView.getSelectedData();
	},
	getSelectedKey:function(){
		return this.oView.getSelectedKey();
	},
	refreshSelectedData:function(){
		var data = this.oView.getSelectedData();
		if (data) {
			this.oProxy.locateJson(data.getKey());
		}
	}
});

tjs.lang.defineTopClass('tjs.sql.MutableController',
function() {
},{
	_createForms:function(){
		if (!this.oIconList) {
			return;
		}
		var aInsertFields, aUpdateFields;
		if (this.oIconList.hasCmd('add')) {
			var aInsertEditNames = this.oMap.remove('aInsertEditNames');
			if (tjs.lang.isArray(aInsertEditNames) && aInsertEditNames.length > 0) {
				aInsertFields = this.dataFactory.getEditFields(aInsertEditNames);
				if (aInsertFields && aInsertFields.length > 0) {
					var aInsertNotNullNames = this.oMap.remove('aInsertNotNullNames'), aInsertNotNullFields;
					if (tjs.lang.isArray(aInsertNotNullNames) && aInsertNotNullNames.length > 0) {
						aInsertNotNullFields = this.dataFactory.getEditFields(aInsertNotNullNames);
					}
					this.oFormInsert = this.createForm({
						oController:this,
						aFields:aInsertFields,
						aNotNullFields:aInsertNotNullFields,
						caption:this.oMap.get('caption')
					},tjs.sql.editPhase.INSERT);
				}
			}
		}
		if (this.oIconList.hasCmd('modify')) {
			var aUpdateEditNames = this.oMap.remove('aUpdateEditNames');
			if (tjs.lang.isArray(aUpdateEditNames) && aUpdateEditNames.length > 0) {
				aUpdateFields = this.dataFactory.getEditFields(aUpdateEditNames);
				if (aUpdateFields && aUpdateFields.length > 0) {
					var b = this.oFormInsert && aInsertFields && aInsertFields.length == aUpdateFields.length;
					if (b) {
						var i = aInsertFields.length;
						while (i--) {
							if (aInsertFields[i] != aUpdateFields[i]) {
								b = false;
								break;
							}
						}
					}
					if (b) {
						this.oFormUpdate = this.oFormInsert;
					} else {
						var aUpdateNotNullNames = this.oMap.remove('aUpdateNotNullNames'),aUpdateNotNullFields;
						if (tjs.lang.isArray(aUpdateNotNullNames) && aUpdateNotNullNames.length > 0) {
							aUpdateNotNullFields = this.dataFactory.getEditFields(aUpdateNotNullNames);
						}
						this.oFormUpdate = this.createForm({
							oController:this,
							aFields:aUpdateFields,
							aNotNullFields:aUpdateNotNullFields,
							caption:this.oMap.get('caption')
						},tjs.sql.editPhase.UPDATE);
					}
				}
			}
		}
	},
	createData:function(){
		var data = new this.dataClass();
		return data;
	},
	addData:function(){
		var data = this.createData();
		if (this.oFormInsert) {
			this.oFormInsert.editData(data,tjs.sql.editPhase.INSERT);
		} else {
			this.oProxy.insertData(data);
		}
	},
	modifyData:function(){
		var data = this.oView.getSelectedData();
		if (data) {
			if (this.oFormUpdate) {
				this.oFormUpdate.editData(new this.dataClass(data),tjs.sql.editPhase.UPDATE);
			} else {
				if (this.dataClass != this.viewClass) {
					data = new this.dataClass(data);
				}
				this.oProxy.updateData(data.getKey(),data);
			}
		}
	},
	validateForm:function(oForm,phase){
		// called by oForm
		var result = false;
		switch (phase) {
			case tjs.sql.editPhase.INSERT:
				result = this.validateInsertForm(oForm);
				break;
			case tjs.sql.editPhase.UPDATE:
				result = this.validateUpdateForm(oForm);
				break;
		}
		return result;
	},
	validateData:function(data,phase){
		// called by oForm
		var result = false;
		switch (phase) {
			case tjs.sql.editPhase.INSERT:
				result = this.validateInsertData(data);
				break;
			case tjs.sql.editPhase.UPDATE:
				result = this.validateUpdateData(data);
				break;
		}
		return result;
	},
	onEditCompleted:function(phase,data,fileEditors){
		// called by oForm
		switch (phase) {
			case tjs.sql.editPhase.INSERT:
				this.oProxy.insertData(data,fileEditors);
				break;
			case tjs.sql.editPhase.UPDATE:
				this.oProxy.updateData(this.oView.getSelectedKey(),data,fileEditors);
				break;
		}
	},
	deleteData:function(){
		var pk = this.oView.getSelectedKey();
		if (pk) {
			var result = window.confirm(tjs.config.oResource.get('delete_data')+'?');
			if (result){
				this.oProxy.deleteData(pk);
			}
		}
	},
	cloneData:function(){
		var pk = this.oView.getSelectedKey();
		if (pk) {
			var result = window.confirm(tjs.config.oResource.get('clone_data')+'?');
			if (result){
				this.oProxy.cloneData(pk);
			}
		}
	},
	updateSelectedData:function(){
		var data = this.oView.getSelectedData();
		if (data) {
			if (this.dataClass != this.viewClass) {
				data = new this.dataClass(data);
			}
			this.oProxy.updateData(data.getKey(),data);
		}
	},
	onImportCompleted:function(completed,oEditor){
		if (completed) {
			this.oProxy.importData(this.createData(),oEditor);
		}
	},
	// to be overrided
	validateInsertForm:function(oForm){return true;},
	validateInsertData:function(data){return true;},
	validateUpdateForm:function(oForm){return true;},
	validateUpdateData:function(data){return true;},
	createForm:function(o,phase){return null;}
});
tjs.lang.extend(tjs.sql.MutableController,{
	initInstance:function(obj){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isFunction(obj.dataClass),'!tjs.lang.isFunction(obj.dataClass) @'+obj.classname);
		tjs.lang.assert(obj.dataFactory instanceof tjs.sql.Factory,'!(obj.dataFactory instanceof tjs.sql.Factory) @'+obj.classname);
//tjs_debug_end
		obj._createForms();
	},
	destroyInstance:function(obj){
		if (obj.oFormInsert){
			obj.oFormInsert.destroy();
		}
		if (obj.oFormUpdate){
			obj.oFormUpdate.destroy();
		}
	}
});
