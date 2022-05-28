import { GetTechnicalsInServiceActive } from "../querys/querysTecnicos";

const esLetra = (caracter: string) => {
    let ascii = caracter.toUpperCase().charCodeAt(0);
    return ascii > 64 && ascii < 91;
};

const esNumero = (caracter: string) => {
    let ascii = caracter.toUpperCase().charCodeAt(0);
    return ascii > 47 && ascii < 58;
};

//SOLO FUNCIONA CON MAYUSCULAS Y NUMEROS
export const DecriptRot39 = (text: string) => {
    const Code = [...text].map((el) => (esLetra(String.fromCharCode(el.charCodeAt(0) - 39)) || esNumero(String.fromCharCode(el.charCodeAt(0) - 39))) ? String.fromCharCode(el.charCodeAt(0) - 39) : String.fromCharCode(el.charCodeAt(0)));
    return Code.join('');
}

export const EncriptRot39 = (text: string) => {
    const Code = [...text].map((el) => (esLetra(el) || esNumero(el)) ? (String.fromCharCode(el.charCodeAt(0) + 39)) : (String.fromCharCode(el.charCodeAt(0))));
    return Code.join('');
}

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
