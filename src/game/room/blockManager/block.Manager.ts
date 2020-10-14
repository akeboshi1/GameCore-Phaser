import { Logger } from "../../../utils/log";
import { Game } from "../../game";
import { IRoomService } from "../roomManager/room/room";
import { Fit, IScenery } from "../skyboxManager/scenery";
import { State } from "../state/state.group";

export interface IBlockManager {
  readonly game: Game;
  startPlay(scene: Phaser.Scene);
  check(time?: number, delta?: number);
}
export class BlockManager implements IBlockManager {
  private mContainer: Phaser.GameObjects.Container;
  private mRows: number = 1;
  private mCols: number = 1;
  private mGridWidth: number;
  private mGridHeight: number;
  private mGrids: Block[];
  private mUris: string[][];
  private mMainCamera: Phaser.Cameras.Scene2D.Camera;
  private mScaleRatio: number;
  private mSceneName: string = "";
  private mGame: Game;
  private scene: Phaser.Scene;
  private mScenery: IScenery;
  private mRoom: IRoomService;
  private mCameras: ICameraService;
  private mStateMap: Map<string, State>;
  private _bound: Phaser.Geom.Rectangle;
  private tween: Phaser.Tweens.Tween;
  constructor(scenery: IScenery, room: IRoomService) {
    this.mGrids = [];
    this.mScenery = scenery;
    this.mUris = scenery.uris;
    this.mRoom = room;
    this.mGame = room.world;
    this.mCameras = room.cameraService;
    this.mMainCamera = this.mCameras.camera;
    this._bound = this.mMainCamera.getBounds();
    this.mScaleRatio = this.mGame.scaleRatio;
    this.setSize(scenery.width, scenery.height);

    const playScene = room.scene;
    if (!playScene) {
      Logger.getInstance().fatal(`${BlockManager.name} scene does not exist`);
      return;
    }
    this.mSceneName = SkyBoxScene.name + `_${scenery.id}`;
    const scene = this.mGame.game.scene.add(this.mSceneName, SkyBoxScene, false);
    playScene.scene.launch(this.mSceneName, this);
    this.updateDepth();
  }

  startPlay(scene: Phaser.Scene) {
    this.scene = scene;
    this.initBlock();
    if (this.mStateMap) {
      this.mStateMap.forEach((state) => this.handlerState(state));
    }
  }

  check(time?: number, delta?: number) {
    const worldView = this.mMainCamera.worldView;
    const viewPort = new Phaser.Geom.Rectangle(worldView.x - worldView.width / 2, worldView.y - worldView.height / 2, worldView.width * 2, worldView.height * 2);
    for (const block of this.mGrids) {
      block.checkCamera(Phaser.Geom.Intersects.RectangleToRectangle(viewPort, block.rectangle));
    }
  }

  update(scenery: IScenery) {
    this.mScenery = scenery;
    this.mUris = scenery.uris;
    this.setSize(scenery.width, scenery.height);
    this.initBlock();
    this.updateDepth();
  }

  setSize(imageW: number, imageH: number, gridW?: number, gridH?: number) {
    // TODO 部分场景超过大小未分块
    if (this.mUris.length === 0) {
      return;
    }
    let cols = 1;
    let rows = 1;
    if (this.mUris.length > 1 || this.mUris[0].length > 1) {
      cols = imageW / 1024;
      rows = imageH / 1024;
    }
    this.mCols = Math.round(cols);
    this.mRows = Math.round(rows);
    this.mGridWidth = imageW / this.mCols;
    this.mGridHeight = imageH / this.mRows;
  }

  resize(width: number, height: number) {
    if (!this.scene || !this.mMainCamera) {
      return;
    }
    const camera = this.scene.cameras.main;
    if (!camera) {
      return;
    }
    this.mScaleRatio = this.mGame.scaleRatio;
    this.updatePosition();
    this._bound = this.mMainCamera.getBounds();
    camera.setBounds(this._bound.x, this._bound.y, this._bound.width, this._bound.height);

    for (const grid of this.mGrids) {
      grid.setScaleRatio(this.mScaleRatio);
      grid.resize(width, height);
    }
  }

  updatePosition() {
    const camera = this.scene.cameras.main;
    const { offset } = this.mScenery;
    const loc = this.fixPosition({ x: offset.x, y: offset.y });
    camera.setPosition(loc.x, loc.y);

    for (const block of this.mGrids) {
      block.updatePosition();
    }
  }

  destroy() {
      // todo destroy game.scene.remove(this.mSceneName)
    // if (this.mGame && this.mGame.game) {
    //   this.mGame.game.scene.remove(this.mSceneName);
    // }
    this.mGrids.length = 0;
  }

  setState(state: State) {
    this.handlerState(state);
  }

  public playSkyBoxAnimation(packet: any) {
    const { id, targets, duration, reset, resetDuration } = packet;
    if (id === undefined || targets === undefined || duration === undefined) {
      return;
    }
    if (!this.scene) {
      return;
    }
    if (id !== this.mScenery.id) {
      return;
    }

    const camera = this.scene.cameras.main;
    this.move(camera, this.fixPosition(targets), duration, this.fixPosition(reset), resetDuration);
  }

  protected handlerState(state: State) {
    const packet = state.packet;
    for (const prop of packet) {
      if (this.mScenery.id === prop.id) {
        this.playSkyBoxAnimation(prop);
      }
    }
  }

