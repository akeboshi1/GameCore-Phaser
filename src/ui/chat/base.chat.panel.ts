import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";

export class BaseChatPanel extends Panel {
    constructor(scene, world: WorldService) {
        super(scene, world);
    }
    public appendChat(val: string) {
    }

    public setLocation(x?: number, y?: number) {
    }

    public tweenView(show: boolean) {
    }

    get outChannel(): number {
        return 0;
    }
}
