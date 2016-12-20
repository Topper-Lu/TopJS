tjs.lang.defineClass('tjs.editor.Dialog',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},tjs.editor.Editor,{
	_construct:function() {
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'span','tagName != "span" @'+this.classname);
//tjs_debug_end
			if (this.oElement.hasChildNodes()) {
				this.oElement.innerHTML = '';
			}
		} else {
			this.oElement = document.createElement('span');
			var oParent = this.oMap.remove('oParent');
			if (tjs.dom.isElement(oParent)) {
				oParent.appendChild(this.oElement);
			}
		}
		tjs.dom.addClass(this.oElement,'tjs_text_dlg');
		this.oElement.noLayout = true;
		// oText
		this.oText = document.createElement('input');
		this.oText.type = 'text';
		this.oText.className = 'text read_only';
		this.oText.readOnly = true;
		var width = this.oMap.remove('width');
		if (!tjs.lang.isNumber(width)) {
			width = 180;
		}
		this.oText.style.width = width+'px';
		this.oText.style.textAlign = 'center';
		this.oElement.appendChild(this.oText);
		// oImgEdit
		this.oImgEdit = document.createElement('img');
		this.oImgEdit.className = 'tjs_img_btn tjs_img_btn_edit';
		this.oImgEdit.src = tjs.config.get('srcSpacer');
		this.oImgEdit.title = tjs.config.oResource.get('edit');
		this.oElement.appendChild(this.oImgEdit);
		this._clickHandler_ = this._clickHandler.bindAsEventListener(this);
		tjs.event.addListener(this.oImgEdit,'click',this._clickHandler_);
		// oDialog
		this.oDialog = new tjs.widget.Dialog(this._checkDialog());
		// oEditor
		var value = this.oMap.remove('value');
		var o = this.oMap.items;
		this.oMap.items = {};
		o.oParent = this.oDialog.getContent();
		this.oEditor = this._createEditor(o);
		this.oEditor.addHandler(tjs.data.VALUE_CHANGED,this._valueChangedHandler.bind(this));
		if (!tjs.lang.isUndefined(value)) {
			this.setValue(value,true);
		}
	},
	_destroy:function() {
		this.oDialog.finalize();
		tjs.event.removeListener(this.oImgEdit,'click',this._clickHandler_);
	},
	_clickHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		if (oTarget == this.oImgEdit) {
			this.oDialog.show(this.oText);
		}
	},
	_checkDialog:function() {
		var oDialog = tjs.widget.Dialog.checkConfig(this.oMap.remove('oDialog'),{
			caption:this.oMap.get('caption')
		});
		oDialog.textCmds = ['close'];
		return oDialog;
	},
	getEditor:function() {
		return this.oEditor;
	},
	_valueChangedHandler:function(source,type) {
		this._checkText();
		this.fire(tjs.data.VALUE_CHANGED);
	},
	_checkText:function() {
		var value = this.oEditor.getValue();
		if (value == null) {
			value = '';
		}
		if (this.oText.value != value) {
			this.oText.value = value;
		}
	},
	setValue:function(value,fireEvent){
		this.oEditor.setValue(value,fireEvent);
		if (!fireEvent) {
			this._checkText();
		}
	},
	hasValue:function() {
		return this.getEditor().hasValue();
	},
	getValue:function() {
		return this.getEditor().getValue();
	},
	// to be overrided
	_createEditor:function(o) {
	}
});

tjs.lang.defineClass('tjs.editor.Date',tjs.editor.Dialog,
function(obj) {
	tjs.editor.Dialog.call(this,obj);
},{
	_checkAll:function(){
		this.oMap.putIfUndefined('width',120);
		this.oMap.putIfUndefined('caption','Date Chooser');
	},
	_createEditor:function(o) {
		o = new tjs.editor.DateChooser(o);
		tjs.html.evalLayouts(o.oElement);
		this.oDialog.setContentSize(o.oElement.offsetWidth,o.oElement.offsetHeight);
		return o;
	}
});

