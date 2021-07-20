import { MainPeer } from "../main.peer";
import { BaseState } from "./base.state";
export declare class GameRunningState extends BaseState {
    constructor(main: MainPeer, key: string);
    next(data?: any): void;
}
