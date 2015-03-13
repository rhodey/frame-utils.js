var fields  = require('./fields');
var element = require('./element');

var DEFAULT_BEACON_INTERVAL_MS = 0x64;

/*
 * [timestamp:8] [beacon interval:2] [capability:2] [SSID:IE] [FH set:IE] [DS set:IE] [CF set:IE] [IBSS set:IE] [TIM:IE]
 *
 * FH   set only present when frequency-hopping is supported.
 * DS   set only present when direct sequence is supported.
 * CF   set only present when AP supports PCF.
 * IBSS set only present in IBSS networks.
 * TIM      only present when beacon is from an APs.
 *
 * FH and DS are mutially exclusive.
 */
function Beacon(data) {
  this.data = data;
};

Beacon.prototype.initElements = function() {
  this.elements = element.getElementArray(this.data.slice(12));
}

Beacon.prototype.getTimeStamp = function() {
  return this.data.slice(0, 8);
}

Beacon.prototype.getBeaconInterval = function() {
  return this.data.slice(8, 10);
}

Beacon.prototype.getCapability = function() {
  return this.data.slice(10, 12);
}

Beacon.prototype.getSsid = function() {
  if (this.elements[element.element_id.SSID] === undefined)
    return '';
  else
    return this.elements[element.element_id.SSID];
}

Beacon.prototype.getFhSet = function() {
  return this.elements[element.element_id.FH_SET];
}

Beacon.prototype.getDsSet = function() {
  return this.elements[element.element_id.DS_SET];
}

Beacon.prototype.getCfSet = function() {
  return this.elements[element.element_id.CF_SET];
}

Beacon.prototype.getIbssSet = function() {
  return this.elements[element.element_id.IBSS_SET];
}

Beacon.prototype.getTim = function() {
  return this.elements[element.element_id.TIM];
}

Beacon.prototype.toString = function() {
  return 'b_timestamp:' + this.getTimeStamp().toString('hex') +
         ',ssid:'       + this.getSsid().toString().replace(/,/g, '\\,');
}

Beacon.mixin = function(destObject){
  ['getTimeStamp', 'getBetweenInterval', 'getCapability', 'getSsid',
   'getFhSet',     'getDsSet',           'getCfSet',      'getIbssSet',
   'getTim',       'toString',           'initElements']
  .forEach(function(property) {
    destObject.prototype[property] = Beacon.prototype[property];
  });
};

// [frame control] [duration] [desination] [source addr] [bssid] [seq control]
function getSimpleBeaconMacHeader(sourceAddr) {
  var frameControl   = new Buffer([0x80, 0x00]);
  var duration       = new Buffer([0x00, 0x00]);
  var desinationAddr = new Buffer([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
  var seqControl     = new Buffer([0x00, 0xDA]); // fragment num should be 0 but seq num should increment

  return Buffer.concat([frameControl, duration, desinationAddr, sourceAddr, sourceAddr, seqControl]);
}

Beacon.buildSimpleDs = function(sourceAddr, ssid, channel) {
  var header         = getSimpleBeaconMacHeader(sourceAddr);
  var timestamp      = new Buffer([0x77, 0x01, 0x29, 0x9B, 0x08, 0x00, 0x00, 0x00]);
  var interval       = new Buffer([DEFAULT_BEACON_INTERVAL_MS, 0x00]);
  var capability     = fields.SIMPLE_AP_CAPABILITY;
  var ssidElement    = element.buildElement(element.element_id.SSID, ssid);
  var dsSet          = element.buildElement(element.element_id.DS_SET, new Buffer(channel));
  var supportedRates = new Buffer([0x01, 0x04, 0x02, 0x04, 0x0B, 0x16, 0x32, 0x08, 0x0C, 0x12, 0x18, 0x24, 0x30, 0x48, 0x60, 0x6C]);

  return new Beacon(Buffer.concat([header, timestamp, interval, capability, ssidElement.data, dsSet.data, supportedRates]));
}


exports.Beacon                     = Beacon;
exports.DEFAULT_BEACON_INTERVAL_MS = DEFAULT_BEACON_INTERVAL_MS;