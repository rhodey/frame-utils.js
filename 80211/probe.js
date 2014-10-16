var InformationElement = require('./element').InformationElement;
var element_id         = require('./element').element_id;
var IE_HEADER_LENGTH   = InformationElement.HEADER_LENGTH;

// [ssid:?] [supported rates:?]
function ProbeRequest(data) {
  this.data = data;
};

ProbeRequest.prototype.getSsid = function() {
  var element = new InformationElement(this.data);
  if (element.getId() != element_id.SSID)
    throw new Error('bad element id, expected ' + element_id.SSID + ' have ' + element.getId());

  return element.getValue();
}

ProbeRequest.prototype.getSupportedRates = function() {
  var offset  = IE_HEADER_LENGTH + this.getSsid().length;
  var element = new InformationElement(this.data.slice(offset));
  if (element.getId() != element_id.SUPPORTED_RATES)
    throw new Error('bad element id, expected ' + element_id.SUPPORTED_RATES + ' have ' + element.getId());

  return element.getValue();
}

ProbeRequest.prototype.toString = function() {
  return 'ssid: ' + this.getSsid().toString();
}

// TODO: check here if this.data is of acceptable length
ProbeRequest.mixin = function(destObject){
  ['getSsid', 'getSupportedRates', 'toString'].forEach(function(property) {
    destObject.prototype[property] = ProbeRequest.prototype[property];
  });
};


// [timestamp:8] [between interval:2] [capability:2] [ssid:?] [fh set:7] [ds set:2] [cf set:8] [ibss set:4]
function ProbeResponse(data) {
  this.data = data;
};

ProbeResponse.prototype.getTimeStamp = function() {
  return this.data.slice(0, 8);
}

ProbeResponse.prototype.getBetweenInterval = function() {
  return this.data.slice(8, 10);
}

ProbeResponse.prototype.getCapability = function() {
  return this.data.slice(10, 12);
}

ProbeResponse.prototype.getSsid = function() {
  var element = new InformationElement(this.data.slice(12));
  if (element.getId() != element_id.SSID)
    throw new Error('bad element id, expected ' + element_id.SSID + ' have ' + element.getId());

  return element.getValue();
}

ProbeResponse.prototype.getFhSet = function() {
  var offset = 12 + IE_HEADER_LENGTH + this.getSsid().length;
  return this.data.slice(offset, offset + 7);
}

ProbeResponse.prototype.getDsSet = function() {
  var offset = 12 + IE_HEADER_LENGTH + 7 + this.getSsid().length;
  return this.data.slice(offset, offset + 2);
}

ProbeResponse.prototype.getCfSet = function() {
  var offset = 12 + IE_HEADER_LENGTH + 7 + 2 + this.getSsid().length;
  return this.data.slice(offset, offset + 8);
}

ProbeResponse.prototype.getIbbsSet = function() {
  var offset = 12 + IE_HEADER_LENGTH + 7 + 2 + 8 + this.getSsid().length;
  return this.data.slice(offset, offset + 4);
}

ProbeResponse.prototype.toString = function() {
  return 'timestamp: ' + this.getTimeStamp().toString('hex') +
         ', ssid: '    + this.getSsid().toString();
}

ProbeResponse.mixin = function(destObject){
  ['getTimeStamp', 'getBetweenInterval', 'getCapability', 'getSsid',
   'getFhSet',     'getDsSet',           'getCfSet',      'getIbbsSet',
   'toString']
  .forEach(function(property) {
    destObject.prototype[property] = ProbeResponse.prototype[property];
  });
};


exports.ProbeRequest  = ProbeRequest;
exports.ProbeResponse = ProbeResponse;