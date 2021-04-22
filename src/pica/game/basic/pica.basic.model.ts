import { ConnectionService } from "lib/net/connection.service";
import { BasicModel, Game } from "gamecore";

export class PicaBasicModel extends BasicModel {
    constructor(protected game: Game) {
        super(game);
        this.register();
    }
    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.onAddLisenter();
        }
    }

    unregister() {
        const connection = this.connection;
        if (connection) {
            this.connection.removePacketListener(this);
            this.onRemoveLisenter();
        }
    }

    onAddLisenter() {

    }

    onRemoveLisenter() {

    }

    destroy() {
        this.unregister();
    }
    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }

    get proto() {
        return this.game.customProto;
    }
}
