/**
 * 图层管理
 * author aaron
 */
import BaseSingleton from "../../base/BaseSingleton";

export class LayerManager extends BaseSingleton {
  public container: Phaser.Group;
  public sceneLayer: Phaser.Group;
  public animationLayer: Phaser.Group;
  public mainUiLayer: Phaser.Group;
  public uiLayer: Phaser.Group;
  public dragLayer: Phaser.Group;
  public dialogLayer: Phaser.Group;
  public tipLayer: Phaser.Group;
  public debugLayer: Phaser.Group;
  private game: Phaser.Game;

  public init(game: Phaser.Game): void {
    this.game = game;

    this.container = game.add.group();

    this.sceneLayer = new Phaser.Group(game, this.container, "sceneLayer");
    this.sceneLayer.inputEnableChildren = true;

    this.animationLayer = new Phaser.Group(game, this.container, "animationLayer");
    this.animationLayer.fixedToCamera = true;

    this.mainUiLayer = new Phaser.Group(game, this.container, "mainUiLayer");
    this.mainUiLayer.fixedToCamera = true;

    this.uiLayer = new Phaser.Group(game, this.container, "uiLayer");
    this.uiLayer.fixedToCamera = true;

    this.dragLayer = new Phaser.Group(game, this.container, "dragLayer");
    this.dragLayer.fixedToCamera = true;

    this.tipLayer = new Phaser.Group(game, this.container, "tipLayer");
    this.tipLayer.fixedToCamera = true;

    this.dialogLayer = new Phaser.Group(game, this.container, "dialogLayer");
    this.dialogLayer.fixedToCamera = true;

    this.debugLayer = new Phaser.Group(game, this.container, "debugLayer");
    this.debugLayer.fixedToCamera = true;

  }
}
