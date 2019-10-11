import {Panel} from "../components/panel";
import {Border} from "../../utils/resUtil";

export class UserMenuPanel extends Panel {
    constructor(scene: Phaser.Scene) {
        super(scene);
    }

    protected preload() {
        this.scene.load.image(Border.getName(), Border.getPNG());
        super.preload();
    }

    protected init() {
        super.init();
    }
}