tjs.lang.defineClass('tjs.editor.Time',tjs.editor.Dialog,
function(obj) {
	tjs.editor.Dialog.call(this,obj);
},{
	_checkAll:function(){
		this.oMap.putIfUndefined('width',100);
		this.oMap.putIfUndefined('caption','Time Chooser');
	},
	_createEditor:function(o) {
		o = new tjs.editor.TimeChooser(o);
		tjs.html.evalLayouts(o.oElement);
		this.oDialog.setContentSize(o.oElement.offsetWidth,o.oElement.offsetHeight);
		return o;
	}
});

tjs.lang.defineClass('tjs.editor.Timestamp',tjs.editor.Dialog,
tjs.editor.Timestamp = function(obj) {
	tjs.editor.Dialog.call(this,obj);
},{
	_checkAll:function(){
		this.oMap.putIfUndefined('width',200);
		this.oMap.putIfUndefined('caption','Timestamp Chooser');
	},
	_createEditor:function(o) {
		o = new tjs.editor.TimestampChooser(o);
		tjs.html.evalLayouts(o.oElement);
		this.oDialog.setContentSize(o.oElement.offsetWidth,o.oElement.offsetHeight);
		return o;
	}
});

tjs.lang.defineClass('tjs.editor.Color',tjs.editor.Dialog,
function(obj) {
	tjs.editor.Dialog.call(this,obj);
},{
	_checkAll:function(){
		this.oMap.putIfUndefined('width',120);
		this.oMap.putIfUndefined('caption','Color Chooser');
	},
	_checkText:function() {
		var value = this.oEditor.getValue();
		if (value == null) {
			value = '';
		}
		if (this.oText.value != value) {
			this.oText.value = value;
			if (value) {
				this.oText.style.backgroundColor = this.oText.value;
			} else {
				this.oText.style.backgroundColor = 'transparent';
			}
		}
	},
	_createEditor:function(o) {
		o = new tjs.editor.ColorChooser(o);
		tjs.html.evalLayouts(o.oElement);
		this.oDialog.setContentSize(o.oElement.offsetWidth,o.oElement.offsetHeight);
		return o;
	}
});

tjs.lang.defineClass('tjs.editor.DataSetDialog',tjs.editor.Dialog,
function(obj) {
	tjs.editor.Dialog.call(this,obj);
},{
	_checkDialog:function() {
		var oDialog = tjs.widget.Dialog.checkConfig(this.oMap.remove('oDialog'),{
			contW:400,
			contH:300,
			caption:this.oMap.get('caption')
		});
		oDialog.textCmds = ['close'];
		return oDialog;
	},
	_checkText:function() {
		if (!this._setTextValue_) {
			this._setTextValue_ = this._setTextValue.bind(this);
		}
		this.oEditor.readTextValue(this._setTextValue_);
	},
	_setTextValue:function(text) {
		this.oText.value = text;
	}
});

tjs.lang.defineClass('tjs.editor.RadioListDialog',tjs.editor.DataSetDialog,
function(obj) {
	tjs.editor.DataSetDialog.call(this,obj);
},{
	_checkAll:function(){
		this.oMap.putIfUndefined('caption','Single Selection List');
	},
	_createEditor:function(o) {
		tjs.dom.replaceClass(o.oParent,'overflow_hidden','overflow_auto');
		o = new tjs.editor.RadioList(o);
		tjs.html.evalLayouts(o.oElement);
		return o;
	}
});

