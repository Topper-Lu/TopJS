tjs.lang.defineClass('tjs.widget.ImgPopup',tjs.widget.Widget,
function(obj) {
	tjs.widget.Widget.call(this,obj);
},{
	_construct:function() {
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'div',"tagName != 'div' @"+this.classname);
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
		tjs.dom.addClass(this.oElement,'pos_rel');
		tjs.dom.addClass(this.oElement,'overflow_hidden');
		tjs.dom.addClass(this.oElement,'tjs_img_popup');

		var oThumb = this.oMap.get('oThumb');
		var oImg = this.oMap.get('oImg');
		var alt = this.oMap.remove('alt');
		var oStyle;

		this.oThumb = document.createElement('img');
		this.oThumb.className = 'cursor_pointer tjs_img_popup_thumb';
		this.oThumb.src = oThumb.url;
		this.oThumb.title = 'Click to magnify!';//
		if (alt && tjs.lang.isString(alt)) {
			this.oThumb.alt = alt;
		}
		oStyle = this.oThumb.style;
		oStyle.width = oThumb.width+'px';
		oStyle.height = oThumb.height+'px';
		this.oElement.appendChild(this.oThumb);
		this.oElement.style.width = this.oThumb.offsetWidth+'px';
		this.oElement.style.height = this.oThumb.offsetHeight+'px';

		var popupManager = tjs.html.popupManager;
		var w = Math.round(popupManager.getContainerWidth() * 0.8);
		var h = Math.round(popupManager.getContainerHeight() * 0.8);
		var ratio = 1, ratioTmp;
		if (oImg.width > w) {
			ratioTmp = w/oImg.width;
			if (ratioTmp < ratio) {
				ratio = ratioTmp;
			}
		}
		if (oImg.height > h) {
			ratioTmp = h/oImg.height;
			if (ratioTmp < ratio) {
				ratio = ratioTmp;
			}
		}
		if (ratio < 1) {
			oImg.width = Math.round(oImg.width * ratio);
			oImg.height = Math.round(oImg.height * ratio);
		}

		this.oImg = document.createElement('img');
		this.oImg.className = 'pos_abs pos_tl cursor_pointer tjs_img_popup_img';
		this.oImg.src = oImg.url;
		this.oImg.title = 'Click to close!';
		if (alt && tjs.lang.isString(alt)) {
			this.oImg.alt = alt;
		}
		oStyle = this.oImg.style;
		oStyle.width = oImg.width+'px';
		oStyle.height = oImg.height+'px';
		popupManager.appendContent(this.oImg);
		oImg.offsetWidth = this.oImg.offsetWidth;
		oImg.offsetHeight = this.oImg.offsetHeight;
		oStyle.width = oThumb.width+'px';
		oStyle.height = oThumb.height+'px';
		popupManager.removeContent();

		this.clickHandler = this._clickHandler.bindAsEventListener(this);
		tjs.event.addListener(this.oThumb,'click',this.clickHandler);
		tjs.event.addListener(this.oImg,'click',this.clickHandler);
	},
	_destroy:function() {
		tjs.event.removeListener(this.oImg,'click',this.clickHandler);
		tjs.event.removeListener(this.oThumb,'click',this.clickHandler);
		if (this.oAnimation) {
			this.oAnimation.destroy();
		}
	},
	_doAnimation:function(reverse) {
		if (!this.oAnimation) {
			var onStart = (function(actor,cnt,oAnimation){
				if (!oAnimation.reverse) {
					var popupManager = tjs.html.popupManager;
					var oImg = this.oMap.get('oImg');
					var xImg = Math.round((popupManager.getContainerWidth() - oImg.offsetWidth)/2);
					var yImg = Math.round((popupManager.getContainerHeight() - oImg.offsetHeight)/2);
					var pos = tjs.css.getPosition(this.oThumb);
					var xThumb = pos.x;
					var yThumb = pos.y;
					pos.destroy();
					var oStyle = this.oImg.style;
					oStyle.left = xThumb+'px';
					oStyle.top = yThumb+'px';
					actor.getHandler('left').setV01(xThumb,xImg);
					actor.getHandler('top').setV01(yThumb,yImg);
					popupManager.appendContent(this.oImg);
					popupManager.setVisible(true);
				}
			}).bind(this);
			var onStop = (function(actor,cnt,oAnimation){
				if (oAnimation.reverse) {
					var popupManager = tjs.html.popupManager;
					popupManager.setVisible(false);
					popupManager.removeContent();
				}
			}).bind(this);
			var oImg = this.oMap.get('oImg');
			var oThumb = this.oMap.get('oThumb');
			this.oAnimation = new tjs.anim.Animation({fTiming:tjs.anim.timing.quartic.easeInOut,interval:50,frameCount:16});
			this.oAnimation.addActor(new tjs.anim.CssActor({oElement:this.oImg,handlers:[{name:'left'},{name:'top'},{name:'width',v0:oThumb.width,v1:oImg.width},{name:'height',v0:oThumb.height,v1:oImg.height}],onStart:onStart,onStop:onStop}));
		}
		this.oAnimation.reverse = reverse;
		this.oAnimation.start();
	},
	_clickHandler:function(oEvent){
		var oTarget = oEvent.target || oEvent.srcElement;
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		if (oTarget == this.oThumb) {
			this._doAnimation(false);
		} else if (oTarget == this.oImg) {
			this._doAnimation(true);
		}
	}
});
