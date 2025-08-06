export interface SignUpType {
  id?: string;
  name: string;
  email: string;
  password: string;
}
export interface LoginType {
  email: string;    
  password: string;
}

export interface Userme {
  id: string;
  name: string,
  email: string
}