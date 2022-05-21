import { Person } from "./interfaces";

export interface TypeService { id_Type: number; name: string; }

export interface Service {
    id_service: string;
    grantedEntry: string;
    grantedExit: string | null;
    firstVerification: string | null;
    secondVerification: string | null;
    id_type: number;
    folio: string;
    entryDate: Date;
    exitDate: Date;
    accountMW: string;
    cron: string | null;
    filesCron: string;
    isDelivered: boolean;
    isKeyCode: boolean;
    isOpCi: boolean;
    isTimeExpired: boolean;
    isActive: boolean;
    withOutFolio: boolean;
}

export interface Comment {
    id_service: string;
    person: string;
    comment: string;
}

export interface Binnacle {
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

export interface ServiceDetails {
    service: Service;
    comments: Array<Comment>;
    binnacle: Binnacle;
    technicals: Array<Person>;
}



export interface Role { id_role: number; name: string }
