"use strict";

if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        var F = function() {};
        F.prototype = o;
        return new F();
    };
}

var app = module.exports = require('appjs'),
    N = {
        require: require,
        process: process,
        module: module,
        // add node modules here:
        fs: require('fs'),
        path: require('path'),
        child_process: require('child_process'),
        stream: require('stream')
    },
    // app state
    __dirname = __dirname,
    __appname = false,
    __zoomed = false;

app.serveFilesFrom(__dirname + '/public');

var OSXify = {
    init: function(appjs_app) {
        var obj = Object.create(this);
        obj.app = appjs_app;
        obj._appname = false;
        return obj;
    },
    getName:  function() {
        if (this._appname) {
            // Return cached version
            return this._appname;
        }
        try {
            // note: this depends on the Info.plist being xml instead of binary
            // look at `man plutil` for conversion
            // Perhaps run the command version of this and then loop/wait until it's finished
            var re = /<key>CFBundleDisplayName<\/key>\s*<string>(.+)<\/string>/;
            this._appname = re.exec(N.fs.readFileSync(N.path.join(__dirname, '..', 'Info.plist'), "utf8"))[1];
        }
        catch (e) {
            this._appname = 'node';
        }
        return this._appname;
    },
    zoom: function() {
        if (__zoomed) {
            window.frame.restore();
            __zoomed = false;
        }
        else {
            window.frame.maximize();
            __zoomed = true;
        }
    },
    openDevTools: function() {
        window.frame.openDevTools();
    },
    close: function() {
        window.close();
    },
    cut: function() {
        window.document.execCommand('Cut');
    },
    copy: function() {
        window.document.execCommand('Copy');
    },
    paste: function() {
        window.document.execCommand('Paste');
    },
    bold: function() {
        // todo: make this actually work
        window.document.execCommand('Bold');
    },
    undo: function() {
        window.document.execCommand('Undo');
    },
    redo: function() {
        window.document.execCommand('Redo');
    },
    hide: function() {
        N.child_process.exec("osascript -e 'tell application \"System Events\" to set visible of process \"" + this.getName() + "\" to false'");
    },
    hideOthers: function() {
        N.child_process.exec("osascript -e 'tell application \"System Events\" to set visible of every process whose visible is true and name is not \"" + this.getName() + "\" to false'");
    },
    selectAll: function() {
        var el = window.document.activeElement;
        if (["textarea", "input"].indexOf(el.tagName.toLowerCase()) !== -1) {
            // todo: check to make sure input element is of type text or password
            el.select();
        }
        else {
            window.document.execCommand('selectall');
        }
    },
    sendNodeConsoleToChromeConsole: function() {
        function ConsoleStream(con) {
            N.stream.call(this);
            this.readable = false;
            this.writable = true;
            this.isRaw = false;
            this._console = con;
        }

        ConsoleStream.prototype = {
            __proto__: N.stream.prototype,
            write: function write(buff, encoding) {
                if (!this.writable) {
                    this.emit('error', new Error('Tried to write to a closed ConsoleStream'));
                    return false;
                }
                if (buff instanceof Buffer) {
                    buff = buff.toString(encoding || 'utf8');
                }
                this._console.log(buff + '');
                return true;
            },
            end: function end(buff, encoding) {
                if (buff) {
                    this.write(buff, encoding);
                }
                this.destroy();
            },
            destroy: function destroy() {
                if (this.writable) {
                    this.writable = false;
                    this._console = null;
                    this.emit('close');
                }
            },
            destroySoon: function destroySoon() {
                this.destroy();
            }
        };

        var stderr = process.stderr;
        var stdout = process.stdout;

        var consoleStream = new ConsoleStream(window.console);
        var desc = {
            configurable: true,
            enumerable: true,
            get: function() {
                return consoleStream
            }
        };

        Object.defineProperties(process, {
            stderr: desc,
            stdout: desc
        });
    },
    includeMousetrap: function() {
        if (typeof window.Mousetrap === 'object') {
            return;
        }
        var document = window.document;
        // mousetrap v1.3 craig.is/killing/mice
        (function(){function s(a,c,b){a.addEventListener?a.addEventListener(c,b,!1):a.attachEvent("on"+c,b)}function y(a){return"keypress"==a.type?String.fromCharCode(a.which):h[a.which]?h[a.which]:z[a.which]?z[a.which]:String.fromCharCode(a.which).toLowerCase()}function t(a,c){a=a||{};var b=!1,d;for(d in m)a[d]&&m[d]>c?b=!0:m[d]=0;b||(p=!1)}function A(a,c,b,d,g){var f,e,h=[],j=b.type;if(!l[a])return[];"keyup"==j&&u(a)&&(c=[a]);for(f=0;f<l[a].length;++f)if(e=l[a][f],!(e.seq&&m[e.seq]!=e.level)&&j==e.action&&
        ("keypress"==j&&!b.metaKey&&!b.ctrlKey||c.sort().join(",")===e.modifiers.sort().join(",")))d&&e.combo==g&&l[a].splice(f,1),h.push(e);return h}function v(a,c,b){if(!k.stopCallback(c,c.target||c.srcElement,b)&&!1===a(c,b))c.preventDefault&&c.preventDefault(),c.stopPropagation&&c.stopPropagation(),c.returnValue=!1,c.cancelBubble=!0}function w(a){"number"!==typeof a.which&&(a.which=a.keyCode);var c=y(a);if(c)if("keyup"==a.type&&x==c)x=!1;else{var b=[];a.shiftKey&&b.push("shift");a.altKey&&b.push("alt");
        a.ctrlKey&&b.push("ctrl");a.metaKey&&b.push("meta");var b=A(c,b,a),d,g={},f=0,e=!1;for(d=0;d<b.length;++d)b[d].seq?(e=!0,f=Math.max(f,b[d].level),g[b[d].seq]=1,v(b[d].callback,a,b[d].combo)):!e&&!p&&v(b[d].callback,a,b[d].combo);a.type==p&&!u(c)&&t(g,f)}}function u(a){return"shift"==a||"ctrl"==a||"alt"==a||"meta"==a}function B(a,c,b){if(!b){if(!q){q={};for(var d in h)95<d&&112>d||h.hasOwnProperty(d)&&(q[h[d]]=d)}b=q[a]?"keydown":"keypress"}"keypress"==b&&c.length&&(b="keydown");return b}function C(a,
        c,b,d,g){r[a+":"+b]=c;a=a.replace(/\s+/g," ");var f=a.split(" "),e,h,j=[];if(1<f.length){var k=a,n=b;m[k]=0;n||(n=B(f[0],[]));a=function(){p=n;++m[k];clearTimeout(D);D=setTimeout(t,1E3)};b=function(a){v(c,a,k);"keyup"!==n&&(x=y(a));setTimeout(t,10)};for(d=0;d<f.length;++d)C(f[d],d<f.length-1?a:b,n,k,d)}else{h="+"===a?["+"]:a.split("+");for(f=0;f<h.length;++f)e=h[f],E[e]&&(e=E[e]),b&&("keypress"!=b&&F[e])&&(e=F[e],j.push("shift")),u(e)&&j.push(e);b=B(e,j,b);l[e]||(l[e]=[]);A(e,j,{type:b},!d,a);l[e][d?
        "unshift":"push"]({callback:c,modifiers:j,action:b,seq:d,level:g,combo:a})}}for(var h={8:"backspace",9:"tab",13:"enter",16:"shift",17:"ctrl",18:"alt",20:"capslock",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"ins",46:"del",91:"meta",93:"meta",224:"meta"},z={106:"*",107:"+",109:"-",110:".",111:"/",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},F={"~":"`","!":"1","@":"2","#":"3",$:"4","%":"5","^":"6",
        "&":"7","*":"8","(":"9",")":"0",_:"-","+":"=",":":";",'"':"'","<":",",">":".","?":"/","|":"\\"},E={option:"alt",command:"meta","return":"enter",escape:"esc"},q,l={},r={},m={},D,x=!1,p=!1,g=1;20>g;++g)h[111+g]="f"+g;for(g=0;9>=g;++g)h[g+96]=g;s(document,"keypress",w);s(document,"keydown",w);s(document,"keyup",w);var k={bind:function(a,c,b){a=a instanceof Array?a:[a];for(var d=0;d<a.length;++d)C(a[d],c,b);return this},unbind:function(a,c){return k.bind(a,function(){},c)},trigger:function(a,c){if(r[a+
        ":"+c])r[a+":"+c]();return this},reset:function(){l={};r={};return this},stopCallback:function(a,c){return-1<(" "+c.className+" ").indexOf(" mousetrap ")?!1:"INPUT"==c.tagName||"SELECT"==c.tagName||"TEXTAREA"==c.tagName||c.contentEditable&&"true"==c.contentEditable}};window.Mousetrap=k;"function"===typeof define&&define.amd&&define(k)})();
        // end mousetrap
        window.Mousetrap.stopCallback = function(e, element, combo) {
            return false;
        };
        return;
    },
    defineShortcutKeys: function() {
        var this_osxify = this;
        this.includeMousetrap();
        window.Mousetrap.bind('command+h', function() {
            this_osxify.hide();
        });
        window.Mousetrap.bind('alt+command+h', function() {
            this_osxify.hideOthers();
        });
        window.Mousetrap.bind(['alt+command+j', 'f12'], function() {
            this_osxify.openDevTools();
        });
        window.Mousetrap.bind(['command+q', 'command+w'], function() {
            this_osxify.close();
        });
        window.Mousetrap.bind('command+m', function() {
            this_osxify.minimize();
        });
        window.Mousetrap.bind('command+a', function() {
            this_osxify.selectAll();
        });
        window.Mousetrap.bind('command+x', function() {
            this_osxify.cut();
        });
        window.Mousetrap.bind('command+c', function() {
            this_osxify.copy();
        });
        window.Mousetrap.bind('command+v', function() {
            this_osxify.paste();
        });
        window.Mousetrap.bind('command+b', function() {
            this_osxify.bold();
        });
        window.Mousetrap.bind('command+z', function() {
            this_osxify.undo();
        });
        window.Mousetrap.bind('shift+command+z', function() {
            this_osxify.redo();
        });
    }
}
var osxapp = OSXify.init(app);

