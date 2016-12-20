tjs.lang.defineTopClass('tjs.sql.Importer',
function(o) {
	this.oController = o;
	this._construct();
},{
	destroy:function(){
		if (this.oController) {
			if (this.oImportDialog) {
				this.oImportDialog.finalize();
			}
			tjs.lang.destroyObject(this);
		}
	},
	_construct:function(){
		this.oImportDialog = new tjs.widget.Dialog({
			caption:tjs.config.oResource.get('import'),
			textCmds:['confirm','cancel'],
			content:{cls:'padding_2 overflow_auto'},
			contW:300,
			contH:200
		});
		this.oImportEditor = new tjs.editor.File({
			oParent:this.oImportDialog.getContent(),
			name:'datas',
			ext:'xls,xlsx'
		});
		var o = this.oImportEditor.oElement;
		o.setAttribute('autoFill','10');
		tjs.html.evalLayouts(o);
		this.oImportDialog.setContentSize(o.offsetWidth,o.offsetHeight);
		this.oImportDialog.addHandler('confirm',this._confirmHandler.bind(this));
		this.oImportDialog.addHandler('cancel',this._cancelHandler.bind(this));
	},
	_cancelHandler:function(source,type){
		this.oController.onImportCompleted(false);
		this.oImportDialog.hide();
	},
	_confirmHandler:function(source,type){
		this.oController.onImportCompleted(true,this.oImportEditor);
		this.oImportDialog.hide();
	},
	doImport:function() {
		this.oImportDialog.show();
	}
});
