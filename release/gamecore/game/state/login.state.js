import { BaseState } from "./base.state";
export class LoginState extends BaseState {
  constructor(main, key) {
    super(main, key);
  }
  run() {
    super.run();
    this.mGame.renderPeer.showLogin();
  }
}
