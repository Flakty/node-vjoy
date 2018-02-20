const vJoy = require('./main.js');

var c1 = new vJoy.Controller();
var t = 0;

c1.enable().then(() => {
  setInterval(() => {
    c1.button[0].tap();
  }, 500)
  setInterval(() => {
    c1.axis.x.set((Math.sin(t) + 1) * 0.5);
    t += 0.05;
  }, 50)
}).catch((e) => {
  throw e;
});
