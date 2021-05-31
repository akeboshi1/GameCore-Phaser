import { IState } from "structure";
import { MainPeer } from "../main.peer";
export class BaseState implements IState {
    protected mMain: MainPeer;
    protected mKey: string;
    constructor(main: MainPeer, key: string) {
        this.mMain = main;
        this.mKey = key;
    }
    get main(): MainPeer {
        return this.mMain;
    }
    get key(): string {
        return this.mKey;
    }
    run(data?: any) {
    }
    update(data?: any) {
    }
    next() {
    }
}
