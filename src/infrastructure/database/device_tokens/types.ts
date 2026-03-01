export interface IDeviceToken {
  id: string;
  profile_id: string;
  player_id: string;
  created_at: string;
  updated_at: string;
}

export interface IRegisterTokenData {
  profile_id: string;
  player_id: string;
}
