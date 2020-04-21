import { Handler } from "../../Handler/Handler";
import { IDispose } from "../action/IDispose";

export class FrameManage implements IDispose {

    private handlers: Handler[] = [];
    public add(caller: any, method: Function, args?: any[]) {
        const handler = new Handler(caller, method, args);
        this.handlers.push(handler);
    }

    public remove(caller: any, method: Function) {
        let removeid: number = -1;
        for (const item of this.handlers) {
            removeid++;
            if (item.caller === caller && item.method === method) {
                return;
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

}