  protected updateDepth() {
    if (!this.mRoom) {
      return;
    }
    const playScene = this.mRoom.scene;
    if (!this.mScenery || !playScene) {
      return;
    }
    const scene = this.mGame.game.scene.getScene(this.mSceneName);
    if (!scene) {
      return;
    }
    if (this.mScenery.depth < 0) {
      scene.scene.sendToBack(this.mSceneName);
    } else {
      scene.scene.moveAbove(playScene.sys.settings.key, this.mSceneName);
    }
  }

  protected initBlock() {
    this.clear();
    this.mContainer = this.scene.add.container(0, 0);
    this.mContainer.setScale(this.mGame.scaleRatio);
    const len = this.mUris.length;
    // TODO
    if (this.mScenery.fit === Fit.Repeat) {
      const room = <Room>this.mRoom;
      const { width, height } = room.getMaxScene();
      const rows = Math.floor(width / this.mScenery.width);
      const cols = Math.floor(height / this.mScenery.height);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const block = new Block(this.scene, this.mUris[0][0], this.mScaleRatio);
          block.setRectangle(j * this.mGridWidth, i * this.mGridHeight, this.mGridWidth, this.mGridHeight);
          this.mGrids.push(block);
        }
      }
    } else {
      for (let i = 0; i < len; i++) {
        const l = this.mUris[i].length;
        for (let j = 0; j < l; j++) {
          const block = new Block(this.scene, this.mUris[i][j], this.mScaleRatio);
          block.setRectangle(j * this.mGridWidth, i * this.mGridHeight, this.mGridWidth, this.mGridHeight);
          this.mGrids.push(block);
        }
      }
    }
    this.mContainer.add(this.mGrids);
    this.initCamera();
  }

  protected move(targets, props, duration?: number, resetProps?: any, resetDuration?: number) {
    if (this.tween) {
      this.tween.stop();
      this.tween.removeAllListeners();
    }
    this.tween = this.scene.tweens.add({
      targets,
      props,
      duration,
      loop: -1,
      onUpdate: () => {
        for (const block of this.mGrids) {
          block.updatePosition();
        }
      }
    });
    if (resetProps) {
      this.tween.once("loop", () => {
        if (resetProps) {
          targets.x = resetProps.x;
          targets.y = resetProps.y;
        }
        this.tween.stop();
        this.move(targets, props, resetDuration);
      });
    }
  }

  protected initCamera() {
    const camera = this.scene.cameras.main;
    if (this.mCameras) {
      camera.setBounds(this._bound.x, this._bound.y, this._bound.width, this._bound.height);

      this.updatePosition();
      camera.setScroll(this.mMainCamera.scrollX, this.mMainCamera.scrollY);
      this.mCameras.addCamera(camera);
    }
  }

  protected clear() {
    for (const grid of this.mGrids) {
      grid.destroy();
    }
    this.mGrids.length = 0;
    if (this.mContainer) {
      this.mContainer.destroy(true);
    }
  }

  get game(): Game {
    return this.mGame;
  }

  get scenery(): IScenery {
    return this.mScenery;
  }

  protected fixPosition(props: any) {
    if (!props) return;
    const offset = this.offset;
    if (props.x !== undefined) {
      props.x = (offset.x + props.x) * this.mGame.scaleRatio;
    }
    if (props.y !== undefined) {
      props.y = (offset.y + props.y) * this.mGame.scaleRatio;
    }
    return props;
  }

  protected get offset(): { x: number, y: number } {
    const os = { x: 0, y: 0 };
    let x = 0;
    let y = 0;
    if (this.mScenery) {
      if (this.mScenery.fit === Fit.Center) {
        const size = this.mRoom.roomSize;
        const { width, height } = this.mScenery;
        x = size.sceneWidth - width >> 1;
        y = size.sceneHeight - height >> 1;
      }
    }
    return { x, y };
  }
}

class Block extends DynamicImage {
  private mLoaded: boolean = false;
  private mInCamera: boolean = false;
  private mKey: string;
  private mRectangle: Phaser.Geom.Rectangle;
  private mScale: number;
  constructor(scene: Phaser.Scene, key: string, scale: number) {
    super(scene, 0, 0);
    this.mKey = key;
    this.mScale = scale;
    this.setOrigin(0);
    // this.mRectangle = new Phaser.Geom.Rectangle(this.x, this.y, 1, 1);
  }

  checkCamera(val: boolean) {
    if (this.mInCamera !== val) {
      this.mInCamera = val;
      this.visible = val;
      if (this.mLoaded) {
        // TODO
        // this.setActive(val);
      } else {
        this.load(Url.getOsdRes(this.mKey));
      }
    }
  }

  setRectangle(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.setSize(width, height);
    const camera = this.scene.cameras.main;
    this.mRectangle = new Phaser.Geom.Rectangle(x * this.mScale + camera.x, y * this.mScale + camera.y, width * this.mScale, height * this.mScale);
  }

  updatePosition() {
    if (this.mRectangle) {
      const camera = this.scene.cameras.main;
      this.mRectangle.x = this.x * this.mScale + camera.x;
      this.mRectangle.y = this.y * this.mScale + camera.y;
    }
  }

  resize(width: number, height: number) {
    const camera = this.scene.cameras.main;
    this.mRectangle = new Phaser.Geom.Rectangle(this.x * this.mScale + camera.x, this.y * this.mScale + camera.y, this.width * this.mScale, this.height * this.mScale);
  }

  setScaleRatio(val: number) {
    this.mScale = val;
  }

  get rectangle(): Phaser.Geom.Rectangle {
    return this.mRectangle;
  }

  get key(): string {
    return this.mKey;
  }

  protected onLoadComplete(file) {
    super.onLoadComplete(file);
    if (this.texture) {
      this.mLoaded = true;
      this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      // this.mRectangle.setSize(this.width, this.height);
    }
  }
}
