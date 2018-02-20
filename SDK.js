// reference used:
// http://vjoystick.sourceforge.net/site/includes/SDK_ReadMe.pdf
//
// chapter names are quoted for lookup in the reference

const ffi    = require('ffi');
const ref    = require('ref');
const Struct = require('ref-struct');

const DWORD = 'uint32';

// Interface Structures
const JOYSTICK_POSITION_V2 = Struct({
  'bDevice':     'byte',
  'wThrottle':   'long',
  'wRudder':     'long',
  'wAileron':    'long',
  'wAxisX':      'long',
  'wAxisY':      'long',
  'wAxisZ':      'long',
  'wAxisXRot':   'long',
  'wAxisYRot':   'long',
  'wAxisZRot':   'long',
  'wSlider':     'long',
  'wDial':       'long',
  'wWheel':      'long',
  'wAxisVX':     'long',
  'wAxisVY':     'long',
  'wAxisVZ':     'long',
  'wAxisVBRX':   'long',
  'wAxisVBRY':   'long',
  'wAxisVBRZ':   'long',
  'lButtons':    'long',
  'bHats':        DWORD,
  'bHatsEx1':     DWORD,
  'bHatsEx2':     DWORD,
  'bHatsEx3':     DWORD,
  'lButtonsEx1': 'long',
  'lButtonsEx2': 'long',
  'lButtonsEx3': 'long'
});
const JOYSTICK_POSITION_V2_ptr = ref.refType(JOYSTICK_POSITION_V2);

// Interface Functions
const vJoySDK = ffi.Library('vJoyInterface', {
  // General Driver Data
  // some functions not implemented
  'GetvJoyVersion': ['short', []],
  'vJoyEnabled':    ['bool',  []],
  // Device Information
  'GetVJDButtonNumber':  ['int',  ['uint']],
  'GetVJDDiscPovNumber': ['int',  ['uint']],
  'GetVJDContPovNumber': ['int',  ['uint']],
  'GetVJDAxisExist':     ['bool', ['uint', 'uint']],
  'GetVJDStatus':        ['int',  ['uint']],
  // Device Feeding
  'AcquireVJD':    ['bool', ['uint']],
  'RelinquishVJD': ['bool', ['uint']],
  'UpdateVJD':     ['bool', ['uint', JOYSTICK_POSITION_V2_ptr]],
  'ResetVJD':      ['bool', ['uint']],
  'ResetAll':      ['bool', []],
  'ResetButtons':  ['bool', ['uint']],
  'ResetPovs':     ['bool', ['uint']],
  'SetAxis':       ['bool', ['long', 'uint', 'uint']],
  'SetBtn':        ['bool', ['bool', 'uint', 'uchar']],
  'SetDiscPov':    ['bool', ['int',  'uint', 'uchar']],
  'SetContPov':    ['bool', [DWORD,  'uint', 'uchar']]
  // Force Feedback
  // functions and related structs not implemented
});

vJoySDK.JOYSTICK_POSITION_V2     = JOYSTICK_POSITION_V2;
vJoySDK.JOYSTICK_POSITION_V2_ptr = JOYSTICK_POSITION_V2_ptr;

vJoySDK.HID_USAGE_X   = 0x30;
vJoySDK.HID_USAGE_Y   = 0x31;
vJoySDK.HID_USAGE_Z   = 0x32;
vJoySDK.HID_USAGE_RX  = 0x33;
vJoySDK.HID_USAGE_RY  = 0x34;
vJoySDK.HID_USAGE_RZ  = 0x35;
vJoySDK.HID_USAGE_SL0 = 0x36;
vJoySDK.HID_USAGE_SL1 = 0x37;
vJoySDK.HID_USAGE_WHL = 0x38;
vJoySDK.HID_USAGE_POV = 0x39;

vJoySDK.NORTH   = 0;
vJoySDK.EAST    = 1;
vJoySDK.SOUTH   = 2;
vJoySDK.WEST    = 3;
vJoySDK.NEUTRAL = -1;

// Interface Constants
vJoySDK.VJD_STAT_OWN  = 0;
vJoySDK.VJD_STAT_FREE = 1;
vJoySDK.VJD_STAT_BUSY = 2;
vJoySDK.VJD_STAT_MISS = 3;
vJoySDK.VJD_STAT_UNKN = 4;

module.exports = vJoySDK;
