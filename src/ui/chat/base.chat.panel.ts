import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";

export class BaseChatPanel extends BasePanel {
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
