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
  return 'ssid:' + this.getSsid().toString().replace(/,/g, '\\,');
}

// TODO: check here if this.data is of acceptable length
ProbeRequest.mixin = function(destObject){
  ['getSsid', 'getSupportedRates', 'toString'].forEach(function(property) {
    destObject.prototype[property] = ProbeRequest.prototype[property];
  });
};


/*
 * [timestamp:8] [between interval:2] [capability:2] [ssid:?] [fh set:7] [ds set:2] [cf set:8] [ibss set:4]
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
  var offset  = 12 + IE_HEADER_LENGTH + this.getSsid().length;
  var element = new InformationElement(this.data.slice(offset));
  if (element.getId() != element_id.FH_SET)
    throw new Error('bad element id, expected ' + element_id.FH_SET + ' have ' + element.getId());

  return element.getValue();
}

ProbeResponse.prototype.getDsSet = function() {
  var offset  = 12 + IE_HEADER_LENGTH + this.getSsid().length;
  var element = new InformationElement(this.data.slice(offset));
  if (element.getId() != element_id.DS_SET)
    throw new Error('bad element id, expected ' + element_id.DS_SET + ' have ' + element.getId());

  return element.getValue();
}

// TODO
ProbeResponse.prototype.getCfSet = function() {
  throw new Error('this is weird and not currently supported.');
}

ProbeResponse.prototype.getIbssSet = function() {
  var offset      = 12 + IE_HEADER_LENGTH + this.getSsid().length;
  var fhSetLength = 0;
  var dsSetLength = 0;
  var cfSetLength = 0;

  try {
    fhSetLength = IE_HEADER_LENGTH + this.getFhSet().length;
  } catch (err) {}
  try {
    dsSetLength = IE_HEADER_LENGTH + this.getDsSet().length;
  } catch (err) {}
  try {
    cfSetLength = IE_HEADER_LENGTH + this.getCfSet().length;
  } catch (err) {}

      offset  = offset + fhSetLength + dsSetLength + cfSetLength;
  var element = new InformationElement(this.data.slice(offset));
  if (element.getId() != element_id.IBSS_SET)
    throw new Error('bad element id, expected ' + element_id.IBSS_SET + ' have ' + element.getId());

  return new element.getValue();
}

ProbeResponse.prototype.toString = function() {
  return 'pr_timestamp:' + this.getTimeStamp().toString('hex') +
         ',ssid:'        + this.getSsid().toString().replace(/,/g, '\\,');
}

ProbeResponse.mixin = function(destObject){
  ['getTimeStamp', 'getBetweenInterval', 'getCapability', 'getSsid',
   'getFhSet',     'getDsSet',           'getCfSet',      'getIbssSet',
   'toString']
  .forEach(function(property) {
    destObject.prototype[property] = ProbeResponse.prototype[property];
  });
};


exports.ProbeRequest  = ProbeRequest;
exports.ProbeResponse = ProbeResponse;