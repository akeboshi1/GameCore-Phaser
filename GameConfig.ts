import {IPhaserLoadList} from "./interface/IPhaserLoadList";
import Globals from "./Globals";

export class GameConfig {
    public static isEditor: boolean;
    public static HomeDir: string;
    public static GameWidth: number;
    public static GameHeight: number;
    public static preLoadList: IPhaserLoadList;
    public static ArmatureName: string = "Armature";
}
