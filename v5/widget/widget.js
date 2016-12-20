tjs.widget = {
	hvMap:{h:'h',v:'v'},
	posMap:{n:'n',s:'s',w:'w',e:'e'},
	alignMap:{l:'text_align_left',c:'text_align_center',r:'text_align_right',j:'text_align_justify'},
	applyStyle:function(oElement,cls,style){
		if (tjs.lang.isString(cls) && cls != '') {
			tjs.dom.addClasses(oElement,cls);
		}
		if (tjs.lang.isString(style) && style != '') {
			oElement.style.cssText = style;
		}
	},
	createContainer:function(o,tagName){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isObject(o),'tjs.lang.isObject(o) @'+this.classname+'.createContainer');
//tjs_debug_end
		if (!tagName || !tjs.lang.isString(tagName)) {
			tagName = 'div';
		}
		var oElement = tjs.dom.isElement(o.oElement) ? o.oElement : document.createElement(tagName);
		this.applyStyle(oElement,o.cls,o.style);
		return oElement;
	},
	// layout type
	LAYOUT_NONE:0,
	LAYOUT_ROOT:1,
	LAYOUT_TREE:2,
	// dialog event type
	BEFORE_SHOW:'BEFORE_SHOW',
	AFTER_SHOW:'AFTER_SHOW',
	BEFORE_HIDE:'BEFORE_HIDE',
	AFTER_HIDE:'AFTER_HIDE',
	// list event type
	SHOW_ITEM:'SHOW_ITEM',
	HIDE_ITEM:'HIDE_ITEM',
	DISABLE_ITEM:'DISABLE_ITEM',
	ENABLE_ITEM:'ENABLE_ITEM',
	DISABLE_WIDGET:'DISABLE_WIDGET',
	ENABLE_WIDGET:'ENABLE_WIDGET',
	// grid event type
	SHOW_COLUMN:'SHOW_COLUMN',
	HIDE_COLUMN:'HIDE_COLUMN',
	BEFORE_COLUMN_MOVE:'BEFORE_COLUMN_MOVE',
	AFTER_COLUMN_MOVE:'AFTER_COLUMN_MOVE',
	// others
	HV_CHANGED:'HV_CHANGED',
	POS_CHANGED:'POS_CHANGED',
	MASK: {
		bgColor: '#ccc',
		opacity: 0.5,
		zIndex: 10000
	},
	classname:'tjs.widget'
};

tjs.lang.defineTopClass('tjs.widget.clsWidget',
function() {
},{
	_clsId:'00',
	_checkClsId:function() {
		var clsId = this.oMap.remove('clsId');
		if (tjs.lang.isString(clsId) && clsId) {
			this._clsId = clsId;
		}
	}
});

tjs.lang.defineTopClass('tjs.widget.hvWidget',
function() {
},{
	_hv:'v',
	_checkHV:function() {
		var hv = this.oMap.remove('hv');
		if (hv in tjs.widget.hvMap) {
			this._hv = hv;
		}
	}
});

tjs.lang.defineTopClass('tjs.widget.posWidget',
function() {
},{
	_pos:'n',
	_checkPos:function() {
		var pos = this.oMap.remove('pos');
		if (pos in tjs.widget.posMap) {
			this._pos = pos;
		}
	},
	setPos:function(pos,noLayout) {
		if (tjs.lang.isString(pos) && (pos in tjs.widget.posMap) && pos != this._pos) {
			this._onPosChanged(this._pos,pos);
			this._pos = pos;
			if (!noLayout) {
				tjs.html.evalLayouts(this.oElement);
			}
		}
	},
	_onPosChanged:function(posOld,posNew){
		// no layout here
	}
});

tjs.lang.defineTopClass('tjs.widget.alignWidget',
function() {
},{
	_align:'l',
	_checkAlign:function(){
		var align = this.oMap.remove('align');
		if (tjs.lang.isString(align) && (align in tjs.widget.alignMap)) {
			this._align = align;
		}
	},
	getAlignCls:function(){
		return tjs.widget.alignMap[this._align];
	}
});

