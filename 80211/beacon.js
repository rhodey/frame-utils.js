var InformationElement = require('./element').InformationElement;
var element_id         = require('./element').element_id;
var IE_HEADER_LENGTH   = InformationElement.HEADER_LENGTH;

/*
 * [timestamp:8] [beacon interval:2] [capability:2] [ssid:?] [fh set:7] [ds set:2] [cf set:8] [ibss set:4] [tim:?]
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
  var element = new InformationElement(this.data.slice(12));
  if (element.getId() != element_id.SSID)
    throw new Error('bad element id, expected ' + element_id.SSID + ' have ' + element.getId());

  return element.getValue();
}

Beacon.prototype.getFhSet = function() {
  var offset  = 12 + IE_HEADER_LENGTH + this.getSsid().length;
  var element = new InformationElement(this.data.slice(offset));
  if (element.getId() != element_id.FH_SET)
    throw new Error('bad element id, expected ' + element_id.FH_SET + ' have ' + element.getId());

  return element.getValue();
}

Beacon.prototype.getDsSet = function() {
  var offset  = 12 + IE_HEADER_LENGTH + this.getSsid().length;
  var element = new InformationElement(this.data.slice(offset));
  if (element.getId() != element_id.DS_SET)
    throw new Error('bad element id, expected ' + element_id.DS_SET + ' have ' + element.getId());

  return element.getValue();
}

// TODO
Beacon.prototype.getCfSet = function() {
  throw new Error('this is weird and not currently supported.');
}

Beacon.prototype.getIbssSet = function() {
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

Beacon.prototype.getTim = function() {
  var offset        = 12 + IE_HEADER_LENGTH + this.getSsid().length;
  var fhSetLength   = 0;
  var dsSetLength   = 0;
  var cfSetLength   = 0;
  var ibssSetLength = 0;

  try {
    fhSetLength = IE_HEADER_LENGTH + this.getFhSet().length;
  } catch (err) {}
  try {
    dsSetLength = IE_HEADER_LENGTH + this.getDsSet().length;
  } catch (err) {}
  try {
    cfSetLength = IE_HEADER_LENGTH + this.getCfSet().length;
  } catch (err) {}
  try {
    ibssSetLength = IE_HEADER_LENGTH + this.getIbssSet().length;
  } catch (err) {}

      offset  = offset + fhSetLength + dsSetLength + cfSetLength + ibssSetLength;
  var element = new InformationElement(this.data.slice(offset));
  if (element.getId() != element_id.TIM)
    throw new Error('bad element id, expected ' + element_id.TIM + ' have ' + element.getId());

  return new element.getValue();
}

Beacon.prototype.toString = function() {
  return 'b_timestamp:' + this.getTimeStamp().toString('hex') +
         ',ssid:'       + this.getSsid().toString().replace(/,/g, '\\,');
}

Beacon.mixin = function(destObject){
  ['getTimeStamp', 'getBetweenInterval', 'getCapability', 'getSsid',
   'getFhSet',     'getDsSet',           'getCfSet',      'getIbssSet',
   'getTim',       'toString']
  .forEach(function(property) {
    destObject.prototype[property] = Beacon.prototype[property];
  });
};


exports.Beacon = Beacon;