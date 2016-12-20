tjs.lang.defineClass('tjs.widget.Pane',tjs.widget.Widget,
function(obj) {
	tjs.widget.Widget.call(this,obj);
},tjs.widget.clsWidget,tjs.widget.alignWidget,tjs.widget.movableWidget,tjs.widget.resizableWidget,{
	_handleChildren:function(){
		var aChildren = this.oMap.remove('aChildren');
		if (aChildren) {
			this.oMap.put('content',aChildren.shift());
			tjs.lang.destroyArray(aChildren,true);
		}
	},
	_align:'c',
	TITLEBAR:1,
	CMDBAR:2,
	_paneBits:0,
	_checkPaneBits:function() {
		var paneBits = this.getPaneBits();
		if (!tjs.lang.isNumber(paneBits) || paneBits < 0) {
			this.oMap.put('paneBits',this._paneBits);
		}
	},
	getPaneBits:function(){
		return this.oMap.get('paneBits');
	},
	_paneType:'tjs_pane',
	_checkPaneType:function() {
		var paneType = this.getPaneType();
		if (!tjs.lang.isString(paneType) || paneType == '') {
			this.oMap.put('paneType',this._paneType);
		}
	},
	getPaneType:function(){
		return this.oMap.get('paneType');
	},
	_checkAll:function(){
		this._handleChildren();
		this._checkClsId();
		this._checkAlign();
		this._checkPaneBits();
		this._checkPaneType();
	},
	_construct:function() {
		var oFragment;
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'div','tagName != "div" @'+this.classname);
//tjs_debug_end
			if (this.oElement.hasChildNodes()) {
				oFragment = document.createDocumentFragment();
				tjs.dom.moveChildren(this.oElement,oFragment);
			}
		} else {
			this.oElement = document.createElement('div');
			tjs.widget.applyStyle(this.oElement,this.oMap.remove('cls'),this.oMap.remove('style'));
			var oParent = this.oMap.remove('oParent');
			if (tjs.dom.isElement(oParent)) {
				oParent.appendChild(this.oElement);
			}
		}
		var paneType = this.getPaneType();
		tjs.dom.addClass(this.oElement,'overflow_hidden');
		tjs.dom.addClass(this.oElement,paneType);
		tjs.dom.addClass(this.oElement,paneType+'_'+this._clsId);

		this._createTitleBar();
		this._createContent(oFragment);
		this._createCmdBar();
		this._createMovable(this._getMovableHandles());
		this._createResizable();

		var os = tjs.css.getComputedStyle(this.oElement);
		if (this.isMovable()) {
			if (os.position != 'absolute') {
				tjs.dom.removeClass(this.oElement,'pos_rel');
				tjs.dom.addClass(this.oElement,'pos_abs');
				tjs.dom.addClass(this.oElement,'pos_tl');
			}
		} else {
			if (os.position == 'static') {
				tjs.dom.addClass(this.oElement,'pos_rel');
			}
		}
	},
	_createContent:function(oFragment) {
		var paneType = this.getPaneType();
		var content = this.oMap.remove('content');
		if (!tjs.lang.isObject(content)) {
			content = {};
		}
		this.oContent = tjs.widget.createContainer(content);
		tjs.dom.addClass(this.oContent,'pos_rel');
		tjs.dom.addClass(this.oContent,paneType+'_content');
		tjs.dom.addClass(this.oContent,paneType+'_content_'+this._clsId);
		if (oFragment) {
			this.oContent.appendChild(oFragment);
		}
		this.oContentWrapper = document.createElement('div');
		this.oContentWrapper.className = 'pos_rel overflow_hidden tjs_content_wrapper';
		this.oContentWrapper.appendChild(this.oContent);
		this.oElement.appendChild(this.oContentWrapper);
		if (tjs.lang.isString(content.url) && content.url != '') {
			tjs.html.loadElementContent(content.url,this.oContent);
		}
		tjs.lang.destroyObject(content);
	},
	_createTitleBar:function() {
		if ((this.getPaneBits() & this.TITLEBAR) != 0) {
			this.oTitleIcon = document.createElement('div');
			this.oTitleIcon.className = 'tjs_title_icon';
			var titleIcon = this.oMap.get('titleIcon');
			if (titleIcon) {
				tjs.dom.addClass(this.oTitleIcon,'tjs_title_icon_'+titleIcon);
			}

			this.oTitleText = document.createElement('div');
			this.oTitleText.className = 'tjs_title_text';
			this.setCaption(this.oMap.remove('caption'));

			this.oTitleBar = document.createElement('div');
			this.oTitleBar.className = 'tjs_titlebar';
			this.oTitleBar.appendChild(this.oTitleIcon);
			this.oTitleBar.appendChild(this.oTitleText);
			this.oElement.appendChild(this.oTitleBar);

			var datas = this.oMap.remove('iconCmdDatas');
			if (!tjs.lang.isArray(datas) || datas.length == 0) {
				var iconCmds = this.oMap.remove('iconCmds');
				if (iconCmds) {
					datas = tjs.data.convertCmds(iconCmds);
				}
			}
			if (tjs.lang.isArray(datas) && datas.length > 0) {
				this.oIconList = new tjs.widget.IconList({oParent:this.oTitleBar,datas:datas});
				this.oIconList.addHandler(tjs.data.DATA_CLICKED,this._iconCmdHandler.bind(this));
			}

			var oClearFloat = document.createElement('div');
			oClearFloat.className = 'clear_float';
			this.oTitleBar.appendChild(oClearFloat);
		}
	},
	setCaption:function(caption) {
		this.oTitleText.innerHTML = tjs.str.toHTMLText(caption);
	},
	_createCmdBar:function() {
		if ((this.getPaneBits() & this.CMDBAR) != 0) {
			this.oCmdBar = document.createElement('div');
			this.oCmdBar.className = 'tjs_cmdbar '+this.getAlignCls();
			this.oCmdBarWrapper = document.createElement('div');
			this.oCmdBarWrapper.className = 'tjs_cmdbar_wrapper';
			this.oCmdBarWrapper.appendChild(this.oCmdBar);
			this.oElement.appendChild(this.oCmdBarWrapper);

			var datas = this.oMap.remove('textCmdDatas');
			if (!tjs.lang.isArray(datas) || datas.length == 0) {
				var textCmds = this.oMap.remove('textCmds');
				if (textCmds) {
					datas = tjs.data.convertCmds(textCmds);
				}
			}
			this.oCmdTextList = new tjs.widget.CmdTextList({oParent:this.oCmdBar,datas:datas});
			this.oCmdTextList.addHandler(tjs.data.DATA_CLICKED,this._textCmdHandler.bind(this));
		}
	},
	_destroy:function() {
		this._destroyMovable();
		this._destroyResizable();
	},
	_iconCmdHandler:function(source,type,oNode) {
		this.fire(oNode.data.getKey());
	},
	_textCmdHandler:function(source,type,oNode) {
		this.fire(oNode.data.getKey());
	},
	_getMovableHandles:function(){
		return this.oTitleBar ? [this.oTitleBar] : [this.oElement];
	},
	_resizeHandler:function(oResizeManager) {
		this.resize();
	},
	layout:function() {
		if (!this.noLayout) {
			this.resize();
		}
	},
	resize:function() {
		this.noLayout = false;
		var w = tjs.css.getContentBoxWidth(this.oElement);
		var h = tjs.css.getContentBoxHeight(this.oElement);
		if (this.oTitleBar) {
			tjs.css.setOffsetWidth(this.oTitleBar,w);
			if (this.oIconList) {
				this.oIconList.layout();//
			}
			h -= this.oTitleBar.offsetHeight;
		}
		if (this.oCmdBar) {
			tjs.css.setOffsetWidth(this.oCmdBarWrapper,w);
			tjs.css.setOffsetWidth(this.oCmdBar,parseInt(this.oCmdBarWrapper.style.width));
			this.oCmdTextList.layout();//
			h -= this.oCmdBarWrapper.offsetHeight;
		}
		tjs.css.setOffsetDimension(this.oContentWrapper,w,h);
		w = parseInt(this.oContentWrapper.style.width);
		h = parseInt(this.oContentWrapper.style.height);
		tjs.css.setOffsetDimension(this.oContent,w,h);
		tjs.html.evalLayouts(this.oContent);
	},
	setSize:function(w,h) {
		tjs.css.setOffsetDimension(this.oElement,w,h);
		this.resize();
	},
	onContentSizeChanged:function() {
		this.noLayout = true;
		var w = this.oContent.offsetWidth;
		var h = this.oContent.offsetHeight;
		this.oContentWrapper.style.width = w+'px';
		this.oContentWrapper.style.height = h+'px';
		w = this.oContentWrapper.offsetWidth;
		h = this.oContentWrapper.offsetHeight;
		if (this.oTitleBar) {
			tjs.css.setOffsetWidth(this.oTitleBar,w);
			if (this.oIconList) {
				this.oIconList.layout();//
			}
			h += this.oTitleBar.offsetHeight;
		}
		if (this.oCmdBar) {
			tjs.css.setOffsetWidth(this.oCmdBarWrapper,w);
			tjs.css.setOffsetWidth(this.oCmdBar,parseInt(this.oCmdBarWrapper.style.width));
			this.oCmdTextList.layout();//
			h += this.oCmdBarWrapper.offsetHeight;
		}
		this.oElement.style.width = w+'px';
		this.oElement.style.height = h+'px';
	},
	setContentSize:function(w,h) {
		this.oContent.style.width = w+'px';
		this.oContent.style.height = h+'px';
		this.onContentSizeChanged();
	},
	getContent:function(){
		return this.oContent;
	},
	getContentWidth:function(){
		return parseInt(this.oContent.style.width);
	},
	getContentHeight:function(){
		return parseInt(this.oContent.style.height);
	}
});

tjs.lang.defineClass('tjs.widget.ContentPane',tjs.widget.Pane,
function(obj) {
	tjs.widget.Pane.call(this,obj);
},{
	_paneBits:0,
	_paneType:'tjs_contentpane'
});

tjs.lang.defineClass('tjs.widget.TitlePane',tjs.widget.Pane,
function(obj) {
	tjs.widget.Pane.call(this,obj);
},{
	_paneBits:1,
	_paneType:'tjs_titlepane'
});

tjs.lang.defineClass('tjs.widget.CmdPane',tjs.widget.Pane,
function(obj) {
	tjs.widget.Pane.call(this,obj);
},{
	_paneBits:2,
	_paneType:'tjs_cmdpane'
});

tjs.lang.defineClass('tjs.widget.TitleCmdPane',tjs.widget.Pane,
function(obj) {
	tjs.widget.Pane.call(this,obj);
},{
	_paneBits:3,
	_paneType:'tjs_titlecmdpane'
});
