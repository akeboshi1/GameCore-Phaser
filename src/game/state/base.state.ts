import { IState } from "structure";
import { MainPeer } from "../main.peer";
export class BaseState implements IState {
    protected mMain: MainPeer;
    constructor(main: MainPeer) {
        this.mMain = main;
    }
    get main(): MainPeer {
        return this.mMain;
    }
    run() {
    }
    update() {
    }
    next() {
    }
}
