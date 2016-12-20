tjs.lang.defineClass('tjs.sql.SingleController',tjs.sql.Controller,
function(o) {
	tjs.sql.Controller.call(this,o);
},tjs.util.Trigger,{
	_checkAll:function() {
		tjs.sql.Controller.prototype._checkAll.call(this);
		this.data = null;
	},
	_construct:function() {
		tjs.util.Trigger.initInstance(this);
	},
	_destroy:function(){
		tjs.util.Trigger.destroyInstance(this);
	},
	_emptyData:function(){
		var changed = this.data != null;
		this.fire(tjs.data.BEFORE_RESTRUCTURE);
		this.data = null;
		this.fire(tjs.data.AFTER_RESTRUCTURE);
		if (changed) {
			this.onDataChanged();
		}
	},
	locate:function(pk){
		if (pk == null) {
			this._emptyData();
		} else {
			this.oProxy.locateJson(pk);
		}
	},
	_locateJsonHandler:function(data){
		if (data){
			this.fire(tjs.data.BEFORE_RESTRUCTURE);
			this.data = data;
			this.fire(tjs.data.AFTER_RESTRUCTURE);
			this.onDataChanged();
		} else {
			this._emptyData();
		}
	},
	onDataChanged:function(){
		if (this.oRenderer) {
			this.oRenderer.renderData(this.data);
		}
		this.fire(tjs.data.SELECTEDDATA_CHANGED);
	}
});

tjs.lang.defineClass('tjs.sql.SingleMController',tjs.sql.SingleController,
function(o) {
	tjs.sql.SingleController.call(this,o);
},tjs.sql.MutableController,{
	_construct:function() {
		tjs.sql.SingleController.prototype._construct.call(this);
		tjs.sql.MutableController.initInstance(this);
	},
	_destroy:function(){
		tjs.sql.MutableController.destroyInstance(this);
		tjs.sql.SingleController.prototype._destroy.call(this);
	},
	_insertHandler:function(data){
		if (data){
			this.fire(tjs.data.BEFORE_INSERT);
			this.data = data;
			this.fire(tjs.data.AFTER_INSERT);
			this.onDataChanged();
		}
	},
	_updateHandler:function(data){
		if (data){
			this.fire(tjs.data.BEFORE_REPLACE);
			this.data = data;
			this.fire(tjs.data.AFTER_REPLACE);
			this.onDataChanged();
		}
	},
	_deleteHandler:function(result){
		if (result){
			this._emptyData();
		}
	},
	_cmdHandler:function(source,type,idx){
		var key = source.getData(idx).getKey();
		switch (key){
		case 'add':
			this.addData();
			break;
		case 'modify':
			this.modifyData();
			break;
		case 'delete':
			this.deleteData();
			break;
		}
	},
	onDataChanged:function(){
		if (this.oRenderer) {
			this.oRenderer.renderData(this.data);
		}
		if (this.oIconList) {
			var noData = !this.data;
			this.oIconList.setCmdDisabled('add',!noData);
			this.oIconList.setCmdDisabled('modify',noDataa);
			this.oIconList.setCmdDisabled('delete',noData);
		}
		this.fire(tjs.data.SELECTEDDATA_CHANGED);
	}
});
