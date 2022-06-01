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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const querysTecnicos_1 = require("../querys/querysTecnicos");
const moment_1 = __importDefault(require("moment"));
const functions_1 = require("../functions/functions");
class Task {
    constructor() {
        this.task = [];
        this.getCrons();
    }
    deleteTaskifNotExist(services) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`verificando tareas`);
            if (services.length === 0) {
                this.task.forEach(m => this.delete(m.nameTask));
            }
            else {
                const servicios = [...new Set(services.map(s => s.id_service))];
                this.task.forEach(t => {
                    if (servicios.find(f => f === t.nameTask) === undefined) {
                        this.delete(t.nameTask);
                        console.log(`Task: ${t.nameTask} Eliminada.`);
                    }
                });
            }
        });
    }
    getCrons() {
        return __awaiter(this, void 0, void 0, function* () {
            const services = yield (0, querysTecnicos_1.GetActiveServices)({});
            const dateActual = (0, functions_1.modDate)({ hours: 0, minutes: 0, seconds: 0 });
            if (typeof (services) === 'string') {
                console.log(services);
            }
            else {
                for (const s of services) {
                    const isAfter = (0, moment_1.default)(dateActual.DATE).isAfter(s.exitDate);
                    if (isAfter) {
                        const prop = ` isTimeExpired = 'true' `;
                        yield (0, querysTecnicos_1.UpdateService)({ id_service: s.id_service, interno: true, prop, selected: true });
                    }
                    else {
                        if (s.cron !== null) {
                            this.add(s.id_service, s.cron, s.isTimeExpired);
                        }
                    }
                }
            }
        });
    }
    getTask() { return this.task; }
    stop(nameTask) {
        const idx = this.task.findIndex(f => f.nameTask === nameTask);
        if (idx !== -1) {
            this.task[idx].task.stop();
            this.task[idx].running = false;
        }
        else {
            console.log(`servicio no encontrado`);
        }
    }
    add(id_service, expire, isTimeExpired) {
        const cron = require('node-cron');
        const task = cron.schedule(expire, () => __awaiter(this, void 0, void 0, function* () {
            const service = id_service;
            console.log(`Ejecutando la tarea ${service}`);
            const updated = yield (0, querysTecnicos_1.UpdateService)({ id_service: service, prop: `isTimeExpired = 'true'`, interno: true });
            if (typeof (updated) === 'string') {
                console.log(updated);
            }
            if (typeof (updated) === 'boolean' && updated) {
                console.log(`servicio ${service} ha expirado`);
            }
            this.stop(id_service);
        }), { scheduled: (isTimeExpired) ? false : true });
        this.task = [...this.task, { nameTask: id_service, running: (isTimeExpired) ? false : true, task, cron: expire }];
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            this.task.map(t => this.stop(t.nameTask));
            console.log(`Tareasparadas`, this.task);
            this.task = [];
            console.log(`Tareas`, this.task.length);
            yield this.getCrons();
            console.log(`tareas actualizadas`, this.task.map(t => t.nameTask));
        });
    }
    delete(id_service) {
        this.stop(id_service);
        this.task = this.task.filter(f => f.nameTask !== id_service);
    }
}
exports.default = Task;
//# sourceMappingURL=task.js.map