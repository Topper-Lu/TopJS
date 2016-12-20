tjs.event = function() {
	var _LoadHandlers = [];
	var _UnloadHandlers = [];
	var _SystemLoadHandlers = [];
	var _SystemUnloadHandlers = [];
	var _stopPropagation;
	var _preventDefault;
	var _addListener;
	var _removeListener;
	if (window.addEventListener) { // W3C, All browsers but IE 6, 7, 8
		_stopPropagation = function(oEvent){
//tjs_debug_start
			tjs.lang.assert(Boolean(oEvent),'!oEvent @'+this.classname+'.stopPropagation');
//tjs_debug_end
			oEvent.stopPropagation();
		};
		_preventDefault = function(oEvent){
//tjs_debug_start
			tjs.lang.assert(Boolean(oEvent),'!oEvent @'+this.classname+'.preventDefault');
//tjs_debug_end
			oEvent.preventDefault();
		};
		_addListener = function(oTarget,sType,fHandler) {
//tjs_debug_start
			tjs.lang.assert(Boolean(oTarget),'!oTarget @'+this.classname+'.addListener');
			tjs.lang.assert(oTarget.addEventListener || oTarget.attachEvent,'Event registration not supported @'+this.classname+'.addListener');
			tjs.lang.assert(sType && tjs.lang.isString(sType),'!tjs.lang.isString(sType) @'+this.classname+'.addListener');
			tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.addListener');
//tjs_debug_end
            oTarget.addEventListener(sType,fHandler,false);
		};
		_removeListener = function(oTarget,sType,fHandler) {
//tjs_debug_start
			tjs.lang.assert(Boolean(oTarget),'!oTarget @'+this.classname+'.removeListener');
			tjs.lang.assert(oTarget.addEventListener || oTarget.attachEvent,'Event registration not supported @'+this.classname+'.removeListener');
			tjs.lang.assert(sType && tjs.lang.isString(sType),'!tjs.lang.isString(sType) @'+this.classname+'.removeListener');
			tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.removeListener');
//tjs_debug_end
            oTarget.removeEventListener(sType,fHandler,false);
		};
	} else if (window.attachEvent) { // IE 6, 7, 8
		_stopPropagation = function(oEvent){
//tjs_debug_start
			tjs.lang.assert(Boolean(oEvent),'!oEvent @'+this.classname+'.stopPropagation');
//tjs_debug_end
			oEvent.cancelBubble = true;
		};
		_preventDefault = function(oEvent){
//tjs_debug_start
			tjs.lang.assert(Boolean(oEvent),'!oEvent @'+this.classname+'.preventDefault');
//tjs_debug_end
			oEvent.returnValue = false;
		};
		_addListener = function(oTarget,sType,fHandler) {
//tjs_debug_start
			tjs.lang.assert(Boolean(oTarget),'!oTarget @'+this.classname+'.addListener');
			tjs.lang.assert(oTarget.addEventListener || oTarget.attachEvent,'Event registration not supported @'+this.classname+'.addListener');
			tjs.lang.assert(sType && tjs.lang.isString(sType),'!tjs.lang.isString(sType) @'+this.classname+'.addListener');
			tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.addListener');
//tjs_debug_end
            oTarget.attachEvent('on'+sType,fHandler);
		};
		_removeListener = function(oTarget,sType,fHandler) {
//tjs_debug_start
			tjs.lang.assert(Boolean(oTarget),'!oTarget @'+this.classname+'.removeListener');
			tjs.lang.assert(oTarget.addEventListener || oTarget.attachEvent,'Event registration not supported @'+this.classname+'.removeListener');
			tjs.lang.assert(sType && tjs.lang.isString(sType),'!tjs.lang.isString(sType) @'+this.classname+'.removeListener');
			tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.removeListener');
//tjs_debug_end
            oTarget.detachEvent('on'+sType,fHandler);
		};
	} else {
		_addListener = function(oTarget,sType,fHandler) {
            oTarget['on'+sType] = fHandler;
		};
		_removeListener = function(oTarget,sType,fHandler) {
            oTarget['on'+sType] = null;
		};
		_stopPropagation = function(oEvent){
		};
		_preventDefault = function(oEvent){
		};
	}
	var _handleLoadEvents = function(oEvent) {
		var i,isize;
		for (i = 0, isize = _SystemLoadHandlers.length; i < isize; i++) {
			try {
				_SystemLoadHandlers[i]();
			} catch(oError) {
				tjs.loger.log(oError.message);
			}
			_SystemLoadHandlers[i] = null;
		}
		_SystemLoadHandlers.length = 0;
		_SystemLoadHandlers = null;

		for (i = 0, isize = _LoadHandlers.length; i < isize; i++) {
			try {
				_LoadHandlers[i]();
			} catch(oError) {
				tjs.loger.log(oError.message);
			}
			_LoadHandlers[i] = null;
		}
		_LoadHandlers.length = 0;
		_LoadHandlers = null;

    	_removeListener(window,'load',_handleLoadEvents);
	};
	var _handleUnloadEvents = function(oEvent) {
		var i = _UnloadHandlers.length;
		while (i--) {
			try {
				_UnloadHandlers[i]();
			} catch(oError) {
				tjs.loger.log(oError.message);
			}
			_UnloadHandlers[i] = null;
		}
		_UnloadHandlers.length = 0;
		_UnloadHandlers = null;

		i = _SystemUnloadHandlers.length;
		while (i--) {
			try {
				_SystemUnloadHandlers[i]();
			} catch(oError) {
				tjs.loger.log(oError.message);
			}
			_SystemUnloadHandlers[i] = null;
		}
		_SystemUnloadHandlers.length = 0;
		_SystemUnloadHandlers = null;

    	_removeListener(window,'unload',_handleUnloadEvents);
	};
	_addListener(window,'load',_handleLoadEvents);
	_addListener(window,'unload',_handleUnloadEvents);

	return {
		/**
		 * Prevent specified Event object from bubbling up.
		 *
		 * @param	{Event} oEvent:
		 * The specified Event object
		 */
		stopPropagation: _stopPropagation,

		/**
		 * Signify that the specified Event object is to be canceled.
		 *
		 * @param	{Event} oEvent:
		 * The specified Event object
		 */
		preventDefault: _preventDefault,

		/**
		 * Registration of event listener on the event target.
		 *
		 * @param	{EventTarget} oTarget:
		 * @param	{string} sType:
		 * @param	{Function} fHandler:
		 */
		addListener: _addListener,

		/**
		 * Removal of event listener from the event target.
		 *
		 * @param	{EventTarget} oTarget:
		 * @param	{string} sType:
		 * @param	{Function} fHandler:
		 */
		removeListener: _removeListener,

		/**
		 *
		 * @param	{Function} fHandler:
		 * A function reference.
		 */
		addSystemLoadHandler:function(fHandler) {
//tjs_debug_start
			tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.addSystemLoadHandler');
//tjs_debug_end
			_SystemLoadHandlers.push(fHandler);
		},

		/**
		 *
		 * @param	{Function} fHandler:
		 * A function reference.
		 */
		addLoadHandler:function(fHandler) {
//tjs_debug_start
			tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.addLoadHandler');
//tjs_debug_end
			_LoadHandlers.push(fHandler);
		},

		/**
		 *
		 * @param	{Function} fHandler:
		 * A function reference.
		 */
		addUnloadHandler:function(fHandler) {
//tjs_debug_start
			tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.addUnloadHandler');
//tjs_debug_end
			_UnloadHandlers.push(fHandler);
		},

		/**
		 *
		 * @param	{Function} fHandler:
		 * A function reference.
		 */
		addSystemUnloadHandler:function(fHandler) {
//tjs_debug_start
			tjs.lang.assert(tjs.lang.isFunction(fHandler),'!tjs.lang.isFunction(fHandler) @'+this.classname+'.addSystemUnloadHandler');
//tjs_debug_end
			_SystemUnloadHandlers.push(fHandler);
		},
		classname:'tjs.event'
	};
}();
