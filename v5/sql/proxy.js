tjs.lang.defineTopClass('tjs.sql.Proxy',
function(o) {
	this.oController = o;
//tjs_debug_start
	tjs.lang.assert(tjs.lang.isObject(this.oController),'!tjs.lang.isObject(this.oController) @'+this.classname);
	tjs.lang.assert(tjs.lang.isString(this.oController.url) && this.oController.url != '','!tjs.lang.isString(this.oController.url) @'+this.classname);
//tjs_debug_end
},{
	destroy:function(){
		if (this.oController) {
			tjs.lang.destroyObject(this);
		}
	},
	_checkFileEditors:function(afs) {
		if (tjs.lang.isArray(afs) && afs.length > 0) {
			var i = afs.length, oEditor;
			while (i--) {
				oEditor = afs[i];
				if (!oEditor.isFile() || !oEditor.hasValue()) {
					afs.splice(i,1);
				}
			}
			if (afs.length == 0) {
				afs = null;
			}
		} else {
			afs = null;
		}
		return afs;
	},
	insertData:function(data,afs){
		tjs.lang.assert(tjs.lang.isFunction(this.oController._insertHandler),'!tjs.lang.isFunction(this.oController._insertHandler) @'+this.classname);
		if (!this._insertHandler_) {
			this._insertHandler_ = this._insertHandler.bind(this);
		}
		afs = this._checkFileEditors(afs);
		if (afs) {
			var oForm = new tjs.editor.Form(this.oController.url);
			oForm.addParameter('cmd','insert');
			oForm.addParameter('json',JSON.stringify(data));
			var i = afs.length;
			while (i--) {
				afs[i].moveToForm(oForm);
				afs[i] = null;
			}
			afs.length = 0;
			tjs.sharedMap.put('fHandler',this._insertHandler_);
			oForm.submit();
			oForm.destroy();
		} else {
			var content = 'cmd=insert&json='+encodeURIComponent(JSON.stringify(data));
			tjs.net.httpPOST4Json(this.oController.url,content,this._insertHandler_);
		}
	},
	_insertHandler:function(response){
		if (response.message) {
			window.alert(response.message);
		}
		var data = response.result ? new this.oController.viewClass(response.data) : null;
		tjs.lang.destroyObject(response);
		this.oController._insertHandler(data);
	},
	updateData:function(pk,data,afs){
		tjs.lang.assert(tjs.lang.isFunction(this.oController._updateHandler),'!tjs.lang.isFunction(this.oController._updateHandler) @'+this.classname);
		if (!this._updateHandler_) {
			this._updateHandler_ = this._updateHandler.bind(this);
		}
		afs = this._checkFileEditors(afs);
		if (afs) {
			var oForm = new tjs.editor.Form(this.oController.url);
			oForm.addParameter('cmd','update');
			oForm.addParameter('pk',pk);
			oForm.addParameter('json',JSON.stringify(data));
			var i = afs.length;
			while (i--) {
				afs[i].moveToForm(oForm);
				afs[i] = null;
			}
			afs.length = 0;
			tjs.sharedMap.put('fHandler',this._updateHandler_);
			oForm.submit();
			oForm.destroy();
		} else {
			var b = [], k = 0;
			b[k++] = 'cmd=update';
			b[k++] = 'pk='+encodeURIComponent(pk);
			b[k++] = 'json='+encodeURIComponent(JSON.stringify(data));
			var content = b.join('&');
			tjs.lang.destroyArray(b);
			tjs.net.httpPOST4Json(this.oController.url,content,this._updateHandler_);
		}
	},
	_updateHandler:function(response){
		if (response.message) {
			window.alert(response.message);
		}
		var data = response.result ? new this.oController.viewClass(response.data) : null;
		tjs.lang.destroyObject(response);
		this.oController._updateHandler(data);
	},
	deleteData:function(pk){
		tjs.lang.assert(tjs.lang.isFunction(this.oController._deleteHandler),'!tjs.lang.isFunction(this.oController._deleteHandler) @'+this.classname);
		if (!this._deleteHandler_) {
			this._deleteHandler_ = this._deleteHandler.bind(this);
		}
		var content = 'cmd=delete&pk='+encodeURIComponent(pk);
		tjs.net.httpPOST4Json(this.oController.url,content,this._deleteHandler_);
	},
	_deleteHandler:function(response){
		if (response.message) {
			window.alert(response.message);
		}
		var result = response.result;
		tjs.lang.destroyObject(response);
		this.oController._deleteHandler(result);
	},
	cloneData:function(pk){
		tjs.lang.assert(tjs.lang.isFunction(this.oController._cloneHandler),'!tjs.lang.isFunction(this.oController._cloneHandler) @'+this.classname);
		if (!this._cloneHandler_) {
			this._cloneHandler_ = this._cloneHandler.bind(this);
		}
		var content = 'cmd=clone&pk='+encodeURIComponent(pk);
		tjs.net.httpPOST4Json(this.oController.url,content,this._cloneHandler_);
	},
	_cloneHandler:function(response){
		if (response.message) {
			window.alert(response.message);
		}
		var data = response.result ? new this.oController.viewClass(response.data) : null;
		tjs.lang.destroyObject(response);
		this.oController._cloneHandler(data);
	},
	mail:function(pk){
		tjs.lang.assert(tjs.lang.isFunction(this.oController._mailHandler),'!tjs.lang.isFunction(this.oController._mailHandler) @'+this.classname);
		if (!this._mailHandler_) {
			this._mailHandler_ = this._mailHandler.bind(this);
		}
		var content = 'cmd=mail&pk='+encodeURIComponent(pk);
		tjs.net.httpPOST4Json(this.oController.url,content,this._reidxHandler_);
	},
	_mailHandler:function(response){
		if (response.message) {
			window.alert(response.message);
		}
		var data = response.result ? new this.oController.viewClass(response.data) : null;
		tjs.lang.destroyObject(response);
		this.oController._mailHandler(data);
	},
	importData:function(data,o){
		tjs.lang.assert(tjs.lang.isFunction(this.oController._importHandler),'!tjs.lang.isFunction(this.oController._importHandler) @'+this.classname);
		tjs.lang.assert(o && (o instanceof tjs.editor.File) && o.isFile() && o.hasValue(),'!o || !(o instanceof tjs.editor.File) || !o.isFile() || !o.hasValue() @'+this.classname);
		if (!this._importHandler_) {
			this._importHandler_ = this._importHandler.bind(this);
		}
		var oForm = new tjs.editor.Form(this.oController.url);
		oForm.addParameter('cmd','import');
		if (data) {
			oForm.addParameter('json',JSON.stringify(data));
		}
		o.moveToForm(oForm);
		tjs.sharedMap.put('fHandler',this._importHandler_);
		oForm.submit();
		oForm.destroy();
	},
	_importHandler:function(response){
		if (response.message) {
			window.alert(response.message);
		}
		var count = response.result ? response.count : 0;
		tjs.lang.destroyObject(response);
		this.oController._importHandler(count);
	},
	reidx:function(idxName,a){
		tjs.lang.assert(tjs.lang.isFunction(this.oController._reidxHandler),'!tjs.lang.isFunction(this.oController._reidxHandler) @'+this.classname);
		tjs.lang.assert(tjs.lang.isArray(a) && a.length > 0,'!tjs.lang.isArray(a) || a.length == 0 @'+this.classname);
		if (!this._reidxHandler_) {
			this._reidxHandler_ = this._reidxHandler.bind(this);
		}
		var b = [], k = 0;
		b[k++] = 'cmd=reidx';
		b[k++] = 'idxName='+idxName;
		b[k++] = 'json='+encodeURIComponent(JSON.stringify(a));
		var content = b.join('&');
		tjs.lang.destroyArray(b);
		tjs.net.httpPOST4Json(this.oController.url,content,this._reidxHandler_);
	},
	_reidxHandler:function(response){
		if (response.message) {
			window.alert(response.message);
		}
		var result = response.result;
		tjs.lang.destroyObject(response);
		this.oController._reidxHandler(result);
	},
	addClickCount:function(clickCountName,pk){
		tjs.lang.assert(tjs.lang.isFunction(this.oController._addClickCountHandler),'!tjs.lang.isFunction(this.oController._addClickCountHandler) @'+this.classname);
		if (!this._addClickCountHandler_) {
			this._addClickCountHandler_ = this._addClickCountHandler.bind(this);
		}
		var content = 'cmd=addClickCount&pk='+encodeURIComponent(pk)+'&clickCountName='+encodeURIComponent(clickCountName);
		tjs.net.httpPOST4Json(this.oController.url,content,this._addClickCountHandler_);
	},
	_addClickCountHandler:function(response){
		if (response.message) {
			window.alert(response.message);
		}
		var clickCount = response.clickCount;
		tjs.lang.destroyObject(response);
		this.oController._addClickCountHandler(clickCount);
	},
	locateJson:function(pk){
		tjs.lang.assert(tjs.lang.isFunction(this.oController._locateJsonHandler),'!tjs.lang.isFunction(this.oController._locateJsonHandler) @'+this.classname);
		if (!this._locateJsonHandler_) {
			this._locateJsonHandler_ = this._locateJsonHandler.bind(this);
		}
		var content = 'cmd=locateJson&pk='+encodeURIComponent(pk);
		tjs.net.httpPOST4Json(this.oController.url,content,this._locateJsonHandler_);
	},
	_locateJsonHandler:function(response){
		if (response.message) {
			window.alert(response.message);
		}
		var data = response.data ? new this.oController.viewClass(response.data) : null;
		tjs.lang.destroyObject(response);
		this.oController._locateJsonHandler(data);
	},
	find:function(where){
		tjs.lang.assert(tjs.lang.isFunction(this.oController._findHandler),'!tjs.lang.isFunction(this.oController._findHandler) @'+this.classname);
		if (!this._findHandler_) {
			this._findHandler_ = this._findHandler.bind(this);
		}
		var a = [], k = 0;
		a[k++] = 'cmd=find';
		if (where){
			a[k++] = 'where='+encodeURIComponent(where);
		}
		var content = a.join('&');
		tjs.lang.destroyArray(a);
		tjs.net.httpPOST4Json(this.oController.url,content,this._findHandler_);
	},
	_findHandler:function(response){
		if (response.message) {
			window.alert(response.message);
		}
		var count = response.count;
		tjs.lang.destroyObject(response);
		this.oController._findHandler(count);
	},
	selectJson:function(where,orderby,offset,length,part){
		tjs.lang.assert(tjs.lang.isFunction(this.oController._selectJsonHandler),'!tjs.lang.isFunction(this.oController._selectJsonHandler) @'+this.classname);
		if (!this._selectJsonHandler_) {
			this._selectJsonHandler_ = this._selectJsonHandler.bind(this);
		}
		var a = [], k = 0;
		a[k++] = 'cmd=selectJson';
		if (where){
			a[k++] = 'where='+encodeURIComponent(where);
		}
		if (orderby){
			a[k++] = 'orderby='+encodeURIComponent(orderby);
		}
		if (offset && offset > 0){
			a[k++] = 'offset='+offset;
		}
		if (length && length > 0){
			a[k++] = 'length='+length;
		}
		if (part > 0 && part <= 1) {
			a[k++] = 'part='+encodeURIComponent(part);
		}
		var content = a.join('&');
		tjs.lang.destroyArray(a);
		tjs.net.httpPOST4Json(this.oController.url,content,this._selectJsonHandler_);
	},
	_selectJsonHandler:function(response){
		if (response.message) {
			window.alert(response.message);
		}
		var totalRows = response.totalRows;
		var datas = response.datas;
		tjs.lang.destroyObject(response);
		if (tjs.lang.isArray(datas) && datas.length > 0) {
			for (var i = 0, isize = datas.length; i < isize; i++){
				datas[i] = new this.oController.viewClass(datas[i]);
			}
		} else {
			datas = null;
		}
		this.oController._selectJsonHandler(totalRows,datas);
	},
	getChildrenCount:function(pk){
		tjs.lang.assert(tjs.lang.isFunction(this.oController._getChildrenCountHandler),'!tjs.lang.isFunction(this.oController._getChildrenCountHandler) @'+this.classname);
		if (!this._getChildrenCountHandler_) {
			this._getChildrenCountHandler_ = this._getChildrenCountHandler.bind(this);
		}
		var content = 'cmd=getChildrenCount&pk='+encodeURIComponent(pk);
		tjs.net.httpPOST4Json(this.oController.url,content,this._getChildrenCountHandler_);
	},
	_getChildrenCountHandler:function(response){
		if (response.message) {
			window.alert(response.message);
		}
		var count = response.count;
		tjs.lang.destroyObject(response);
		this.oController._getChildrenCountHandler(count);
	},
	getJsonChildren:function(pk,orderby){
		tjs.lang.assert(tjs.lang.isFunction(this.oController._getJsonChildrenHandler),'!tjs.lang.isFunction(this.oController._getJsonChildrenHandler) @'+this.classname);
		if (!this._getJsonChildrenHandler_) {
			this._getJsonChildrenHandler_ = this._getJsonChildrenHandler.bind(this);
		}
		var a = [], k = 0;
		a[k++] = 'cmd=getJsonChildren';
		a[k++] = 'pk='+encodeURIComponent(pk);
		if (orderby) {
			a[k++] = 'orderby='+encodeURIComponent(orderby);
		}
		var content = a.join('&');
		tjs.lang.destroyArray(a);
		tjs.net.httpPOST4Json(this.oController.url,content,this._getJsonChildrenHandler_);
	},
	_getJsonChildrenHandler:function(response){
		if (response.message) {
			window.alert(response.message);
		}
		var datas = response.datas;
		tjs.lang.destroyObject(response);
		if (tjs.lang.isArray(datas) && datas.length > 0) {
			var oNode, data;
			for (var i = 0, isize = datas.length; i < isize; i++){
				data = datas[i];
				oNode = new tjs.data.TreeNode();
				oNode.childrenCount = data.childrenCount || 0;
				oNode.data = new this.oController.viewClass(data);
				datas[i] = oNode;
			}
		} else {
			datas = null;
		}
		this.oController._getJsonChildrenHandler(datas);
	},
	selectRootJson:function(where,orderby){
		tjs.lang.assert(tjs.lang.isFunction(this.oController._selectRootJsonHandler),'!tjs.lang.isFunction(this.oController._selectRootJsonHandler) @'+this.classname);
		if (!this._selectRootJsonHandler_) {
			this._selectRootJsonHandler_ = this._selectRootJsonHandler.bind(this);
		}
		var a = [], k = 0;
		a[k++] = 'cmd=selectRootJson';
		if (where) {
			a[k++] = 'where='+encodeURIComponent(where);
		}
		if (orderby) {
			a[k++] = 'orderby='+encodeURIComponent(orderby);
		}
		var content = a.join('&');
		tjs.lang.destroyArray(a);
		tjs.net.httpPOST4Json(this.oController.url,content,this._selectRootJsonHandler_);
	},
	_selectRootJsonHandler:function(response){
		if (response.message) {
			window.alert(response.message);
		}
		var root;
		var datas = response.datas;
		tjs.lang.destroyObject(response);
		if (tjs.lang.isArray(datas)) {
			var isize = datas.length, i, data, oNode;
			if (isize > 1) {
				root = new tjs.data.TreeNode();
				for (i = 0, isize = datas.length; i < isize; i++){
					data = datas[i];
					oNode = new tjs.data.TreeNode();
					oNode.childrenCount = data.childrenCount || 0;
					oNode.data = new this.oController.viewClass(data);
					oNode.parent = root;
					datas[i] = oNode;
				}
				root.children = datas;
			} else if (isize == 1) {
				data = datas[0];
				oNode = new tjs.data.TreeNode();
				oNode.childrenCount = data.childrenCount || 0;
				oNode.data = new this.oController.viewClass(data);
				datas[0] = null;
				datas.length = 0;
				root = oNode;
			}
		}
		this.oController._selectRootJsonHandler(root);
	},
	selectJsonTree:function(where,orderby){
		tjs.lang.assert(tjs.lang.isFunction(this.oController._selectJsonTreeHandler),'!tjs.lang.isFunction(this.oController._selectJsonTreeHandler) @'+this.classname);
		if (!this._selectJsonTreeHandler_) {
			this._selectJsonTreeHandler_ = this._selectJsonTreeHandler.bind(this);
		}
		var a = [], k = 0;
		a[k++] = 'cmd=selectJsonTree';
		if (where) {
			a[k++] = 'where='+encodeURIComponent(where);
		}
		if (orderby) {
			a[k++] = 'orderby='+encodeURIComponent(orderby);
		}
		var content = a.join('&');
		tjs.lang.destroyArray(a);
		tjs.net.httpPOST4Json(this.oController.url,content,this._selectJsonTreeHandler_);
	},
	_selectJsonTreeHandler:function(response){
		if (response.message) {
			window.alert(response.message);
		}
		var root;
		var datas = response.datas;
		tjs.lang.destroyObject(response);
		if (tjs.lang.isArray(datas)) {
			var isize = datas.length;
			if (isize > 1) {
				root = tjs.data.TreeNode.createNode({data:null,children:datas},this.oController.viewClass);
			} else if (isize == 1) {
				root = tjs.data.TreeNode.createNode(datas[0],this.oController.viewClass);
				datas[0] = null;
				datas.length = 0;
			}
		}
		this.oController._selectJsonTreeHandler(root);
	},
	locateJsonTree:function(pk,orderby){
		tjs.lang.assert(tjs.lang.isFunction(this.oController._locateJsonTreeHandler),'!tjs.lang.isFunction(this.oController._locateJsonTreeHandler) @'+this.classname);
		if (!this._locateJsonTreeHandler_) {
			this._locateJsonTreeHandler_ = this._locateJsonTreeHandler.bind(this);
		}
		var a = [], k = 0;
		a[k++] = 'cmd=locateJsonTree';
		a[k++] = 'pk='+encodeURIComponent(pk);
		if (orderby) {
			a[k++] = 'orderby='+encodeURIComponent(orderby);
		}
		var content = a.join('&');
		tjs.lang.destroyArray(a);
		tjs.net.httpPOST4Json(this.oController.url,content,this._locateJsonTreeHandler_);
	},
	_locateJsonTreeHandler:function(response){
		if (response.message) {
			window.alert(response.message);
		}
		var root = tjs.lang.isObject(response.datas) ? tjs.data.TreeNode.createNode(response.datas,this.oController.viewClass) : null;
		tjs.lang.destroyObject(response);
		this.oController._locateJsonTreeHandler(root);
	},
	updateParent:function(pk,pkParent){
		tjs.lang.assert(tjs.lang.isFunction(this.oController._updateParentHandler),'!tjs.lang.isFunction(this.oController._updateParentHandler) @'+this.classname);
		if (!this._updateParentHandler_) {
			this._updateParentHandler_ = this._updateParentHandler.bind(this);
		}
		var a = [], k = 0;
		a[k++] = 'cmd=updateParent';
		a[k++] = 'pk='+encodeURIComponent(pk);
		a[k++] = 'pkParent='+encodeURIComponent(pkParent);
		var content = a.join('&');
		tjs.lang.destroyArray(a);
		tjs.net.httpPOST4Json(this.oController.url,content,this._updateParentHandler_);
	},
	_updateParentHandler:function(response){
		if (response.message) {
			window.alert(response.message);
		}
		var result = response.result;
		tjs.lang.destroyObject(response);
		this.oController._updateParentHandler(root);
	}
});
