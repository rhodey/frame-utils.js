var InformationElement = require('./element').InformationElement;
var element_id         = require('./element').element_id;
var IE_HEADER_LENGTH   = InformationElement.HEADER_LENGTH;

/*
 * [timestamp:8] [beacon interval:2] [capability:2] [ssid:IE] [fh set:IE] [ds set:IE] [cf set:IE] [ibss set:IE] [tim:IE]
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
  this.elements = InformationElement.getElementArray(this.data.slice(12));
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
  if (this.elements[element_id.SSID] === undefined)
    return '';
  else
    return this.elements[element_id.SSID];
}

Beacon.prototype.getFhSet = function() {
  return this.elements[element_id.FH_SET];
}

Beacon.prototype.getDsSet = function() {
  return this.elements[element_id.DS_SET];
}

Beacon.prototype.getCfSet = function() {
  return this.elements[element_id.CF_SET];
}

Beacon.prototype.getIbssSet = function() {
  return this.elements[element_id.IBSS_SET];
}

Beacon.prototype.getTim = function() {
  return this.elements[element_id.TIM];
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


exports.Beacon = Beacon;