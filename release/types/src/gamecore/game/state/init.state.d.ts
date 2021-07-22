import { MainPeer } from "../main.peer";
import { BaseState } from "./base.state";
export declare class InitState extends BaseState {
    constructor(main: MainPeer, key: string);
    run(data: any): void;
    next(): void;
}
