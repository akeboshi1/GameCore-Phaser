import { Panel } from "../components/panel";

export class BaseChatPanel extends Panel {
    constructor(scene) {
        super(scene);
    }
    public appendChat(val: string) {
    }

    public setLocation(x?: number, y?: number) {
    }

    get outChannel(): number {
        return 0;
    }
}
