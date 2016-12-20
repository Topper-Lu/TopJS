tjs.sql.sort = {
	getOrderbyDatas:function(){
		if (!this._aOrderbyDatas) {
			this._aOrderbyDatas = [];
			this._aOrderbyDatas.push(new tjs.data.KeyedData(1,tjs.config.oResource.get('ascend')));
			this._aOrderbyDatas.push(new tjs.data.KeyedData(-1,tjs.config.oResource.get('descend')));
		}
		return this._aOrderbyDatas.concat();
	},
	getColumns:function(){
		var a = [];
		a.push(new tjs.grid.ToStringColumn({name:'field_name',caption:tjs.config.oResource.get('field_name'),width:120}));
		a.push(new tjs.sql.sort.EditorColumn());
		return a;
	},
	classname:'tjs.sql.sort'
};

tjs.lang.defineClass('tjs.sql.sort.EditorColumn',tjs.grid.Column,
function() {
	var o = {
		name:'sort',
		caption:tjs.config.oResource.get('sort'),
		width:200
	};
	tjs.grid.Column.call(this,o);
},{
	createContent:function(oNode,data){
		oNode.oItem = new tjs.sql.sort.Item(oNode.oCell,data);
	},
	destroyContent:function(oNode,data){
		oNode.oItem.destroy();
	}
});

tjs.lang.defineTopClass('tjs.sql.sort.Item',
function(oContainer,data) {
	this.data = data;
	this.oEditor = new tjs.editor.RadioList({oParent:oContainer,hv:'h',datas:tjs.sql.sort.getOrderbyDatas()});
	this.oEditor.setValue(1);
},{
	destroy:function(){
		if (this.data) {
			this.oEditor.destroy();
			tjs.lang.destroyObject(this);
		}
	},
	hasValue:function(){
		return true;
	},
	setValue:function(o,fireEvent) {
		this.oEditor.setValue(o.value,fireEvent);
	},
	getValue:function() {
		return {name:this.data.getKey(),value:this.oEditor.getValue()};
	}
});

tjs.lang.defineClass('tjs.sql.sort.Editor',tjs.sql.AbstractSearchSort,
function(o) {
	tjs.sql.AbstractSearchSort.call(this,o);
},{
	_construct:function() {
		tjs.sql.AbstractSearchSort.prototype._construct.call(this);

		this.oCheckboxList = new tjs.widget.CheckboxList({
			oParent:this.oContentL,
			datas:this.oMap.remove('datas'),
			hv:'v',
			alternate:true
		});
		tjs.dom.addClass(this.oContentL,'pos_rel');
		tjs.dom.addClass(this.oContentL,'overflow_auto');

		this.oListGrid = new tjs.grid.ListGrid({
			oElement:this.oContentR,
			dndOptions:tjs.dnd.REORDERABLE,
			aColumns:tjs.sql.sort.getColumns(),
			alternate:true
		});

		this.oCheckboxList.addHandler(tjs.data.DATA_SELECTED,this._onDataSelected.bind(this));
		this.oCheckboxList.addHandler(tjs.data.DATA_UNSELECTED,this._onDataUnselected.bind(this));
	},
	layout:function(){
		tjs.sql.AbstractSearchSort.prototype.layout.call(this);
		this.oCheckboxList.layout();
		this.oListGrid.layout();
	},
	_onDataSelected:function(source,type,oNode) {
		this.oListGrid.insertData(oNode.data);
	},
	_onDataUnselected:function(source,type,oNode) {
		this.oListGrid.deleteData(this.oListGrid.getIndexByKey(oNode.data.getKey()));
	},
	setValue:function(a) {
		this.oCheckboxList.unselectAll();
		this.oListGrid.setDatas(null);
		if (tjs.lang.isArray(a) && a.length > 0) {
			var oNodes = this.oListGrid._oNodes;
			var o,n;
			for (var i = 0, isize = a.length; i < isize; i++) {
				o = a[i];
				if (o.name) {
					n = this.oCheckboxList.getNodeByKey(o.name);
					if (n) {
						this.oCheckboxList.setNodeSelection(n,true,true);
						oNodes[oNodes.length - 1].oColNodes[1].oItem.oEditor.setValue(o.value);
					}
				}
			}
		}
	},
	hasValue:function(){
		return this.oListGrid._oNodes.length > 0;
	},
	getValue:function() {
		var oNodes = this.oListGrid._oNodes;
		if (oNodes && oNodes.length > 0) {
			var a = [];
			for (var i = 0, isize = oNodes.length; i < isize; i++) {
				a[a.length] = oNodes[i].oColNodes[1].oItem.getValue();
			}
			return a;
		} else {
			return null;
		}
	},
	getConditions:function() {
		var oNodes = this.oListGrid._oNodes;
		if (oNodes && oNodes.length > 0) {
			var buf = [], k = 0, o, v;
			for (var i = 0, isize = oNodes.length; i < isize; i++) {
				o = oNodes[i].oColNodes[1].oItem;
				v = o.oEditor.getValue();
				if (v < 0) {
					buf[k++] = o.data.getKey()+' DESC';
				} else if (v > 0) {
					buf[k++] = o.data.getKey();
				}
			}
			var result = buf.join(',');
			tjs.lang.destroyArray(buf);
			return result;
		} else {
			return null;
		}
	}
});

tjs.lang.defineClass('tjs.sql.search.Sorter',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},tjs.widget.alignWidget,{
	_align:'c',
	_checkAll:function(){
		this._checkAlign();
		this.oController = this.oMap.remove('oController');
	},
	_construct:function(){
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'div','tagName != "div" @'+this.classname);
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
		tjs.dom.addClass(this.oElement,'tjs_sql_sorter');

		this.oEditor = new tjs.sql.sort.Editor({
			oParent:this.oElement,
			aFields:this.oMap.remove('aFields')
		});

		this.oCmdBar = document.createElement('div');
		this.oCmdBar.className = 'overflow_hidden tjs_cmdbar '+this.getAlignCls();//
		this.oElement.appendChild(this.oCmdBar);
		this.oCmdTextList = new tjs.widget.CmdTextList({oParent:this.oCmdBar,datas:tjs.data.convertCmds(['confirm','clear'])});
		this.oCmdTextList.addHandler(tjs.data.DATA_CLICKED,this._cmdBarHandler.bind(this));
	},
	layout:function(){
		var tjs_css = tjs.css;
		var w = tjs_css.getContentBoxWidth(this.oElement);
		tjs_css.setOffsetWidth(this.oEditor.oElement,w);
		tjs_css.setOffsetWidth(this.oCmdBar,w);
		this.oEditor.layout();
		this.oCmdTextList.layout();
	},
	_cmdBarHandler:function(source,type,oNode) {
		switch (oNode.data.getKey()) {
		case 'confirm':
			this.onConditionsChanged(this.oEditor.getConditions());
			break;
		case 'clear':
			this.oEditor.setValue(null);
			this.onConditionsChanged(null);
			break;
		}
	},
	onConditionsChanged:function(orderby){
		if (this.oController) {
			this.oController.setOrderby(orderby);
		}
	}
});
