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
    for (let i of ['key', 'mapwidth', 'map', 'debug']){
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
    return ret;
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
  ns.posToIndex = function(x, y){
    return x + y*ns.mapwidth;
  }
  ns.moveUp = function(){
    if (ns.symbolAt(ns.x, ns.y-1) === ' '){
      ns.y -= 1;
    }
  }
  ns.moveRight = function(){
    if (ns.symbolAt(ns.x+1, ns.y) === ' '){
      ns.x += 1;
    }
  }
  ns.moveDown = function(){
    if (ns.symbolAt(ns.x, ns.y+1) === ' '){
      ns.y += 1;
    }
  }
  ns.moveLeft = function(){
    if (ns.symbolAt(ns.x-1, ns.y) === ' '){
      ns.x -= 1;
    }
  }
  
  ns.parseArgs();
  if (ns.debug){
    return [ns.moveUp, ns.moveRight, ns.moveDown, ns.moveLeft, ns];
  }else{
    return [ns.moveUp, ns.moveRight, ns.moveDown, ns.moveLeft];
  }
};
