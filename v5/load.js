tjs.loadConfig = function(url){
//tjs_debug_start
	tjs.lang.assert(tjs.lang.isString(url) && url != '','!tjs.lang.isString(url) @tjs.loadConfig');
//tjs_debug_end
	tjs.net.httpGET4Json(url,function(response){
		if (response.result) {
			tjs.config = new tjs.util.Map(response.data);
		} else {
			throw new Error('No configuration object.');
		}
	},true,true);

	// tjs_home
	var tjs_home = tjs.config.get('tjs_home');
//tjs_debug_start
	tjs.lang.assert(tjs.lang.isString(tjs_home) && tjs_home != '','No tjs_home @tjs.loadConfig');
//tjs_debug_end

	// tjs_locale
	var tjs_locale = tjs.config.get('tjs_locale');
	if (!tjs.lang.isString(tjs_locale) || tjs_locale == '') {
		tjs_locale = 'en';
	}
	tjs.net.httpGET(tjs_home+'/locale/'+tjs_locale+'.js',function(xhr){
		if (xhr.status == 200) {
			var response;
			eval('response = ' + xhr.responseText + ';');
			if (!tjs.lang.isObject(response)) {
				throw new Error('No locale configuration object.');
			}
			tjs.config.oResource = new tjs.util.Map(response);
		} else {
			alert('Error: HTTP status = '+xhr.status);
		}
	},true,true);

	// css
	if (!tjs.html.getStyleSheet('tjs_base_css')) {
		tjs.html.loadStyleSheet(tjs_home+'/css/base/css.jsp','tjs_base_css');
	}
	var siteJS = tjs.config.get('siteJS');
	if (siteJS) {
		tjs.html.loadJS(siteJS);
	}

	// default values
	tjs.config.put('tjs_anim_disabled',Boolean(tjs.config.get('tjs_anim_disabled')));
	tjs.config.put('srcSpacer',tjs_home+'/css/base/img/spacer.gif');

	// tjs.dnd.oDragDropManager
	tjs.dnd.oDragDropManager = new tjs.dnd.DragDropManager();
	// sharedMap
	tjs.sharedMap = new tjs.util.Map();

	tjs.event.addLoadHandler(function(){
		var t = tjs.html;
		t.init();
		tjs.net.showAnimation = function(){
			tjs.html.showLoading();
		};
		tjs.net.hideAnimation = function(){
			tjs.html.hideLoading();
		};
		tjs.dnd.oDragProxy = new tjs.dnd.DragProxy();
		tjs.dnd.oDragImage = new tjs.dnd.DragImage();
		t.dialogManager.init();
		t.popupManager.init();
		if (tjs.bom.isIE) {
			var o = document.createElement('canvas');
			t.getHiddenContainer().appendChild(o);
			t.getHiddenContainer().removeChild(o);
		}

		t.evalElementContent(t.getBodyWrapper());
		t.resizeContent = function() {
			var o = tjs.html;
			if (o._resizeId) {
				delete o._resizeId;
				window.setTimeout(o.resizeContent,300);
			}
			o.evalLayouts(o.getBodyWrapper());
			o.dialogManager.layout();
		};
		t.resizeHandler = function(oEvent) {
			var o = tjs.html;
			if (o._resizeId) {
				window.clearTimeout(o._resizeId);
				delete o._resizeId;
			}
			o._resizeId = window.setTimeout(o.resizeContent,300);
		};
		tjs.event.addListener(window,'resize',t.resizeHandler);
	});
	tjs.event.addUnloadHandler(function(){
		tjs.event.removeListener(window,'resize',tjs.html.resizeHandler);
		tjs.html.destroyElementContent(tjs.html.getBodyWrapper());
		tjs.html.popupManager.destroy();
		tjs.html.dialogManager.destroy();
		tjs.dnd.oDragProxy.destroy();
		tjs.dnd.oDragImage.destroy();
		delete tjs.dnd.oDragProxy;
		delete tjs.dnd.oDragImage;
		tjs.html.destroy();
	});
	tjs.event.addSystemUnloadHandler(function(){
		tjs.editor.oDateTime.destroy();
		tjs.dnd.oDragDropManager.destroy();
		delete tjs.dnd.oDragDropManager;
		tjs.data.TreeCache.destroy();
		tjs.data.ListCache.destroy();
	});
};
