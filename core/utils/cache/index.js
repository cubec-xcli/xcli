const fs = require('fs');
const struct = require('ax-struct-js');
const { isString } = require('lodash');
const { cacheFilePath } = require('../paths');
const { prefixAbcJSON } = require('../abc');
const error = require('../std/error');
const ERRORS = require('../../../dict/std/ERRORS');

const _get = struct.prop('get');
const _set = struct.prop('set');
const _idt = struct.broken;
const _clone = struct.clone();

// 写入缓存
const writeCache = function(path, store){
  fs.writeFileSync(path, JSON.stringify(store));
};

// 读缓存
const readCache = function(path){
  let cache = {__GLOBAL__:{}};
  try{
    cache = JSON.parse(fs.readFileSync(path));
  }catch(e){
    error(ERRORS.CACHE.READCACHEERROR);
  }
  return cache;
};

// Cache Core 核心
const Cache = function(cachePath){
  let store = {};
  const path = cachePath;
  const type = prefixAbcJSON ? prefixAbcJSON.type : null;

  this._s = (idt)=>(idt===_idt ? store : {});
  this._p = (idt)=>(idt===_idt ? path  : "");
  this._t = (idt)=>(idt===_idt ? type  : null);

  if(fs.existsSync(path))
    store = readCache(path);

  if(!store.__GLOBAL__){
    store.__GLOBAL__ = {};
    writeCache(path, store);
  }

  if(type && !store[type]){
    store[type] = {};
    writeCache(path, store);
  }
};

Cache.prototype = {
  get: function(key){
    const type = this._t(_idt);

    if(type){
      const store = this._s(_idt);
      const preset = (key && isString(key)) ? `${type}.${key}` : type;
      return _clone(_get(store, preset));
    }
  },

  set: function(key, value){
    const type = this._t(_idt);
    const path = this._p(_idt);

    if(type && key && isString(key)){
      const store = this._s(_idt);
      const preset = `${type}.${key}`;
      _set(store, preset, value);
      writeCache(path, store);
    }
  },

  getGlobal: function(key){
    const store = this._s(_idt);
    const preset = (key && isString(key)) ? `__GLOBAL__.${key}` : "__GLOBAL__";
    return _clone(_get(store, preset));
  },

  setGlobal: function(key, value){
    const path = this._p(_idt);

    if(key && isString(key)){
      const store = this._s(_idt);
      const preset = `__GLOBAL__.${key}`;
      _set(store, preset, value);
      writeCache(path, store);
    }
  }

};

const cacheInstance = new Cache(cacheFilePath);

module.exports = cacheInstance;
