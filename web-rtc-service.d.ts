// declare var webRTC: any;
 declare module "Webrtc" {
    export = WebGMEAPI;
}

declare class WebGMEAPI {
    event;
    Init(document: any, sdkAppId: string, openId: number): void;
    SetTMGDelegate(event: any): void;
    EnterRoom(roomId: number, roomType: number, authBuffer: string): void;
    ExitRoom(): void;
    EnableMic(enable: boolean): void;
}


