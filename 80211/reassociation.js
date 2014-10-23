var InformationElement = require('./element').InformationElement;
var element_id         = require('./element').element_id;
var IE_HEADER_LENGTH   = InformationElement.HEADER_LENGTH;

// [capability:2] [listen interval:2] [current ap address:6] [ssid:?] [supported rates:?]
function ReassociationRequest(data) {
  this.data = data;
};

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
  var element = new InformationElement(this.data.slice(10));
  if (element.getId() != element_id.SSID)
    throw new Error('bad element id, expected ' + element_id.SSID + ' have ' + element.getId());

  return element.getValue();
}

ReassociationRequest.prototype.getSupportedRates = function() {
  var offset  = 10 + IE_HEADER_LENGTH + this.getSsid().length;
  var element = new InformationElement(this.data.slice(offset));
  if (element.getId() != element_id.SUPPORTED_RATES)
    throw new Error('bad element id, expected ' + element_id.SUPPORTED_RATES + ' have ' + element.getId());

  return element.getValue();
}

ReassociationRequest.prototype.toString = function() {
  return 'current_ap:' + this.getCurrentApAddress().toString('hex') +
         ',ssid:'      + this.getSsid().toString().replace(/,/g, '\\,');
}

ReassociationRequest.mixin = function(destObject){
  ['getCapability',     'getLisenInterval', 'getCurrentApAddress', 'getSsid',
   'getSupportedRates', 'toString']
  .forEach(function(property) {
    destObject.prototype[property] = ReassociationRequest.prototype[property];
  });
};


// [capability:2] [status:2] [association id:2] [supported rates:?]
function ReassociationResponse(data) {
  this.data = data;
};

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
  var element = new InformationElement(this.data.slice(6));
  if (element.getId() != element_id.SUPPORTED_RATES)
    throw new Error('bad element id, expected ' + element_id.SUPPORTED_RATES + ' have ' + element.getId());

  return element.getValue();
}

ReassociationResponse.prototype.toString = function() {
  return 'status:'          + this.getStatus().toString('hex') +
         ',association id:' + this.getAssociationId().toString('hex');
}

ReassociationResponse.mixin = function(destObject){
  ['getCapability', 'getStatus', 'getAssociationId', 'getSupportedRates',
   'toString']
  .forEach(function(property) {
    destObject.prototype[property] = ReassociationResponse.prototype[property];
  });
};


exports.ReassociationRequest  = ReassociationRequest;
exports.ReassociationResponse = ReassociationResponse;