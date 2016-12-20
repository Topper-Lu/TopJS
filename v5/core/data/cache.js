tjs.lang.defineClass('tjs.data.Cache',tjs.util.Trigger,
function(url,fClass) {
//tjs_debug_start
	tjs.lang.assert(url && tjs.lang.isString(url),'!tjs.lang.isString(url) @'+this.classname);
	tjs.lang.assert(fClass == null || tjs.lang.isFunction(fClass),'!tjs.lang.isFunction(fClass) @'+this.classname);
//tjs_debug_end
	tjs.util.Trigger.initInstance(this);
	this.url = url;
	this.fClass = fClass || Object;
	this.loading = true;
	tjs.data.Cache._oLoadingCaches[this.url] = true;
},{
	destroy:function() {
		this._destroyDatas();
		tjs.util.Trigger.destroyInstance(this);
		tjs.lang.destroyObject(this);
	},
	isLoading:function(){
		return this.loading;
	},
	_loadDatas:function(){
		tjs.net.httpGET4Json(this.url,this._loadDatasHandler.bind(this));
	},
	_loadDatasHandler:function(response){
		if (response.datas) {
			this._createDatas(response.datas);
		}
		if (response.message) {
			alert(response.message);
		}
		tjs.lang.destroyObject(response);
		this.loading = false;
		delete tjs.data.Cache._oLoadingCaches[this.url];
		this.fire(tjs.data.CACHE_LOADED);
		this.removeAllHandlers(tjs.data.CACHE_LOADED);
	},
	cloneDatas:function(){return null;},
	_createDatas:function(datas){},
	_destroyDatas:function(){}
});
tjs.lang.extend(tjs.data.Cache,{
	_oLoadingCaches:{},
	isLoading:function(){
		var o = this._oLoadingCaches;
		for (var x in o) {
			if (o.hasOwnProperty(x)) {
				return true;
			}
		}
		return false;
	}
});

tjs.lang.defineClass('tjs.data.ListCache',tjs.data.Cache,
function(url,fClass) {
	tjs.data.Cache.call(this,url,fClass);
},{
	cloneDatas:function(){
		return this.datas ? this.datas.concat() : null;
	},
	_createDatas:function(datas){
		if (tjs.lang.isArray(datas) && datas.length > 0) {
			for (var i = 0, isize = datas.length; i < isize; i++){
				datas[i] = new this.fClass(datas[i]);
			}
			this.datas = datas;
		}
	},
	_destroyDatas:function(){
		if (this.datas) {
			tjs.lang.destroyArray(this.datas);
		}
	}
});
tjs.lang.extend(tjs.data.ListCache,{
	oCaches:new tjs.util.Map(),
	get:function(url,fClass) {
		var oCache = this.oCaches.get(url);
		if (!oCache) {
			oCache = new tjs.data.ListCache(url,fClass);
			this.oCaches.put(url,oCache);
			oCache._loadDatas();
		}
		return oCache;
	},
	destroy:function(){
		if (this.oCaches.items) {
			this.oCaches.forEach(tjs.util.destructor);
			this.oCaches.destroy();
		}
	}
});

tjs.lang.defineClass('tjs.data.TreeCache',tjs.data.Cache,
function(url,fClass) {
	tjs.data.Cache.call(this,url,fClass);
},{
	cloneDatas:function(){
		return this.root ? this.root.clone() : null;
	},
	_createDatas:function(datas){
		if (tjs.lang.isArray(datas)) {
			var isize = datas.length;
			if (isize > 1) {
				this.root = tjs.data.TreeNode.createNode({data:null,children:datas},this.fClass);
			} else if (isize == 1) {
				this.root = tjs.data.TreeNode.createNode(datas[0],this.fClass);
				datas[0] = null;
				datas.length = 0;
			} else {
				this.root = null;
			}
		} else if (tjs.lang.isObject(datas)) {
			this.root = tjs.data.TreeNode.createNode(datas,this.fClass);
		}
	},
	_destroyDatas:function(){
		if (this.root) {
			tjs.data.TreeNode.destroyNode(this.root);
		}
	}
});
tjs.lang.extend(tjs.data.TreeCache,{
	oCaches:new tjs.util.Map(),
	get:function(url,fClass) {
		var oCache = this.oCaches.get(url);
		if (!oCache) {
			oCache = new tjs.data.TreeCache(url,fClass);
			this.oCaches.put(url,oCache);
			oCache._loadDatas();
		}
		return oCache;
	},
	destroy:function(){
		if (this.oCaches.items) {
			this.oCaches.forEach(tjs.util.destructor);
			this.oCaches.destroy();
		}
	}
});
