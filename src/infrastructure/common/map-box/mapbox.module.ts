import { Module } from '@nestjs/common';
import { MapboxService } from './mapbox.service';
import { HttpModule } from '@nestjs/axios';
@Module({
   imports: [HttpModule],
   providers: [MapboxService],
   exports: [MapboxService],
})
export class MapboxModule { }
