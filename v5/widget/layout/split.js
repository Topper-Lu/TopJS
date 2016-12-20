tjs.lang.defineClass('tjs.widget.SplitLayout',tjs.widget.Widget,
function(obj) {
	tjs.widget.Widget.call(this,obj);
},{
	_handleChildren:function(){
		var aChildren = this.oMap.remove('aChildren');
		if (aChildren) {
			var i = aChildren.length;
			while (i--) {
				oChild = aChildren[i];
				aChildren[i] = null;
				if (oChild.child_id == 'tl') {
					delete oChild.child_id;
					this.oMap.put('contentTL',oChild);
				} else if (oChild.child_id == 'br') {
					delete oChild.child_id;
					this.oMap.put('contentBR',oChild);
				} else {
					tjs.lang.destroyObject(oChild,true);
				}
			}
			aChildren.length = 0;
		}
	},
	_checkAll:function(){
		this._handleChildren();
	},
	_construct:function() {
		var splitType = this.oMap.get('splitType');
		if (splitType != 'TB') {
			splitType = 'LR';
			this.oMap.put('splitType',splitType);
		}
		var isH = splitType == 'LR';

		var ratio = this.oMap.get('ratio');
		if (ratio == null || !tjs.lang.isNumber(ratio)) {
			ratio = 0.5;
		} else {
			ratio = tjs.lang.boundedValue(ratio,0.2,0.8);
		}
		this.oMap.put('ratio',ratio);

		this.oImgTL = document.createElement('div');
		this.oImgTL.className = 'tjs_split_spliter_img img_toTL';
		this.oImgBR = document.createElement('div');
		this.oImgBR.className = 'tjs_split_spliter_img img_toBR';
		this.oSpliter = document.createElement('div');
		this.oSpliter.className = 'pos_rel overflow_hidden tjs_split_spliter tjs_split_spliter_'+splitType;
		this.oSpliter.appendChild(this.oImgTL);
		this.oSpliter.appendChild(this.oImgBR);

		var contentTL = this.oMap.remove('contentTL');
		if (!tjs.lang.isObject(contentTL)) {
			contentTL = {};
		}
		this.oContentTL = tjs.widget.createContainer(contentTL);

		var contentBR = this.oMap.remove('contentBR');
		if (!tjs.lang.isObject(contentBR)) {
			contentBR = {};
		}
		this.oContentBR = tjs.widget.createContainer(contentBR);

		this.oWrapperTL = document.createElement('div');
		this.oWrapperTL.className = 'pos_rel overflow_hidden';
		this.oWrapperTL.appendChild(this.oContentTL);

		this.oWrapperBR = document.createElement('div');
		this.oWrapperBR.className = 'pos_rel overflow_hidden';
		this.oWrapperBR.appendChild(this.oContentBR);

		if (isH) {
			tjs.dom.addClass(this.oWrapperTL,'float_left');
			tjs.dom.addClass(this.oSpliter,'float_left');
			tjs.dom.addClass(this.oWrapperBR,'float_left');
		}
		this.oWrapper = document.createElement('div');
		this.oWrapper.className = 'pos_rel overflow_hidden tjs_wrapper';
		this.oWrapper.appendChild(this.oWrapperTL);
		this.oWrapper.appendChild(this.oSpliter);
		this.oWrapper.appendChild(this.oWrapperBR);

		if (this.oElement) {
			if (this.oElement.hasChildNodes()) {
				this.oElement.innerHTML = '';
			}
			var oCS = tjs.css.getComputedStyle(this.oElement);
			if (oCS.overflow != 'auto') {
				this.oElement.style.overflow = 'auto';
			}
		} else {
			this.oElement = document.createElement('div');
			this.oElement.className = 'overflow_auto';
			var oParent = this.oMap.remove('oParent');
			if (tjs.dom.isElement(oParent)) {
				oParent.appendChild(this.oElement);
			}
		}
		this.oElement.appendChild(this.oWrapper);

		if (tjs.lang.isString(contentTL.url) && contentTL.url != '') {
			tjs.html.loadElementContent(contentTL.url,this.oContentTL);
		}
		if (tjs.lang.isString(contentBR.url) && contentBR.url != '') {
			tjs.html.loadElementContent(contentBR.url,this.oContentBR);
		}
		tjs.lang.destroyObject(contentTL);
		tjs.lang.destroyObject(contentBR);

		var tjs_event = tjs.event;
		this._clickImgTL_ = this._clickImgTL.bindAsEventListener(this);
		this._clickImgBR_ = this._clickImgBR.bindAsEventListener(this);
		tjs_event.addListener(this.oImgTL,'click',this._clickImgTL_);
		tjs_event.addListener(this.oImgBR,'click',this._clickImgBR_);

		this.oDraggable = new tjs.dnd.Draggable({oHandles:[this.oSpliter],dragCursor:(tjs.bom.isIE || tjs.bom.isGecko) ? (isH ? 'col-resize' : 'row-resize') : (isH ? 'e-resize' : 's-resize')});
		this.oDraggable.onDragStart = this._onDragStart.bind(this);
		this.oDraggable.onDrag = this._onDrag.bind(this);
		this.oDraggable.onDragEnd = this._onDragEnd.bind(this);
		this.state = 'normal';
	},
	_destroy:function() {
		tjs.event.removeListener(this.oImgTL,'click',this._clickImgTL_);
		tjs.event.removeListener(this.oImgBR,'click',this._clickImgBR_);
		this.oDraggable.destroy();
		var dragData = this.oMap.remove('dragData');
		if (dragData) {
			tjs.lang.destroyObject(dragData);
		}
		if (this.oAnimation) {
			this.oAnimation.destroy();
		}
	},
	_onDragStart:function(dndData){
		var dragData = this.oMap.get('dragData');
		if (!dragData) {
			dragData = {};
			this.oMap.put('dragData',dragData);
		}
		if (this.oMap.get('splitType') != 'TB') {
			dragData.x0 = this.oWrapperTL.offsetWidth;
			dragData.y0 = 0;
			var w = this.oWrapper.offsetWidth - this.oSpliter.offsetWidth;
			dragData.minX = Math.round(w*0.2);
			dragData.maxX = Math.round(w*0.8);
		} else {
			dragData.x0 = 0;
			dragData.y0 = this.oWrapperTL.offsetHeight;
			var h = this.oWrapper.offsetHeight - this.oSpliter.offsetHeight;
			dragData.minY = Math.round(h*0.2);
			dragData.maxY = Math.round(h*0.8);
		}
		dragData.x = dragData.x0;
		dragData.y = dragData.y0;
		var oDragProxy = tjs.dnd.oDragProxy;
		oDragProxy.setRegion(dragData.x0,dragData.y0,this.oSpliter.offsetWidth,this.oSpliter.offsetHeight);
		this.oWrapper.appendChild(oDragProxy.getElement());
	},
	_onDrag:function(dndData){
		var deltaX = dndData.x - dndData.startX;
		var deltaY = dndData.y - dndData.startY;
		var dragData = this.oMap.get('dragData');
		if (this.oMap.get('splitType') != 'TB') {
			dragData.x = tjs.lang.boundedValue(dragData.x0 + deltaX,dragData.minX,dragData.maxX);
		} else {
			dragData.y = tjs.lang.boundedValue(dragData.y0 + deltaY,dragData.minY,dragData.maxY);
		}
		tjs.dnd.oDragProxy.setPosition(dragData.x,dragData.y);
	},
	_onDragEnd:function(dndData){
		var deltaX = dndData.x - dndData.startX;
		var deltaY = dndData.y - dndData.startY;
		var dragData = this.oMap.get('dragData');
		if (this.oMap.get('splitType') != 'TB') {
			dragData.x = tjs.lang.boundedValue(dragData.x0 + deltaX,dragData.minX,dragData.maxX);
		} else {
			dragData.y = tjs.lang.boundedValue(dragData.y0 + deltaY,dragData.minY,dragData.maxY);
		}
		tjs.dnd.oDragProxy.recycle();
		this._moveSpliter(dragData.x,dragData.y);
	},
	_moveSpliter:function(w1,h1){
		var tjs_css = tjs.css;
		var ratioOld = this.oMap.get('ratio');
		var ratioNew;
		if (this.oMap.get('splitType') != 'TB') {
			var w0 = this.oMap.get('w0');
			ratioNew = w1/w0;
			this.oMap.put('ratio',ratioNew);
			if (ratioNew > ratioOld) {
				tjs_css.setOffsetWidth(this.oContentTL,w1);
				this.oWrapperTL.style.width = w1+'px';
				this.oWrapperBR.style.width = (w0 - w1)+'px';
				tjs_css.setOffsetWidth(this.oContentBR,w0 - w1);
			} else {
				tjs_css.setOffsetWidth(this.oContentBR,w0 - w1);
				this.oWrapperTL.style.width = w1+'px';
				this.oWrapperBR.style.width = (w0 - w1)+'px';
				tjs_css.setOffsetWidth(this.oContentTL,w1);
			}
		} else {
			var h0 = this.oMap.get('h0');
			ratioNew = h1/h0;
			this.oMap.put('ratio',ratioNew);
			if (ratioNew > ratioOld) {
				tjs_css.setOffsetHeight(this.oContentTL,h1);
				this.oWrapperTL.style.height = h1+'px';
				this.oWrapperBR.style.height = (h0 - h1)+'px';
				tjs_css.setOffsetHeight(this.oContentBR,h0 - h1);
			} else {
				tjs_css.setOffsetHeight(this.oContentBR,h0 - h1);
				this.oWrapperTL.style.height = h1+'px';
				this.oWrapperBR.style.height = (h0 - h1)+'px';
				tjs_css.setOffsetHeight(this.oContentTL,h1);
			}
		}
		tjs.html.evalLayouts(this.oContentTL);
		tjs.html.evalLayouts(this.oContentBR);
	},
	_moveToNormal:function(){
		var tjs_css = tjs.css;
		var ratio = this.oMap.get('ratio');
		if (this.oMap.get('splitType') != 'TB') {
			var w0 = this.oMap.get('w0');
			var w1 = Math.round(w0*ratio);
			tjs_css.setOffsetWidth(this.oContentTL,w1);
			tjs_css.setOffsetWidth(this.oContentBR,w0 - w1);
			this.oWrapperTL.style.width = w1+'px';
			this.oWrapperBR.style.width = (w0 - w1)+'px';
		} else {
			var h0 = this.oMap.get('h0');
			var h1 = Math.round(h0*ratio);
			tjs_css.setOffsetHeight(this.oContentTL,h1);
			tjs_css.setOffsetHeight(this.oContentBR,h0 - h1);
			this.oWrapperTL.style.height = h1+'px';
			this.oWrapperBR.style.height = (h0 - h1)+'px';
		}
		tjs.html.evalLayouts(this.oContentTL);
		tjs.html.evalLayouts(this.oContentBR);
		this.oDraggable.setEnabled(true);
	},
	_moveToHideTL:function(){
		this.oWrapperTL.style.display = 'none';
		if (this.oMap.get('splitType') != 'TB') {
			this.oWrapperBR.style.width = this.oMap.get('w0')+'px';
		} else {
			this.oWrapperBR.style.height = this.oMap.get('h0')+'px';
		}
	},
	_moveToHideBR:function(){
		this.oWrapperBR.style.display = 'none';
		if (this.oMap.get('splitType') != 'TB') {
			this.oWrapperTL.style.width = this.oMap.get('w0')+'px';
		} else {
			this.oWrapperTL.style.height = this.oMap.get('h0')+'px';
		}
	},
	_clickImgTL:function(oEvent) {
		var tjs_event = tjs.event;
		tjs_event.stopPropagation(oEvent);
		tjs_event.preventDefault(oEvent);
		if (this.state == 'hideBR') {
			this.oWrapperBR.style.display = 'block';
			if (this.oMap.get('splitType') != 'TB') {
				var h = parseInt(this.oWrapperTL.style.height);
				if (parseInt(this.oWrapperBR.style.height) != h) {
					this.oWrapperBR.style.height = h+'px';
					tjs.css.setOffsetHeight(this.oContentBR,h);
					tjs.html.evalLayouts(this.oContentBR);
				}
			} else {
				var w = parseInt(this.oWrapperTL.style.width);
				if (parseInt(this.oWrapperBR.style.width) != w) {
					this.oWrapperBR.style.width = w+'px';
					tjs.css.setOffsetWidth(this.oContentBR,w);
					tjs.html.evalLayouts(this.oContentBR);
				}
			}
			this.oImgBR.style.visibility = '';
			this.state = 'normal';
			if (!tjs.config.get('tjs_anim_disabled')) {
				this._animate(1,this.oMap.get('ratio'));
			} else {
				this._moveToNormal();
			}
		} else {
			this.oImgTL.style.visibility = 'hidden';
			this.oDraggable.setEnabled(false);
			if (this.oMap.get('splitType') != 'TB') {
				tjs.css.setOffsetWidth(this.oContentBR,this.oMap.get('w0'));
			} else {
				tjs.css.setOffsetHeight(this.oContentBR,this.oMap.get('h0'));
			}
			tjs.html.evalLayouts(this.oContentBR);
			this.state = 'hideTL';
			if (!tjs.config.get('tjs_anim_disabled')) {
				this._animate(this.oMap.get('ratio'),0);
			} else {
				this._moveToHideTL();
			}
		}
	},
	_clickImgBR:function(oEvent) {
		var tjs_event = tjs.event;
		tjs_event.stopPropagation(oEvent);
		tjs_event.preventDefault(oEvent);
		if (this.state == 'hideTL') {
			this.oWrapperTL.style.display = 'block';
			if (this.oMap.get('splitType') != 'TB') {
				var h = parseInt(this.oWrapperBR.style.height);
				if (parseInt(this.oWrapperTL.style.height) != h) {
					this.oWrapperTL.style.height = h+'px';
					tjs.css.setOffsetHeight(this.oContentTL,h);
					tjs.html.evalLayouts(this.oContentTL);
				}
			} else {
				var w = parseInt(this.oWrapperBR.style.width);
				if (parseInt(this.oWrapperTL.style.width) != w) {
					this.oWrapperTL.style.width = w+'px';
					tjs.css.setOffsetWidth(this.oContentTL,w);
					tjs.html.evalLayouts(this.oContentTL);
				}
			}
			this.oImgTL.style.visibility = '';
			this.state = 'normal';
			if (!tjs.config.get('tjs_anim_disabled')) {
				this._animate(0,this.oMap.get('ratio'));
			} else {
				this._moveToNormal();
			}
		} else {
			this.oImgBR.style.visibility = 'hidden';
			this.oDraggable.setEnabled(false);
			if (this.oMap.get('splitType') != 'TB') {
				tjs.css.setOffsetWidth(this.oContentTL,this.oMap.get('w0'));
			} else {
				tjs.css.setOffsetHeight(this.oContentTL,this.oMap.get('h0'));
			}
			tjs.html.evalLayouts(this.oContentTL);
			this.state = 'hideBR';
			if (!tjs.config.get('tjs_anim_disabled')) {
				this._animate(this.oMap.get('ratio'),1);
			} else {
				this._moveToHideBR();
			}
		}
	},
	_onAnimateStop:function(source,type){
		switch (this.state) {
		case 'hideTL':
			this._moveToHideTL();
			break;
		case 'hideBR':
			this._moveToHideBR();
			break;
		case 'normal':
			this._moveToNormal();
			break;
		}
	},
	_animate:function(r0,r1){
		var isH = this.oMap.get('splitType') != 'TB';
		if (!this.oAnimation) {
			var tjs_anim = tjs.anim;
			var actorTL = new tjs_anim.CssActor({oElement:this.oWrapperTL});
			var actorBR = new tjs_anim.CssActor({oElement:this.oWrapperBR});
			if (isH) {
				actorTL.addHandler(tjs_anim.createHandler({name:'width'}));
				actorBR.addHandler(tjs_anim.createHandler({name:'width'}));
			} else {
				actorTL.addHandler(tjs_anim.createHandler({name:'height'}));
				actorBR.addHandler(tjs_anim.createHandler({name:'height'}));
			}
			this.oAnimation = new tjs_anim.Animation({fTiming:tjs_anim.timing.quartic.easeInOut,interval:50,frameCount:20});
			this.oAnimation.addActor(actorTL);
			this.oAnimation.addActor(actorBR);
			this.oAnimation.addHandler(tjs_anim.ANIMATE_STOP,this._onAnimateStop.bind(this));
		}
		var v0,v1;
		if (isH) {
			var w0 = this.oMap.get('w0');
			v0 = Math.round(w0*r0);
			v1 = Math.round(w0*r1);
			this.oAnimation.getActor(0).getHandler('width').setV01(v0,v1);
			this.oAnimation.getActor(1).getHandler('width').setV01(w0-v0,w0-v1);
		} else {
			var h0 = this.oMap.get('h0');
			v0 = Math.round(h0*r0);
			v1 = Math.round(h0*r1);
			this.oAnimation.getActor(0).getHandler('height').setV01(v0,v1);
			this.oAnimation.getActor(1).getHandler('height').setV01(h0-v0,h0-v1);
		}
		this.oAnimation.start();
	},
	layout:function() {
		var tjs_css = tjs.css;
		this.oElement.style.overflow = 'hidden';
		var w = tjs.css.getContentBoxWidth(this.oElement);
		var h = tjs.css.getContentBoxHeight(this.oElement);
		this.oWrapper.style.width = w+'px';
		this.oWrapper.style.height = h+'px';
		this.oElement.style.overflow = '';
		if (this.oMap.get('splitType') != 'TB') {
			tjs_css.setOffsetHeight(this.oSpliter,h);
			var w0 = w - this.oSpliter.offsetWidth;
			this.oMap.put('w0',w0);
			switch (this.state) {
				case 'normal':
					var w1 = Math.round(this.oMap.get('ratio')*w0);
					this.oWrapperTL.style.width = w1+'px';
					this.oWrapperTL.style.height = h+'px';
					this.oWrapperBR.style.width = (w0 - w1)+'px';
					this.oWrapperBR.style.height = h+'px';
					tjs_css.setOffsetDimension(this.oContentTL,w1,h);
					tjs_css.setOffsetDimension(this.oContentBR,w0 - w1,h);
					tjs.html.evalLayouts(this.oContentTL);
					tjs.html.evalLayouts(this.oContentBR);
					break;
				case 'hideTL':
					this.oWrapperBR.style.width = w0+'px';
					this.oWrapperBR.style.height = h+'px';
					tjs_css.setOffsetDimension(this.oContentBR,w0,h);
					tjs.html.evalLayouts(this.oContentBR);
					break;
				case 'hideBR':
					this.oWrapperTL.style.width = w0+'px';
					this.oWrapperTL.style.height = h+'px';
					tjs_css.setOffsetDimension(this.oContentTL,w0,h);
					tjs.html.evalLayouts(this.oContentTL);
					break;
			}
		} else {
			tjs_css.setOffsetWidth(this.oSpliter,w);
			var h0 = h - this.oSpliter.offsetHeight;
			this.oMap.put('h0',h0);
			switch (this.state) {
				case 'normal':
					var h1 = Math.round(this.oMap.get('ratio')*h0);
					this.oWrapperTL.style.width = w+'px';
					this.oWrapperTL.style.height = h1+'px';
					this.oWrapperBR.style.width = w+'px';
					this.oWrapperBR.style.height = (h0 - h1)+'px';
					tjs_css.setOffsetDimension(this.oContentTL,w,h1);
					tjs_css.setOffsetDimension(this.oContentBR,w,h0 - h1);
					tjs.html.evalLayouts(this.oContentTL);
					tjs.html.evalLayouts(this.oContentBR);
					break;
				case 'hideTL':
					this.oWrapperBR.style.width = w+'px';
					this.oWrapperBR.style.height = h0+'px';
					tjs_css.setOffsetDimension(this.oContentBR,w,h0);
					tjs.html.evalLayouts(this.oContentBR);
					break;
				case 'hideBR':
					this.oWrapperTL.style.width = w+'px';
					this.oWrapperTL.style.height = h0+'px';
					tjs_css.setOffsetDimension(this.oContentTL,w,h0);
					tjs.html.evalLayouts(this.oContentTL);
					break;
			}
		}
	}
});
