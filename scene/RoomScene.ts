import {RoomSceneBasic} from "./RoomSceneBasic";
import {RoomGridUtil} from "./util/RoomGridUtil";
import {ElementInfo} from "../struct/ElementInfo";
import {MapInfo} from "../struct/MapInfo";

export class RoomScene extends RoomSceneBasic {
    public seaMapGrid: RoomGridUtil;

    protected onInitialize(): void {
        super.onInitialize();
        this.seaMapGrid = new RoomGridUtil();
    }

    protected onInitializeScene(value: MapInfo): void {
        this.mapSceneInfo = value;
        this.seaMapGrid.initGrid(this.mapSceneInfo.cols, this.mapSceneInfo.rows);

        super.onInitializeScene(value);

        this.terrainSceneLayer.initializeMap(value);

        // let i: number = 0;
        // let len: number = this.mapSceneInfo.elementInfo.length;
        // let element: ElementInfo;
        // for (; i < len; i++) {
        //     element = this.mapSceneInfo.elementInfo[i];
            // if (element.config.type == 13) {
            //this.addSceneElement(SceneElementType.ELEMENT, element.id.toString(), element);
            // }
        // }
    }

}