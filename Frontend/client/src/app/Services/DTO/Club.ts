import {StadiumDto} from '../stadium.service';

export interface Club {
  id:number;
  name:string;
  info:string;
  email:string;
  phoneNumber:string;
  instagram:string;
  facebook:string;
  pictureUrl:string;
  stadium:StadiumDto;
}
