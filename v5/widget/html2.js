tjs.html.dialogManager = {
	init:function() {
		this.oProxy = document.createElement('div');
		this.oProxy.className = 'tjs_dlg_proxy';
		this.oProxy.style.visibility = 'hidden';

		this.oContainer = document.createElement('div');
		this.oContainer.setAttribute('id','tjs_dialog_container');
		this.oContainer.appendChild(this.oProxy);

		this.oMask = document.createElement('div');
		this.oMask.setAttribute('id','tjs_dialog_mask');

		this.oLayer = document.createElement('div');
		this.oLayer.setAttribute('id','tjs_dialog_layer');
		var os = this.oLayer.style;
		os.visibility = 'hidden';
		os.left = '-10000px';
		os.top = '-10000px';
		this.oLayer.appendChild(this.oMask);
		this.oLayer.appendChild(this.oContainer);
		document.body.appendChild(this.oLayer);

		this.oDialogs = [];
		this.oActiveDialogs = [];
	},
	destroy:function() {
		if (this.oLayer) {
			tjs.lang.destroyArray(this.oActiveDialogs);
			tjs.lang.destroyArray(this.oDialogs);
			tjs.html.destroyElementContent(this.oContainer);
			this.oLayer.innerHTML = '';
			tjs.lang.destroyObject(this);
		}
	},
	_addDialog:function(oDialog){
		this.oDialogs.push(oDialog);
		var os = oDialog.getElement().style;
		os.visibility = 'hidden';
		os.left = '-10000px';
		os.top = '-10000px';
	},
	_destroyDialog:function(oDialog) {
		var idx = this.oDialogs.indexOf(oDialog);
		if (idx > -1) {
			this.oDialogs.splice(idx,1);
			var oElement = oDialog.oElement;
			tjs.html.destroyElementContent(oElement);
			this.oContainer.removeChild(oElement);
		}
	},
	_checkOn:function(){
		if (this.oActiveDialogs.length == 0) {
			tjs.dom.addClass(tjs.html.getBodyWrapper(),'masked');//IE6 SELECT, Flash, Applet
			var os = this.oLayer.style;
			os.left = '0px';
			os.top = '0px';
			os.visibility = '';
		} else {
			this.oActiveDialogs[this.oActiveDialogs.length - 1].setMasked(true);//
		}
	},
	_checkOff:function(){
		if (this.oActiveDialogs.length == 0) {
			var os = this.oLayer.style;
			os.visibility = 'hidden';
			os.left = '-10000px';
			os.top = '-10000px';
			tjs.dom.removeClass(tjs.html.getBodyWrapper(),'masked');//IE6 SELECT, Flash, Applet
		} else {
			this.oActiveDialogs[this.oActiveDialogs.length - 1].setMasked(false);//
		}
	},
	_doAnimation:function(reverse,oTriggerElement) {
		if (!this.oAnimation) {
			var onStart = (function(actor,cnt,oAnimation){
				var oDialog = this.oActiveDialogs[this.oActiveDialogs.length - 1];
				var o,os,x0,x1,y0,y1,w0,w1,h0,h1;
				//
				o = oAnimation.oTriggerElement;
				if (o) {
					var pos = tjs.css.getPosition(o);
					x0 = pos.x;
					y0 = pos.y;
					w0 = o.offsetWidth;
					h0 = o.offsetHeight;
					pos.destroy();
				} else {
					x0 = Math.round(this.oContainer.offsetWidth/2);
					y0 = Math.round(this.oContainer.offsetHeight/2);
					w0 = 0;
					h0 = 0;
				}
				//
				o = oDialog.getElement();
				os = o.style;
				x1 = parseInt(os.left);
				y1 = parseInt(os.top);
				w1 = o.offsetWidth;
				h1 = o.offsetHeight;
				//
				actor.getHandler('left').setV01(x0,x1);
				actor.getHandler('top').setV01(y0,y1);
				actor.getHandler('width').setV01(w0,w1);
				actor.getHandler('height').setV01(h0,h1);
				//
				this.oProxy.style.visibility = '';
			}).bind(this);
			var onStop = (function(actor,cnt,oAnimation){
				this.oProxy.style.visibility = 'hidden';
				var oDialog;
				if (oAnimation.reverse) {
					oDialog = this.oActiveDialogs.pop();
					this._checkOff();
					oDialog.fire(tjs.widget.AFTER_HIDE);
				} else {
					oDialog = this.oActiveDialogs[this.oActiveDialogs.length - 1];
					oDialog.getElement().style.visibility = '';
					oDialog.fire(tjs.widget.AFTER_SHOW);
				}
			}).bind(this);
			this.oAnimation = new tjs.anim.Animation({fTiming:tjs.anim.timing.quartic.easeInOut,interval:50,frameCount:16});
			this.oAnimation.addActor(new tjs.anim.CssActor({oElement:this.oProxy,handlers:[{name:'left'},{name:'top'},{name:'width'},{name:'height'}],onStart:onStart,onStop:onStop}));
		}
		this.oAnimation.oTriggerElement = oTriggerElement;
		this.oAnimation.reverse = reverse;
		this.oAnimation.start();
	},
	showDialog:function(oDialog,oTriggerElement) {
		var idx = this.oDialogs.indexOf(oDialog);
		if (idx < 0) {
			return;
		}
		idx = this.oActiveDialogs.indexOf(oDialog);
		if (idx > -1) {
			return;
		}
		oDialog.fire(tjs.widget.BEFORE_SHOW);
		this._checkOn();
		this.oActiveDialogs.push(oDialog);
		var os = oDialog.getElement().style;
		os.zIndex = this.oActiveDialogs.length;
		oDialog._setGeoBounds();
		if (!tjs.config.get('tjs_anim_disabled')) {
			this._doAnimation(false,oTriggerElement);
		} else {
			os.visibility = '';
			oDialog.fire(tjs.widget.AFTER_SHOW);
		}
	},
	hideDialog:function(oDialog,oTriggerElement) {
		var len = this.oActiveDialogs.length;
		if (len == 0 || oDialog != this.oActiveDialogs[len - 1]) {
			return;
		}
		oDialog.fire(tjs.widget.BEFORE_HIDE);
		var os = oDialog.getElement().style;
		os.visibility = 'hidden';
		os.zIndex = 0;
		if (!tjs.config.get('tjs_anim_disabled')) {
			this._doAnimation(true,oTriggerElement);
		} else {
			this.oActiveDialogs.pop();
			this._checkOff();
			oDialog.fire(tjs.widget.AFTER_HIDE);
		}
	},
	layout:function() {
		tjs.html.evalLayouts(this.oContainer);
	},
	getContainer:function() {
		return this.oContainer;
	},
	getContainerWidth:function() {
		return this.oContainer.offsetWidth;
	},
	getContainerHeight:function() {
		return this.oContainer.offsetHeight;
	},
	classname:'tjs.html.dialogManager'
};

