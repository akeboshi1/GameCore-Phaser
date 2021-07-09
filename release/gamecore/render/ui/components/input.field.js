import { InputText } from "apowophaserui";
export class InputField extends InputText {
  constructor(scene, x, y, width, height, config) {
    super(scene, x, y, width, height, config);
    this.node.addEventListener("keypress", this.onKeypressHandler.bind(this));
    this.on("focus", this.onFocusHandler, this);
    this.on("blur", this.onBlurHandler, this);
  }
  destroy() {
    if (this.node)
      this.node.removeEventListener("keypress", this.onKeypressHandler.bind(this));
    this.off("focus", this.onFocusHandler, this);
    this.off("blur", this.onBlurHandler, this);
    if (this.scene)
      this.scene.input.off("gameobjectdown", this.onGameobjectDown, this);
    super.destroy();
  }
  onKeypressHandler(e) {
    const keycode = e.keyCode || e.which;
    if (keycode === 13) {
      this.emit("enter", this.text);
    }
  }
  onFocusHandler() {
    this.scene.input.on("gameobjectdown", this.onGameobjectDown, this);
  }
  onBlurHandler() {
    this.scene.input.off("gameobjectdown", this.onGameobjectDown, this);
  }
  onGameobjectDown() {
    this.setBlur();
  }
}
