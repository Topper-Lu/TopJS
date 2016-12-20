tjs.lang.defineClass('tjs.widget.TextList',tjs.widget.List,
function(o) {
	tjs.widget.List.call(this,o);
},tjs.widget.hvList,{
	_listType:'tjs_text_list'
});

tjs.lang.defineClass('tjs.widget.TextSList',tjs.widget.SList,
function(o) {
	tjs.widget.SList.call(this,o);
},tjs.widget.hvList,{
	_listType:'tjs_text_list'
});

tjs.lang.defineClass('tjs.widget.TextMList',tjs.widget.MList,
function(o) {
	tjs.widget.MList.call(this,o);
},tjs.widget.hvList,{
	_listType:'tjs_text_list'
});

tjs.lang.defineClass('tjs.widget.RadioList',tjs.widget.SList,
function(o) {
	tjs.widget.SList.call(this,o);
},tjs.widget.hvList,{
	_listType:'tjs_radio_list'
});

tjs.lang.defineClass('tjs.widget.CheckboxList',tjs.widget.MList,
function(o) {
	tjs.widget.MList.call(this,o);
},tjs.widget.hvList,{
	_listType:'tjs_checkbox_list'
});

tjs.lang.defineClass('tjs.widget.CmdList',tjs.widget.hvList,
function() {
},{
	_hv:'h',
	addCmds:function(cmds){
		var datas = tjs.data.convertCmds(cmds);
		if (datas) {
			this.insertDatas(datas);
		}
	},
	addCmd:function(cmd,caption,tooltip,clsIcon){
		this.insertData(tjs.data.convertCmd(cmd,caption,tooltip,clsIcon));
	},
	removeCmd:function(cmd){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(cmd) && cmd,'!tjs.lang.isString(cmd) @'+this.classname+'.removeCmd');
//tjs_debug_end
		var idx = this.getIndexByKey(cmd);
		if (idx > -1) {
			this.deleteData(idx);
		}
	},
	hasCmd:function(cmd){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(cmd) && cmd,'!tjs.lang.isString(cmd) @'+this.classname+'.hasCmd');
//tjs_debug_end
		return Boolean(this.getNodeByKey(cmd));
	},
	isCmdSelected:function(cmd){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(cmd) && cmd,'!tjs.lang.isString(cmd) @'+this.classname+'.isCmdSelected');
//tjs_debug_end
		return this.isKeySelected(cmd);
	},
	isCmdDisabled:function(cmd){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(cmd) && cmd,'!tjs.lang.isString(cmd) @'+this.classname+'.isCmdDisabled');
//tjs_debug_end
		var idx = this.getIndexByKey(cmd);
		return idx > -1 ? this.isDisabled(this.getIndexByKey(cmd)) : false;
	},
	setCmdDisabled:function(cmd,disabled){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(cmd) && cmd,'!tjs.lang.isString(cmd) @'+this.classname+'.setCmdDisabled');
//tjs_debug_end
		var idx = this.getIndexByKey(cmd);
		if (idx > -1) {
			this.setDisabled(idx,disabled);
		}
	},
	isCmdHidden:function(cmd){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(cmd) && cmd != '','!tjs.lang.isString(cmd) @'+this.classname+'.setCmdDisabled');
//tjs_debug_end
		var idx = this.getIndexByKey(cmd);
		return idx > -1 ? this.isHidden(this.getIndexByKey(cmd)) : false;
	},
	setCmdHidden:function(cmd,hidden){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(cmd) && cmd != '','!tjs.lang.isString(cmd) @'+this.classname+'.setCmdHidden');
//tjs_debug_end
		var idx = this.getIndexByKey(cmd);
		if (idx > -1) {
			this.setHidden(idx,hidden);
		}
	}
});

tjs.lang.defineClass('tjs.widget.CmdTextList',tjs.widget.List,
function(o) {
	tjs.widget.List.call(this,o);
},tjs.widget.CmdList,{
	_listType:'tjs_cmdtext_list'
});

tjs.lang.defineClass('tjs.widget.CmdTextSList',tjs.widget.SList,
function(o) {
	tjs.widget.SList.call(this,o);
},tjs.widget.CmdList,{
	_listType:'tjs_cmdtext_list'
});

tjs.lang.defineClass('tjs.widget.CmdTextMList',tjs.widget.MList,
function(o) {
	tjs.widget.MList.call(this,o);
},tjs.widget.CmdList,{
	_listType:'tjs_cmdtext_list'
});

tjs.lang.defineClass('tjs.widget.IconList',tjs.widget.List,
function(o) {
	tjs.widget.List.call(this,o);
},tjs.widget.CmdList,{
	_cellHandler:'tjs.cell.IconHandler',
	_listType:'tjs_icon_list'
});

tjs.lang.defineClass('tjs.widget.IconSList',tjs.widget.SList,
function(o) {
	tjs.widget.SList.call(this,o);
},tjs.widget.CmdList,{
	_cellHandler:'tjs.cell.IconHandler',
	_listType:'tjs_icon_list'
});

tjs.lang.defineClass('tjs.widget.IconMList',tjs.widget.MList,
function(o) {
	tjs.widget.MList.call(this,o);
},tjs.widget.CmdList,{
	_cellHandler:'tjs.cell.IconHandler',
	_listType:'tjs_icon_list'
});

tjs.lang.defineClass('tjs.widget.IconTextList',tjs.widget.List,
function(o) {
	tjs.widget.List.call(this,o);
},tjs.widget.CmdList,{
	_cellHandler:'tjs.cell.IconTextHandler',
	_listType:'tjs_icontext_list'
});

tjs.lang.defineClass('tjs.widget.IconTextSList',tjs.widget.SList,
function(o) {
	tjs.widget.SList.call(this,o);
},tjs.widget.CmdList,{
	_cellHandler:'tjs.cell.IconTextHandler',
	_listType:'tjs_icontext_list'
});

tjs.lang.defineClass('tjs.widget.IconTextMList',tjs.widget.MList,
function(o) {
	tjs.widget.MList.call(this,o);
},tjs.widget.CmdList,{
	_cellHandler:'tjs.cell.IconTextHandler',
	_listType:'tjs_icontext_list'
});
