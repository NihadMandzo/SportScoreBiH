import {Club} from './Club';
import {Picture} from './Picture';

export interface Player {
  id:number;
  firstName:string;
  lastName:string;
  birthDate:string;
  club:Club;
  position:string;
  picture:Picture;
  //imageUrl?: string;
}

export interface PlayerPost{
  id?:number;
  firstName:string;
  lastName:string;
  birthDate:string;
  position:string;
  clubId:number;
  image: File;
  imageUrl?: string;
}
