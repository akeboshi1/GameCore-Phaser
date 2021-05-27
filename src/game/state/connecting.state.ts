import { MainPeer } from "../main.peer";
import { BaseState } from "./base.state";

export class ConnectingState extends BaseState {
    constructor(main: MainPeer) {
        super(main);
    }
}
