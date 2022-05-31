"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rError = void 0;
const rError = ({ location, msg, resp, status, param, value }) => {
    return resp.status(status ? status : 500).json({ status: false, errors: [{ value: (value) ? value : '', msg, location: (location) ? location : '', param: (param) ? param : '', }] });
};
exports.rError = rError;
//# sourceMappingURL=errorController.js.map