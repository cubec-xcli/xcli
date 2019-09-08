module.exports = function (args = []){
  const parsedArgs = args.map(function(val){
    if(val === "true") return true;
    if(val === "false") return false;
    if(val === "null") return null;
    if(val === "undefined" || val === "void 0") return void 0;
    return val;
  });

  return parsedArgs;
};
