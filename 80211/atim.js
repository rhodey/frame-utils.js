// atim frame has no body? TODO: understand this...
function Atim(data) {
  this.data = data;
};

Atim.prototype.toString = function() {
  return 'idk:atim has no body?'
}

Atim.mixin = function(destObject){
  ['toString']
  .forEach(function(property) {
    destObject.prototype[property] = Atim.prototype[property];
  });
};


exports.Atim = Atim;