tjs.lang.defineClass('tjs.sql.Form',tjs.util.Trigger,
function(o) {
	tjs.util.Trigger.initInstance(this);
	this.oMap = tjs.util.toMap(o);
	this.oController = this.oMap.remove('oController');
	this.aFields = this.oMap.remove('aFields');
	this.aNotNullFields = this.oMap.remove('aNotNullFields');
	this.oEditorMap = new tjs.util.Map();
	this.oDialog = this._createDialog();
	this.oContainer = document.createElement('div');
	this.oContainer.style.width = this.oDialog.getContentWidth()+'px';
	tjs.dom.addClass(this.oContainer,'tjs_data_editor');
	this.oDialog.getContent().appendChild(this.oContainer);
	this.oContainer.innerHTML = tjs.editor.createTemplate(this.aFields,this.oMap.remove('ratio'));
	var tjs_sql = tjs.sql;
	tjs_sql.handleContainers(this.aFields,this.oContainer,'component_label',tjs_sql.createLabel);
	tjs_sql.handleContainers(this.aFields,this.oContainer,'component_container',this._createEditor.bind(this));
	this._evalForm_ = this._evalForm.bind(this);
	this._evalForm();
},{
	destroy:function(){
		if (this.oMap) {
			this.oDialog.finalize();
			if (this.aFileEditors) {
				tjs.lang.destroyArray(this.aFileEditors);
			}
			this.oEditorMap.destroy();
			tjs.util.Trigger.destroyInstance(this);
			this.oMap.destroy();
			tjs.lang.destroyObject(this);
		}
	},
	editData:function(data, phase){
		this.phase = phase;
		this.data = data;
		this._data2form();
		this.oDialog.show();
	},
	getData:function(){
		return this.data;
	},
	getEditor:function(name){
		return this.oEditorMap.get(name);
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
	_evalForm:function(){
		if (tjs.data.Cache.isLoading()) {
			tjs.lang.invokeLater(this._evalForm_);
		} else {
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
		}
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
		return oDialog;
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
		if (this._checkHasValues()){
			if (!this.oController.validateForm || this.oController.validateForm(this,this.phase)) {
				this._form2data();
				if (!this.oController.validateData || this.oController.validateData(this.data,this.phase)) {
					this.oDialog.hide();
					this.oController.onEditCompleted(this.phase, this.data, this.getFileEditors());
				}
			}
		}
	},
	_resetHandler:function(source,type){
		this._data2form();
	},
	_cancelHandler:function(source,type){
		this.oDialog.hide();
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
	}
});
