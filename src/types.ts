export type Job = {
  id: string;
  createdAt: number;
  customer: string;
  description: string;
  flatRate: number;
  materials?: number;
  miles?: number;
};
