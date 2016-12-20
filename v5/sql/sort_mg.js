tjs.lang.defineTopClass('tjs.sql.SortManager',
function(o) {
	this.oMap = tjs.util.toMap(o);
	this._construct();
},{
	destroy:function(){
		if (this.oMap) {
			if (this.oSorterDialog) {
				this.oSorterDialog.finalize();
			}
			this.oMap.destroy();
			tjs.lang.destroyObject(this);
		}
	},
	_construct:function(){
		this.oController = this.oMap.remove('oController');
		var datas = this.oMap.remove('datas');
		if (tjs.lang.isArray(datas)) {
			if (this.oMap.remove('noDelay')) {
				this._createSorter(datas);
			} else {
				this.oMap.put('datas', datas);
			}
		}
	},
	_createSorter:function(datas){
		this.oSorterDialog = new tjs.widget.Dialog({
			caption:tjs.config.oResource.get('sort'),
			textCmds:['confirm','clear'],
			resizable:{minW:400,minH:200},
			contW:600,
			contH:300
		});
		this.oSorterDialog.addHandler('confirm',this._confirmHandler.bind(this));
		this.oSorterDialog.addHandler('clear',this._clearHandler.bind(this));
		this.oSorter = new tjs.sql.sort.Editor({
			oElement:this.oSorterDialog.getContent(),
			datas:datas
		});
		tjs.html.evalLayouts(this.oSorterDialog.getContent());
	},
	_confirmHandler:function(source,type){
		this.oController.setOrderby(this.oSorter.getConditions());//
		this.oSorterDialog.hide();
	},
	_clearHandler:function(source,type){
		this.oSorter.setValue(null);
		this.oController.setOrderby(null);//
		this.oSorterDialog.hide();
	},
	sort:function(oIcon){
		if (this.oMap.get('datas') && !this.oSorter && !this.oSorterDialog) {
			this._createSorter(this.oMap.remove('datas'));
		}
		this.oSorterDialog.show(oIcon);
	},
	setSortValue:function(v){
		if (this.oSorter) {
			this.oSorter.setValue(v);
			this.oController.setOrderby(this.oSorter.getConditions());//
		}
	},
	hasSortValue:function(){
		if (this.oSorter) {
			return this.oSorter.hasValue();
		} else {
			return false;
		}
	},
	getSortValue:function(){
		if (this.oSorter) {
			return this.oSorter.getValue();
		} else {
			return null;
		}
	}
});
