import { MainPeer } from "../main.peer";
import { BaseState } from "./base.state";
export declare class LoginState extends BaseState {
    constructor(main: MainPeer, key: string);
    run(): void;
}
