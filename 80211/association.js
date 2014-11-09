var InformationElement = require('./element').InformationElement;
var element_id         = require('./element').element_id;
var IE_HEADER_LENGTH   = InformationElement.HEADER_LENGTH;

// [capability:2] [listen interval:2] [ssid:IE] [supported rates:IE]
function AssociationRequest(data) {
  this.data = data;
};

AssociationRequest.prototype.initElements = function() {
  this.elements = InformationElement.getElementArray(this.data.slice(4));
}

AssociationRequest.prototype.getCapability = function() {
  return this.data.slice(0, 2);
}

AssociationRequest.prototype.getListenInterval = function() {
  return this.data.slice(2, 4);
}

AssociationRequest.prototype.getSsid = function() {
  if (this.elements[element_id.SSID] === undefined)
    return '';
  else
    return this.elements[element_id.SSID];
}

AssociationRequest.prototype.getSupportedRates = function() {
  return this.elements[element_id.SUPPORTED_RATES];
}

AssociationRequest.prototype.toString = function() {
  return 'ssid:' + this.getSsid().toString().replace(/,/g, '\\,');
}

AssociationRequest.mixin = function(destObject){
  ['getCapability', 'getLisenInterval', 'getSsid', 'getSupportedRates',
   'toString',      'initElements']
  .forEach(function(property) {
    destObject.prototype[property] = AssociationRequest.prototype[property];
  });
};


// [capability:2] [status:2] [association id:2] [supported rates:IE]
function AssociationResponse(data) {
  this.data = data;
};

AssociationResponse.prototype.initElements = function() {
  this.elements = InformationElement.getElementArray(this.data.slice(6));
}

AssociationResponse.prototype.getCapability = function() {
  return this.data.slice(0, 2);
}

AssociationResponse.prototype.getStatus = function() {
  return this.data.slice(2, 4);
}

AssociationResponse.prototype.getAssociationId = function() {
  return this.data.slice(4, 6);
}

AssociationResponse.prototype.getSupportedRates = function() {
  return this.elements[element_id.SUPPORTED_RATES];
}

AssociationResponse.prototype.toString = function() {
  return 'status:'          + this.getStatus().toString('hex') +
         ',association_id:' + this.getAssociationId().toString('hex');
}

AssociationResponse.mixin = function(destObject){
  ['getCapability', 'getStatus', 'getAssociationId', 'getSupportedRates',
   'toString',      'initElements']
  .forEach(function(property) {
    destObject.prototype[property] = AssociationResponse.prototype[property];
  });
};


// [reason:2]
function Disassociation(data) {
  this.data = data;
};

Disassociation.prototype.getReason = function() {
  return this.data.slice(0, 2);
}

Disassociation.prototype.toString = function() {
  return 'reason:' + this.getReason().toString('hex');
}

Disassociation.mixin = function(destObject){
  ['getReason', 'toString']
  .forEach(function(property) {
    destObject.prototype[property] = Disassociation.prototype[property];
  });
};


exports.Disassociation      = Disassociation;
exports.AssociationRequest  = AssociationRequest;
exports.AssociationResponse = AssociationResponse;