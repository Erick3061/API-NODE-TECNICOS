"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnterpriceOfTechnicals = exports.modDate = exports.getDate = exports.EncriptRot39 = exports.DecriptRot39 = void 0;
const querysTecnicos_1 = require("../querys/querysTecnicos");
/**
 * @typedef {Objet} date
 * @property {String} date YYYY-MM-DD
 * @property {Number} day dia
 * @property {Number} month mes
 * @property {Number} year año
 */
/**
 * @typedef {Object} time
 * @property {String} time HH:MM:SS
 * @property {Number} hour horas
 * @property {Number} minute minutos
 * @property {Number} second segundos
 */
/**
 * @typedef {Object} FormatDate
 * @property {Date} DATE YYYY-MM-DDTHH:MM:SS.MSEGZ
 * @property {date} date objeto fecha
 * @property {time} time onjeto hora
 * @property {Number} weekday número del dia de la semana
 */
/**@module FUNCTIONS */
/**
 * @description Verifica si es una letra en el código ASCII
 * @param {String} caracter caracter a convertir y hacer match con el código ASCII
 * @returns {Boolean}
 */
const esLetra = (caracter) => {
    let ascii = caracter.toUpperCase().charCodeAt(0);
    return ascii > 64 && ascii < 91;
};
/**
 * @description Verifica si es un número en el código ASCII
 * @param {String} caracter caracter a convertir y hacer match con el código ASCII
 * @returns {Boolean}
 */
const esNumero = (caracter) => {
    let ascii = caracter.toUpperCase().charCodeAt(0);
    return ascii > 47 && ascii < 58;
};
/**
 * @description Método que utiliza MonitoringWorks para desencriptar sus cadenas encriptadas SOLO MAYUSCULAS
 * @param {String} text Texto a desencriptar
 * @returns {String} Cadena desencriptada
 */
const DecriptRot39 = (text) => {
    const Code = [...text].map((el) => (esLetra(String.fromCharCode(el.charCodeAt(0) - 39)) || esNumero(String.fromCharCode(el.charCodeAt(0) - 39))) ? String.fromCharCode(el.charCodeAt(0) - 39) : String.fromCharCode(el.charCodeAt(0)));
    return Code.join('');
};
exports.DecriptRot39 = DecriptRot39;
/**
 * @description Método que utiliza MonitoringWorks para encriptar sus cadenas SOLO MAYUSCULAS
 * @param {String} text Texto a desencriptar
 * @returns {String} Cadena desencriptada
 */
const EncriptRot39 = (text) => {
    const Code = [...text].map((el) => (esLetra(el) || esNumero(el)) ? (String.fromCharCode(el.charCodeAt(0) + 39)) : (String.fromCharCode(el.charCodeAt(0))));
    return Code.join('');
};
exports.EncriptRot39 = EncriptRot39;
/**
 * @description Retorna un formato de fecha que contiene horas, minutos, segundos, dia, mes, año, numero de día de la semana, y formato  DATE
 * @returns {FormatDate}
 */
const getDate = () => {
    const newDate = new Date();
    const [day, month, year] = newDate.toLocaleDateString("es-MX", {
        year: 'numeric', month: 'numeric', day: 'numeric'
    }).split('/');
    const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const time = `${newDate.toTimeString().slice(0, 8)}`;
    const [hour, minute, second] = time.split(':').map(m => parseInt(m));
    const dateGenerated = new Date(`${date}T${time}.000Z`);
    const weekday = dateGenerated.getDay();
    return {
        DATE: dateGenerated,
        date: { date, day: parseInt(day), month: parseInt(month), year: parseInt(year) },
        time: { time, hour, minute, second },
        weekday
    };
};
exports.getDate = getDate;
/**
 * Retorna un formato de fecha que contiene horas, minutos, segundos, dia, mes, año, numero de día de la semana, y formato DATE aumentando o disminuyendo las horas, minutos y segundos
 * @param {Object<{hours:Number, minutes:Number, seconds:Number, dateI: Date}>} parámetros
 * @returns {FormatDate}
 */
const modDate = ({ hours, minutes, seconds, dateI }) => {
    const newDate = (dateI) ? new Date(dateI.toJSON()) : (0, exports.getDate)().DATE;
    newDate.setHours(newDate.getHours() + hours);
    newDate.setMinutes(newDate.getMinutes() + minutes);
    newDate.setSeconds(newDate.getSeconds() + seconds);
    const [date, time] = newDate.toJSON().split('.')[0].split('T');
    const [year, month, day] = date.split('-').map(m => parseInt(m));
    const [hour, minute, second] = time.split(':').map(m => parseInt(m));
    const weekday = newDate.getDay();
    return {
        DATE: newDate,
        date: { date, day, month, year },
        time: { time, hour, minute, second },
        weekday
    };
};
exports.modDate = modDate;
/**
 * @description Obtiene la empresa asignada de un técnico
 * @param {Array<String>} id_services Arreglo de servicios activos o inactivos
 * @returns {Promise<{id_service: String, enterprice:Array<Number>}>}
 */
const getEnterpriceOfTechnicals = (id_services) => __awaiter(void 0, void 0, void 0, function* () {
    const technicals = yield (0, querysTecnicos_1.GetTechnicalsInServiceActive)();
    let enterprices = [];
    (typeof technicals === 'object') && technicals.forEach(p => { enterprices = [...enterprices, { id_enterprice: p.id_enterprice, id_service: p.id_service }]; });
    const Enterprices = id_services.map(s => {
        const arr = [...new Set(enterprices.filter(f => f.id_service === s).map(m => m.id_enterprice))];
        return { id_service: s, enterprice: arr };
    });
    return Enterprices;
});
exports.getEnterpriceOfTechnicals = getEnterpriceOfTechnicals;
//# sourceMappingURL=functions.js.map