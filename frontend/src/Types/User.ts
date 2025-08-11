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
  email: string,
  role : string
}

export interface AdminData {
    id: string,
    name: string,
    email: string,
    role: string,
    createdAt: string,
    updatedAt: string
}