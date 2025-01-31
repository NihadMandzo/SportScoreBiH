export interface Comment {
    id:number;
    comment:string;
    dateTime:string;
    username:string;
    like:number;
    dislike:number;
    userReaction?: 'like' | 'dislike';
  }
  