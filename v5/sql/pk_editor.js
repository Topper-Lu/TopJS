tjs.lang.defineClass('tjs.editor.PkEditor',tjs.widget.Widget,
function(obj) {
	tjs.widget.Widget.call(this,obj);
},tjs.editor.Editor,{
//tjs_debug_start
	_checkAll:function(){
		var fController = this.oMap.get('fController');
		tjs.lang.assert(tjs.lang.isFunction(fController),'!tjs.lang.isFunction(fController) @'+this.classname);
		tjs.lang.assert(tjs.lang.isSubClassOf(fController,tjs.sql.AbstractLTController),'!tjs.lang.isSubClassOf(fController,tjs.sql.AbstractLTController) @'+this.classname);
	},
//tjs_debug_end
	_construct:function(){
		if (this.oElement) {
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

		var oToolBar = document.createElement('div');
		oToolBar.className = 'overflow_hidden';
		this.oElement.appendChild(oToolBar);
		this.oSplitLayout = new tjs.widget.SplitLayout({
			oParent:this.oElement,
			splitType:'LR',
			ratio:0.3
		});
		this.oSplitLayout.oContentTL.className = 'pos_rel overflow_auto padding_2';

		var fController = this.oMap.remove('fController');
		this.oController = new fController({
			oProxy:{locateJsonHandler:this._locateJsonHandler.bind(this)},
			oToolBar:oToolBar,
			oRenderer:this.oSplitLayout.oContentTL,
			oView:{oElement:this.oSplitLayout.oContentBR,alternate:true}
		});
		this.oController.oView.addHandler(tjs.data.SELECTEDDATA_CHANGED,this._onSelectedDataChanged.bind(this));

		this.data = null;
		this.loadingState = {loading:false,fireEvent:false,fSetTextValue:null};
		this.oController.loadDatas();
	},
	layout:function(){
		var tjs_css = tjs.css;
		var w = tjs_css.getContentBoxWidth(this.oElement);
		var h = tjs_css.getContentBoxHeight(this.oElement);
		var o = this.oController.oToolBar.oElement;
		tjs_css.setOffsetWidth(o,w);
		tjs.html.evalLayouts(o);
		h -= o.offsetHeight;
		tjs_css.setOffsetDimension(this.oSplitLayout.oElement,w,h);
		this.oSplitLayout.layout();
	},
	_onSelectedDataChanged:function(source,type,oNode){
		var data = source.getSelectedData();
		if (data && (!this.data || data.getKey() != this.data.getKey())){
			this.data = data;
			this.oController.oRenderer.renderData(this.data);
			this.fire(tjs.data.VALUE_CHANGED);
		}
	},
	_locateJsonHandler:function(data){
		this.data = data;
		this.loadingState.loading = false;
		this.oController.oRenderer.renderData(this.data);
		if (this.loadingState.fSetTextValue) {
			this.loadingState.fSetTextValue(this.getTextValue());
			this.loadingState.fSetTextValue = null;
		}
		if (this.loadingState.fireEvent) {
			this.loadingState.fireEvent = false;
			this.fire(tjs.data.VALUE_CHANGED);
		}
	},
	hasValue:function(){
		return this.data != null;
	},
	getValue:function(){
		return this.data ? this.data.getKey() : null;
	},
	setValue:function(value,fireEvent) {
		if (this.getValue() != value) {
			fireEvent = Boolean(fireEvent);
			var oView = this.oController.oView;
			oView.setSelectedKey(value);
			this.data = oView.getSelectedData();
			if (value != null && this.data == null) {
				this.loadingState.fireEvent = fireEvent;
				this.loadingState.loading = true;
				this.oController.oProxy.locateJson(value);
			} else {
				this.oController.oRenderer.renderData(this.data);
				if (fireEvent) {
					this.fire(tjs.data.VALUE_CHANGED);
				}
			}
		}
	},
	getTextValue:function() {
		return this.data ? this.data.toString() : '';
	},
	readTextValue:function(fSetTextValue) {
		if (this.loadingState.loading) {
			this.loadingState.fSetTextValue = fSetTextValue;
		} else {
			fSetTextValue(this.getTextValue());
		}
	}
});

tjs.lang.defineClass('tjs.editor.PkDialog',tjs.editor.DataSetDialog,
function(obj) {
	tjs.editor.DataSetDialog.call(this,obj);
},{
	_checkDialog:function() {
		this.oMap.putIfUndefined('caption','Single Selection List');
		var oDialog = tjs.widget.Dialog.checkConfig(this.oMap.remove('oDialog'),{
			contW:800,
			contH:400,
			caption:this.oMap.get('caption')
		});
		oDialog.textCmds = ['close'];
		return oDialog;
	},
	_createEditor:function(o) {
		o = new tjs.editor.PkEditor(o);
		o.oElement.setAttribute('autoFill','11');
		tjs.html.evalLayouts(o.oElement);
		return o;
	}
});

tjs.lang.defineClass('tjs.sql.PkDialogField',tjs.sql.SimpleField,
function(o){
	tjs.sql.SimpleField.call(this,o);
},{
	_doConfig:function(){
		this.oMap.putIfUndefined('dataType',tjs.data.types.STRING);
		this.oMap.putIfUndefined('sqlType',tjs.sql.types.VARCHAR);
		this.oMap.putIfUndefined('fGridColumn',tjs.grid.TextColumn);
		this.oMap.putIfUndefined('fRenderer',tjs.renderer.OneLineText);
		this.oMap.putIfUndefined('fEditor',tjs.editor.PkDialog);
		this.oMap.putIfUndefined('fEditor4Search',tjs.editor.PkDialog);
		this.oMap.putIfUndefined('fSearchItem',tjs.sql.search.Item4String);
	}
});
tjs.sql.PkDialogField.oConfig = {oEditor:{width:120},oEditor4Search:{width:120}};
