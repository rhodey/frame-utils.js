var util    = require('./util.js');
var Frame   = require('./80211/80211.js').Frame;
var through = require('through');

var RADIO_TAP_LENGTH = 32;

// TODO: this is still modeled after "rxinfo" from airserv-ng
function RadioTapHeader(data) {
  if (data.length != 32)
    throw new Error('RadioTapHeader must be 32 bytes in length, is ' + data.length);

  this.data = data;
}

RadioTapHeader.prototype.getMacTime = function() {
  return util.getUInt64FromBuffer(this.data.slice(0, 0 + 8));
}

RadioTapHeader.prototype.getPower = function() {
  return util.getIntFromTwosByte(this.data.slice(8, 8 + 4)[3]);
}

RadioTapHeader.prototype.getNoise = function() {
  return util.getIntFromTwosByte(this.data.slice(12, 12 + 4)[3]);
}

RadioTapHeader.prototype.getChannel = function() {
  return util.getUInt32FromBuffer(this.data.slice(16, 16 + 4));
}

RadioTapHeader.prototype.getFrequency = function() {
  return util.getUInt32FromBuffer(this.data.slice(20, 20 + 4));
}

RadioTapHeader.prototype.getRate = function() {
  return util.getUInt32FromBuffer(this.data.slice(24, 24 + 4));
}

RadioTapHeader.prototype.getAntenna = function() {
  return util.getUInt32FromBuffer(this.data.slice(28, 28 + 4));
}

RadioTapHeader.prototype.toString = function() {
  return 'mac_time:' + this.getMacTime()   +
         ',power:'   + this.getPower()     +
         ',noise:'   + this.getNoise()     +
         ',channel:' + this.getChannel()   +
         ',freq:'    + this.getFrequency() +
         ',rate:'    + this.getRate()      +
         ',antenna:' + this.getAntenna();
}

function CapturedFrame(data) {
  this.data = data;
};

CapturedFrame.prototype.getRadioTapHeader = function() {
  return new RadioTapHeader(this.data.slice(0, RADIO_TAP_LENGTH));
}

CapturedFrame.prototype.getFrame = function() {
  return new Frame(this.data.slice(RADIO_TAP_LENGTH));
}

CapturedFrame.prototype.toString = function() {
  return this.getRadioTapHeader().toString() + ',' + this.getFrame().toString();
}


exports.RADIO_TAP_LENGTH = RADIO_TAP_LENGTH;
exports.RadioTapHeader   = RadioTapHeader;
exports.CapturedFrame    = CapturedFrame;