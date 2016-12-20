tjs.lang.defineClass('tjs.editor.AutoSuggest',tjs.widget.Widget,
function(obj) {
	tjs.widget.Widget.call(this,obj);
},{
	_construct:function() {
		if (!this.oElement) {
			this.oElement = document.createElement('span');
			this.oMap.remove('oParent').appendChild(this.oElement);
//tjs_debug_start
		} else {
			var tagName = oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'span','tagName != "span" @'+this.classname+'._construct');
//tjs_debug_end
		}
		this.fClass = this.oMap.remove('fClass');
		this.url = this.oMap.remove('url');
		var fRenderer = this.oMap.remove('fRenderer');
		if (tjs.lang.isFunction(fRenderer)) {
			this.fRenderer = fRenderer;
		} else {
			this.fRenderer = this._defaultRenderer;
		}
		this.fetchDatas = this._fetchDatas.bind(this);
		this.fetchHandler = this._fetchHandler.bind(this);
		this.fetchParameters = this._createParameters();
		this.sIndicator = tjs.config.oResource.get('total_rows')+tjs.config.oResource.get('colon');
		this.currDatas = [];
		this.currDatas[0] = new tjs.editor.AutoSuggest.Data(this.sIndicator+0,null);

		this.oElement.appendChild(document.createTextNode(tjs.config.oResource.get('search')+tjs.config.oResource.get('colon')));

		this.oText = document.createElement('input');
		this.oText.type = 'text';
		this.oText.className = 'text';
		this.oText.value = '';
		this.oText.style.backgroundColor = '#fdd';
		var textWidth = this.oMap.remove('textWidth');
		if (tjs.lang.isNumber(textWidth)) {
			this.oText.style.width = textWidth+'px';
		} else {
			this.oText.style.width = '100px';
		}
		this.oElement.appendChild(this.oText);
		this.oTextKeyupListener = new tjs.event.Listener(this.oText,'keyup',this._textKeyupHandler.bindAsEventListener(this));
		this.oTextKeyupListener.attach();

		this.oSelect = document.createElement('select');
		this.oElement.appendChild(this.oSelect);
		var width = this.oMap.remove('width');
		if (tjs.lang.isNumber(width)) {
			this.oSelect.style.width = width+'px';
		} else {
			this.oSelect.style.width = '200px';
		}
		var name = this.oMap.remove('name');
		if (name) {
			this.oSelect.name = name;
			if (tjs.bom.isIE) {
				var oForm = this.oSelect.form;
				if (oForm && !oForm[name]) {
					oForm[name] = this.oSelect;
				}
			}
		}
		this.changeListener = new tjs.event.Listener(this.oSelect,'change',this._changeHandler.bindAsEventListener(this));
		this.changeListener.attach();

		this.value = this.oMap.remove('value') || null;
		if (this.value != null) {
			this._fetchData(this.value);
		} else {
			this.oSelect.selectedIndex = 0;
		}
	},
	_destroy:function() {
		var i = this.currDatas.length;
		while (i--) {
			this.currDatas[i].destroy();
			this.currDatas[i] = null;
		}
		this.currDatas.length = 0;
		delete this.currDatas;
		delete this.value;
		delete this.sIndicator;
		delete this.fetchParameters;
		delete this.fetchHandler;
		delete this.fetchDatas;
		this.changeListener.destroy();
		delete this.changeListener;
		this.oTextKeyupListener.destroy();
		delete this.oTextKeyupListener;
		this.oSelect.length = 0;
		delete this.oSelect;
		delete this.oText;
		delete this.fRenderer;
		delete this.url;
		delete this.fClass;
	},
	_createParameters:function() {
		var buf = [], k = 0;
		//buf[k++] = 'cmd=fetchDatas';
		//buf[k++] = 'databaseId='+encodeURIComponent(this.oMap.remove('databaseId'));
		//buf[k++] = 'tableId='+encodeURIComponent(this.oMap.remove('tableId'));
		buf[k++] = 'columnName='+encodeURIComponent(this.oMap.remove('columnName'));
		var maxNumber = this.oMap.remove('maxNumber');
		if (!maxNumber) {
			maxNumber = 40;
		}
		buf[k++] = 'maxNumber='+maxNumber;
		var defaultWhere = this.oMap.remove('defaultWhere');
		if (defaultWhere) {
			buf[k++] = 'defaultWhere='+encodeURIComponent(defaultWhere);
		}
		var fetchParameters = buf.join('&');
		buf.length = 0;
		return fetchParameters;
	},
	_textKeyupHandler :function(oEvent) {
		var text = this.oText.value;
		if (!text || text.charCodeAt(text.length - 1) == 0x3000) {
			return;
		}
		if (this.id4fetch) {
			window.clearTimeout(this.id4fetch);
			this.id4fetch = null;
		}
		this.id4fetch = window.setTimeout(this.fetchDatas,1000);
	},
	_fetchData:function(pk) {
		var content = this.fetchParameters;
		content += '&pk=' + encodeURIComponent(pk);
		tjs.net.httpPOST4Json(this.url,content,this.fetchHandler);
	},
	_fetchDatas:function() {
		this.id4fetch = null;
		var content = this.fetchParameters;
		content += '&text=' + encodeURIComponent(this.oText.value);
		tjs.net.httpPOST4Json(this.url,content,this.fetchHandler);
	},
	_fetchHandler:function(response) {
		this._clearDatas();
		if (response.result) {
			this.currDatas[0].caption = this.sIndicator+response.count;
			if (response.count > 0 && response.datas) {
				var datas = response.datas;
				for (var i = 0, isize = datas.length; i < isize; i++) {
					datas[i] = new this.fClass(datas[i]);
					this.currDatas[this.currDatas.length] = new tjs.editor.AutoSuggest.Data(this.fRenderer(datas[i]),datas[i]);
				}
			}
		} else if (response.message) {
			this.currDatas[0].caption = this.sIndicator+0;
			alert(response.message);
		} else {
			this.currDatas[0].caption = this.sIndicator+0;
		}
		this._restDatas();
	},
	_clearDatas:function() {
		for (i = this.currDatas.length - 1; i > 0; i--) {
			this.currDatas[i].destroy();
			this.currDatas[i] = null;
		}
		this.currDatas.length = 1;
	},
	_restDatas:function() {
		var rows = this.currDatas.length;
		var i = this.oSelect.options.length;
		var j = Math.min(i,rows);
		var row,oOption;
		for (row = 0; row < j; row++) {
			oOption = this.oSelect.options[row];
			oOption.value = this.currDatas[row].getKey();
			oOption.innerHTML = tjs.str.escapeXML(this.currDatas[row].toString());
		}
		if (i > rows) {
			this.oSelect.length = rows;
		} else if (i < rows) {
			for (row = i; row < rows; row++) {
				oOption = document.createElement('option');
				this.oSelect.appendChild(oOption);
				oOption.value = this.currDatas[row].getKey();
				oOption.innerHTML = tjs.str.escapeXML(this.currDatas[row].toString());
			}
		}

		var idx = 0;
		if (this.value != null) {
			for (var k = 1; k < rows; k++) {
				if (this.value == this.currDatas[k].getKey()) {
					idx = k;
					break;
				}
			}
		}
		this.oSelect.selectedIndex = idx;
		if (idx <= 0) {
			if (this.value != null) {
				this.value = null;
				this.fire(tjs.data.VALUE_CHANGED);
			}
		} else {
			this.oText.value = this.currDatas[idx].data.toString();
		}
	},
	_defaultRenderer:function(data) {
		return data ? data.toString() : '';
	},
	_changeHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		var data = this.currDatas[this.oSelect.selectedIndex].data;
		this.value = data ? data.getKey() : null;
		this.oText.value = data ? data.toString() : '';
		this.fire(tjs.data.VALUE_CHANGED);
	},
	getName:function() {
		return this.oSelect.name;
	},
	setValue:function(value,fireEvent) {
		fireEvent = fireEvent && this.value != value;
		this.value = value;
		if (this.value != null) {
			this._fetchData(this.value);
		} else {
			this._clearDatas();
			this.oSelect.selectedIndex = 0;
			this.oText.value = '';
		}
		if (fireEvent) {
			this.fire(tjs.data.VALUE_CHANGED);
		}
	},
	getValue:function() {
		return this.oSelect.selectedIndex > 0 ? this.currDatas[this.oSelect.selectedIndex].data.getKey() : null;
	},
	hasValue:function() {
		return this.oSelect.selectedIndex > 0;
	},
	getTextValue:function() {
		return this.oSelect.selectedIndex > 0 ? this.currDatas[this.oSelect.selectedIndex].data.toString() : '';
	},
	getSelectedData:function() {
		return this.oSelect.selectedIndex > 0 ? this.currDatas[this.oSelect.selectedIndex].data : null;
	}
});

tjs.lang.defineClass('tjs.editor.AutoSuggest.Data',tjs.data.KeyedObject,
function(caption,data) {
	this.caption = caption || null;
	this.data = data || null;
},{
	getKey:function() {
		return this.data ? this.data.getKey() : null;
	},
	toString:function() {
		return this.caption || '';
	}
});
