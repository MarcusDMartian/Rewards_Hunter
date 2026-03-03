export interface ReqUser {
  id: string;
  email: string;
  orgId: string;
  teamId?: string;
  role: string;
  name?: string;
}
