import { EventEmitter } from "events";

class AppEmitter extends EventEmitter {}

export const events = new AppEmitter();
