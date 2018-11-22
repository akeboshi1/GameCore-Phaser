import {SceneMediator} from "./SceneMediator";
import {MapInfo} from "../../common/struct/MapInfo";
import Globals from "../../Globals";
import {MessageType} from "../../common/const/MessageType";
import {IEditorMode} from "../../interface/IEditorMode";
import {EditorType} from "../../common/const/EditorType";

export class SceneEditorMediator extends SceneMediator {
    constructor() {
        super();
    }

    public onRegister(): void {
        super.onRegister();
        Globals.MessageCenter.on(MessageType.EDITOR_CHANGE_MODE, this.handleChangeMode);
    }

    private dragStart(): void {
    }

    private dragUpdate(sprite: any, pointer: Phaser.Pointer, dragX: number, dragY: number, snapPoint:Phaser.Point ): void {
    }

    private dragStop(): void {
    }

    private resetStatus(): void {
        this.view.inputEnabled = false;
        //  Drag events
        this.view.events.onDragStart.remove(this.dragStart);
        this.view.events.onDragUpdate.remove(this.dragUpdate);
        this.view.events.onDragStop.remove(this.dragStop);
    }

    /**
     * 切换编辑器状态
     */
    private handleChangeMode(): void {
        this.resetStatus();

        let em: IEditorMode = Globals.DataCenter.EditorData.editorMode;
        if ( em.mode === EditorType.MODE_MOVE ) {
            this.view.inputEnabled = true;
            this.view.input.enableDrag();
            //  Drag events
            this.view.events.onDragStart.add(this.dragStart);
            this.view.events.onDragUpdate.add(this.dragUpdate);
            this.view.events.onDragStop.add(this.dragStop);
        } else if ( em.mode === EditorType.MODE_BRUSH) {
            this.view.inputEnabled = true;
            this.view.events.onInputDown.add(this.inputDown, this);
        }
    }

    private inputDown(): void {
    }

    protected changedToMapSceneCompleteHandler(mapSceneInfo: MapInfo): void {
        //clear the last one scene.
        if (this.view) this.view.clearScene();

        Globals.SceneManager.popupScene();

        Globals.Room45Util.setting(mapSceneInfo.rows, mapSceneInfo.cols, mapSceneInfo.tilewidth, mapSceneInfo.tileheight);

        Globals.game.world.setBounds(0, 0, mapSceneInfo.mapTotalWidth, mapSceneInfo.mapTotalHeight);

        this.view.initializeScene(mapSceneInfo);

        this.view.terrainGridLayer.initializeMap(mapSceneInfo);

        Globals.SceneManager.pushScene(this.view);

        this.handleChangeMode();

        Globals.MessageCenter.emit(MessageType.SCENE_INITIALIZED);
    }
}