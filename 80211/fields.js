/*
 * helper constants, functions, and documentation for 80211 fixed length fields.
 *
 * units...
 *   TU - 1024us time units
 *
 * fixed length management frame fields...
 *   auth alg number:2B      - identifies the type of auth used in the auth process.
 *   auth transaction seq:2B - tracks progress through the auth process, starts at 1 not 0.
 *   beacon interval:2B      - beacon transmission interval measured in TUs.
 *   capability:2B           - advertises the networks capabilities.
 *     ESS:1b                - set to 1 if AP network.
 *     IBSS:1b               - set to 1 if IBSS network.
 *     CF pollable:1b        - see contention-free polling bits table...
 *     CF poll request:1b    - see contention-free polling bits table...
 *     privacy:1b            - set to 1 if WEP required.
 *     short preamble:1b     - set to 1 if using short preamble in DSSS PHY.
 *     PBCC:1b               - set to 1 if using packet binary convolution coding in DSSS PHY.
 *     channel agility:1b    - set to 1 if using channel agility in DSSS PHY.
 *   current AP addr:6B      - used in association to help transfer buffered frames.
 *   listen interval:2B      - number of beacon intervals a station waits before listening to beacon frames, used to save power by shutting down antenna.
 *   association id:2B       - id assigned by ap to assist with control and management frames.
 *   timestamp:8B            - number of microseconds timekeeper has been active, used for synchronization, wraps around to 0.
 *   reason code:2B          - used in disassociation & deauth frames to give explain reason.
 *   status code:2B          - indicates the success or failure of an operation.
 *
 * contention-free polling bits...
 *   station...
 *     [cf pollable] [cf poll req] [interpretation]
 *           0            0         polling not supported
 *           0            1         polling supported but not requested
 *           1            0         polling supported and requested
 *           1            1         polling supported but never wants to be polled
 *   access point...
 *     [cf pollable] [cf poll req] [interpretation]
 *           0            0         PCF not implemented
 *           0            1         PCF implemented but polling not supported
 *           1            0         PCF implemented and polling supported
 *           1            1         reserved / unused
 *
 * base reason codes...
 *   0 - reserved / unused
 *   1 - unspecified
 *   2 - prior auth is not valid
 *   3 - station has left service area, is deauthed
 *   4 - inactivity timer expired, station is deauthed
 *   5 - disassociation due to lack of ap resources
 *   6 - incorrect frame type or subtype from unauthed station
 *   7 - incorrect frame type or subtype from unassociated station
 *   8 - station has left service area, is disassociated
 *   9 - association or reassociation request before auth
 *
 * base status codes...
 *   00 - success
 *   01 - unspecified failure
 *   10 - requested capability cannot be supported
 *   11 - reassociation denied
 *   12 - association denied for reason not specified by 80211
 *   13 - requested auth alg not supported
 *   14 - unexpected auth seq number
 *   15 - auth rejected, challenge response failed
 *   16 - auth rejected, next frame in seq did not arrive in expected window
 *   17 - association denied, ap lacks resources
 *   18 - association denied, mobile does not support BSS required data rates
 *   19 - association denied, mobile does not support short preamble
 *   20 - association denied, mobile does not support PBCC modulation
 *   21 - association denied, mobile does not support channel agility
 */

var SIMPLE_AP_CAPABILITY = new Buffer([0x80, 0x00]);


exports.SIMPLE_AP_CAPABILITY = SIMPLE_AP_CAPABILITY;