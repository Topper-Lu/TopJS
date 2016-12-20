tjs.lang.defineClass('tjs.widget.Dialog',tjs.widget.Pane,
function(obj) {
	tjs.widget.Pane.call(this,obj);
},{
	_paneBits:3,
	_paneType:'tjs_dialog',
	_checkAll:function(){
		tjs.widget.Pane.prototype._checkAll.call(this);
		// oTitleBar
		var caption = this.oMap.get('caption');
		if (!tjs.lang.isString(caption)) {
			this.oMap.put('caption','Dialog');
		}
		var iconCmds = this.oMap.get('iconCmds');
		if (!tjs.lang.isArray(iconCmds)) {
			this.oMap.put('iconCmds',['close']);
		} else if (iconCmds.indexOf('close') < 0) {
			iconCmds.push('close');
		}
		// movable
		var movable = this.oMap.get('movable');
		if (!tjs.lang.isObject(movable)) {
			this.oMap.put('movable',{noProxy:true});
		}
	},
	_construct:function() {
		var dialogManager = tjs.html.dialogManager;
		var p = dialogManager.getContainer();
		var o = this.oElement;
		if (!o) {
			this.oMap.put('oParent',p);
		} else if (!o.parentNode) {
			p.appendChild(o);
		} else if (o.parentNode != p) {
			o.parentNode.removeChild(o);
			p.appendChild(o);
		}
		tjs.widget.Pane.prototype._construct.call(this);//
		dialogManager._addDialog(this);

		this.addHandler('close',this._closeHandler.bind(this));

		this.isMasked = false;
		this.isOn = false;

		var contW = this.oMap.remove('contW');
		var contH = this.oMap.remove('contH');
		if (tjs.lang.isNumber(contW) && contW > 0 && tjs.lang.isNumber(contH) && contH > 0) {
			this.setContentSize(contW,contH);// init layout
		}
	},
	finalize:function() {
		tjs.html.dialogManager._destroyDialog(this);
	},
	_setGeoBounds:function() {// layout
		var w0 = tjs.html.dialogManager.getContainerWidth();
		var h0 = tjs.html.dialogManager.getContainerHeight();
		var w = this.oElement.offsetWidth;
		var h = this.oElement.offsetHeight;
		var x,y;
		if (this.isResizable() && !this.noLayout) {
			var minW = this.oResizable.getMinW();
			var minH = this.oResizable.getMinH();
			var w1,h1;
			if (minW < w0) {
				w1 =  tjs.lang.boundedValue(w,minW,w0);
				x = Math.floor((w0 - w1)/2);
			} else {
				w1 = minW;
				x = 0;
			}
			if (minH < h0) {
				h1 =  tjs.lang.boundedValue(h,minH,h0);
				y = Math.floor((h0 - h1)/2);
			} else {
				h1 = minH;
				y = 0;
			}
			if (w1 != w || h1 != h) {
				this.setSize(w1,h1);//
			}
		} else {
			x = w < w0 ? Math.floor((w0 - w)/2) : 0;
			y = h < h0 ? Math.floor((h0 - h)/2) : 0;
		}
		var oStyle = this.oElement.style;
		oStyle.left = x+'px';
		oStyle.top = y+'px';
	},
	_closeHandler:function(source,type){
		this.hide();
	},
	show:function(oTriggerElement) {
		if (!this.isOn) {
			this.isOn = true;
			if (oTriggerElement) {
				this.oMap.put('oTriggerElement',oTriggerElement);
			}
			tjs.html.dialogManager.showDialog(this,oTriggerElement);
		}
	},
	hide:function() {
		if (this.isOn) {
			this.isOn = false;
			tjs.html.dialogManager.hideDialog(this,this.oMap.remove('oTriggerElement'));
		}
	},
	// called by tjs.html.dialogManager when show or hide another dialog
	setMasked:function(masked) {
		masked = Boolean(masked);
		if (this.isMasked != masked) {
			this.isMasked = masked;
			if (masked) {
				if (tjs.bom.isIE6) {
					tjs.dom.addClass(this.oElement,'masked');
				}
				if (!this.oMask) {
					this.oMask = this._createMask('#000',0.05);
				}
				this.oElement.appendChild(this.oMask);
			} else {
				this.oElement.removeChild(this.oMask);
				if (tjs.bom.isIE6) {
					tjs.dom.removeClass(this.oElement,'masked');
				}
			}
		}
	},
	_createMask:function(bgColor,opacity) {
		if (bgColor == null) {
			bgColor = tjs.widget.MASK.bgColor;
		}
		if (opacity == null) {
			opacity = tjs.widget.MASK.opacity;
		}

		var oMask = document.createElement('div');
		var oStyle = oMask.style;
		oStyle.cssText = 'margin:0;padding:0;border:0 none;position:absolute;left:0;top:0;width:100%;height:100%;';
		oStyle.zIndex = tjs.widget.MASK.zIndex;
		oStyle.backgroundColor = bgColor;
		if (tjs.bom.isIE) {
			oStyle.filter = 'alpha(opacity='+Math.round(opacity*100)+')';
		} else {
			oStyle.opacity = opacity;
		}
		return oMask;
	}
});
tjs.lang.extend(tjs.widget.Dialog,{
	checkConfig:function(oDialog,oDefault){
		if (!tjs.lang.isObject(oDialog)) {
			oDialog = {};
		}
		if (!tjs.lang.isObject(oDefault)) {
			oDefault = {};
		}
		if (!tjs.lang.isNumber(oDialog.contW) && tjs.lang.isNumber(oDefault.contW)) {
			oDialog.contW = oDefault.contW;
		}
		if (!tjs.lang.isNumber(oDialog.contH) && tjs.lang.isNumber(oDefault.contH)) {
			oDialog.contH = oDefault.contH;
		}
		if (!tjs.lang.isObject(oDialog.resizable) && tjs.lang.isObject(oDefault.resizable)) {
			oDialog.resizable = oDefault.resizable;
		}
		if (!tjs.lang.isObject(oDialog.content)) {
			oDialog.content = tjs.lang.isObject(oDefault.content) ? oDefault.content : {cls:'padding_2 overflow_hidden'};
		}
		if (!oDialog.caption || !tjs.lang.isString(oDialog.caption)) {
			if (oDefault.caption && tjs.lang.isString(oDefault.caption)) {
				oDialog.caption = oDefault.caption;
			}
		}
		if (!tjs.lang.isArray(oDialog.iconCmds) && tjs.lang.isArray(oDefault.iconCmds)) {
			oDialog.iconCmds = oDefault.iconCmds;
		}
		if (!tjs.lang.isArray(oDialog.textCmds) && tjs.lang.isArray(oDefault.textCmds)) {
			oDialog.textCmds = oDefault.textCmds;
		}
		return oDialog;
	}
});
