import { ListItemComponent } from "../../../base/component/list/core/ListItemComponent";
import { UI } from "../../../Assets";

export class SuggestItem extends ListItemComponent {
  private mName: Phaser.Text;
  public onSelectedItem: Phaser.Signal = new Phaser.Signal();
  constructor(game: Phaser.Game) {
    super(game);
    this.createText();
  }

  public render() {
    if (this.data) {
      this.mName.setText(this.data);
    } else {
      this.mName.setText("");
    }
  }

  private createText() {
    this.mName = this.game.make.text(0, 0, "", {fontSize: 12, fill: "#FFFFFF"});
    this.addChild(this.mName);
  }
}