tjs.lang.defineClass('tjs.sql.Form',tjs.util.Trigger,
function(o) {
	this.oMap = tjs.util.toMap(o);
	this.construct();
},{
	construct:function(){
		tjs.util.Trigger.initInstance(this);
		this._checkAll();
		this._construct();
	},
	destroy:function(){
		if (this.oMap) {
			this._destroy();
			if (this.aFileEditors) {
				tjs.lang.destroyArray(this.aFileEditors);
			}
			this.oEditorMap.destroy();
			tjs.util.Trigger.destroyInstance(this);
			this.oMap.destroy();
			tjs.lang.destroyObject(this);
		}
	},
	_destroy:function(){
		this.oDialog.finalize();
	},
	_checkAll:function(){
		var oController = this.oMap.remove('oController');
		var aFields = this.oMap.remove('aFields');
//tjs_debug_start
		tjs.lang.assert(oController instanceof tjs.sql.Controller,'!(oController instanceof tjs.sql.Controller) @'+this.classname);
		tjs.lang.assert(tjs.lang.isArray(aFields) && aFields.length > 0,'!tjs.lang.isArray(aFields) @'+this.classname);
//tjs_debug_end
		this.oController = oController;
		this.aFields = aFields;
		this.aNotNullFields = this.oMap.remove('aNotNullFields');
		this.oEditorMap = new tjs.util.Map();
	},
	_construct:function(){
		this.oDialog = this._createDialog();
		this.oContainer = document.createElement('div');
		var contW = this.oDialog.getContentWidth();
		this.oContainer.style.width = contW+'px';
		tjs.dom.addClass(this.oContainer,'tjs_data_editor');
		this.oDialog.getContent().appendChild(this.oContainer);
		this._createEditors(this.oContainer);
	},
	_checkHasValues:function(){
		var a = this.aNotNullFields;
		if (a && a.length > 0) {
			var o,e;
			for (var i = 0, isize = a.length; i < isize; i++){
				o = a[i];
				e = this.getEditor(o.getKey());
				if (e.oElement.style.visibility != 'hidden' && !e.hasValue()){
					window.alert(tjs.config.oResource.get('please_input')+o.toString());
					return false;
				}
			}
		}
		return true;
	},
	_confirmHandler:function(source,type){
		if (this._checkHasValues() && this.oController.validateForm(this,this.phase)){
			this._form2data();
			if (this.oController.validateData(this.data,this.phase)) {
				this._editEnd(true);//
			}
		}
	},
	_resetHandler:function(source,type){
		this._data2form();
	},
	_cancelHandler:function(source,type){
		this._editEnd(false);//
	},
	_data2form:function(){
		var oField,oEditor;
		for (var i = 0, isize = this.aFields.length; i < isize; i++){
			oField = this.aFields[i];
			oEditor = this.oEditorMap.get(oField.getKey());
			if (oEditor) {
				if (oEditor.isFile()) {
					oEditor.reset();
				} else {
					oEditor.setValue(oField.toEditorValue(this.data),true);
				}
			}
		}
	},
	_form2data:function(){
		var oField,oEditor;
		for (var i = 0, isize = this.aFields.length; i < isize; i++){
			oField = this.aFields[i];
			oEditor = this.oEditorMap.get(oField.getKey());
			if (oEditor && !oEditor.isFile()) {
				oField.fromEditorValue(this.data,oEditor.getValue());
			}
		}
	},
	getEditor:function(name){
		return this.oEditorMap.get(name);
	},
	editData:function(data, phase){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isObject(data),'!tjs.lang.isObject(data) @'+this.classname+'.editData');
//tjs_debug_end
		this.phase = phase;
		this.data = data;
		this._data2form();
		this._editStart();
	},
	getData:function(){
		return this.data;
	},
	getFileEditors:function(){
		var a;
		if (this.aFileEditors) {
			a = [];
			var i = this.aFileEditors.length, o, k = 0;
			while (i--) {
				o = this.aFileEditors[i];
				if (o.hasValue()) {
					a[k++] = o;
				}
			}
			if (a.length == 0) {
				a = null;
			}
		}
		return a;
	},
	_createEditors:function(oContainer){
		var url = this.oMap.remove('url');
		if (url && tjs.lang.isString(url)) {
			var oThis = this;
			tjs.html.loadElementContent(url,oContainer,function(){oThis._evalTempleate(oContainer);});
		} else {
			var template = this.oMap.remove('template');
			if (template && tjs.lang.isString(template)) {
				oContainer.innerHTML = template;
			} else {
				tjs.dom.cleanWhiteSpace(oContainer);
				if (!oContainer.hasChildNodes()) {
					oContainer.innerHTML = tjs.editor.createTemplate(this.aFields,this.oMap.remove('ratio'));
				}
			}
			this._evalTempleate(oContainer);
		}
	},
	_evalTempleate:function(oContainer){
		var tjs_sql = tjs.sql;
		tjs_sql.handleContainers(this.aFields,oContainer,'component_label',tjs_sql.createLabel);
		tjs_sql.handleContainers(this.aFields,oContainer,'component_container',this._createEditor.bind(this));
		this._evalForm_ = this._evalForm.bind(this);
		this._evalForm();
	},
	_evalForm:function(){
		if (tjs.data.Cache.isLoading()) {
			tjs.lang.invokeLater(this._evalForm_);
		} else {
			this._onFormReady();
		}
	},
	_onFormReady:function(){
		tjs.html.evalLayouts(this.oContainer);
		var contH = this.oDialog.getContentHeight();
		var w = this.oContainer.offsetWidth;
		var h = this.oContainer.offsetHeight;
		if (h > contH) {
			w += tjs.bom.getVScrollBarWidth();
			h = contH;
			tjs.dom.replaceClass(this.oDialog.getContent(),'overflow_hidden','overflow_auto');
		}
		this.oDialog.setContentSize(w,h);
		//
		this.fire('FORM_READY');
	},
	_createEditor:function(oField,oContainer){
		var oEditor = oField.createEditor(oContainer);
		if (oEditor.isFile()) {
			if (!this.aFileEditors) {
				this.aFileEditors = [];
			}
			this.aFileEditors.push(oEditor);
		}
		this.oEditorMap.put(oField.getKey(),oEditor);
	},
	_createDialog:function(){
		var oDialog = tjs.widget.Dialog.checkConfig(this.oMap.remove('oDialog'),{
			contW:600,
			contH:400,
			caption:this.oMap.get('caption'),
			textCmds:['confirm','reset','cancel']
		});
		oDialog = new tjs.widget.Dialog(oDialog);
		oDialog.addHandler('confirm',this._confirmHandler.bind(this));
		oDialog.addHandler('reset',this._resetHandler.bind(this));
		oDialog.addHandler('cancel',this._cancelHandler.bind(this));
		oDialog.addHandler(tjs.widget.AFTER_HIDE,this._afterHideHandler.bind(this));
		return oDialog;
	},
	_editStart:function(){
		this.oDialog.show();
	},
	_editEnd:function(completed){
		this.oMap.put('completed',completed);
		this.oDialog.hide();
	},
	_afterHideHandler:function(source,type){
		if (this.oMap.remove('completed')) {
			//this.fire('EDIT_COMPLETED',{data:this.data,fileEditors:this.getFileEditors()});
			this.oController.onEditCompleted(this.phase,this.data,this.getFileEditors());
		}
	}
});
