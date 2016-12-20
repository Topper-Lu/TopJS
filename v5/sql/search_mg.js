tjs.lang.defineTopClass('tjs.sql.SearchManager',
function(o) {
	this.oMap = tjs.util.toMap(o);
	this._construct();
},{
	destroy:function(){
		if (this.oMap) {
			if (this.oSearcherDialog) {
				this.oSearcherDialog.finalize();
			}
			this.oMap.destroy();
			tjs.lang.destroyObject(this);
		}
	},
	_construct:function(){
		this.oController = this.oMap.remove('oController');//
		this.oEncoder = this.oMap.remove('oEncoder');//
		var oSearcher = this.oMap.remove('oSearcher');//
		if (tjs.lang.isObject(oSearcher)) {
			if (tjs.lang.isArray(oSearcher.aFields)) {
				if (tjs.dom.isElement(oSearcher.oContainer) && oSearcher.oTrigger) {
					this._createSearcher(oSearcher.aFields, oSearcher.oContainer, oSearcher.oTrigger);
				} else if (oSearcher.noDelay) {
					this._createSearcherDialog(oSearcher.aFields);
				} else {
					this.oMap.put('aFields', oSearcher.aFields);
				}
			}
			tjs.lang.destroyObject(oSearcher);
		}
		var oKeyword = this.oMap.remove('oKeyword');//
		if (tjs.lang.isObject(oKeyword)) {
			if (tjs.lang.isArray(oKeyword.aFields) && tjs.dom.isElement(oKeyword.oContainer)) {
				this._createKeyword(oKeyword.aFields, oKeyword.oContainer);
			}
			tjs.lang.destroyObject(oKeyword);
		}
	},
	_createSearcherDialog:function(aFields){
		this.oSearcherDialog = new tjs.widget.Dialog({
			caption:tjs.config.oResource.get('search'),
			content:{cls:'padding_2 overflow_auto'},
			textCmds:['search','clear'],
			contW:600,
			contH:300
		});
		this._createSearcher(aFields, this.oSearcherDialog.getContent(), this.oSearcherDialog);
		this.oSearcher.oElement.setAttribute('autoFill','20');
		tjs.html.evalLayouts(this.oSearcherDialog.getContent());
	},
	_createSearcher:function(aFields, oContainer, oTrigger){
		this.oSearcher = new tjs.sql.search.Editor({
			oParent:oContainer,
			datas:aFields,
			oEncoder:this.oEncoder
		});
		oTrigger.addHandler('search',this._searchHandler.bind(this));
		oTrigger.addHandler('clear',this._clearHandler.bind(this));
	},
	_createKeyword:function(aFields, oContainer){
		if (tjs.lang.isArray(aFields) && tjs.dom.isElement(oContainer)) {
			this.oKeyword = new tjs.sql.search.KeywordEditor({aFields:aFields,oEncoder:this.oEncoder,oParent:oContainer});
			this.oKeyword.addHandler('search',this._searchHandler.bind(this));
			this.oKeyword.addHandler('clear',this._clearHandler.bind(this));
		}
	},
	_searchHandler:function(source,type){
		if (source == this.oKeyword) {
			this.oController.setWhere(this.oKeyword.getConditions());
			if (this.oSearcher) {
				this.oSearcher.setValue(null);
			}
		} else if (this.oSearcher) {
			this.oController.setWhere(this.oSearcher.getConditions());
			if (this.oKeyword) {
				this.oKeyword.setValue(null);
			}
		}
		if (this.oSearcherDialog) {
			this.oSearcherDialog.hide();
		}
	},
	_clearHandler:function(source,type){
		this.oController.setWhere(null);
		if (this.oSearcher) {
			this.oSearcher.setValue(null);
		}
		if (this.oKeyword) {
			this.oKeyword.setValue(null);
		}
		if (this.oSearcherDialog) {
			this.oSearcherDialog.hide();
		}
	},
	search:function(oIcon){
		if (this.oMap.get('aFields') && !this.oSearcher && !this.oSearcherDialog) {
			this._createSearcherDialog(this.oMap.remove('aFields'));
		}
		this.oSearcherDialog.show(oIcon);
	},
	setSearchValue:function(v){
		if (this.oSearcher) {
			this.oSearcher.setValue(v);
			if (this.oKeyword) {
				this.oKeyword.setValue(null);
			}
			this.oController.setWhere(this.oSearcher.getConditions());
		}
	},
	hasSearchValue:function(){
		if (this.oSearcher) {
			return this.oSearcher.hasValue();
		} else {
			return false;
		}
	},
	getSearchValue:function(){
		if (this.oSearcher) {
			return this.oSearcher.getValue();
		} else {
			return null;
		}
	}
});
