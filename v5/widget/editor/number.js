tjs.lang.defineClass('tjs.editor.Number',tjs.editor.Text,
function(obj) {
	tjs.editor.Text.call(this,obj);
},{
	_construct:function() {
		this._setBounds(this.oMap.remove('minValue'),this.oMap.remove('maxValue'));
		tjs.editor.Text.prototype._construct.call(this);
		tjs.dom.replaceClass(this.oElement,'tjs_text','tjs_number');
	},
	_setBounds:function(minValue,maxValue) {
		if (minValue != null && !tjs.lang.isNumber(minValue)) {
			minValue = null;
		}
		if (maxValue != null && !tjs.lang.isNumber(maxValue)) {
			maxValue = null;
		}
		if (minValue != null && maxValue != null) {
			tjs.lang.assert(minValue <= maxValue,'minValue > maxValue @'+this.classname+'.setBounds');
		}
		this.minValue = minValue;
		this.maxValue = maxValue;
	},
	setBounds:function(minValue,maxValue,fireEvent) {
		this._setBounds(minValue,maxValue);
		if (this.value) {
			var value = Number(this.value);
			if (this.minValue != null && value < this.minValue) {
				this.setValue(this.minValue,fireEvent);
			} else if (this.maxValue != null && value > this.maxValue) {
				this.setValue(this.maxValue,fireEvent);
			}
		}
	},
	_validate:function(value) {
		if (this.minValue != null && value < this.minValue) {
			value = this.minValue;
		} else if (this.maxValue != null && value > this.maxValue) {
			value = this.maxValue;
		}
		return value;
	},
	getValue:function(){
		return this.value ? Number(this.value) : null;
	},
	_writeValue:function(value) {
		value = tjs.lang.isNumber(value) ? String(this._validate(value)) : '';
		var changed = this.value != value;
		if (changed) {
			this.value = value;
			this.oText.value = value;
		}
		return changed;
	},
	_readValue:function() {//override
		var value = parseFloat(tjs.str.normalizeOneLine(this.oText.value));
		value = isFinite(value) ? String(this._validate(value)) : '';
		this.oText.value = value;
		var changed = this.value != value;
		if (changed) {
			this.value = value;
		}
		return changed;
	}
});

tjs.lang.defineClass('tjs.editor.Integer',tjs.editor.Number,
function(obj) {
	tjs.editor.Number.call(this,obj);
},{
	_construct:function() {
		tjs.editor.Number.prototype._construct.call(this);
		tjs.dom.replaceClass(this.oElement,'tjs_number','tjs_integer');
	},
	_writeValue:function(value) {
		value = tjs.lang.isNumber(value) ? String(this._validate(Math.round(value))) : '';
		var changed = this.value != value;
		if (changed) {
			this.value = value;
			this.oText.value = value;
		}
		return changed;
	},
	_readValue:function() {//override
		var value = parseInt(tjs.str.normalizeOneLine(this.oText.value));
		value = isFinite(value) ? String(this._validate(value)) : '';
		this.oText.value = value;
		var changed = this.value != value;
		if (changed) {
			this.value = value;
		}
		return changed;
	}
});

tjs.lang.defineClass('tjs.editor.Spinner',tjs.editor.Integer,
function(obj) {
	tjs.editor.Integer.call(this,obj);
},{
	_destroy :function() {
		if (this.oAreas) {
			var tjs_event = tjs.event;
			var i = this.oAreas.length;
			while (i--) {
				tjs_event.removeListener(this.oAreas[i],'click',this.clickHandler);
				this.oAreas[i] = null;
			}
			this.oAreas.length = 0;
		}
		tjs.editor.Integer.prototype._destroy.call(this);
	},
	_construct:function() {
		tjs.editor.Integer.prototype._construct.call(this);
		tjs.dom.replaceClass(this.oElement,'tjs_integer','tjs_spinner');

		var mapId = 'spinner_map_' + (this.oText.name ? this.oText.name : Math.random());

		this.oImg = document.createElement('img');
		this.oImg.className = 'tjs_img_btn tjs_img_btn_spinner';
		this.oImg.style.cursor = 'pointer';
		this.oImg.src = tjs.config.get('srcSpacer');
		this.oImg.useMap = '#spinner_map_'+mapId;
		tjs.dom.insertAfter(this.oImg,this.oText);

		this.oAreaMap = document.createElement('map');
		this.oAreaMap.id = 'spinner_map_'+mapId;
		this.oAreaMap.name = 'spinner_map_'+mapId;
		tjs.dom.insertAfter(this.oAreaMap,this.oImg);
		if (tjs.bom.isIE) {
			window.setTimeout(this._resize.bind(this),100);//fix IE bug
		} else {
			this,this._resize();
		}
	},
	_resize:function(){
		var w = tjs.css.getContentBoxWidth(this.oImg);
		var h = tjs.css.getContentBoxHeight(this.oImg);
		h = Math.floor(h/2);
		var x1 = 0;
		var x2 = w - 1;
		var tjs_event = tjs.event,oArea;
		this.clickHandler = this._clickHandler.bindAsEventListener(this);
		this.oAreas = [];
		for (var j = 0; j < 2; j++) {
			var y1 = j * h;
			var y2 = y1 + h - 1;
			oArea = document.createElement('area');
			oArea.shape = 'rect';
			oArea.coords = x1+','+y1+','+x2+','+y2;
			tjs_event.addListener(oArea,'click',this.clickHandler);
			this.oAreaMap.appendChild(oArea);
			this.oAreas.push(oArea);
		}
		this.oAreas[0].title = '+1';
		this.oAreas[1].title = '-1';
	},
	_clickHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		if (this.value) {
			var oArea = oEvent.target || oEvent.srcElement;
			this.oText.value = String(Number(this.value) + Number(oArea.title));
			this._stateChanged();
		}
	}
});
