import { GetTechnicalsInServiceActive } from "../querys/querysTecnicos";
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
const esLetra = (caracter: string) => {
    let ascii = caracter.toUpperCase().charCodeAt(0);
    return ascii > 64 && ascii < 91;
};

/**
 * @description Verifica si es un número en el código ASCII
 * @param {String} caracter caracter a convertir y hacer match con el código ASCII 
 * @returns {Boolean}
 */
const esNumero = (caracter: string) => {
    let ascii = caracter.toUpperCase().charCodeAt(0);
    return ascii > 47 && ascii < 58;
};

/**
 * @description Método que utiliza MonitoringWorks para desencriptar sus cadenas encriptadas SOLO MAYUSCULAS
 * @param {String} text Texto a desencriptar
 * @returns {String} Cadena desencriptada
 */
export const DecriptRot39 = (text: string) => {
    const Code = [...text].map((el) => (esLetra(String.fromCharCode(el.charCodeAt(0) - 39)) || esNumero(String.fromCharCode(el.charCodeAt(0) - 39))) ? String.fromCharCode(el.charCodeAt(0) - 39) : String.fromCharCode(el.charCodeAt(0)));
    return Code.join('');
}

/**
 * @description Método que utiliza MonitoringWorks para encriptar sus cadenas SOLO MAYUSCULAS
 * @param {String} text Texto a desencriptar
 * @returns {String} Cadena desencriptada
 */
export const EncriptRot39 = (text: string) => {
    const Code = [...text].map((el) => (esLetra(el) || esNumero(el)) ? (String.fromCharCode(el.charCodeAt(0) + 39)) : (String.fromCharCode(el.charCodeAt(0))));
    return Code.join('');
}

/**
 * @description Retorna un formato de fecha que contiene horas, minutos, segundos, dia, mes, año, numero de día de la semana, y formato  DATE
 * @returns {FormatDate}
 */
export const getDate = () => {
    const newDate: Date = new Date();
    const [day, month, year]: Array<string> = newDate.toLocaleDateString("es-MX", {
        year: 'numeric', month: 'numeric', day: 'numeric'
    }).split('/');
    const date: string = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const time: string = `${newDate.toTimeString().slice(0, 8)}`;
    const [hour, minute, second]: Array<number> = time.split(':').map(m => parseInt(m));
    const dateGenerated: Date = new Date(`${date}T${time}.000Z`);
    const weekday = dateGenerated.getDay();
    return {
        DATE: dateGenerated,
        date: { date, day: parseInt(day), month: parseInt(month), year: parseInt(year) },
        time: { time, hour, minute, second },
        weekday
    };
}

/**
 * Retorna un formato de fecha que contiene horas, minutos, segundos, dia, mes, año, numero de día de la semana, y formato DATE aumentando o disminuyendo las horas, minutos y segundos
 * @param {Object<{hours:Number, minutes:Number, seconds:Number, dateI: Date}>} parámetros
 * @returns {FormatDate}
 */
export const modDate = ({ hours, minutes, seconds, dateI }: { dateI?: Date, seconds: number, minutes: number, hours: number }) => {
    const newDate = (dateI) ? new Date(dateI.toJSON()) : getDate().DATE;
    newDate.setHours(newDate.getHours() + hours);
    newDate.setMinutes(newDate.getMinutes() + minutes);
    newDate.setSeconds(newDate.getSeconds() + seconds);
    const [date, time] = newDate.toJSON().split('.')[0].split('T');
    const [year, month, day]: Array<number> = date.split('-').map(m => parseInt(m));
    const [hour, minute, second]: Array<number> = time.split(':').map(m => parseInt(m));
    const weekday = newDate.getDay();
    return {
        DATE: newDate,
        date: { date, day, month, year },
        time: { time, hour, minute, second },
        weekday
    };
}

/**
 * @description Obtiene la empresa asignada de un técnico
 * @param {Array<String>} id_services Arreglo de servicios activos o inactivos 
 * @returns {Promise<{id_service: String, enterprice:Array<Number>}>}
 */
export const getEnterpriceOfTechnicals = async (id_services: Array<string>) => {
    const technicals = await GetTechnicalsInServiceActive();
    let enterprices: Array<{ id_enterprice: number, id_service: string | undefined }> = [];
    (typeof technicals === 'object') && technicals.forEach(p => { enterprices = [...enterprices, { id_enterprice: p.id_enterprice, id_service: p.id_service }] });

    const Enterprices = id_services.map(s => {
        const arr = [...new Set(enterprices.filter(f => f.id_service === s).map(m => m.id_enterprice))];
        return { id_service: s, enterprice: arr }
    });
    return Enterprices;
}
