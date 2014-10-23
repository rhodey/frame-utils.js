var InformationElement = require('./element').InformationElement;
var element_id         = require('./element').element_id;
var IE_HEADER_LENGTH   = InformationElement.HEADER_LENGTH;

// [timestamp:8] [between interval:2] [capability:2] [ssid:?] [fh set:7] [ds set:2] [cf set:8] [ibss set:4] [tim:?]
function Beacon(data) {
  this.data = data;
};

Beacon.prototype.getTimeStamp = function() {
  return this.data.slice(0, 8);
}

Beacon.prototype.getBetweenInterval = function() {
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
  var offset = 12 + IE_HEADER_LENGTH + this.getSsid().length;
  return this.data.slice(offset, offset + 7);
}

Beacon.prototype.getDsSet = function() {
  var offset = 12 + IE_HEADER_LENGTH + 7 + this.getSsid().length;
  return this.data.slice(offset, offset + 2);
}

Beacon.prototype.getCfSet = function() {
  var offset = 12 + IE_HEADER_LENGTH + 7 + 2 + this.getSsid().length;
  return this.data.slice(offset, offset + 8);
}

Beacon.prototype.getIbbsSet = function() {
  var offset = 12 + IE_HEADER_LENGTH + 7 + 2 + 8 + this.getSsid().length;
  return this.data.slice(offset, offset + 4);
}

Beacon.prototype.getTim = function() {
  var offset  = 12 + IE_HEADER_LENGTH + 7 + 2 + 8 + 4 + this.getSsid().length;
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
   'getFhSet',     'getDsSet',           'getCfSet',      'getIbbsSet',
   'getTim',       'toString']
  .forEach(function(property) {
    destObject.prototype[property] = Beacon.prototype[property];
  });
};


exports.Beacon = Beacon;