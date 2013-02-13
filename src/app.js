/**
 * Setup AppJS
 */

var app = module.exports = require('appjs')
app.serveFilesFrom(__dirname + '/public');

/**
 * Window options; menus, icons, etc.
 */
var menubar = app.createMenu([{
  label:'&File',
  submenu:[
    {
      label:'E&xit',
      action: function(){
        window.close();
      }
    }
  ]
},{
  label:'&Window',
  submenu:[
    {
      label:'Fullscreen',
      action:function(item) {
        window.frame.fullscreen();
        console.log(item.label+" called.");
      }
    },
    {
      label:'Minimize',
      action:function(){
        window.frame.minimize();
      }
    },
    {
      label:'Maximize',
      action:function(){
        window.frame.maximize();
      }
    },{
      label:''//separator
    },{
      label:'Restore',
      action:function(){
        window.frame.restore();
      }
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
  
  window.N = {
    require: require,
    process: process,
    module: module,
    __dirname: __dirname,
    // add node modules here:
    fs: require("fs"),
    path: require("path")
  };
  
  window.addEventListener('keydown', function(e){
    if (e.keyIdentifier === 'F12') {
      window.frame.openDevTools();
    }
    else if (e.keyIdentifier === 'U+0051') {
      // Command+Q
      window.close();
    }
    else if (e.keyIdentifier === 'U+0057') {
      // Command+W
      window.close();
    }
    else if (e.keyIdentifier === 'U+0048') {
      // Command+H
      console.log('Hide only works when launched from an OSX .app bundle');
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
    else {
      console.log(e.keyIdentifier);
    }
  });
});

window.on('close', function(){
  console.log("Window Closed");
});