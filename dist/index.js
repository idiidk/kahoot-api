"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Player", {
  enumerable: true,
  get: function get() {
    return _player["default"];
  }
});
Object.defineProperty(exports, "Events", {
  enumerable: true,
  get: function get() {
    return _events["default"];
  }
});
exports.Session = exports.Helpers = void 0;

var Helpers = _interopRequireWildcard(require("./helpers"));

exports.Helpers = Helpers;

var Session = _interopRequireWildcard(require("./session"));

exports.Session = Session;

var _player = _interopRequireDefault(require("./player"));

var _events = _interopRequireDefault(require("./events"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }
//# sourceMappingURL=index.js.map