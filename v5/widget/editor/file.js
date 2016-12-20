tjs.lang.defineClass('tjs.editor.File',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},tjs.editor.Editor,{
	_construct:function() {
		var name = this.oMap.remove('name');
		var ext = this.oMap.remove('ext');
//tjs_debug_start
		tjs.lang.assert(name && tjs.lang.isString(name),'!tjs.lang.isString(name) @'+this.classname);
		tjs.lang.assert(!ext || tjs.lang.isString(ext),'!tjs.lang.isString(ext) @'+this.classname);
//tjs_debug_end
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
		tjs.dom.addClass(this.oElement,'tjs_file');

		this.name = name;
		this.caption = this.oMap.remove('caption') || name;
		this._changeHandler_ = this._changeHandler.bindAsEventListener(this);

		this._attachFile();
		if (ext) {
			ext = ext.toLowerCase();
			this.exts = ext.split(',');
			ext = tjs.config.oResource.get('file_format') + tjs.config.oResource.get('colon') + ' ' + ext;
			this.oElement.appendChild(document.createElement('br'));
			this.oElement.appendChild(document.createTextNode(ext));
		}
	},
	_destroy:function() {
		if (this.exts) {
			tjs.lang.destroyArray(this.exts);
			delete this.exts;
		}
		tjs.event.removeListener(this.oFile,'change',this._changeHandler_);
	},
	reset:function(){
		if (this.hasValue()) {
			tjs.event.removeListener(this.oFile,'change',this._changeHandler_);
			this.oElement.removeChild(this.oFile);
			delete this.oFile;
			this._attachFile();
		}
	},
	_attachFile:function(){
		var oFile = document.createElement('input');
		oFile.type = 'file';
		oFile.name = this.name;
		oFile.className = 'file';
		var width = this.oMap.get('width');
		if (tjs.lang.isNumber(width)) {
			oFile.style.width = width+'px';
		}
		tjs.event.addListener(oFile,'change',this._changeHandler_);
		tjs.dom.prependChild(oFile,this.oElement);
		this.oFile = oFile;
	},
	_detachFile:function(){
		var oFile = this.oFile;
		tjs.event.removeListener(oFile,'change',this._changeHandler_);
		this.oElement.removeChild(oFile);
		delete this.oFile;
		return oFile;
	},
	getName:function() {
		return this.name;
	},
	getCaption:function() {
		return this.caption;
	},
	_changeHandler:function(oEvent) {
		var oTarget = oEvent.target || oEvent.srcElement;
		if (oTarget == this.oFile) {
			tjs.event.stopPropagation(oEvent);
			//tjs.event.preventDefault(oEvent);
			var value = this.oFile.value;
			if (value && !this._verifyExt(value)) {
				if (tjs.bom.isIE || tjs.bom.isOpera) {
					this._detachFile();
					this._attachFile();
				} else {
					this.oFile.value = '';
				}
				window.alert(tjs.config.oResource.get('file_format_error'));
			}
		}
	},
	_verifyExt:function(fileName) {
		if (!this.exts) {
			return true;
		}
		var result = false;
		var idx = fileName.lastIndexOf('.');
		if (idx > 0) {
			var ext = fileName.substr(idx+1).toLowerCase();
			var i = this.exts.length;
			while (i--) {
				if (ext == this.exts[i]) {
					result = true;
					break;
				}
			}
		}
		return result;
	},
	moveToForm:function(oForm){
//tjs_debug_start
		tjs.lang.assert(oForm instanceof tjs.editor.Form,'!(oForm instanceof tjs.editor.Form) @'+this.classname+'.moveToForm');
//tjs_debug_end
		if (this.hasValue()) {
			oForm.addItem(this._detachFile());
			this._attachFile();
		}
	},
	isFile:function(){
		return true;
	},
	hasValue:function() {
		return Boolean(this.oFile.value);
	}
});
