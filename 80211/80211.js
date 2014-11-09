/*
 * some vocab...
 *   BSS  - infrastructure networks, have one or more APs.
 *   IBSS - independent networks, direct communication between stations, no APs.
 */

var util                  = require('../util.js');
var AssociationRequest    = require('./association.js').AssociationRequest;
var AssociationResponse   = require('./association.js').AssociationResponse;
var ReassociationRequest  = require('./reassociation.js').ReassociationRequest;
var ReassociationResponse = require('./reassociation.js').ReassociationResponse;
var ProbeRequest          = require('./probe.js').ProbeRequest;
var ProbeResponse         = require('./probe.js').ProbeResponse;
var Beacon                = require('./beacon.js').Beacon;
var Atim                  = require('./atim.js').Atim;
var Disassociation        = require('./association.js').Disassociation;
var Authentication        = require('./authentication.js').Authentication;
var Deauthentication      = require('./authentication.js').Deauthentication;

var mac_header = {

  // 16 bits
  control : {

    // 2 bits
    _version : null,

    // 6 bits... 2 bit type, 4 bit subtype
    type : {
      MANAGEMENT : { // 0x00
        ASSOCIATION_REQUEST    : 0x00,
        ASSOCIATION_RESPONSE   : 0x01,
        REASSOCIATION_REQUEST  : 0x02,
        REASSOCIATION_RESPONSE : 0x03,
        PROBE_REQUEST          : 0x04,
        PROBE_RESPONSE         : 0x05,
        BEACON                 : 0x08,
        ATIM                   : 0x09,
        DISASSOCIATION         : 0x0A,
        AUTHENTICATION         : 0x0B,
        DEAUTHENTICATION       : 0x0C,
        ACTION                 : 0x0D
      },
      CONTROL : { // 0x01
        BLOCK_ACK_REQUEST : 0x08,
        BLOCK_ACK         : 0x09,
        PS_POLL           : 0x0A,
        RTS               : 0x0B,
        CTS               : 0x0C,
        ACK               : 0x0D,
        CF_END            : 0x0E,
        CF_END_CF_ACK     : 0x0F
      },
      DATA : { // 0x02
        DATA                    : 0x00,
        DATA_CF_ACK             : 0x01,
        DATA_CF_POLL            : 0x02,
        DATA_CF_ACK_CF_POLL     : 0x03,
        NULL                    : 0x04,
        CF_ACK                  : 0x05,
        CF_POLL                 : 0x06,
        CF_ACK_CF_POLL          : 0x07,
        QOS_DATA                : 0x08,
        QOS_DATA_CF_ACK         : 0x09,
        QOS_DATA_CF_POLL        : 0x0A,
        QOS_DATA_CF_ACK_CF_POLL : 0x0B,
        QOS_NULL                : 0x0C,
        QOS_CF_POLL_NO_DATA     : 0x0E,
        QOS_CF_ACK_NO_DATA      : 0x0F
      }
    },

    _to_ds      : null, // 1 bit
    _from_ds    : null, // 1 bit
    _more_frag  : null, // 1 bit
    _retry      : null, // 1 bit
    _power_mgmt : null, // 1 bit
    _more_data  : null, // 1 bit
    _wep        : null, // 1 bit
    _order      : null, // 1 bit

  },

  _duration_id      : null, // 16 bits
  _address1         : null, // 48 bits
  _address2         : null, // 48 bits
  _address3         : null, // 48 bits
  _sequence_control : null, // 16 bits
  _address4         : null  // 48 bits

};

function MacHeader(data) {
  this.data = data;

  if (data.length < 24)
    throw new Error('mac header must be at least 24 bytes in length, is ' + data.length);
  else if (this.getFromDs() && this.getToDs() && data.length < 30)
    throw new Error('mac header must be at least 30 bytes in length, is ' + data.length);
};

MacHeader.prototype.getProtocolVersion = function() {
  return this.data[0] & 0xC0;
}

MacHeader.prototype.getType = function() {
  return (this.data[0] & 0x30) >> 4;
}

MacHeader.prototype.getSubType = function() {
  return this.data[0] & 0x0F;
}

MacHeader.prototype.getToDs = function() {
  return (this.data[1] & 0x80) === 0x80;
}

MacHeader.prototype.getFromDs = function() {
  return (this.data[1] & 0x40) === 0x40;
}

MacHeader.prototype.getMoreFrag = function() {
  return (this.data[1] & 0x20) === 0x20;
}

MacHeader.prototype.getRetry = function() {
  return (this.data[1] & 0x10) === 0x10;
}

MacHeader.prototype.getPowerManagement = function() {
  return (this.data[1] & 0x08) === 0x08;
}

MacHeader.prototype.getMoreData = function() {
  return (this.data[1] & 0x04) === 0x04;
}

MacHeader.prototype.getWep = function() {
  return (this.data[1] & 0x02) === 0x02;
}

MacHeader.prototype.getOrder = function() {
  return (this.data[1] & 0x01) === 0x01;
}

MacHeader.prototype.getDurationId = function() {
  return this.data.slice(2, 4);
}

