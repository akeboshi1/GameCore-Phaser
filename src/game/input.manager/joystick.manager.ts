import { PacketHandler } from "net-socket-packet";
import { LogicPoint, Tool } from "utils";
import { User } from "../actor/user";
import { Game } from "../game";

export class JoystickManager extends PacketHandler {
    private user: User;
    private targetPoint: LogicPoint;
    constructor(private game: Game) {
        super();
        this.user = this.game.user;
        this.register();
    }

    register() {
        const peer = this.game.peer;
        peer.exportProperty(this, this.game.peer, this.constructor.name).onceReady(() => {
            this.game.renderPeer.showJoystick();
        });
    }

    start() {
        this.user.startMove();
    }
    
    stop() {
        this.user.stopMove();
    }

    calcAngle(x: number, y: number) {
        if (!this.user) {
            return;
        }
        this.user.tryMove({ x, y });
        // Logger.getInstance().log("pointer position: ", Tool.angleToDirections(angle, 3, undefined));
    }

    destroy() {
        delete this.game.peer[this.constructor.name];
    }
}