tjs.lang.defineClass('tjs.editor.CheckboxListDialog',tjs.editor.DataSetDialog,
function(obj) {
	tjs.editor.DataSetDialog.call(this,obj);
},{
	_checkDialog:function() {
		this.oMap.putIfUndefined('caption','Multiple Selection List');
		var oDialog = tjs.widget.Dialog.checkConfig(this.oMap.remove('oDialog'),{
			contW:400,
			contH:300,
			caption:this.oMap.get('caption')
		});
		oDialog.textCmds = ['close','select_all','unselect_all'];
		return oDialog;
	},
	_cmdHandler:function(source,type) {
		switch (type) {
		case 'select_all':
			this.oEditor.selectAll(true);
			break;
		case 'unselect_all':
			this.oEditor.unselectAll(true);
			break;
		}
	},
	_createEditor:function(o) {
		this.oDialog.addHandler(['select_all','unselect_all'],this._cmdHandler.bind(this));
		tjs.dom.replaceClass(o.oParent,'overflow_hidden','overflow_auto');
		o = new tjs.editor.CheckboxList(o);
		tjs.html.evalLayouts(o.oElement);
		return o;
	}
});

tjs.lang.defineClass('tjs.editor.BitCheckboxListDialog',tjs.editor.DataSetDialog,
function(obj) {
	tjs.editor.DataSetDialog.call(this,obj);
},{
	_checkDialog:function() {
		this.oMap.putIfUndefined('caption','Multiple Selection List');
		var oDialog = tjs.widget.Dialog.checkConfig(this.oMap.remove('oDialog'),{
			contW:400,
			contH:300,
			caption:this.oMap.get('caption')
		});
		oDialog.textCmds = ['close','select_all','unselect_all'];
		return oDialog;
	},
	_cmdHandler:function(source,type) {
		switch (type) {
		case 'select_all':
			this.oEditor.selectAll(true);
			break;
		case 'unselect_all':
			this.oEditor.unselectAll(true);
			break;
		}
	},
	_createEditor:function(o) {
		this.oDialog.addHandler(['select_all','unselect_all'],this._cmdHandler.bind(this));
		tjs.dom.replaceClass(o.oParent,'overflow_hidden','overflow_auto');
		o = new tjs.editor.BitCheckboxList(o);
		tjs.html.evalLayouts(o.oElement);
		return o;
	}
});

tjs.lang.defineClass('tjs.editor.RadioTreeDialog',tjs.editor.DataSetDialog,
function(obj) {
	tjs.editor.DataSetDialog.call(this,obj);
},{
	_checkAll:function(){
		this.oMap.putIfUndefined('caption','Single Selection Tree');
	},
	_createEditor:function(o) {
		tjs.dom.replaceClass(o.oParent,'overflow_hidden','overflow_auto');
		o = new tjs.editor.RadioTree(o);
		tjs.html.evalLayouts(o.oElement);
		return o;
	}
});

tjs.lang.defineClass('tjs.editor.RadioPTreeDialog',tjs.editor.DataSetDialog,
function(obj) {
	tjs.editor.DataSetDialog.call(this,obj);
},{
	_checkAll:function(){
		this.oMap.putIfUndefined('caption','Single Selection Tree');
	},
	_createEditor:function(o) {
		tjs.dom.replaceClass(o.oParent,'overflow_hidden','overflow_auto');
		o = new tjs.editor.RadioPTree(o);
		tjs.html.evalLayouts(o.oElement);
		return o;
	}
});

tjs.lang.defineClass('tjs.editor.CheckboxTreeDialog',tjs.editor.DataSetDialog,
function(obj) {
	tjs.editor.DataSetDialog.call(this,obj);
},{
	_checkAll:function(){
		this.oMap.putIfUndefined('caption','Multiple Selection Tree');
	},
	_createEditor:function(o) {
		tjs.dom.replaceClass(o.oParent,'overflow_hidden','overflow_auto');
		o = new tjs.editor.CheckboxTree(o);
		tjs.html.evalLayouts(o.oElement);
		return o;
	}
});

