tjs.lang.defineClass('tjs.widget.TextTree',tjs.widget.Tree,
function(obj) {
	tjs.widget.Tree.call(this,obj);
},{
	_treeType:'tjs_text_tree'
});

tjs.lang.defineClass('tjs.widget.TextSTree',tjs.widget.STree,
function(obj) {
	tjs.widget.STree.call(this,obj);
},{
	_treeType:'tjs_text_tree'
});

tjs.lang.defineClass('tjs.widget.TextMTree',tjs.widget.MTree,
function(obj) {
	tjs.widget.MTree.call(this,obj);
},{
	_treeType:'tjs_text_tree'
});

tjs.lang.defineClass('tjs.widget.RadioTree',tjs.widget.STree,
function(obj) {
	tjs.widget.STree.call(this,obj);
},{
	_treeType:'tjs_radio_tree'
});

tjs.lang.defineClass('tjs.widget.CheckboxTree',tjs.widget.MTree,
function(obj) {
	tjs.widget.MTree.call(this,obj);
},{
	_treeType:'tjs_checkbox_tree'
});

tjs.lang.defineClass('tjs.widget.IconTextTree',tjs.widget.Tree,
function(obj) {
	tjs.widget.Tree.call(this,obj);
},{
	_cellHandler:'tjs.cell.IconTextHandler',
	_treeType:'tjs_icontext_tree'
});

tjs.lang.defineClass('tjs.widget.IconTextSTree',tjs.widget.STree,
function(obj) {
	tjs.widget.STree.call(this,obj);
},{
	_cellHandler:'tjs.cell.IconTextHandler',
	_treeType:'tjs_icontext_tree'
});

tjs.lang.defineClass('tjs.widget.IconTextMTree',tjs.widget.MTree,
function(obj) {
	tjs.widget.MTree.call(this,obj);
},{
	_cellHandler:'tjs.cell.IconTextHandler',
	_treeType:'tjs_icontext_tree'
});
