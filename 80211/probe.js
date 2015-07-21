var element   = require('./element');
var MacHeader = require('./80211').MacHeader;

// [SSID:IE] [supported rates:IE]
function ProbeRequest(data) {
  this.data = data;
};

ProbeRequest.prototype.initElements = function() {
  this.elements = element.getElementArray(this.data);
}

ProbeRequest.prototype.getSsid = function() {
  if (this.elements[element.element_id.SSID] === undefined)
    return '';
  else
    return this.elements[element.element_id.SSID];
}

ProbeRequest.prototype.getSupportedRates = function() {
  return this.elements[element.element_id.SUPPORTED_RATES];
}

ProbeRequest.prototype.toString = function() {
  return 'ssid:' + this.getSsid().toString().replace(/,/g, '\\,');
}

ProbeRequest.mixin = function(destObject){
  ['getSsid', 'getSupportedRates', 'toString', 'initElements'].forEach(function(property) {
    destObject.prototype[property] = ProbeRequest.prototype[property];
  });
};

// [frame control] [duration] [desination] [source addr] [bssid] [seq control]
function getProbeRequestMacHeader(sourceAddr, seqNum) {
  var frameControl   = new Buffer([0x40, 0x00]);
  var duration       = new Buffer([0x00, 0x00]);
  var desinationAddr = new Buffer([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
  var seqControl     = MacHeader.getSeqControl(0, seqNum);

  return Buffer.concat([frameControl, duration, desinationAddr, sourceAddr, desinationAddr, seqControl]);
}

// ~header~ [ssid] [rates]
ProbeRequest.build = function(sourceAddr, seqNum, ssid, channel) {
  var header         = getProbeRequestMacHeader(sourceAddr, seqNum);
  var ssidElement    = element.buildElement(element.element_id.SSID,   ssid);
  var supportedRates = new Buffer([0x01, 0x04, 0x02, 0x04, 0x0B, 0x16]); // TODO: use something from elements.js
  var dsSet          = element.buildElement(element.element_id.DS_SET, new Buffer([channel]));

  return new ProbeRequest(Buffer.concat([header, ssidElement.data, supportedRates, dsSet.data]));
}


/*
 * [timestamp:8] [between interval:2] [capability:2] [SSID:IE] [FH set:IE] [DS set:IE] [CF set:IE] [IBSS set:IE]
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
  this.elements = element.getElementArray(this.data.slice(12));
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
  if (this.elements[element.element_id.SSID] === undefined)
    return '';
  else
    return this.elements[element.element_id.SSID];
}

ProbeResponse.prototype.getFhSet = function() {
  return this.elements[element.element_id.FH_SET];
}

ProbeResponse.prototype.getDsSet = function() {
  return this.elements[element.element_id.DS_SET];
}

ProbeResponse.prototype.getCfSet = function() {
  return this.elements[element.element_id.CF_SET];
}

ProbeResponse.prototype.getIbssSet = function() {
  return this.elements[element.element_id.IBSS_SET];
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