import { PacketHandler } from "net-socket-packet";
import { Game } from "../game";
export declare class JoystickManager extends PacketHandler {
    private game;
    private user;
    private targetPoint;
    constructor(game: Game);
    register(): void;
    start(): void;
    stop(): void;
    calcAngle(x: number, y: number): void;
    destroy(): void;
}
