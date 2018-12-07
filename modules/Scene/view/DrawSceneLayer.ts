import {BasicSceneLayer} from "../../../base/BasicSceneLayer";
import Globals from "../../../Globals";
import {SceneInfo} from "../../../common/struct/SceneInfo";
import {ElementInfo} from "../../../common/struct/ElementInfo";
import {PlayerInfo} from "../../../common/struct/PlayerInfo";
import {DrawArea} from "../../../common/struct/DrawArea";

export class DrawSceneLayer extends BasicSceneLayer {
    private graphicsList: DrawArea[];
    public constructor(game: Phaser.Game) {
        super(game);
        this.graphicsList = [];
    }

    public addPlayer(value: PlayerInfo): void {
        let graphics: Phaser.Graphics = value.collisionArea.graphics;
        this.addChild(graphics);
        this.graphicsList.push(value.collisionArea);
    }

    public initializeMap(value: SceneInfo): void {
        let i: number = 0;
        let len: number = value.elementConfig.length;
        let element: ElementInfo;
        let graphics: Phaser.Graphics;
        for (; i < len; i++) {
            element = value.elementConfig[i];
            graphics = element.collisionArea.graphics;
            this.addChild(graphics);
            this.graphicsList.push(element.collisionArea);
        }
    }

    public onFrame(deltaTime: number): void {
        super.onFrame(deltaTime);
        let len: number = this.graphicsList.length;
        for (let i = 0; i < len; i++) {
            this.graphicsList[i].onFrame(deltaTime);
        }
    }
}