function getAddress(data, addressNumber) {
  switch(addressNumber) {
    case 1:
      return data.slice(4, 10);

    case 2:
      return data.slice(10, 16);

    case 3:
      return data.slice(16, 22);

    case 4:
      return data.slice(24, 30);
  }
}

MacHeader.prototype.getSource = function() {
  if (!this.getFromDs())
    return getAddress(this.data, 2);
  else if (!this.getToDs())
    return getAddress(this.data, 3);
  return getAddress(this.data, 4);
}

MacHeader.prototype.getDestination = function() {
  if (!this.getToDs())
    return getAddress(this.data, 1);
  return getAddress(this.data, 3);
}

MacHeader.prototype.getBssid = function() {
  if (!this.getToDs() && !this.getFromDs())
    return getAddress(this.data, 3);
  else if (!this.getToDs() && this.getFromDs())
    return getAddress(this.data, 2);
  else if (this.getToDs() && !this.getFromDs())
    return getAddress(this.data, 1);
}

MacHeader.prototype.getReceiver = function() {
  if (this.getToDs() && this.getFromDs())
    return getAddress(this.data, 1);
}

MacHeader.prototype.getTransmitter = function() {
  if (this.getToDs() && this.getFromDs())
    return getAddress(this.data, 2);
}

MacHeader.prototype.getSequenceControl = function() {
  return this.data.slice(22, 24);
}

function getSubTypeSymbol(type, subType) {
  var typeArray;

  switch (type) {
    case 0x00:
      typeArray = mac_header.control.type.MANAGEMENT;
      break;

    case 0x01:
      typeArray = mac_header.control.type.CONTROL;
      break;

    case 0x02:
      typeArray = mac_header.control.type.DATA;
      break;
  }

  for (var key in typeArray) {
    if (typeArray[key] === subType)
      return key;
  }
}

MacHeader.prototype.toString = function() {
  return 'subtype:'  + getSubTypeSymbol(this.getType(), this.getSubType()) +
         ',srcaddr:' + util.getFormattedMacAddress(this.getSource())       +
         ',dstaddr:' + util.getFormattedMacAddress(this.getDestination())  +
         ',bssid:'   + util.getFormattedMacAddress(this.getBssid());
}

function FrameBody(type, subType, data) {
  this.data = data;

  switch (type) {
    case 0x00:
      switch (subType) {
        case mac_header.control.type.MANAGEMENT.ASSOCIATION_REQUEST:
          AssociationRequest.mixin(FrameBody);
          break;

        case mac_header.control.type.MANAGEMENT.ASSOCIATION_RESPONSE:
          AssociationResponse.mixin(FrameBody);
          break;

        case mac_header.control.type.MANAGEMENT.REASSOCIATION_REQUEST:
          ReassociationRequest.mixin(FrameBody);
          break;

        case mac_header.control.type.MANAGEMENT.REASSOCIATION_RESPONSE:
          ReassociationResponse.mixin(FrameBody);
          break;

        case mac_header.control.type.MANAGEMENT.PROBE_REQUEST:
          ProbeRequest.mixin(FrameBody);
          break;

        case mac_header.control.type.MANAGEMENT.PROBE_RESPONSE:
          ProbeResponse.mixin(FrameBody);
          break;

        case mac_header.control.type.MANAGEMENT.BEACON:
          Beacon.mixin(FrameBody);
          break;

        case mac_header.control.type.MANAGEMENT.ATIM:
          Atim.mixin(FrameBody);
          break;

        case mac_header.control.type.MANAGEMENT.DISASSOCIATION:
          Disassociation.mixin(FrameBody);
          break;

        case mac_header.control.type.MANAGEMENT.AUTHENTICATION:
          Authentication.mixin(FrameBody);
          break;

        case mac_header.control.type.MANAGEMENT.DEAUTHENTICATION:
          Deauthentication.mixin(FrameBody);
          break;

        default:
          FrameBody.prototype.toString = function() {
            return getSubTypeSymbol(type, subType) + ' frames not yet implemented';
          };
      }
      break;

    case 0x01:
    case 0x02:
    default:
      FrameBody.prototype.toString = function() {
        return getSubTypeSymbol(type, subType) + ' frames not yet implemented';
      };
  }
};

function getMacHeaderLength(data) {
  var header = new MacHeader(data);
  if (header.getFromDs() && header.getToDs())
    return 30;

  return 24;
};

// TODO check fcs
function Frame(data) {
  var headerLength = getMacHeaderLength(data);
  if(data.length < (headerLength + 4))
    throw new Error('frame must be at least ' + (headerLength + 4) + ' bytes in length, is ' + data.length);

  this.data   = data;
  this.header = new MacHeader(data.slice(0, headerLength));
  this.body   = new FrameBody(
    this.header.getType(),
    this.header.getSubType(),
    data.slice(headerLength, (data.length - 4))
  );
  this.fcs = data.slice(data.length - 4);

  if (this.body.initElements != undefined)
    this.body.initElements();
};

Frame.prototype.toString = function() {
  return this.header.toString() + ',' + this.body.toString() + ',fcs:' + this.fcs.toString('hex');
}


exports.mac_header = mac_header;
exports.MacHeader  = MacHeader;
exports.FrameBody  = FrameBody;
exports.Frame      = Frame;