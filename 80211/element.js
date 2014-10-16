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
  ROBUST_SECURITY_NET         : 0X30,
  EXTENDED_SUPPORTED_RATES    : 0X32,
  WIFI_PROTECTED_ACCESS       : 0XDD
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


exports.element_id         = element_id;
exports.InformationElement = InformationElement;