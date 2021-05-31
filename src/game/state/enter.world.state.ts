import { MainPeer } from "../main.peer";
import { BaseState } from "./base.state";

export class EnterWorldState extends BaseState {
    constructor(main: MainPeer, key: string) {
        super(main, key);
    }
}
