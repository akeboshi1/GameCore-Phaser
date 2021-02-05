import { ICountablePackageItem } from "picaStructure";
import { op_client, op_virtual_world, op_pkt_def } from "pixelpai_proto";
import { PropItem } from "./prop.item";
export class MaterialItem extends PropItem {
    private mselect: boolean = false;
    private selectframe: string;
    constructor(scene: Phaser.Scene, key: string, bgframe: string, selectframe: string, dpr: number, style?: any) {
        super(scene, key, bgframe, dpr, style);
        this.selectframe = selectframe;
    }
    public setItemData(data: ICountablePackageItem, needvalue: boolean = true) {
        super.setItemData(data);
        this.itemCount.text = needvalue ? this.getCountText(data.count, data.neededCount) : data.count;
    }
    public set select(value: boolean) {
        this.bg.setFrame(value ? this.selectframe : this.bgframe);
        this.mselect = value;
    }
    public get select() {
        return this.mselect;
    }
    private getCountText(count: number, needcount: number) {
        const color = (count >= needcount ? "#000000" : "#ff0000");
        const text = `[stroke=${color}][color=${color}]${count}[/color][/stroke]/` + needcount;
        return text;
    }
}
