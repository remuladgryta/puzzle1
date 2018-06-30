"use strict"
function $(args){
  let ns = {};
  ns.debug = false;
  ns.parseArgs = function(){
    if (args){
      ns = Object.assign(ns, JSON.parse(atob(args)))
    }else {
      args = (new URL(location)).searchParams.get('data');
      if(args){
        ns = Object.assign(ns, JSON.parse(atob(args)))
      }
    }
  }
  ns.dumpArgs = function(){
    let ret = {}
    for (let i of ['key', 'mapwidth', 'map', 'debug', 'x', 'y']){
      ret[i] = ns[i];
    }
    return btoa(JSON.stringify(ret))
  }
  //up, right, down, left
  ns.key = {
    '____':'A',
    '___X':'B',
    '__X_':'C',
    '_X__':'D',
    'X___':'E',
    '__XX':'F',
    '_X_X':'G',
    'X__X':'H',
    '_XX_':'I',
    'X_X_':'J',
    'XX__':'K',
    'XXX_':'L',
    'XX_X':'M',
    'X_XX':'N',
    '_XXX':'O',
    'XXXX':'P'
  };

  ns.mapwidth = 11;
  ns.map = 'XXXXXXXXXXX'+
           'X         X'+
           'X  X      X'+
           'X X X     X'+
           'X         X'+
           'XXXXXXXXXXX';
  ns.x = 1;
  ns.y = 1;
  ns.render = function(){
    let ret = ""
    for (let i=0; i < ns.map.length/ns.mapwidth; i++){
      let line = ns.map.slice(ns.mapwidth*i, ns.mapwidth*(i+1));
      if (ns.y === i){
        line = line.substr(0,ns.x) + '!' + line.substr(ns.x+1);
      }
      ret += line + '\n';
    }
    return ret.trim();
  }
  ns.symbolAt = function(x, y){
    let surroundings = ['_','_','_','_'];
    if (ns.map.charAt(ns.posToIndex(x, y-1)) === 'X'){
      surroundings[0] = 'X';
    }
    if (ns.map.charAt(ns.posToIndex(x+1, y)) === 'X'){
      surroundings[1] = 'X';
    }
    if (ns.map.charAt(ns.posToIndex(x, y+1)) === 'X'){
      surroundings[2] = 'X';
    }
    if (ns.map.charAt(ns.posToIndex(x-1, y)) === 'X'){
      surroundings[3] = 'X';
    }
    let k = surroundings.join('');
    return ns.key[k];
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
  ns.moveUp = function(){
    if (ns.tileAt(ns.x, ns.y-1) === ' '){
      ns.y -= 1;
    }
  }
  ns.moveRight = function(){
    if (ns.tileAt(ns.x+1, ns.y) === ' '){
      ns.x += 1;
    }
  }
  ns.moveDown = function(){
    if (ns.tileAt(ns.x, ns.y+1) === ' '){
      ns.y += 1;
    }
  }
  ns.moveLeft = function(){
    if (ns.tileAt(ns.x-1, ns.y) === ' '){
      ns.x -= 1;
    }
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
    mapedit.title = 'Edit this to change the layout of the maze. Walls are marked by X, starting position is marked by !';
    ns.parseMap = function(inputText){
      let lines = inputText.split('\n');
      for (let y=0; y<lines.length; y++){
        let x = lines[y].indexOf('!');
        if (x >= 0){
          ns.x = x;
          ns.y = y;
          break;
        }
      }
      ns.mapwidth = lines[0].length;
      ns.map = lines.join('').replace('!', ' ');
    }
    dbgroot.appendChild(mapedit);
    let symboledit = document.createElement('textarea');
    symboledit.title = 'Edit this to change what symbol is seen through the lens depending on where you are. X for wall, _ for no wall.\nThe format of each line is "UpRightDownLeft:Symbol", so "X_X_:J" means if there are walls above and below but no walls to the right or to the left, you see a Q.'
    ns.printkeys = function(){
      let out = "";
      for (let k in ns.key){
        out += k + ':' + ns.key[k] + '\n';
      }
      return out.trim();
    }
    ns.parsekeys = function(inputtext){
      let lines = inputtext.split('\n');
      for (let line of lines){
        let tokens = line.split(':');
        ns.key[tokens[0]] = tokens[1].trim();
      }
    }
    symboledit.value = ns.printkeys();
    symboledit.rows = symboledit.value.split('\n').length;
    dbgroot.appendChild(symboledit);
    let btnsave = document.createElement('button');
    btnsave.innerHTML = 'Generate URL';
    btnsave.addEventListener('click', function(){
      ns.parseMap(mapedit.value);
      ns.parsekeys(symboledit.value);
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
