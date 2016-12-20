tjs.lang.defineTopClass('tjs.sql.PageManager',
function(oController) {
	this.oController = oController;
	this._construct();
},{
	_construct:function() {
		this.totalRows = 0;
		this.pageRows = 10;
		this.totalPages = 0;
		this.currPage = 0;

		var fkd = tjs.data.KeyedData;
		var oResource = tjs.config.oResource;
		var label,oLabeledContainer;
		var oToolBar = this.oController.oToolBar;

		oToolBar.addContainer({cls:'tjs_toolbar_container'});
		this.oIconList4Pagged = new tjs.widget.IconList({
			oElement:oToolBar.getLastContainer(),
			datas:[
				new fkd('first',oResource.get('go_first_page'),oResource.get('go_first_page'),'first'),
				new fkd('prev',oResource.get('go_previous_page'),oResource.get('go_previous_page'),'prev'),
				new fkd('next',oResource.get('go_next_page'),oResource.get('go_next_page'),'next'),
				new fkd('last',oResource.get('go_last_page'),oResource.get('go_last_page'),'last')
			],
			hv:'h'
		});
		this.oIconList4Pagged.addHandler(tjs.data.DATA_CLICKED,this._pageHandler.bind(this));
		this._checkVisibility();

		oToolBar.addContainer({cls:'tjs_toolbar_container'});
		label = oResource.get('total_rows')+oResource.get('colon');
		oLabeledContainer = new tjs.widget.LabeledContainer({oElement:oToolBar.getLastContainer(),label:label});
		this.oRenderer4TotalRows = new tjs.renderer.Number({oParent:oLabeledContainer.getContent()});
		this.oRenderer4TotalRows.setValue(this.totalRows);

		oToolBar.addContainer({cls:'tjs_toolbar_container'});
		label = oResource.get('total_pages')+oResource.get('colon');
		oLabeledContainer = new tjs.widget.LabeledContainer({oElement:oToolBar.getLastContainer(),label:label});
		this.oRenderer4TotalPages = new tjs.renderer.Number({oParent:oLabeledContainer.getContent()});
		this.oRenderer4TotalPages.setValue(this.totalPages);

		oToolBar.addContainer({cls:'tjs_toolbar_container'});
		label = oResource.get('current_page')+oResource.get('colon');
		oLabeledContainer = new tjs.widget.LabeledContainer({oElement:oToolBar.getLastContainer(),label:label});
		this.oEditor4CurrPage = new tjs.editor.Spinner({oParent:oLabeledContainer.getContent(),width:40});
		this.oEditor4CurrPage.setBounds(0,this.totalPages);
		this.oEditor4CurrPage.setValue(this.currPage);
		this.oEditor4CurrPage.addHandler(tjs.data.VALUE_CHANGED,this._currPageHandler.bind(this));

		oToolBar.addContainer({cls:'tjs_toolbar_container'});
		label = oResource.get('rows_per_page')+oResource.get('colon');
		oLabeledContainer = new tjs.widget.LabeledContainer({oElement:oToolBar.getLastContainer(),label:label});
		this.oEditor4PageRows = new tjs.editor.Combobox({
			oParent:oLabeledContainer.getContent(),
			width:60,
			datas:function(){
				var a = [], i;
				for (i = 5; i <= 30; i += 5) {
					a[a.length] = new fkd(i,String(i));
				}
				for (i = 40; i <= 100; i += 10) {
					a[a.length] = new fkd(i,String(i));
				}
				for (i = 120; i <= 200; i += 20) {
					a[a.length] = new fkd(i,String(i));
				}
				return a;
			}()
		});
		this.oEditor4PageRows.setValue(this.pageRows);
		this.oEditor4PageRows.addHandler(tjs.data.VALUE_CHANGED,this._pageRowsHandler.bind(this));
	},
	destroy:function(){
		if (this.oController) {
			tjs.lang.destroyObject(this);
		}
	},
	getTotalRows:function(){
		return this.totalRows;
	},
	setTotalRows:function(totalRows){
		if (this.totalRows != totalRows) {
			this.totalRows = totalRows;
			if (this.totalRows > 0) {
				this.totalPages = Math.floor((this.totalRows - 1)/this.pageRows) + 1;
				this.oRenderer4TotalRows.setValue(this.totalRows);
				this.oRenderer4TotalPages.setValue(this.totalPages);
				this.oEditor4CurrPage.setBounds(1,this.totalPages);
				if (this.currPage == 0) {
					this.currPage = 1;
					this.oEditor4CurrPage.setValue(this.currPage);
					this._checkVisibility();
				} else if (this.currPage > this.totalPages){
					this._setCurrPage(this.totalPages);
				} else {
					this._checkVisibility();
				}
			} else {
				this.totalPages = 0;
				this.currPage = 0;
				this.oRenderer4TotalRows.setValue(this.totalRows);
				this.oRenderer4TotalPages.setValue(this.totalPages);
				this.oEditor4CurrPage.setBounds(0,this.totalPages);
				this.oEditor4CurrPage.setValue(this.currPage);
				this._checkVisibility();
			}
		}
	},
	getOffset:function(){
		return this.totalRows > 0 ? (this.currPage - 1)*this.pageRows : 0;
	},
	getLength:function(){
		return this.pageRows;
	},
	resetCurrPage:function() {
		return this._setCurrPage(this.totalRows > 0 ? 1 : 0);
	},
	_pageHandler:function(source,type,oNode){
		var key = oNode.data.getKey();
		switch (key){
		case 'first':
			this._goFirstPage();
			break;
		case 'prev':
			this._goPrevPage();
			break;
		case 'next':
			this._goNextPage();
			break;
		case 'last':
			this._goLastPage();
			break;
		}
	},
	_currPageHandler:function(source,type){
		if (this.oEditor4CurrPage.hasValue()) {
			this.currPage = this.oEditor4CurrPage.getValue();
			this._checkVisibility();
			this.oController.loadDatas();
		}
	},
	_pageRowsHandler:function(source,type){
		if (this.oEditor4PageRows.hasValue()){
			this._setPageRows(this.oEditor4PageRows.getValue());
		}
	},
	_setPageRows:function(pageRows){
		if (this.pageRows != pageRows){
			this.pageRows = pageRows;
			if (this.totalRows > 0){
				this.totalPages = Math.floor((this.totalRows - 1)/this.pageRows) + 1;
				this.oRenderer4TotalPages.setValue(this.totalPages);
				this.oEditor4CurrPage.setBounds(1,this.totalPages);
				if (!this._setCurrPage(1)) {
					this._checkVisibility();
					this.oController.loadDatas();
				}
			}
		}
	},
	_checkVisibility:function(){
		var disabled = this.currPage <= 1;
		this.oIconList4Pagged.setCmdDisabled('first',disabled);
		this.oIconList4Pagged.setCmdDisabled('prev',disabled);
		disabled = this.currPage >= this.totalPages;
		this.oIconList4Pagged.setCmdDisabled('next',disabled);
		this.oIconList4Pagged.setCmdDisabled('last',disabled);
	},
	_setCurrPage:function(page){
		var changed = this.currPage != page;
		if (changed){
			this.currPage = page;
			this.oEditor4CurrPage.setValue(this.currPage);
			this._checkVisibility();
			this.oController.loadDatas();
		}
		return changed;
	},
	_goFirstPage:function(){
		if (this.currPage > 1){
			this._setCurrPage(1);
		}
	},
	_goPrevPage:function(){
		if (this.currPage > 1){
			this._setCurrPage(this.currPage - 1);
		}
	},
	_goNextPage:function(){
		if (this.currPage < this.totalPages){
			this._setCurrPage(this.currPage + 1);
		}
	},
	_goLastPage:function(){
		if (this.currPage < this.totalPages){
			this._setCurrPage(this.totalPages);
		}
	}
});
