tjs.lang.defineClass('tjs.editor.Files',tjs.widget.Widget,
function(obj) {
	tjs.widget.Widget.call(this,obj);
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
		tjs.dom.addClass(this.oElement,'tjs_files');

		this.FileContainer = document.createElement('div');
		this.FileContainer.className = 'tjs_file_container';
		if (ext) {
			ext = ext.toLowerCase();
			this.exts = ext.split(',');
			ext = tjs.config.oResource.get('file_format') + tjs.config.oResource.get('colon') + ' ' + ext;
			this.FileContainer.appendChild(document.createElement('br'));
			this.FileContainer.appendChild(document.createTextNode(ext));
		}
		this.oElement.appendChild(this.FileContainer);

		this.ListContainer = document.createElement('div');
		this.ListContainer.className = 'tjs_files_list';
		this.ListContainer.style.display = 'none';
		this.oElement.appendChild(this.ListContainer);

		this.name = name;
		this.caption = this.oMap.remove('caption') || name;
		this._removeHandler_ = this._removeHandler.bindAsEventListener(this);
		this._changeHandler_ = this._changeHandler.bindAsEventListener(this);
		this._attachFile();
	},
	_destroy:function() {
		tjs.event.removeListener(this.oFile,'change',this._changeHandler_);
		if (this.exts) {
			tjs.lang.destroyArray(this.exts);
			delete this.exts;
		}
		this._removeChildren();
	},
	reset:function(){
		if (this.hasValue()) {
			this._removeChildren();
		}
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
			this._addFile();
		}
	},
	_removeHandler:function(oEvent) {
		var oTarget = oEvent.target || oEvent.srcElement;
		oTarget = tjs.dom.getAncestorByTagName(oTarget,'a',this.ListContainer);
		if (oTarget) {
			tjs.event.stopPropagation(oEvent);
			tjs.event.preventDefault(oEvent);
			tjs.event.removeListener(oTarget,'click',this._removeHandler_);
			this.ListContainer.removeChild(oTarget.parentNode);
			if (!this.hasValue()) {
				this.ListContainer.style.display = 'none';
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
		tjs.dom.prependChild(oFile,this.FileContainer);
		this.oFile = oFile;
	},
	_detachFile:function(){
		var oFile = this.oFile;
		tjs.event.removeListener(oFile,'change',this._changeHandler_);
		this.FileContainer.removeChild(oFile);
		delete this.oFile;
		return oFile;
	},
	_addFile:function(){
		var value = this.oFile.value;
		if (!value) {
			return;
		}
		if (!this._verifyExt(value)) {
			if (tjs.bom.isIE || tjs.bom.isOpera) {
				this._detachFile();
				this._attachFile();
			} else {
				this.oFile.value = '';
			}
			window.alert(tjs.config.oResource.get('file_format_error'));
			return;
		}
		this.ListContainer.style.display = '';

		// old file
		var oA = document.createElement('a');
		oA.className = 'tjs_files_remove_img';
		oA.href = 'javascript:void';
		oA.title = tjs.config.oResource.get('remove');
		tjs.event.addListener(oA,'click',this._removeHandler_);

		var oSpan = document.createElement('span');
		oSpan.className = 'tjs_files_description';
		oSpan.appendChild(document.createTextNode(value));

		var oDiv = document.createElement('div');
		oDiv.className = 'tjs_files_item';
		oDiv.appendChild(oA);
		oDiv.appendChild(oSpan);
		oDiv.appendChild(this._detachFile());
		this.ListContainer.appendChild(oDiv);

		// new file
		this._attachFile();
	},
	_removeChildren:function(oForm){
		var oNode = this.ListContainer.lastChild, oChildNode, oTmp;
		while(oNode) {
			if (oNode.nodeType == Node.ELEMENT_NODE) {
				oChildNode = oNode.lastChild;
				while (oChildNode) {
					oTmp = oChildNode;
					oChildNode = oChildNode.previousSibling;
					oNode.removeChild(oTmp);
					if (oTmp.nodeType == Node.ELEMENT_NODE) {
						if (oTmp.className == 'tjs_files_remove_img') {
							tjs.event.removeListener(oTmp,'click',this._removeHandler_);
						} else if (oForm && oTmp.className == 'file') {
							oForm.addItem(oTmp);
						}
					}
				}
			}
			oTmp = oNode;
			oNode = oNode.previousSibling;
			this.ListContainer.removeChild(oTmp);
		}
	},
	moveToForm:function(oForm){
//tjs_debug_start
		tjs.lang.assert(oForm instanceof tjs.editor.Form,'!(oForm instanceof tjs.editor.Form) @'+this.classname+'.moveToForm');
//tjs_debug_end
		if (this.hasValue()) {
			this._removeChildren(oForm);
		}
	},
	isFile:function(){
		return true;
	},
	hasValue:function() {
		return this.ListContainer.hasChildNodes();
	}
});