/**
 * Window options; menus, icons, etc.
 */
var menubar = app.createMenu([
    {
        label: '&File',
        submenu: [
            {
                label: 'About ' + osxapp.getName(),
                action: function() {
                    // todo: about
                }
            },
            {
                label: '' // separator
            },
            {
                label: 'Hide ' + osxapp.getName() + '\t\t   ⌘H',
                action: function() {
                    // todo: hide
                    osxapp.hide();
                }
            },
            {
                label: 'Hide Others\t\t⇧⌥⌘H',
                action: function() {
                    osxapp.hideOthers();
                }
            },
            {
                label: '' // separator
            },
            {
                label: 'Quit ' + osxapp.getName() + '\t\t   ⌘Q',
                action: function() {
                    window.close();
                }
            }
        ]
    },
    {
        label: '&Window',
        submenu: [
            {
                label: 'Minimize\t\t⌘M',
                action: function() {
                    window.frame.minimize();
                }
            },
            {
                label: 'Zoom',
                action: osxapp.zoom
            }
        ]
    }
]);

var window = app.createWindow({
    width : 640,
    height: 460,
    icons : __dirname + '/public/icons'
});

// show the window after initialization
window.on('create', function() {
    window.frame.show();
    window.frame.center();
    window.frame.setMenuBar(menubar);
});

// add require/process/module to the window global object for debugging from the DevTools
window.on('ready', function(){
  
    window.N = N;
    osxapp.sendNodeConsoleToChromeConsole();
    osxapp.defineShortcutKeys();

});

window.on('close', function() {
    console.log("Window Closed");
});