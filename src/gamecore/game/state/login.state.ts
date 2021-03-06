import { MainPeer } from "../main.peer";
import { BaseState } from "./base.state";

export class LoginState extends BaseState {
    constructor(main: MainPeer, key: string) {
        super(main, key);
    }
    run() {
        super.run();
        this.mGame.renderPeer.showLogin();
    }
}
