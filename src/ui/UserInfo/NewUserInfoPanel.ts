import { WorldService } from "../../game/world.service";
import { Panel } from "../components/panel";
import { DynamicImage } from "../components/dynamic.image";
import { Button } from "../../../lib/rexui/lib/ui/button/Button";
import TextArea from "../../../lib/rexui/lib/ui/textarea/TextArea";
import BBCodeText from "../../../lib/rexui/lib/plugins/gameobjects/text/bbocdetext/BBCodeText.js";

export class NewUserInfoPanel extends Panel {
    private mActor: DynamicImage;
    private mNickName: Phaser.GameObjects.Text;
    private mLv: Phaser.GameObjects.Text;
    private mCloseBtn: Button;
    private mTextArea: TextArea;
    constructor(scene: Phaser.Scene, worldService: WorldService) {
        super(scene, worldService);
    }
}
