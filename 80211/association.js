var InformationElement = require('./element').InformationElement;
var element_id         = require('./element').element_id;
var IE_HEADER_LENGTH   = InformationElement.HEADER_LENGTH;

// [capability:2] [listen interval:2] [ssid:?] [supported rates:?]
function AssociationRequest(data) {
  this.data = data;
};

AssociationRequest.prototype.getCapability = function() {
  return this.data.slice(0, 2);
}

AssociationRequest.prototype.getListenInterval = function() {
  return this.data.slice(2, 4);
}

AssociationRequest.prototype.getSsid = function() {
  var element = new InformationElement(this.data.slice(4));
  if (element.getId() != element_id.SSID)
    throw new Error('bad element id, expected ' + element_id.SSID + ' have ' + element.getId());

  return element.getValue();
}

AssociationRequest.prototype.getSupportedRates = function() {
  var offset  = 4 + IE_HEADER_LENGTH + this.getSsid().length;
  var element = new InformationElement(this.data.slice(offset));
  if (element.getId() != element_id.SUPPORTED_RATES)
    throw new Error('bad element id, expected ' + element_id.SUPPORTED_RATES + ' have ' + element.getId());

  return element.getValue();
}

AssociationRequest.prototype.toString = function() {
  return 'ssid: ' + this.getSsid().toString();
}

AssociationRequest.mixin = function(destObject){
  ['getCapability', 'getLisenInterval', 'getSsid', 'getSupportedRates',
   'toString']
  .forEach(function(property) {
    destObject.prototype[property] = AssociationRequest.prototype[property];
  });
};


// [capability:2] [status:2] [association id:2] [supported rates:?]
function AssociationResponse(data) {
  this.data = data;
};

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
  var element = new InformationElement(this.data.slice(6));
  if (element.getId() != element_id.SUPPORTED_RATES)
    throw new Error('bad element id, expected ' + element_id.SUPPORTED_RATES + ' have ' + element.getId());

  return element.getValue();
}

AssociationResponse.prototype.toString = function() {
  return 'status: '           + this.getStatus().toString('hex') +
         ', association id: ' + this.getAssociationId().toString('hex');
}

AssociationResponse.mixin = function(destObject){
  ['getCapability', 'getStatus', 'getAssociationId', 'getSupportedRates',
   'toString']
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
  return 'reason: ' + this.getReason().toString('hex');
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