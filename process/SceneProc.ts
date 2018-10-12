import {BaseProc} from "../base/BaseProc";
import {Globals} from "../Globals";
import {RoomScene} from "../scene/RoomScene";
import {MapInfo} from "../struct/MapInfo";
import {FlowManager} from "../flow/FlowManager";

export class SceneProc extends BaseProc {
	public roomScene: RoomScene;
	private hasRgistHandler: boolean = false;
	private flowManager: FlowManager;
	// private roomSceneLoader: RoomSceneLoader;

	public beginProc(): void {
		super.beginProc();
		this.onLoginOk();
	}

	public endProc(): void {
		if (this._active) {
			Globals.MessageCenter.removeByGroup("SceneProc");
			this.unRegistRoomListenerHandler();
			if (this.flowManager)
				this.flowManager.dispose();
			this.flowManager = null;
			super.endProc();
		}
	}

	private onLoginOk(): void {
		// App.SocketCenter.gameSocket.sendMsg([Core.MessageEnum.SEND_ENTER_GAME, 1]);
		let self = this;
		setTimeout(function () {
			self.onEnterRoom();
		}, 1000);
	}

	private onEnterRoom(): void {
		this.roomScene = new RoomScene();
		// this.roomScene.camera = App.SceneCamera;
		// this.roomScene.camera.cameraStage.addChildAt(this.roomScene, 0);

		// this.roomSceneLoader = new RoomSceneLoader();
		// this.roomSceneLoader.setLoadCallback(this.changedToMapSceneStartHandler, this.changedToMapSceneCompleteHandler, this)

		this.flowManager = new FlowManager();
		this.flowManager.initialize();
		this.flowManager.setView(this.roomScene);

		//mapScene
		// this.roomSceneLoader.changedToMap(Globals.DataCenter.PlayerData.mainPlayerInfo.mapId);

		this.registRoomListenerHandler();
	}

	private changedToMapSceneStartHandler(): void {
	}

	private changedToMapSceneCompleteHandler(mapSceneInfo: MapInfo): void {
		//clear the last one scene.
		if (this.roomScene) this.roomScene.clearScene();

		Globals.SceneManager.popupScene();

		Globals.Room45Util.setting(mapSceneInfo.rows, mapSceneInfo.cols, mapSceneInfo.tilewidth, mapSceneInfo.tileheight);

		this.roomScene.initializeScene(mapSceneInfo);

		//set camera
		Globals.SceneManager.pushScene(this.roomScene);
		this.roomScene.notifyInitializeSceneComplete();
	}

	//server handler
	public registRoomListenerHandler(): void {
		if (!this.hasRgistHandler) {
			this.hasRgistHandler = true;
		}
	}

	public unRegistRoomListenerHandler(): void {
		if (this.hasRgistHandler) {
			this.hasRgistHandler = false;
		}
	}
}