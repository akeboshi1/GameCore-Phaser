import { MainPeer } from "../main.peer";
import { BaseState } from "./base.state";
export declare class ConnectingState extends BaseState {
    constructor(main: MainPeer, key: string);
    run(): void;
    update(data?: any): void;
    next(): void;
}
