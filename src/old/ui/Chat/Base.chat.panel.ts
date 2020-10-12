import { BasePanel } from "../Components/BasePanel";
import { WorldService } from "../../world.service";
export class BaseChatPanel extends BasePanel {
    constructor(scene, world: WorldService) {
        super(scene, world);
    }
    public appendChat(val: string) {
    }

    get outChannel(): number {
        return 0;
    }
}
