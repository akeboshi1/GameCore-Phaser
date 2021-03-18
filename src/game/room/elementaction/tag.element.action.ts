/**
 * 11100110101011011010010011100111101100011011101111100101100111101000101
 * 111100100101110001011101011100101100111001011101011100110100110011010111111100
 * 111100010011010100111100100101110111011011011100100101110101010010011100100101
 * 1101010010010111001111011000110111011111001011001111010001011111011111011110010
 * 001100111001101001110010101100111001101001110110100101111001001011100010001101111
 * 0011110010100101010001110010110000110100110011110011010101101101110111110011110011010
 * 100001001110111110111100100011001110011110101101100101101110010110001000100100101110011
 * 110011011101101001110011010001110101001011110100110000101100011011110011110111101101011101
 * 110010110110000101100011110100010100001100011001110111110111100100011001110010010111101100
 * 0011011100110100110001010111111100100101110111001011011100100101110111010110011100101100111011001101011
 * 1001101000110010000001111010001010011010000001111001011000011010011001111001101010110110111011111
 * 0111110111100100011001110011110111011100100
 * 1111100110100111101001110011100100101110111010001111100111101000
 * 00100000011110011010001000100100001110010010111010100001100110110001101111011101010110001001101001
 */
import { EventType } from "structure";
import { ElementBaseAction } from "./element.base.action";

export class TAGElementAction extends ElementBaseAction {
    public actionTag: string = "TQ_PKT_tag";
    public executeAction() {
        const data = this.getActionData();
        if (data) {
            switch (data.type) {
                case "mine":
                    this.executeMine(data);
                    break;
                case "crop":
                    this.executeCrop(data);
                    break;
                case "pick":
                    this.executeCollect(data);
                    break;
                case "openchest":
                    this.executeOpenChest(data);
                    break;
            }
        }
    }

    private executeMine(data: any) {
        const tempdata = { weaponID: "5f912f98c4486f3a23bd2eb4", animation: "mining", times: data.repeat };
        this.game.emitter.emit(EventType.SCENE_PLAYER_ACTION, this.userid, this.data.id, tempdata);
    }

    private executeCrop(data: any) {
        const tempdata = { weaponID: "5f912fc1f1d58a7199b745f0", animation: "crafting", times: data.repeat };
        this.game.emitter.emit(EventType.SCENE_PLAYER_ACTION, this.userid, this.data.id, tempdata);
    }
    private executeCollect(data: any) {
        const tempdata = { animation: "collect", times: data.repeat };
        this.game.emitter.emit(EventType.SCENE_PLAYER_ACTION, this.userid, this.data.id, tempdata);
    }
    private executeOpenChest(data: any) {
        const tempdata = { animation: "open_chest", times: data.repeat };
        this.game.emitter.emit(EventType.SCENE_PLAYER_ACTION, this.userid, this.data.id, tempdata);
    }
}
