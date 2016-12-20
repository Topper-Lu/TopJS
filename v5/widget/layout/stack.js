tjs.lang.defineClass('tjs.widget.StackLayout',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},{
	_checkAll:function(){
		this.doAnim = Boolean(this.oMap.remove('doAnim')) && !tjs.config.get('tjs_anim_disabled');
	},
	_construct:function() {
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'div','tagName != "div" @'+this.classname);
//tjs_debug_end
			if (this.oElement.hasChildNodes()) {
				this.oElement.innerHTML = '';
			}
			var oCS = tjs.css.getComputedStyle(this.oElement);
			var oS = this.oElement.style;
			if (oCS.position == 'static') {
				oS.position = 'relative';
				oS.left = '0px';
				oS.top = '0px';
			}
			if (oCS.overflow != 'hidden') {
				oS.overflow = 'hidden';
			}
		} else {
			this.oElement = document.createElement('div');
			this.oElement.className = 'pos_rel overflow_hidden';
			var oParent = this.oMap.remove('oParent');
			if (tjs.dom.isElement(oParent)) {
				oParent.appendChild(this.oElement);
			}
		}

		this.oContainers = [];
		this.currIdx = -1;
		this.layouted = false;
		var aChildren = this.oMap.remove('aChildren');
		if (tjs.lang.isArray(aChildren) && aChildren.length > 0) {
			for (var i = 0, isize = aChildren.length; i < isize; i++) {
				this.addContainer(aChildren[i]);
				aChildren[i] = null;
			}
			aChildren.length = 0;
			this.currIdx = 0;
		}
	},
	_destroy:function() {
		if (this.oAnimation) {
			this.oAnimation.destroy();
		}
		tjs.lang.destroyArray(this.oContainers);
	},
	layout:function() {
		this.layouted = true;
		var tjs_css = tjs.css;
		this.w = tjs_css.getPaddingBoxWidth(this.oElement);
		this.h = tjs_css.getPaddingBoxHeight(this.oElement);
		var oContainer;
		for (var i = 0, isize = this.oContainers.length; i < isize; i++) {
			oContainer = this.oContainers[i];
			tjs_css.setOffsetDimension(oContainer,this.w,this.h);
			if (i == this.currIdx) {
				oContainer.style.top = '0px';
			} else {
				oContainer.style.top = -this.h+'px';
			}
			tjs.html.evalLayouts(oContainer);
		}
	},
	addContainer:function(o){
		var oContainer = tjs.widget.createContainer(o);
		tjs.dom.addClasses(oContainer,'pos_abs');
		var idx = this.oContainers.length;
		this.oContainers[idx] = oContainer;
		var oS = oContainer.style;
		oS.left = '0px';
		if (this.currIdx < 0) {
			this.currIdx = idx;
		}
		this.oElement.appendChild(oContainer);
		if (this.layouted) {
			tjs.css.setOffsetDimension(oContainer,this.w,this.h);
			oS.top = this.currIdx == idx ? '0px' : -this.h+'px';
			tjs.html.evalLayouts(oContainer);
		}
		if (o.url && tjs.lang.isString(o.url)) {
			tjs.html.loadElementContent(o.url,oContainer);
		}
		tjs.lang.destroyObject(o);
	},
	removeContainer:function(idx){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.getContainer');
		tjs.lang.assert(idx >= 0 && idx < this.oContainers.length,'idx is out of bounds @'+this.classname+'.getContainer');
//tjs_debug_end
		var a = this.oContainers.splice(idx,1);
		this.oElement.removeChild(a[0]);
		tjs.lang.destroyArray(a);
		if (this.currIdx == idx) {
			if (this.oContainers.length > 0) {
				this.currIdx = 0;
				var oS = this.oContainers[this.currIdx].style;
				oS.top = '0px';
			} else {
				this.currIdx = -1;
			}
		}
	},
	getContainer:function(idx){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.getContainer');
		tjs.lang.assert(idx >= 0 && idx < this.oContainers.length,'idx is out of bounds @'+this.classname+'.getContainer');
//tjs_debug_end
		return this.oContainers[idx];
	},
	_doAnimation:function(){
		if (!this.oAnimation) {
			var onStart = (function(actor,cnt,oAnimation){
				var oContainer;
				switch (cnt) {
				case 2:
					oContainer = this.oContainers[this.oldIdx];
					actor.setElement(oContainer);
					actor.getHandler('top').setV01(0,-this.h);
					break;
				case 1:
					delete this.oldIdx;
					oContainer = this.oContainers[this.currIdx];
					oContainer.scrollLeft = 0;
					oContainer.scrollTop = 0;
					actor.setElement(oContainer);
					break;
				}
			}).bind(this);
			this.oAnimation = new tjs.anim.Animation({fTiming:tjs.anim.timing.quartic.easeInOut,interval:50,frameCount:16,animationCount:2,alternate:true});
			this.oAnimation.addActor(new tjs.anim.CssActor({handlers:[{name:'top'}],onStart:onStart}));
		}
		this.oAnimation.start();
	},
	showContainer:function(idx){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.showContainer');
		tjs.lang.assert(idx > -1 && idx < this.oContainers.length,'idx is out of bounds @'+this.classname+'.showContainer');
//tjs_debug_end
		if (this.currIdx != idx) {
			if (this.layouted && this.doAnim) {
				this.oldIdx = this.currIdx;
				this.currIdx = idx;
				this._doAnimation();
			} else {
				var oContainer = this.oContainers[this.currIdx];
				oContainer.scrollLeft = 0;
				oContainer.scrollTop = 0;
				var oS = oContainer.style;
				oS.top = -this.h+'px';
				this.currIdx = idx;
				oContainer = this.oContainers[this.currIdx];
				oContainer.scrollLeft = 0;
				oContainer.scrollTop = 0;
				oS = oContainer.style;
				oS.top = '0px';
			}
		}
	}
});
