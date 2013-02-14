/**
 * Setup AppJS
 */

var app = module.exports = require('appjs'),
  path = require('path'),
  child_process = require('child_process'),
  __appname = false,
  __zoomed = false;

app.serveFilesFrom(__dirname + '/public');

var getAppName = function() {
  
  // todo: avoid hard-coding the app name here
  __appname = "MyApp";
  return __appname;
  
  if (__appname) {
    // Return cached version
    return __appname;
  }
  child_process.exec('defaults read "' + path.normalize(path.join(__dirname, "..", "Info")) + '" CFBundleDisplayName',
    function(error, stdout, stderr) {
      // Cache the app name
      if (error) {
        __appname = "node";
      }
      else {
        __appname = stdout.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
      }
      return __appname;
    }
  );
}

var zoomApp = function() {
  if (__zoomed) {
    window.frame.restore();
    __zoomed = false;
  }
  else {
    window.frame.maximize();
    __zoomed = true;
  }
}

/**
 * Window options; menus, icons, etc.
 */
var menubar = app.createMenu([{
  label:'&File',
  submenu:[
    {
      label: 'About ' + getAppName(),
      action: function() {
        // todo: about
      }
    },
    {
      label: '' // separator
    },
    {
      label: 'Hide ' + getAppName() + '\t\t   ⌘H',
      action: function() {
        // todo: hide
      }
    },
    {
      label: 'Hide Others\t\t⌥⌘H',
      action: function() {
        // todo: hide
      }
    },
    {
      label: '' // separator
    },
    {
      label:'Quit ' + getAppName() + '\t\t   ⌘Q',
      action: function(){
        window.close();
      }
    }
  ]
},{
  label: '&Window',
  submenu:[
    {
      label: 'Minimize\t\t⌘M',
      action:function(){
        window.frame.minimize();
      }
    },
    {
      label: 'Zoom',
      action: zoomApp
    }
  ]
}]);

menubar.on('select',function(item){
  console.log("menu item "+item.label+" clicked");
});

var trayMenu = app.createMenu([{
  label:'Show',
  action:function(){
    window.frame.show();
  },
},{
  label:'Minimize',
  action:function(){
    window.frame.hide();
  }
},{
  label:'Exit',
  action:function(){
    window.close();
  }
}]);

var statusIcon = app.createStatusIcon({
  icon:'./data/content/icons/32.png',
  tooltip:'AppJS Hello World',
  menu:trayMenu
});

var window = app.createWindow({
  width : 640,
  height: 460,
  icons : __dirname + '/public/icons'
});

// show the window after initialization
window.on('create', function(){
  window.frame.show();
  window.frame.center();
  window.frame.setMenuBar(menubar);
});