tjs.lang.defineTopClass('tjs.widget.movableWidget',
function() {
},{
	_createMovable:function(oHandles) {
		var movable = this.oMap.remove('movable');
		if (tjs.lang.isObject(movable)) {
			movable.oDragElement = this.oElement;
			if (tjs.lang.isArray(oHandles)) {
				movable.oHandles = oHandles;
			}
			this.oMovable = new tjs.dnd.Movable(movable);
		}
	},
	_destroyMovable:function() {
		if (this.oMovable) {
			this.oMovable.destroy();
		}
	},
	isMovable:function() {
		return Boolean(this.oMovable);
	}
});

tjs.lang.defineTopClass('tjs.widget.resizableWidget',
function() {
},{
	_createResizable:function() {
		var resizable = this.oMap.remove('resizable');
		if (tjs.lang.isObject(resizable)) {
			resizable.oDragElement = this.oElement;
			this.oResizable = new tjs.dnd.Resizable(resizable);
			this.oResizable.setResizeHandler(this._resizeHandler.bind(this));
		}
	},
	_destroyResizable:function() {
		if (this.oResizable) {
			this.oResizable.destroy();
		}
	},
	_resizeHandler:function(oResizeManager) {
		tjs.html.evalLayouts(this.oElement);
	},
	isResizable:function() {
		return Boolean(this.oResizable);
	}
});

tjs.lang.defineClass('tjs.widget.Widget',tjs.util.Trigger,
function(o) {
	this.oMap = tjs.util.toMap(o);
	this.construct();
},{
	construct:function(){
		this.oElement = this.oMap.remove('oElement');
//tjs_debug_start
		if (this.oElement) {
			tjs.lang.assert(tjs.dom.isElement(this.oElement),'!tjs.dom.isElement(this.oElement) @'+this.classname);
			tjs.lang.assert(tjs.dom.inDocument(this.oElement),'!tjs.dom.inDocument(this.oElement) @'+this.classname);
		}
//tjs_debug_end
		tjs.util.Trigger.initInstance(this);
		this._checkHandlers();
		this._checkAll();
		this._construct();
		this.oElement.oWidget = this;
	},
	destroy:function(){
		if (this.oMap) {
			if (tjs.bom.isIE) {
				this.oElement.oWidget = null;
			} else {
				delete this.oElement.oWidget;
			}
			this._destroy();
			tjs.util.Trigger.destroyInstance(this);
			if (this.oElement.hasChildNodes()) {
				this.oElement.innerHTML = '';
			}
			this.oMap.destroy();
			delete this.oMap;
			tjs.lang.destroyObject(this);
		}
	},
	autoDestroy:true,
	getElement:function(){
		return this.oElement;
	},
	_checkHandlers:function() {
		var o;
		var oHandlers = this.oMap.remove('oHandlers');
		if (tjs.lang.isArray(oHandlers) && oHandlers.length > 0) {
			for (var i = 0, isize = oHandlers.length > 0; i < isize; i++) {
				o = oHandlers[i];
				oHandlers[i] = null;
				if (o.t && o.f) {
					this.addHandler(o.t,o.f);
				}
			}
		}
		var oHandler = this.oMap.remove('oHandler');
		if (tjs.lang.isObject(oHandler)) {
			o = oHandler;
			if (o.t && o.f) {
				this.addHandler(o.t,o.f);
			}
		}
	},
	// to be overrided
	_checkAll:function(){
	},
	_construct:function(){
	},
	_destroy:function(){
	},
	layout:function(){
	}
});

tjs.lang.defineClass('tjs.widget.LabeledContainer',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},{
	_construct:function() {
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'span',"tagName != 'span' @"+this.classname);
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
		tjs.dom.addClass(this.oElement,'tjs_labeled_container');

		this.oLabel = document.createTextNode('');
		var o = document.createElement('span');
		o.className = 'tjs_labeled_container_label';
		o.appendChild(this.oLabel);
		this.oElement.appendChild(o);

		this.oContent = document.createElement('span');
		this.oContent.className = 'tjs_labeled_container_content';
		this.oElement.appendChild(this.oContent);

		this.setLabel(this.oMap.remove('label'));
	},
	layout:function() {
		tjs.html.evalLayouts(this.oContent);
	},
	setLabel:function(label) {
		this.oLabel.nodeValue = tjs.str.toHTMLText(label);
	},
	getContent:function() {
		return this.oContent;
	}
});
