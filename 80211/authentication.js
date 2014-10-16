var InformationElement = require('./element').InformationElement;
var element_id         = require('./element').element_id;

// [algorithm:2] [transaction sequence:2] [status:2] [challenge:?]
function Authentication(data) {
  this.data = data;
};

Authentication.prototype.getAlgorithm = function() {
  return this.data.slice(0, 2);
}

Authentication.prototype.getTransactionSequence = function() {
  return this.data.slice(2, 4);
}

Authentication.prototype.getStatus = function() {
  return this.data.slice(4, 6);
}

Authentication.prototype.getChallenge = function() {
  var element = new InformationElement(this.data.slice(6));
  if (element.getId() != element_id.CHALLEGE_TEXT)
    throw new Error('bad element id, expected ' + element_id.CHALLEGE_TEXT + ' have ' + element.getId());

  return element.getValue();
}

Authentication.prototype.toString = function() {
  return 'status: '           + this.getStatus().toString('hex') +
         ', association id: ' + this.getAssociationId().toString('hex');
}

Authentication.mixin = function(destObject){
  ['getAlgorithm', 'getTransactionSequence', 'getStatus', 'getChallenge',
   'toString']
  .forEach(function(property) {
    destObject.prototype[property] = Authentication.prototype[property];
  });
};


// [reason:2]
function Deauthentication(data) {
  this.data = data;
};

Deauthentication.prototype.getReason = function() {
  return this.data.slice(0, 2);
}

Deauthentication.prototype.toString = function() {
  return 'reason: ' + this.getReason().toString('hex');
}

Deauthentication.mixin = function(destObject){
  ['getReason', 'toString']
  .forEach(function(property) {
    destObject.prototype[property] = Deauthentication.prototype[property];
  });
};


exports.Deauthentication = Deauthentication;
exports.Authentication   = Authentication;