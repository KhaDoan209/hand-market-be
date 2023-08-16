import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { EnvironmentConfigService } from 'src/infrastructure/config/environment/environment/environment.service';
@Injectable()
export class MapboxService {
   constructor(private readonly httpService: HttpService, private readonly environmentConfig: EnvironmentConfigService) { }

   async getCoordinates(placeName: string): Promise<any> {
      const bboxVietnam = '102.14425,8.18018,109.46906,23.39214';
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
         placeName
      )}.json?access_token=${this.environmentConfig.getMapBoxToken()}&limit=1&bbox=${bboxVietnam}`;
      const response = await this.httpService.get(url).toPromise();
      const coordinates = {
         longitude: Number(response.data.features[0].geometry.coordinates[0].toFixed(6)),
         latitude: Number(response.data.features[0].geometry.coordinates[1].toFixed(6))
      }
      return coordinates;
   }
}
