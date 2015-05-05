/*
 * management frame information elements...
 *   SSID:?              - network name 0-32 bytes in length, usually a null-terminated ASCII string.
 *   supported rates:?   - list of supported rates, one byte per rate, TODO: enum rate labels.
 *   FH set:7B           - used by frequency-hopping networks.
 *     dwell time:2B     - amount of time spent on each channel measured in TUs.
 *     hop set:1B        - hop patterns to be used as defined by 80211 frequency-hopping PHY.
 *     hop pattern:1B    - which pattern in the hop set is being used.
 *     hop index:1B      - the current point in the hop pattern.
 *   DS set:3B           - used by direct seq networks, contains only the channel number.
 *   TIM:?               - details which stations have buffered traffic waiting to be picked up.
 *     DTIM count:1B     - number of beacons that will be transmitted before next DTIM frame.
 *     DTIM period:1B    - number of beacon intervals between DTIM frames.
 *     bitmap control:1B - used to help processing of the partial virtual bitmap.
 *     partial bitmap:?  - one bit per association ID, if bit set then traffic is buffered.
 *   CF set:8B           - used by networks supporting contention-free service (point coordination function).
 *     CFP count:1B      - number of DTIM frames that will be transmitted before next contention-free period.
 *     CFP period:1B     - number of DTIM intervals between start of contention-free periods.
 *     CFP max dur:2B    - maximum duration of the contention-free period measued in TUs.
 *     CFP dur remain:2B - number of TUs reamining in the current contention-free period.
 *   IBSS set:4B         - number of TUs between ATIM frames.
 *   challenge text:?    - encrypted challenge text for shared-key auth.
 */

var element_id = {
  SSID                        : 0x00,
  SUPPORTED_RATES             : 0X01,
  FH_SET                      : 0X02,
  DS_SET                      : 0X03,
  CF_SET                      : 0X04,
  TIM                         : 0X05,
  IBSS_SET                    : 0X06,
  COUNTRY                     : 0X07,
  HOPPING_PARAMETERS          : 0X08,
  HOPPING_TABLE               : 0X09,
  REQUEST                     : 0X0A,
  CHALLENGE_TEXT              : 0X10,
  POWER_CONSTRAINT            : 0X20,
  POWER_CAPABILITY            : 0X21,
  TPC_REQUEST                 : 0X22,
  TCP_REPORT                  : 0X23,
  SUPPORTED_CHANNELS          : 0X24,
  CHANNEL_SWITCH_ANNOUNCEMENT : 0X25,
  MEASUREMENT_REQUEST         : 0X26,
  MEASUREMENT_REPORT          : 0X27,
  QUIET                       : 0X28,
  IBSS_DFS                    : 0X28,
  ERP_INFO                    : 0X29,
  HT_CAPABILITIES             : 0x2D,
  RSN                         : 0X30,
  EXTENDED_SUPPORTED_RATES    : 0X32,
  HT_INFO                     : 0x3D,
  WIFI_PROTECTED_ACCESS       : 0XDD,
  EXTENDED_CAPABILITIES       : 0x7F
};

function InformationElement(data) {
  if (data.length < 2)
    throw new Error('information element must be at least 2 bytes in length');
  else if (data.length < (2 + data[1]))
    throw new Error('bad information element, expected length ' + (2 + data[1]) + ' have ' + data.length);

  this.data = data;
};

InformationElement.HEADER_LENGTH = 2;

InformationElement.prototype.getId = function() {
  return this.data[0];
}

InformationElement.prototype.getValue = function() {
  return this.data.slice(
    InformationElement.HEADER_LENGTH,
    (InformationElement.HEADER_LENGTH + this.data[1])
  );
}

function buildElementArray(data, start, elements) {
  if (start + 2 >= data.length)
    return;

  var elementId   = data[start];
  var valueLength = data[start + 1];

  if ((start + 1 + valueLength) >= data.length) {
    // TODO: should throw error or something :/
    return;
  }

  if (valueLength === 0) {
    elements[elementId] = undefined;
    buildElementArray(data, start + 2, elements);
  }
  else {
    var valueStart = start + 2;
    var valueEnd   = valueStart + valueLength;

    elements[elementId] = data.slice(valueStart, valueEnd);
    buildElementArray(data, valueEnd, elements);
  }
}

// assumes that data contains only information elements
function getElementArray(data) {
  var elements = new Array();
  if (data.length < 3)
    return elements;

  buildElementArray(data, 0, elements);
  return elements;
}

function buildElement(id, data) {
  return new InformationElement(
    Buffer.concat([new Buffer([id, data.length]), data])
  );
}


var SIMPLE_RATES          = buildElement(element_id.SUPPORTED_RATES,          new Buffer([0x82, 0x84, 0x8B, 0x96, 0x24, 0x30, 0x48, 0x6C]));
var SIMPLE_TIM            = buildElement(element_id.TIM,                      new Buffer([0x00, 0x01, 0x00, 0x00]));
var SIMPLE_COUNTRY        = buildElement(element_id.COUNTRY,                  new Buffer([0x55, 0x53, 0x20, 0x01, 0x0B, 0x1E]));
var SIMPLE_RSN            = buildElement(element_id.RSN,                      new Buffer([0x01, 0x00, 0x00, 0x0f, 0xac, 0x04, 0x01, 0x00, 0x00, 0x0f, 0xac, 0x04, 0x01, 0x00, 0x00, 0x0f, 0xac, 0x02, 0x00, 0x00]));
var SIMPLE_EXT_RATES      = buildElement(element_id.EXTENDED_SUPPORTED_RATES, new Buffer([0x0C, 0x12, 0x18, 0x60]));
var SIMPLE_HT_CAPABILITY  = buildElement(element_id.HT_CAPABILITIES,          new Buffer([0x1c, 0x18, 0x1b, 0xff, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
var SIMPLE_HT_INFO        = buildElement(element_id.HT_INFO,                  new Buffer([0x04, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
var SIMPLE_EXT_CAPABILITY = buildElement(element_id.EXTENDED_CAPABILITIES,    new Buffer([0x01]));


exports.SIMPLE_RATES          = SIMPLE_RATES;
exports.SIMPLE_TIM            = SIMPLE_TIM;
exports.SIMPLE_COUNTRY        = SIMPLE_COUNTRY;
exports.SIMPLE_RSN            = SIMPLE_RSN;
exports.SIMPLE_EXT_RATES      = SIMPLE_EXT_RATES;
exports.SIMPLE_HT_CAPABILITY  = SIMPLE_HT_CAPABILITY;
exports.SIMPLE_HT_INFO        = SIMPLE_HT_INFO;
exports.SIMPLE_EXT_CAPABILITY = SIMPLE_EXT_CAPABILITY;

exports.element_id         = element_id;
exports.InformationElement = InformationElement;
exports.buildElement       = buildElement;
exports.getElementArray    = getElementArray;