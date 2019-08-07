// declare var webRTC: any;
 declare module "Webrtc" {
    export = WebGMEAPI;
}

declare class WebGMEAPI {
    event;
    Init(document: any, sdkAppId: string, openId: string): void;
    SetTMGDelegate(event: any): void;
    EnterRoom(roomId: string, roomType: number, authBuffer: string): void;
    ExitRoom(): void;
    EnableMic(enable: boolean): void;
    isFirstMessage: boolean;
}


