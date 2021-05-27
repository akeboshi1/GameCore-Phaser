import { MainPeer } from "../main.peer";
import { BaseState } from "./base.state";

export class GameRunningState extends BaseState {
    constructor(main: MainPeer) {
        super(main);
    }
}