tjs.lang.defineClass('tjs.editor.CheckboxPTreeDialog',tjs.editor.DataSetDialog,
function(obj) {
	tjs.editor.DataSetDialog.call(this,obj);
},{
	_checkAll:function(){
		this.oMap.putIfUndefined('caption','Multiple Selection Tree');
	},
	_createEditor:function(o) {
		tjs.dom.replaceClass(o.oParent,'overflow_hidden','overflow_auto');
		o = new tjs.editor.CheckboxPTree(o);
		tjs.html.evalLayouts(o.oElement);
		return o;
	}
});

tjs.lang.defineClass('tjs.editor.HTMLDialog',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},tjs.editor.Editor,{
	_construct:function() {
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'div','tagName != "div" @'+this.classname);
//tjs_debug_end
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
		tjs.dom.addClass(this.oElement,'tjs_html_editor tjs_html_container');
		this.oElement.noLayout = true;
		// oEditor
		var value = this.oMap.remove('value');
		if (!tjs.lang.isUndefined(value)) {
			this.setValue(value,true);
		}
		// oDialog
		this.oDialog = new tjs.widget.Dialog(this._checkDialog());
		this.oDialog.addHandler('save',this._saveHandler.bind(this));
		this.oDialog.addHandler('cancel',this._cancelHandler.bind(this));
		this.oEditor = this._createEditor(this.oMap.remove('toolbar'));
		this._clickHandler_ = this._clickHandler.bindAsEventListener(this);
		tjs.event.addListener(this.oElement,'click',this._clickHandler_);
	},
	_destroy:function() {
		this.oDialog.finalize();
		tjs.event.removeListener(this.oElement,'click',this._clickHandler_);
	},
	_checkDialog:function() {
		this.oMap.putIfUndefined('caption','HTML Editor');
		var oDialog = tjs.widget.Dialog.checkConfig(this.oMap.remove('oDialog'),{
			caption:this.oMap.get('caption'),
			contW:960,contH:400
		});
		oDialog.textCmds = ['save','cancel'];
		return oDialog;
	},
	_createEditor:function(toolbar) {
		if (!tjs.lang.isArray(toolbar)) {
			toolbar = [
				{ name: 'document', groups: [ 'mode', 'document', 'doctools' ], items: [ 'Source'] },
				{ name: 'tools', items: [ 'Maximize', 'ShowBlocks' ] },
				{ name: 'clipboard', groups: [ 'clipboard', 'undo' ], items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
				{ name: 'insert', items: [ 'Image', 'Table' ] },
				'/',
				{ name: 'styles', items: [ 'Format', 'Font', 'FontSize' ] },
				{ name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ], items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ] },
				{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat' ] },
				{ name: 'colors', items: [ 'TextColor', 'BGColor' ] }
			];
		}
		var oCKEditor = CKEDITOR.appendTo(this.oDialog.getContent(), {resize_enabled:false,toolbar:toolbar});
		oCKEditor.once('instanceReady',function(){
			var oChild = tjs.dom.getFirstChildByTagName(this.oDialog.getContent(),'div');
			this.oDialog.setContentSize(oChild.offsetWidth,oChild.offsetHeight);
		},this);
		return oCKEditor;
	},
	_saveHandler:function(source,type) {
		this.setValue(this.oEditor.getData(),true);
	},
	_cancelHandler:function(source,type) {
		this.oDialog.hide();
	},
	_clickHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		//tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		oTarget = tjs.dom.getAncestorByClassName(oTarget,'div','tjs_html_container',this.oElement.parentNode);
		if (oTarget) {
			this.oEditor.setData(this.value);
			this.oDialog.show(this.oElement);
		}
	},
	setValue:function(value,fireEvent){
		if (!tjs.lang.isString(value)) {
			value = '';
		}
		if (this.value != value) {
			this.value = value;
			this.oElement.innerHTML = this.value;
			if (fireEvent) {
				this.fire(tjs.data.VALUE_CHANGED);
			}
		}
	},
	hasValue:function() {
		return Boolean(this.value);
	},
	getValue:function() {
		return this.value;
	}
});
