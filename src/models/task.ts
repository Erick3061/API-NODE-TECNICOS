import { ScheduledTask } from "node-cron";
import { GetActiveServices, UpdateService } from '../querys/querysTecnicos';
import { Service } from '../rules/response';
import moment from 'moment';
import { modDate } from "../functions/functions";

interface task {
    nameTask: string;
    cron: string;
    running: boolean;
    task: ScheduledTask;
}

class Task {
    task: Array<task> = [];
    constructor() {
        this.getCrons();
    }
    async deleteTaskifNotExist(services: Array<Service>) {
        console.log(`verificando tareas`);
        if (services.length === 0) {
            this.task.forEach(m => this.delete(m.nameTask));
        } else {
            const servicios = [...new Set(services.map(s => s.id_service))];
            this.task.forEach(t => {
                if (servicios.find(f => f === t.nameTask) === undefined) {
                    this.delete(t.nameTask);
                    console.log(`Task: ${t.nameTask} Eliminada.`);
                }
            });
        }
    }

    async getCrons() {
        const services = await GetActiveServices({});
        const dateActual = modDate({ hours: 0, minutes: 0, seconds: 0 });
        if (typeof (services) === 'string') {
            console.log(services);
        } else {
            for (const s of services) {
                const isAfter = moment(dateActual.DATE).isAfter(s.exitDate);
                if (isAfter) {
                    const prop: string = ` isTimeExpired = 'true' `
                    await UpdateService({ id_service: s.id_service, interno: true, prop, selected: true });
                } else {
                    if (s.cron !== null) {
                        this.add(s.id_service, s.cron, s.isTimeExpired);
                    }
                }
            }
        }
    }

    public getTask() { return this.task; }

    stop(nameTask: string) {
        const idx = this.task.findIndex(f => f.nameTask === nameTask);
        if (idx !== -1) {
            this.task[idx].task.stop();
            this.task[idx].running = false;
        } else {
            console.log(`servicio no encontrado`);
        }
    }

    public add(id_service: string, expire: string, isTimeExpired: boolean) {
        const cron = require('node-cron');
        const task: ScheduledTask = cron.schedule(expire, async () => {
            const service: string = id_service;
            console.log(`Ejecutando la tarea ${service}`);
            const updated = await UpdateService({ id_service: service, prop: `isTimeExpired = 'true'`, interno: true });
            if (typeof (updated) === 'string') {
                console.log(updated);
            }
            if (typeof (updated) === 'boolean' && updated) {
                console.log(`servicio ${service} ha expirado`);
            }
            this.stop(id_service);
        }, { scheduled: (isTimeExpired) ? false : true });

        this.task = [...this.task, { nameTask: id_service, running: (isTimeExpired) ? false : true, task, cron: expire }];
    }

    public async update() {
        this.task.map(t => this.stop(t.nameTask));
        console.log(`Tareasparadas`, this.task);
        this.task = [];
        console.log(`Tareas`, this.task.length);
        await this.getCrons();
        console.log(`tareas actualizadas`, this.task.map(t => t.nameTask));
    }

    public delete(id_service: string) {
        this.stop(id_service);
        this.task = this.task.filter(f => f.nameTask !== id_service);
    }

}
export default Task;