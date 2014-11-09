var InformationElement = require('./element').InformationElement;
var element_id         = require('./element').element_id;
var IE_HEADER_LENGTH   = InformationElement.HEADER_LENGTH;

// [ssid:IE] [supported rates:IE]
function ProbeRequest(data) {
  this.data = data;
};

ProbeRequest.prototype.initElements = function() {
  this.elements = InformationElement.getElementArray(this.data);
}

ProbeRequest.prototype.getSsid = function() {
  if (this.elements[element_id.SSID] === undefined)
    return '';
  else
    return this.elements[element_id.SSID];
}

ProbeRequest.prototype.getSupportedRates = function() {
  return this.elements[element_id.SUPPORTED_RATES];
}

ProbeRequest.prototype.toString = function() {
  return 'ssid:' + this.getSsid().toString().replace(/,/g, '\\,');
}

// TODO: check here if this.data is of acceptable length
ProbeRequest.mixin = function(destObject){
  ['getSsid', 'getSupportedRates', 'toString', 'initElements'].forEach(function(property) {
    destObject.prototype[property] = ProbeRequest.prototype[property];
  });
};


/*
 * [timestamp:8] [between interval:2] [capability:2] [ssid:IE] [fh set:IE] [ds set:IE] [cf set:IE] [ibss set:IE]
 *
 * FH   set only present when frequency-hopping is supported.
 * DS   set only present when direct sequence is supported.
 * IBSS set only present in IBSS networks.
 * CF   set only present when AP supports PCF.
 *
 * FH and DS are mutially exclusive.
 */
function ProbeResponse(data) {
  this.data = data;
};

ProbeResponse.prototype.initElements = function() {
  this.elements = InformationElement.getElementArray(this.data.slice(12));
}

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
  if (this.elements[element_id.SSID] === undefined)
    return '';
  else
    return this.elements[element_id.SSID];
}

ProbeResponse.prototype.getFhSet = function() {
  return this.elements[element_id.FH_SET];
}

ProbeResponse.prototype.getDsSet = function() {
  return this.elements[element_id.DS_SET];
}

ProbeResponse.prototype.getCfSet = function() {
  return this.elements[element_id.CF_SET];
}

ProbeResponse.prototype.getIbssSet = function() {
  return this.elements[element_id.IBSS_SET];
}

ProbeResponse.prototype.toString = function() {
  return 'pr_timestamp:' + this.getTimeStamp().toString('hex') +
         ',ssid:'        + this.getSsid().toString().replace(/,/g, '\\,');
}

ProbeResponse.mixin = function(destObject){
  ['getTimeStamp', 'getBetweenInterval', 'getCapability', 'getSsid',
   'getFhSet',     'getDsSet',           'getCfSet',      'getIbssSet',
   'toString',     'initElements']
  .forEach(function(property) {
    destObject.prototype[property] = ProbeResponse.prototype[property];
  });
};


exports.ProbeRequest  = ProbeRequest;
exports.ProbeResponse = ProbeResponse;