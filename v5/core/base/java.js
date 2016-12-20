tjs.java_util = {
	_initStart: false,
	_initEnd: false,
	_javaEnabled: false,
	_javaVersion: '',
	_fHandlers:[],
	invoke:function(f) {
		tjs.lang.assert(tjs.lang.isFunction(f),'!tjs.lang.isFunction(f) @'+this.classname+'.invoke');
		this._fHandlers.push(f);
		if (this._initEnd) {
			this._invokeAll();
		} else if (!this._initStart) {
			this.init();
		}
	},
	_invokeAll:function() {
		var f;
		while (this._fHandlers.length > 0) {
			f = this._fHandlers.shift();
			f(this._javaEnabled,this._javaVersion);
		}
	},
	refresh:function() {
		this._initStart = false;
		this._initEnd = false;
		this._javaEnabled = false;
		this._javaVersion = '';
		this.init();
	},
	init:function() {
		if (this._initStart) {
			return;
		}
		this._initStart = true;
		this._javaEnabled = navigator.javaEnabled();
		if (this._javaEnabled) {
			if (window.java) { // Gecko, Opera
				this._javaVersion = java.lang.System.getProperty('java.version');
				this._initEnd = true;
				this._invokeAll();
			} else if (tjs.bom.isIE) {
				this._javaVersion = this._getVersion4IE();
				this._initEnd = true;
				this._invokeAll();
			} else if (tjs.bom.isGecko) {
				// should not reach here
				this._javaVersion = this._getVersion4Gecko();
				this._initEnd = true;
				this._invokeAll();
			} else {
				var applet = document.createElement('applet');
				applet.codebase = '.';
				applet.archive = 'detect.jar';
				applet.code = 'tw.idv.topperlu.browser.DetectApplet';
				applet.width = 1;
				applet.height = 1;
				applet.mayscript = true;
				var oContainer = tjs.html.getHiddenContainer();
				oContainer.appendChild(applet);
				var oThis = this;
				var cnt = 20;
				var id = window.setInterval(function(){
					if (cnt--) {
						try {
							oThis._javaVersion = applet.getJavaVersion();
							window.clearInterval(id);
							oContainer.removeChild(applet);
							oThis._initEnd = true;
							oThis._invokeAll();
						} catch (oError) {
						}
					} else {
						window.clearInterval(id);
						oContainer.removeChild(applet);
						oThis._initEnd = true;
						oThis._invokeAll();
					}
				},1000);
			}
		} else {
			this._initEnd = true;
			this._invokeAll();
		}
	},
    _getVersionFromToolkit:function(toolkit) {
    	var version = '';
		var jvms = toolkit.jvms;
		if (jvms && jvms.getLength() > 0) {
			var ver;
			for (var i = 0, isize = jvms.getLength(); i < isize; i++) {
				ver = jvms.get(i).version;
				if (ver > version) {
					version = ver;
				}
			}
		}
		return version;
    },
    _getVersion4IE:function() {
    	var version = '';
    	var toolkit = document.createElement('object');
    	toolkit.classid = 'clsid:CAFEEFAC-DEC7-0000-0000-ABCDEFFEDCBA';
    	toolkit.width = 1;
    	toolkit.height = 1;
    	var oContainer = tjs.html.getHiddenContainer();
    	oContainer.appendChild(toolkit);
    	version = this._getVersionFromToolkit(toolkit);
    	oContainer.removeChild(toolkit);
    	if (version) {
    		return version;
    	}
        if (!window.ActiveXObject) {
            return version;
        }
        var name, ax;
    	var vers = ['1.8.0','1.7.0','1.6.0','1.5.0','1.4.2'];
    	for (var i = 0, isize = vers.length; i < isize; i++) {
	        name = 'JavaWebStart.isInstalled.' + vers[i] + '.0';
	        try {
	        	ax = new ActiveXObject(name);
	            if (ax) {
	            	version = vers[i];
	            	break;
	            }
	        } catch (oError) {
	        }
    	}
    	tjs.lang.destroyArray(vers);
    	return version;
    },
    _getVersion4Gecko:function() {
        var version = '';
        var mimeTypes = navigator.mimeTypes;
        if (!mimeTypes || !mimeTypes.length) {
            return version;
        }
        var dtMimeType = 'application/npruntime-scriptable-plugin;DeploymentToolkit';
        var mimeType = mimeTypes[dtMimeType];
        if (mimeType && mimeType.enabledPlugin) {
	    	var toolkit = document.createElement('embed');
	    	toolkit.type = dtMimeType;
	    	toolkit.hidden = true;
	    	var oContainer = tjs.html.getHiddenContainer();
	    	oContainer.appendChild(toolkit);
	    	version = this._getVersionFromToolkit(toolkit);
	    	oContainer.removeChild(toolkit);
	    	if (version) {
	    		return version;
	    	}
        }
        var _regexp_1 = /^application\/x-java-applet/;
        var s, idx;
		for (var i = 0, isize = mimeTypes.length; i < isize; i++) {
            s = mimeTypes[i].type;
			if (_regexp_1.test(s)) {
            	idx = s.lastIndexOf('version=');
            	if (idx > 0) {
            		s = s.substr(idx + 8);
            		if (s > version) {
            			version = s;
            		}
            	}
            }
        }
        return version;
    },
	classname:'tjs.java_util'
};
