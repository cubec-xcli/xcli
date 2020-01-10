const struct = require('ax-struct-js');

const randomInt = struct.random('int');


const chars = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
const extendChars = chars+"1234567890";

const charsLength = chars.length;
// const extendCharsLength = extendChars.length;

const charsPos = (charsLength * charsLength);

const extendPrefix = "_";

const createClass = function(cache, needExtend){
  const classKey = needExtend ?
    (chars[randomInt(0,charsLength-1)] +
     chars[randomInt(0,charsLength-1)]) :
    (chars[randomInt(0,charsLength-1)] +
     chars[randomInt(0,charsLength-1)] +
     extendPrefix +
     extendChars[randomInt(0,charsLength-1)] +
     extendChars[randomInt(0,charsLength-1)]
    );

  if(cache[classKey]) return createClass(cache, needExtend);

  cache[classKey] = true;

  return classKey;
};

module.exports = function(config){
  let num = 0;
  const cacheLocalName = {};
  const cacheExistCreate = {};

  return function(context, localIdentName, localName, options){
    // console.log(localIdentName, "---", localName);
    // console.log("[css log]", localName);
    // console.log(context, options);
    let className = cacheLocalName[localName];
    if(className) return className;

    className = createClass(cacheExistCreate,((num++)<charsPos));
    cacheLocalName[localName] = className;
    return className;
  };
};
