import { GuideManager, Render } from "gamecoreRender";
import { ExploreGuide } from "./explore.guide";
import { HotelGuide } from "./hotel.guide";
import { PlaneGuide } from "./plane.guide";
export enum GuideID {
    Explore,
    Plane,
    Hotel
}
export class PicaGuideManager extends GuideManager {
    constructor(protected render: Render) {
        super(render);
    }

    public init(data?: any) {
        // todo test
        // this.guideMap.set(GuideID.Explore, new ExploreGuide(GuideID.Explore, this.render));
        // this.guideMap.set(GuideID.Plane, new PlaneGuide(GuideID.Plane, this.render));
        // this.guideMap.set(GuideID.Hotel, new HotelGuide(GuideID.Hotel, this.render));
    }
}
