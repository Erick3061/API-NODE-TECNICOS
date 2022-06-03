import { Response } from "express";
import fileUpload from "express-fileupload";

export const administrator: Person = {
    email: '',
    employeeNumber: 'admin',
    id_enterprice: 0,
    id_role: 4,
    id_person: 'admin',
    lastname: '',
    nameUser: 'admin',
    password: '',
    personName: 'Administrator',
    phoneNumber: '',
    shortName: 'DEV',
    status: '',
    withOutFolio: false
}

/** bodyAddPerson*/
export interface BAPEnterprice {
    id: number;
    shortName: string;
}
export interface BAPRole {
    id: number;
    name: string;
    user: string;
}

export interface responseLoadedFile {
    nameFile: string,
    directoryFile: string,
    fullDirectory: string,
}

export interface propsUpLoadFile {
    files: fileUpload.FileArray;
    validExtensions?: Array<string>;
    type: 'Service' | 'Person' | 'Enterprice';
    carpeta?: string;
}

export interface bodyPerson {
    name: string;
    lastname: string;
    email: string | null;
    password: string;
    phoneNumber: string | null;
    employeeNumber: string;
    enterprice: BAPEnterprice;
    role: BAPRole;
}
/**RespInsert  */
export interface RespInsert { isInserted: boolean; error?: string; }

export interface Person {
    id_person: string;
    id_enterprice: number;
    id_role: number;
    shortName: string;
    personName: string;
    lastname: string;
    email: string | null;
    password: string;
    phoneNumber: string | null;
    employeeNumber: string;
    status: string;
    nameUser: string | null;
    withOutFolio?: boolean | null;
    id_service?: string;
}

export interface PropsAddPerson {
    id_person: string;
    id_enterprice: number;
    id_role: number;
    name: string;
    lastname: string;
    email: string | null;
    password: string;
    phoneNumber: string | null;
    employeeNumber: string;
}

export interface PropsAddComment {
    id_service: string;
    person: string;
    comment: string;
}

export interface PropsAddBinnacle {
    id_service: string;
    zones: string;
    missingZones: string;
    zonesUndefined: string;
    users: string;
    missingUsers: string;
    usersUndefined: string;
    link: string;
    technicals: string;
}

export interface PropAddService {
    id_type: number;
    grantedEntry: ExistPerson;
    CodigoCte: string;
    technicals: Array<string>;
    isKeyCode: boolean;
    isOpCi: boolean;
    time: PropsMoreTime;
}

export interface PropsAddService {
    id_service: string;
    grantedEntry: string;
    id_type: number;
    folio: string;
    entryDate: Date;
    exitDate: Date;
    accountMW: string;
    digital: string;
    nameAccount: string;
    isKeyCode: boolean;
    isOpCi: boolean;
    cron: string;
}

export interface updateService {
    id_service: string;
    prop: string;
    interno: boolean;
    selected?: boolean;
}

export interface updateTechnical {
    id_service: string;
    id_person: string;
    prop: string;
}

export interface updatePersonData {
    personName: string;
    lastname: string;
    email: string | null;
    password: string;
    phoneNumber: string | null;
    employeeNumber: string;
}

export interface updatePersonProps {
    id_person: string;
    prop?: string;
    data?: updatePersonData;
}

export interface optionsUpdatePerson {
    resetPassword?: boolean;
    deletePerson?: boolean;
    updateStatus?: 'ACTIVO' | 'INACTIVO';
    updateData?: bodyPerson;
}

export interface optionsUpdateEnterprice {
    deleteEnterprice?: boolean;
    updateData?: { shortName: string, name: string };
}

export interface actionPersonProps {
    person: ExistPerson;
    option: optionsUpdatePerson
}

export interface actionEnterpriceProps {
    enterprice: BAPEnterprice;
    option: optionsUpdateEnterprice;
}

export type propiedad = 'isKeyCode' | 'accountMW' | 'firstVerification' | 'secondVerification' | 'moreTime' | 'SF' | 'EF' | 'TS';
export interface PropsBinnacle {
    ze: string;
    zf: string;
    zu: string;
    ue: string;
    uf: string;
    uu: string;
    link: string;
    technicals: string;
}
export interface PropsMoreTime {
    hours: number;
    minutes: number;
    seconds: number;
}
export interface PropsUpdateService {
    person: ExistPerson;
    id_service: string;
    prop: propiedad;
    value: boolean | string | undefined | { comment: string, value?: boolean, binnacle?: PropsBinnacle, moreTime?: PropsMoreTime };
}

export interface ExistPerson { id: string, role: number, name: string };



/**
 * Interfaces consulta API
 */

export interface ResponseApi<T> {
    status: boolean;
    data?: T;
    errors?: Array<Errors>
}

export interface Errors {
    msg: string;
    param: string;
    value: string;
    location: string;
}

export interface account {
    CodigoCte: string;
    CodigoAbonado: string;
    Nombre: string;
    Direccion: string;
    partitions?: partition
    zones?: zone
    users?: user
    contacts?: contact
    panel?: panel
}

export interface event {
    FechaOriginal: string;
    FechaFormat: string;
    Dia: string;
    Hora: string;
    CodigoEvento: string;
    CodigoAlarma: string;
    DescripcionAlarm: string;
    CodigoZona: string;
    DescripcionZona: string;
    CodigoUsuario: string;
    NombreUsuario: string;
    DescripcionEvent: string;
    Particion: number;
    ClaveMonitorista: string;
    NomCalifEvento: string;
    FechaPrimeraToma: string;
    HoraPrimeraToma: string;
    FechaFinalizo: string;
    HoraFinalizo: string;
}
export interface datos {
    Nombre: string;
    Direccion: string;
    CodigoCte: string;
    CodigoAbonado: string;
    haveEvents: boolean;
    eventos: Array<event>
}
export interface RespgetEvents {
    datos: Array<datos>
}

export interface partition {
    codigo: number | null;
    descripcion: string | null;
}
export interface zone {
    codigo: number | null;
    descripcion: string | null;
}
export interface user {
    codigo: string | null;
    nombre: string | null;
    clave: string | null;
    descripcion: string | null;
}
export interface contact {
    codigo: number | null;
    telefono: string | null;
    contacto: string | null;
    descripcion: string | null;
}
export interface panel {
    nombre: string | null;
    ubicacion: string | null;
    descripcion: string | null;
}

export interface RERROR {
    resp: Response;
    status?: number;
    msg: string;
    location?: string;
    param?: string;
    value?: string;
}

export interface Enterprices {
    id_enterprice: number;
    shortName: string;
    name: string;
}

export interface Roles {
    id_role: number;
    name: string;
}

export interface ServicesTypes {
    id_type: number;
    name: string;
}

export interface respGetServiceFiltered { id_service: string; folio: string; entryDate: string; exitDate: string; accountMW: string, technicals?: string };

export interface propsTechnicalBinnacle {
    fullName: string;
    employeeNumber: string;
    id_enterprice: number;
    enterpriceShortName: string;
    nameUser: string;
    phoneNumber: string;
    withOutFolio: string;
}