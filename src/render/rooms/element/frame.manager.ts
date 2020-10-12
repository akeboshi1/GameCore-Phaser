import { IDispose } from "../action/IDispose";
import { Handler } from "../../../utils/handler";

export class FrameManager implements IDispose {

    private handlers: Handler[] = [];
    public add(caller: any, method: Function, args?: any[]) {
        this.remove(caller, method);
        const handler = new Handler(caller, method, args);
        this.handlers.push(handler);
    }

    public remove(caller: any, method: Function) {
        let removeid: number = -1;
        for (let i = 0; i < this.handlers.length; i++) {
            const item = this.handlers[i];
            if (item.caller === caller && item.method === method) {
                removeid = i;
                break;
            }
        }
        if (removeid !== -1) {
            const hander = this.handlers.splice(removeid, 1)[0];
            hander.clear();
        }
    }
    public update(time: number, delta: number) {
        for (const item of this.handlers) {
            item.runWith([time, delta]);
        }
    }

    public destroy() {
        for (const item of this.handlers) {
            item.clear();
        }
        this.handlers.length = 0;
    }

    public hasRegistered(caller: any, method: Function) {
        let removeid: number = -1;
        for (let i = 0; i < this.handlers.length; i++) {
            const item = this.handlers[i];
            if (item.caller === caller && item.method === method) {
                removeid = i;
                break;
            }
        }
        return (removeid !== -1);
    }
}