// add require/process/module to the window global object for debugging from the DevTools
window.on('ready', function(){
  

  var debuglog = function(msg) {
    var launched_via_test = false;
    if (launched_via_test) {
      console.log(msg);
    }
    else {
      //window.document.getElementsByTagName('body').innerHTML += '<pre>' + msg + '</pre>';
    }
  },
    altdown = false,
    metadown = false,
    ctldown = false,
    shiftdown = false;

  window.N = {
    require: require,
    process: process,
    module: module,
    __dirname: __dirname,
    // add node modules here:
    fs: require('fs'),
    path: require('path'),
    child_process: require('child_process')
  };

  var Stream = require('stream');

  function ConsoleStream(con){
    Stream.call(this);
    this.readable = false;
    this.writable = true;
    this.isRaw = false;
    this._console = con;
  }

  ConsoleStream.prototype = {
    __proto__: Stream.prototype,
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
    end: function end(buff, encoding){
      if (buff) {
        this.write(buff, encoding);
      }
      this.destroy();
    },
    destroy: function destroy(){
      if (this.writable) {
        this.writable = false;
        this._console = null;
        this.emit('close');
      }
    },
    destroySoon: function destroySoon(){
      this.destroy();
    }
  };

  var stderr = process.stderr;
  var stdout = process.stdout;

  var consoleStream = new ConsoleStream(window.console);
  var desc = { configurable: true,
               enumerable: true,
               get: function(){ return consoleStream } };

  Object.defineProperties(process, {
    stderr: desc,
    stdout: desc
  });

  var myappjs = {
    hide: function() {

    },
    activate: function() {

    }
  }

  window.addEventListener('keyup', function(e) {
    if (e.keyIdentifier === 'Meta') {
      metadown = false;
    }
    else if (e.keyIdentifier === 'Alt') {
      altdown = false;
    }
    else if (e.keyIdentifier === 'Control') {
      ctldown = false;
    }
    else if (e.keyIdentifier === 'Shift') {
      shiftdown = false;
    }
  });

  window.addEventListener('keydown', function(e){
    console.log(e.keyIdentifier);
    if (altdown && ctldown && shiftdown) {
      // Shift+Control+Alt+Command
    }
    else if (shiftdown && altdown) {
      // Shift+Alt+Command
    }
    else if (shiftdown && ctldown) {
      // Shift+Control+Command
    }
    else if (altdown && ctldown) {
      // Control+Alt+Command
    }
    else if (altdown) {
      // Alt+Command
      if (e.keyIdentifier === 'U+0048') {
        // Alt+Command+H
        
        window.N.child_process.exec("osascript -e 'tell application \"System Events\" to set visible of every process whose visible is true and name is not \"" + getAppName() + "\" to false'");
      }
      else if (e.keyIdentifier === 'U+004A') {
        // Alt+Command+J
        window.frame.openDevTools();
      }
    }
    else if (ctldown) {
      // Control+Command
    }
    else if (shiftdown) {
      // Shift+Command
    }
    else if (e.keyIdentifier === 'F12') {
      // F12
      window.frame.openDevTools();
    }
    else {
      // Command
      if (e.keyIdentifier === 'U+0051') {
        // Command+Q
        window.close();
      }
      else if (e.keyIdentifier === 'U+0057') {
        // Command+W
        window.close();
      }
      else if (e.keyIdentifier === 'U+004D') {
        // Command+M
        window.frame.minimize();
      }
      else if (e.keyIdentifier === 'U+0048') {
        // Command+H
        var info_plist_path = window.N.path.normalize(window.N.path.join(__dirname, "..", "Info"));
        window.N.child_process.exec('defaults read "' + info_plist_path + '" CFBundleDisplayName',
          function(error, stdout, stderr) {
            var app_name = "node";
            if (! error) {
              app_name = stdout.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
            }
            window.N.child_process.exec("osascript -e 'tell application \"System Events\" to set visible of process \"" + getAppName() + "\" to false'");
          }
        );
      }
      else if (e.keyIdentifier === 'U+0058') {
        // Command+X
        window.document.execCommand('Cut');
      }
      else if (e.keyIdentifier === 'U+0043') {
        // Command+C
        window.document.execCommand('Copy');
      }
      else if (e.keyIdentifier === 'U+0056') {
        // Command+V
        window.document.execCommand('Paste');
      }
      else if (e.keyIdentifier === 'U+0041') {
        // Command+A
        // (taken from http://stackoverflow.com/questions/6240139/highlight-text-range-using-javascript)
        var getTextNodesIn = function(node) {
          var textNodes = [];
          if (node.nodeType == 3) {
            textNodes.push(node);
          } else {
            var children = node.childNodes;
            for (var i = 0, len = children.length; i < len; ++i) {
              textNodes.push.apply(textNodes, getTextNodesIn(children[i]));
            }
          }
          return textNodes;
        },
        setSelectionRange = function(el, start, end) {
          if (window.document.createRange && window.getSelection) {
            var range = window.document.createRange();
            range.selectNodeContents(el);
            var textNodes = getTextNodesIn(el);
            var foundStart = false;
            var charCount = 0, endCharCount;
            for (var i = 0, textNode; textNode = textNodes[i++]; ) {
              endCharCount = charCount + textNode.length;
              if (!foundStart && start >= charCount && (start < endCharCount || (start == endCharCount && i < textNodes.length))) {
                range.setStart(textNode, start - charCount);
                foundStart = true;
              }
              if (foundStart && end <= endCharCount) {
                range.setEnd(textNode, end - charCount);
                break;
              }
              charCount = endCharCount;
            }
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
          } else if (window.document.selection && window.document.body.createTextRange) {
            var textRange = window.document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(true);
            textRange.moveEnd("character", end);
            textRange.moveStart("character", start);
            textRange.select();
          }
        },
        el = window.document.activeElement;
        if (["textarea", "input"].indexOf(el.tagName.toLowerCase()) != -1) {
          // todo: check to make sure input element is of type text or password
          //console.log(el.attributes);
          el.select();
        }
        else {
          setSelectionRange(window.document.getElementsByTagName("body")[0]);
        }
      }
      else if (e.keyIdentifier === 'Meta') {
        metadown = true;
      }
      else if (e.keyIdentifier === 'Alt') {
        altdown = true;
      }
      else if (e.keyIdentifier === 'Control') {
        ctldown = true;
      }
      else if (e.keyIdentifier === 'Shift') {
        shiftdown = true;
      }
      else {
        //console.log(e.keyIdentifier);
      }
    }
  });
});

window.on('close', function(){
  console.log("Window Closed");
});