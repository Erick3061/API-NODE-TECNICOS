import { RERROR } from "../rules/interfaces";
export const rError = ({ location, msg, resp, status, param, value }: RERROR) => {
    return resp.status(status ? status : 500).json({ status: false, errors: [{ value: (value) ? value : '', msg, location: (location) ? location : '', param: (param) ? param : '', }] });
}