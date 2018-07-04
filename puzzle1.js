"use strict"
function $(args){
  let ns = {};
  ns.debug = false;
  ns.parseArgs = function(){
    if (args){
      ns = Object.assign(ns, JSON.parse(decodeURIComponent(atob(args))))
    }else {
      args = (new URL(location)).searchParams.get('data');
      if(args){
        ns = Object.assign(ns, JSON.parse(decodeURIComponent(atob(args))))
      }
    }
  }
  ns.dumpArgs = function(){
    let ret = {}
    for (let i of ['key', 'mapwidth', 'map', 'debug', 'x', 'y', 'startx', 'starty', 'portals']){
      ret[i] = ns[i];
    }
    return btoa(encodeURIComponent(JSON.stringify(ret)));
  }
  ns.key = {
    '┼': 'A',
    '─': '2',
    '│': '3',
    '┬': '4',
    '┤': '5',
    '┴': '6',
    '├': '7',
    '┐': '8',
    '┘': '9',
    '└': '10',
    '┌': 'J',
    'Q': 'Q',
    'K': 'K',
  };
  ns.dirmap = {
    '─': ['right', 'left'],
    '│': ['up', 'down'],
    '┌': ['right', 'down'],
    '┐': ['down', 'left'],
    '└': ['up', 'right'],
    '┘': ['up', 'left'],
    '├': ['up', 'right', 'down'],
    '┤': ['up', 'down', 'left'],
    '┬': ['right', 'down', 'left'],
    '┴': ['up', 'right', 'left'],
    '┼': ['up', 'right', 'down', 'left'],
    '╴': ['left'],
    '╵': ['up'],
    '╶': ['right'],
    '╷': ['down'],
    'X': ['up', 'right', 'down', 'left'],
    'Q': ['up', 'right', 'down', 'left'],
    'K': ['up', 'right', 'down', 'left'],
    '█': []
  }
  ns.portals = {'3,3':'8,1'};
  ns.mapwidth = 11;
  ns.map = '███████████'+
           '█┌┬─┬┬┬┬┬┐█'+
           '█├┘█└┼┼┼┼┤█'+
           '█│█│█├┼┼┼┤█'+
           '█└─┴─┴┴┴┴┘█'+
           '███████████';
  ns.x = 1;
  ns.y = 1;
  ns.startx = 1;
  ns.starty = 1;
  ns.render = function(){
    let ret = ""
    for (let i=0; i < ns.map.length/ns.mapwidth; i++){
      let line = ns.map.slice(ns.mapwidth*i, ns.mapwidth*(i+1));
      if (ns.y === i){
        line = line.substr(0,ns.x) + 'O' + line.substr(ns.x+1);
      }
      ret += line + '\n';
    }
    return ret.trim();
  }
  ns.symbolAt = function(x, y){
    return ns.key[ns.tileAt(x, y)];
  }
  ns.currentSymbol = function(){
    return ns.symbolAt(ns.x, ns.y);
  }
  ns.tileAt = function(x, y){
    return ns.map.charAt(ns.posToIndex(x,y))
  }
  ns.posToIndex = function(x, y){
    return x + y*ns.mapwidth;
  }
  ns.handleSpecialTile = function(){
    if (ns.tileAt(ns.x, ns.y) === 'X'){//Dead end should return you to the start
      ns.x = ns.startx;
      ns.y = ns.starty;
    }
    //Handle portal tiles
    let source = ns.x + "," + ns.y;
    let target = ns.portals[source];
    if (target){
      target = target.split(',');
      ns.x = Number.parseInt(target[0]);
      ns.y = Number.parseInt(target[1]);
    }
  }
  ns.moveUp = function(){
    if (ns.dirmap[ns.tileAt(ns.x, ns.y)].includes('up') &&
        ns.dirmap[ns.tileAt(ns.x, ns.y-1)].includes('down')){
      ns.y -= 1;
    }
    ns.handleSpecialTile();
  }
  ns.moveRight = function(){
    if (ns.dirmap[ns.tileAt(ns.x, ns.y)].includes('right') &&
        ns.dirmap[ns.tileAt(ns.x+1, ns.y)].includes('left'))
    {
      ns.x += 1;
    }
    ns.handleSpecialTile();
  }
  ns.moveDown = function(){
    if (ns.dirmap[ns.tileAt(ns.x, ns.y)].includes('down') &&
        ns.dirmap[ns.tileAt(ns.x, ns.y+1)].includes('up'))
    {
      ns.y += 1;
    }
    ns.handleSpecialTile();
  }
  ns.moveLeft = function(){
    if (ns.dirmap[ns.tileAt(ns.x, ns.y)].includes('left') &&
        ns.dirmap[ns.tileAt(ns.x-1, ns.y)].includes('right'))
    {
      ns.x -= 1;
    }
    ns.handleSpecialTile();
  }
  ns.parseArgs();
  if (ns.debug){
    let dbgroot = document.createElement('div');
    let mapview = document.createElement('textarea');
    mapview.disabled = true;
    mapview.value = ns.render();
    mapview.rows = ns.map.length/ns.mapwidth;
    mapview.cols = ns.mapwidth;
    mapview.title = 'current state';
    dbgroot.appendChild(mapview);
    let mapedit = document.createElement('textarea');
    mapedit.value = ns.render();
    mapedit.rows = ns.map.length/ns.mapwidth;
    mapedit.cols = ns.mapwidth;
    mapedit.title = 'Edit this to change the layout of the maze. Starting position is marked by O';
    ns.parseMap = function(inputText){
      let lines = inputText.split('\n');
      for (let y=0; y<lines.length; y++){
        let x = lines[y].indexOf('O');
        if (x >= 0){
          ns.x = x;
          ns.y = y;
          ns.startx = x;
          ns.starty = y;
          break;
        }
      }
      ns.mapwidth = lines[0].length;
      ns.map = lines.join('').replace('O', '┼');
    }
    dbgroot.appendChild(mapedit);
    let symboledit = document.createElement('textarea');
    symboledit.title = 'Edit this to change what symbol is seen through the lens depending on where you are.'
    ns.printdict = function(dict){
      let out = "";
      for (let k in dict){
        out += k + ':' + dict[k] + '\n';
      }
      return out.trim();
    }
    ns.parsedict = function(inputtext){
      let ret = {}
      let lines = inputtext.split('\n');
      for (let line of lines){
        let tokens = line.split(':');
        ret[tokens[0]] = tokens[1].trim();
      }
      return ret;
    }
    symboledit.value = ns.printdict(ns.key);
    symboledit.rows = symboledit.value.split('\n').length;
    dbgroot.appendChild(symboledit);
    let portaledit = document.createElement('textarea');
    portaledit.title = 'Edit this to add tiles that teleport you to other tiles. Format is "x,y:x,y" ("1,2:10,11" teleports from x=1,y=2 to x=10,y=11).';
    portaledit.value = ns.printdict(ns.portals);
    portaledit.rows = portaledit.value.split('\n').length;
    dbgroot.appendChild(portaledit);
    let btnsave = document.createElement('button');
    btnsave.innerHTML = 'Generate URL';
    btnsave.addEventListener('click', function(){
      ns.parseMap(mapedit.value);
      ns.key = ns.parsedict(symboledit.value);
      ns.portals = ns.parsedict(portaledit.value);
      let gen = new URL(location);
      ns.debug = false;
      gen.search = '?data=' + ns.dumpArgs();
      ns.debug = true;
      output.value = gen.href;
    });
    dbgroot.appendChild(btnsave);
    let output = document.createElement('textarea');
    dbgroot.appendChild(output);
    let body = document.body;
    body.appendChild(dbgroot);
    body.addEventListener('click', function(){mapview.value = ns.render()});

    return [ns.moveUp, ns.moveRight, ns.moveDown, ns.moveLeft, ns.currentSymbol, ns];
  }else{
    return [ns.moveUp, ns.moveRight, ns.moveDown, ns.moveLeft, ns.currentSymbol];
  }
};
