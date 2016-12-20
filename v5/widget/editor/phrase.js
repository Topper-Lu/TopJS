tjs.lang.defineClass('tjs.editor.Phrase',tjs.editor.TextArea,
function(obj) {
	tjs.editor.TextArea.call(this,obj);
},tjs.widget.alignWidget,{
	_align:'c',
	_checkAll:function(){
		//tjs.editor.TextArea.prototype._checkAll.call(this);
		this._checkAlign();
	},
	_construct:function() {
		tjs.editor.TextArea.prototype._construct.call(this);
		this.oCmdBar = document.createElement('div');
		this.oCmdBar.className = 'overflow_hidden tjs_cmdbar '+this.getAlignCls();
		this.oElement.appendChild(this.oCmdBar);
		var cmd = 'use_phrase';
		this.oCmdTextList = new tjs.widget.CmdTextList({oParent:this.oCmdBar,datas:tjs.data.convertCmds(['use_phrase'])});
		this.oCmdTextList.addHandler(tjs.data.DATA_CLICKED,this._cmdBarHandler.bind(this));
	},
	_destroy:function() {
		if (this.oDialog) {
			this.oDialog.finalize();
		}
		tjs.editor.TextArea.prototype._destroy.call(this);
	},
	layout:function(){
		var w = tjs.css.getContentBoxWidth(this.oElement);
		var h = tjs.css.getContentBoxHeight(this.oElement);
		tjs.css.setOffsetWidth(this.oCmdBar,w);
		this.oCmdTextList.layout();
		h -= this.oCmdBar.offsetHeight;
		tjs.css.setOffsetDimension(this.oTextarea,w,h);
	},
	_createDialog:function() {
		var oDialog = tjs.widget.Dialog.checkConfig(this.oMap.remove('oDialog'),{
			contW:400,
			contH:400,
			content:{url:this.oMap.remove('url')},
			caption:this.oMap.remove('caption')
		});
		oDialog.textCmds = ['confirm','cancel'];
		oDialog = new tjs.widget.Dialog(oDialog);
		oDialog.addHandler('confirm',this._confirmHandler.bind(this));
		oDialog.addHandler('cancel',this._cancelHandler.bind(this));
		return oDialog;
	},
	_cmdBarHandler:function(source,type,oNode) {
		if (!this.oDialog) {
			this.oDialog = this._createDialog();
		}
		this.oDialog.show(this.oElement);
	},
	_confirmHandler:function(source,type) {
		if (!this.oPhraseWidget) {
			var oElement = tjs.dom.getFirstChildByAttribute(this.oDialog.getContent(),'div','id','phrase_element');
			if (oElement && oElement.oWidget) {
				this.oPhraseWidget = oElement.oWidget;
			}
		}
		if (this.oPhraseWidget) {
			var value = this.oPhraseWidget.getSelectedPhrase();
			if (value) {
				this.setValue(value,true);
			}
		}
		this.oDialog.hide();
	},
	_cancelHandler:function(source,type) {
		this.oDialog.hide();
	}
});
