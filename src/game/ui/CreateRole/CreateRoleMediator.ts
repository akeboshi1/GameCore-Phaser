import { Game } from "../../game";
import { BasicMediator } from "../basic/basic.mediator";

export class CreateRoleMediator extends BasicMediator {
    constructor(private game: Game) {
        super();
    }

    show(params?: any) {
        this.game.renderPeer.showCreateRole(params);
    }
}
