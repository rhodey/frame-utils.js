var InformationElement = require('./element').InformationElement;
var element_id         = require('./element').element_id;
var IE_HEADER_LENGTH   = InformationElement.HEADER_LENGTH;

// [capability:2] [listen interval:2] [current ap address:6] [ssid:IE] [supported rates:IE]
function ReassociationRequest(data) {
  this.data = data;
};

ReassociationRequest.prototype.initElements = function() {
  this.elements = InformationElement.getElementArray(this.data.slice(10));
}

ReassociationRequest.prototype.getCapability = function() {
  return this.data.slice(0, 2);
}

ReassociationRequest.prototype.getListenInterval = function() {
  return this.data.slice(2, 4);
}

ReassociationRequest.prototype.getCurrentApAddress = function() {
  return this.data.slice(4, 10);
}

ReassociationRequest.prototype.getSsid = function() {
  if (this.elements[element_id.SSID] === undefined)
    return '';
  else
    return this.elements[element_id.SSID];
}

ReassociationRequest.prototype.getSupportedRates = function() {
  return this.elements[element_id.SUPPORTED_RATES];
}

ReassociationRequest.prototype.toString = function() {
  return 'current_ap:' + this.getCurrentApAddress().toString('hex') +
         ',ssid:'      + this.getSsid().toString().replace(/,/g, '\\,');
}

ReassociationRequest.mixin = function(destObject){
  ['getCapability',     'getLisenInterval', 'getCurrentApAddress', 'getSsid',
   'getSupportedRates', 'toString',         'initElements']
  .forEach(function(property) {
    destObject.prototype[property] = ReassociationRequest.prototype[property];
  });
};


// [capability:2] [status:2] [association id:2] [supported rates:IE]
function ReassociationResponse(data) {
  this.data = data;
};

ReassociationResponse.prototype.initElements = function() {
  this.elements = InformationElement.getElementArray(this.data.slice(6));
}

ReassociationResponse.prototype.getCapability = function() {
  return this.data.slice(0, 2);
}

ReassociationResponse.prototype.getStatus = function() {
  return this.data.slice(2, 4);
}

ReassociationResponse.prototype.getAssociationId = function() {
  return this.data.slice(4, 6);
}

ReassociationResponse.prototype.getSupportedRates = function() {
  return this.elements[element_id.SUPPORTED_RATES];
}

ReassociationResponse.prototype.toString = function() {
  return 'status:'          + this.getStatus().toString('hex') +
         ',association id:' + this.getAssociationId().toString('hex');
}

ReassociationResponse.mixin = function(destObject){
  ['getCapability', 'getStatus', 'getAssociationId', 'getSupportedRates',
   'toString',      'initElements']
  .forEach(function(property) {
    destObject.prototype[property] = ReassociationResponse.prototype[property];
  });
};


exports.ReassociationRequest  = ReassociationRequest;
exports.ReassociationResponse = ReassociationResponse;