tjs.html.popupManager = {
	init:function() {
		this.oContainer = document.createElement('div');
		this.oContainer.setAttribute('id','tjs_popup_container');

		this.oMask = document.createElement('div');
		this.oMask.setAttribute('id','tjs_popup_mask');

		this.oLayer = document.createElement('div');
		this.oLayer.setAttribute('id','tjs_popup_layer');
		this.oLayer.style.visibility = 'hidden';
		this.oLayer.appendChild(this.oMask);
		this.oLayer.appendChild(this.oContainer);
		document.body.appendChild(this.oLayer);
		this.visible = false;
	},
	destroy:function() {
		if (this.oLayer) {
			this.oLayer.innerHTML = '';
			tjs.lang.destroyObject(this);
		}
	},
	setVisible:function(visible){
		visible = Boolean(visible);
		if (this.visible != visible) {
			this.visible = visible;
			if (visible) {
				tjs.dom.addClass(tjs.html.getBodyWrapper(),'masked');//IE6 SELECT, Flash, Applet
				tjs.dom.addClass(tjs.html.dialogManager.oContainer,'masked');//IE6 SELECT, Flash, Applet
				this.oLayer.style.visibility = 'visible';
			} else {
				this.oLayer.style.visibility = 'hidden';
				tjs.dom.removeClass(tjs.html.getBodyWrapper(),'masked');//IE6 SELECT, Flash, Applet
				tjs.dom.removeClass(tjs.html.dialogManager.oContainer,'masked');//IE6 SELECT, Flash, Applet
			}
		}
	},
	appendContent:function(oContent){
		this.oContainer.appendChild(oContent);
	},
	removeContent:function(){
		this.oContainer.innerHTML = '';
	},
	layout:function() {
		tjs.html.evalLayouts(this.oContainer);
	},
	getContainer:function(){
		return this.oContainer;
	},
	getContainerWidth:function(){
		return this.oContainer.offsetWidth;
	},
	getContainerHeight:function(){
		return this.oContainer.offsetHeight;
	},
	classname:'tjs.html.popupManager'
};
