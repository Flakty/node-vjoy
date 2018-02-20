'use strict';

const SDK = require('./SDK.js');

const vJoy = {
  SDK: SDK
};

vJoy.Controller = function(rID) {
  this.rID = rID || null;
  this.enabled = false;
  this.button = [];
  this.axis = {}
}

vJoy.Button = function(controller, index) {
  this.controller = controller;
  this.index = index;
}

vJoy.Axis = function(controller, index) {
  this.controller = controller;
  this.index = index;
}

// i'm so sorry

// acquires an available controller from the driver
// starts requesting controller 0 to 15, until one is found
vJoy.Controller.prototype.enable = function() {
  var controller = this;
  return new Promise(function(resolve, reject) {
    var stats = [];
    seeIfAvailable(1);

    function seeIfAvailable(rID) {
      SDK.GetVJDStatus.async(rID, function(error, status) {
        if (error) reject(error);
        stats[rID - 1] = status;
        if (status === SDK.VJD_STAT_FREE) {
          SDK.AcquireVJD.async(rID, function(error, success) {
            if (error) { reject(error); return; }
            if (success) {
              setUpButtonAmounts(rID);
              return;
            } else {
              reject(new Error('Could not acquire joystick from driver.\nStat results: ' + `[${stats.join(", ")}]`));
              return;
            }
          });
        } else {
          rID++;
          if (rID < 16) {
            seeIfAvailable(rID);
          } else {
            reject(new Error('No free joystick found, is the vJoy driver running?\nStat results: ' + `[${stats.join(", ")}]`));
            return;
          }
        }
      });
    }

    function setUpButtonAmounts(rID) {
      SDK.GetVJDButtonNumber.async(rID, (error, buttonAmount) => {
        if (error) {
          reject(error); // TODO: disable controller whenever button amounts cannot be read:::::::: do this by only writing to `this` at the end of routine
          return;
        }
        if (buttonAmount < 0) {
          if (buttonAmount === -2) {reject(new Error("Function failed to get device's pre-parsed data"))}
          if (buttonAmount === -3) {reject(new Error("Function failed to get device's capabilities"))}
          if (buttonAmount === -4) {reject(new Error(`Function failed to get the “Number of Buttons” field in the device's capabilities structure.`))}
          if (buttonAmount === -6) {reject(new Error("Function failed to extract the Button Capabilities from the device's capabilities structure."))}
          if (buttonAmount === -7) {reject(new Error("Function failed to extract the Button Range from device's capabilities structure."))}
          return;
        }
        for (var b = 0; b < buttonAmount; b++) {
          controller.button[b] = new vJoy.Button(controller, b + 1);
        }
        setUpAxis(rID);
        return;
      });
    }

    function setUpAxis(rID) {
      var names = ['x', 'y', 'z', 'rx', 'ry', 'rz', 'slider0', 'slider1', 'wheel', 'pov'];
      var callsBack = 0; // make your variables descriptive, they said
      for (var n = 0; n < names.length; n++) {
        testAxis(rID, names[n], 48 + n, (error, exists, name, value) => {
          if (error) {
            reject(error);
            return;
          }
          if (exists) {
            controller.axis[name] = new vJoy.Axis(controller, value);
          }
          callsBack++;
          if (callsBack >= names.length) {
            controller.rID = rID;
            controller.enabled = true;
            resolve(controller);
            return;
          }
        });
      }
    }

    function testAxis(rID, name, value, callback) {
      SDK.GetVJDAxisExist.async(rID, value, (error, exists) => {
        callback(error, exists, name, value); // lmao what
      });
    }
  });
}

vJoy.Controller.prototype.disable = function() {
  var controller = this;
  if (!this.enabled) {
    return new Promise(function(resolve, reject) {
      resolve(controller);
    });
  }
  return new Promise(function(resolve, reject) {
    SDK.RelinquishVJD.async(controller.rID, (error) => {
      if (error) { reject(error); return; }
      controller.rID = null;
      controller.enabled = false;
      controller.buttons = [];
      controller.axis = {};
      resolve(controller);
    });
  });
}

vJoy.Controller.prototype.reset = function() {
  var success = SDK.ResetVJD(this.controller.rID);
  if (!success) throw new Error('Could not reset controls.');
}

vJoy.Controller.prototype.resetButtons = function() {
  var success = SDK.ResetButtons(this.controller.rID);
  if (!success) throw new Error('Could not reset buttons.');
}

vJoy.Button.prototype.set = function(value) {
  var success = SDK.SetBtn(value, this.controller.rID, this.index);
  if (!success) throw new Error('Could not set button value.');
}

vJoy.Button.prototype.down = function() {
  this.set(true);
}

vJoy.Button.prototype.up = function() {
  this.set(false);
}

vJoy.Button.prototype.hold = function(ms) {
  var button = this;
  button.down()
  setTimeout(function() {
    button.up()
  }, ms);
}

vJoy.Button.prototype.tap = function() {
  this.hold(100);
}

// between 0 and 1
vJoy.Axis.prototype.set = function(float) {
  var value = Math.round(float * 32767 + 1);
  SDK.SetAxis(value, this.controller.rID, this.index)
}

module.exports = vJoy;
