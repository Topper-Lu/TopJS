tjs.lang.defineClass('tjs.widget.TabList',tjs.widget.SList,
function(o) {
	tjs.widget.SList.call(this,o);
},tjs.widget.posList,{
	_checkAll:function() {
		this.oMap.put('alwaysSelected',true);
		tjs.widget.SList.prototype._checkAll.call(this);
	},
	_listType:'tjs_tab_list'
});

tjs.lang.defineClass('tjs.widget.TabPanel',tjs.widget.DockLayout,
function(o) {
	tjs.widget.DockLayout.call(this,o);
},tjs.widget.clsWidget,tjs.widget.alignWidget,{
	_checkAll:function(){
		tjs.widget.DockLayout.prototype._checkAll.call(this);
		this._checkClsId();
		this._checkAlign();
		this.doAnim = Boolean(this.oMap.remove('doAnim')) && !tjs.config.get('tjs_anim_disabled');
	},
	_handleChildren:function(){
		var aChildren = this.oMap.remove('aChildren');
		if (aChildren) {
			var content,data;
			for (var i = 0, isize = aChildren.length; i < isize; i++) {
				content = aChildren[i];
				data = content.title;
				delete content.title;
				if (!tjs.lang.isObject(data)) {
					data = {};
				}
				data.content = content;
				aChildren[i] = data;
			}
			this.oMap.put('datas',aChildren);
		}
	},
	_destroy:function() {
		if (this.oAnimation) {
			this.oAnimation.destroy();
		}
		tjs.widget.DockLayout.prototype._destroy.call(this);
	},
	_construct:function() {
		tjs.widget.DockLayout.prototype._construct.call(this);

		tjs.dom.addClass(this.oElement,'tjs_tab_panel');
		tjs.dom.addClass(this.oElement,'tjs_tab_panel_'+this._clsId);
		tjs.dom.addClass(this.oElement,'tjs_tab_panel_'+this._pos);
		tjs.dom.addClass(this.oElement,'tjs_tab_panel_'+this._clsId+'_'+this._pos);

		tjs.dom.addClass(this.oDock,'tjs_tab_panel_dock');
		tjs.dom.addClass(this.oDock,'tjs_tab_panel_dock_'+this._clsId);
		tjs.dom.addClass(this.oDock,'tjs_tab_panel_dock_'+this._pos);
		tjs.dom.addClass(this.oDock,'tjs_tab_panel_dock_'+this._clsId+'_'+this._pos);
		if (this._pos == 'n' || this._pos == 's') {
			tjs.dom.addClass(this.oDock,this.getAlignCls());
		}

		tjs.dom.addClass(this.oDockContent,'overflow_hidden');
		tjs.dom.addClass(this.oDockContent,'tjs_tab_panel_dock_content');
		tjs.dom.addClass(this.oDockContent,'tjs_tab_panel_dock_content_'+this._clsId);
		tjs.dom.addClass(this.oDockContent,'tjs_tab_panel_dock_content_'+this._pos);
		tjs.dom.addClass(this.oDockContent,'tjs_tab_panel_dock_content_'+this._clsId+'_'+this._pos);

		this.oTabPanelContainer = document.createElement('div');
		this.oTabPanelContainer.className = 'pos_rel overflow_hidden tjs_tab_panel_container';
		tjs.dom.addClass(this.oTabPanelContainer,'tjs_tab_panel_container_'+this._clsId);
		tjs.dom.addClass(this.oTabPanelContainer,'tjs_tab_panel_container_'+this._pos);
		tjs.dom.addClass(this.oTabPanelContainer,'tjs_tab_panel_container_'+this._clsId+'_'+this._pos);
		this.oDockContent.appendChild(this.oTabPanelContainer);

		var oTabList = {oParent:this.oDock,clsId:this._clsId,pos:this._pos};
		var datas = this.oMap.remove('datas');
		if (tjs.lang.isArray(datas) && datas.length > 0) {
			oTabList.datas = datas;
		}
		this.oTabList = new tjs.widget.TabList(oTabList);
		//tjs.dom.addClass(this.oTabList.oElement,'pos_rel');
		//tjs.dom.addClass(this.oTabList.oElement,'overflow_hidden');
		if (!this.oTabList.isEmpty()) {
			this._createContainers(0,this.oTabList.getDataSize(),true);
		}
		var tjs_data = tjs.data;
		this.oTabList.addHandler(tjs_data.AFTER_RESTRUCTURE,this._onAfterRestructure.bind(this));
		this.oTabList.addHandler(tjs_data.BEFORE_DELETE,this._onBeforeDelete.bind(this));
		this.oTabList.addHandler(tjs_data.AFTER_INSERT,this._onAfterInsert.bind(this));
		this.oTabList.addHandler(tjs_data.DATA_SELECTED,this._onDataSelected.bind(this));
		this.oTabList.addHandler(tjs_data.DATA_UNSELECTED,this._onDataUnselected.bind(this));
		var oNode = this.oTabList.getSelectedNode();
		if (oNode && oNode.data.url) {
			tjs.html.loadElementContent(oNode.data.url,oNode.oContainer);
			delete oNode.data.url;
		}
	},
	_onPosChanged:function(pOld,pNew){
		// do not layout here
		tjs.dom.replaceClass(this.oElement,'tjs_tab_panel_'+pOld,'tjs_tab_panel_'+pNew);
		tjs.dom.replaceClass(this.oElement,'tjs_tab_panel_'+this._clsId+'_'+pOld,'tjs_tab_panel_'+this._clsId+'_'+pNew);
		tjs.dom.replaceClass(this.oDock,'tjs_tab_panel_dock_'+pOld,'tjs_tab_panel_dock_'+pNew);
		tjs.dom.replaceClass(this.oDock,'tjs_tab_panel_dock_'+this._clsId+'_'+pOld,'tjs_tab_panel_dock_'+this._clsId+'_'+pNew);
		tjs.dom.replaceClass(this.oDockContent,'tjs_tab_panel_dock_content_'+pOld,'tjs_tab_panel_dock_content_'+pNew);
		tjs.dom.replaceClass(this.oDockContent,'tjs_tab_panel_dock_content_'+this._clsId+'_'+pOld,'tjs_tab_panel_dock_content_'+this._clsId+'_'+pNew);
		tjs.dom.replaceClass(this.oTabPanelContainer,'tjs_tab_panel_container_'+pOld,'tjs_tab_panel_container_'+pNew);
		tjs.dom.replaceClass(this.oTabPanelContainer,'tjs_tab_panel_container_'+this._clsId+'_'+pOld,'tjs_tab_panel_container_'+this._clsId+'_'+pNew);
		tjs.dom.replaceClass(this.oTabList.oElement,this.oTabList._listType+'_'+this._clsId+'_'+pOld,this.oTabList._listType+'_'+this._clsId+'_'+pNew);
		this.oTabList.setPos(pNew,true);
	},
	_preLayout:function() {// override
		if (this._pos == 'w' || this._pos == 'e') {
			this.oDock.style.width = this.oTabList.oElement.offsetWidth;
		} else if (tjs.bom.isIE6) {
			var s = this.oDock.style;
			s.visibility = 'hidden';
			s.visibility = '';
		}
	},
	_postLayout:function() {// override
		var tjs_css = tjs.css,w,h;
		w = parseInt(this.oDockContent.style.width);
		h = parseInt(this.oDockContent.style.height);
		tjs_css.setOffsetDimension(this.oTabPanelContainer,w,h);
		w = parseInt(this.oTabPanelContainer.style.width);
		h = parseInt(this.oTabPanelContainer.style.height);
		this.h = h;
		if (!this.oTabList.isEmpty()) {
			var oNodes = this.oTabList.getNodes(),oNode;
			for (var i = 0, isize = oNodes.length; i < isize; i++) {
				oNode = oNodes[i];
				tjs_css.setOffsetDimension(oNode.oContainer,w,h);
				oNode.oContainer.style.top = oNode.selected ? '0px' : -this.h+'px';
				tjs.html.evalLayouts(oNode.oContainer);
			}
		}
	},
	_destroyContainers:function(idx,count){
		var oNodes = this.oTabList.getNodes(),oNode;
		for (var i = idx, isize = idx + count; i < isize; i++) {
			oNode = oNodes[i];
			tjs.lang.html.destroyElementContent(oNode.oContainer);
			this.oTabPanelContainer.removeChild(oNode.oContainer);
		}
	},
	_createContainers:function(idx,count,noLayout){
		var oNodes = this.oTabList.getNodes(), isize = idx + count, i, oNode, data, o;
		for (i = idx; i < isize; i++) {
			oNode = oNodes[i];
			data = oNode.data;
			o = data.content;
			delete data.content;
			if (!tjs.lang.isObject(o)) {
				o = {};
			}
			oNode.oContainer = tjs.widget.createContainer(o);
			tjs.dom.addClasses(oNode.oContainer,'pos_abs pos_tl tjs_tab_container');
			this.oTabPanelContainer.appendChild(oNode.oContainer);
			if (o.url && tjs.lang.isString(o.url)) {
				if (('url' in data)) {
					delete data.url;
				}
				tjs.html.loadElementContent(o.url,oNode.oContainer);
			} else if (('url' in data) && (!tjs.lang.isString(data.url) || !data.url)) {
				delete data.url;
			}
			tjs.lang.destroyObject(o);
		}
		if (!noLayout) {
			var tjs_css = tjs.css;
			var w = parseInt(this.oTabPanelContainer.style.width);
			var h = parseInt(this.oTabPanelContainer.style.height);
			for (i = idx; i < isize; i++) {
				oNode = oNodes[i];
				tjs_css.setOffsetDimension(oNode.oContainer,w,h);
				oNode.oContainer.style.top = oNode.selected ? '0px' : -this.h+'px';
				tjs.html.evalLayouts(oNode.oContainer);
			}
		}
	},
	_onAfterRestructure:function(source,type){
		this._createContainers(0,this.oTabList.getDataSize());
	},
	_onBeforeDelete:function(source,type,o){
		this._destroyContainers(o.idx,o.count);
	},
	_onAfterInsert:function(source,type,o){
		this._createContainers(o.idx,o.count);
	},
	_doAnimation:function(){
		if (!this.oAnimation) {
			var onStart = (function(actor,cnt,oAnimation){
				switch (cnt) {
				case 2:
					actor.setElement(this.oNodeUnselected.oContainer);
					actor.getHandler('top').setV01(0,-this.h);
					break;
				case 1:
					delete this.oNodeUnselected;
					var oContainer = this.oTabList.getSelectedNode().oContainer;
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
	_onDataSelected:function(source,type,oNode) {
		if (oNode.data.url) {
			if (this.oNodeUnselected) {
				this.oNodeUnselected.oContainer.style.top = -this.h+'px';
				delete this.oNodeUnselected;
			}
			oNode.oContainer.style.top = '0px';
			tjs.html.loadElementContent(oNode.data.url,oNode.oContainer);
			delete oNode.data.url;
		} else if (this.oNodeUnselected) {
			if (this.doAnim) {
				this._doAnimation();
			} else {
				oNode.oContainer.style.top = '0px';
				this.oNodeUnselected.oContainer.style.top = -this.h+'px';
				delete this.oNodeUnselected;
			}
		}
	},
	_onDataUnselected:function(source,type,oNode) {
		this.oNodeUnselected = oNode;
	},
	getList:function() {
		return this.oTabList;
	},
	addListHandler:function(type,fHandler) {
		return this.oTabList.addHandler(type,fHandler);
	},
	removeListHandler:function(type,fHandler) {
		return this.oTabList.removeHandler(type,fHandler);
	},
	removeAllListHandlers:function(type) {
		this.oTabList.removeAllHandlers(type);
	},
	setSelectedIndex:function(idx,fireEvent) {
		this.oTabList.setSelectedIndex(idx,fireEvent);
	},
	getSelectedIndex:function(){
		return this.oTabList.getSelectedIndex();
	},
	getSelectedData:function(){
		return this.oTabList.getSelectedData();
	},
	getContainer:function(idx) {
		return this.oTabList.getNode(idx).oContainer;
	},
	setDisabledAftar:function(idx,disabled) {
		this.oTabList.setDisabledAftar(idx,disabled);
	},
	setDisabled:function(idx,disabled) {
		this.oTabList.setDisabled(idx,disabled);
	}
});
