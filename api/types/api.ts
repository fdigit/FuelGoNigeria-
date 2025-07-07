export interface ApiRequest {
  method: string;
  body: any;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, string | string[]>;
  cookies: Record<string, string>;
  url?: string;
  user?: any;
}

export interface ApiResponse {
  status(code: number): ApiResponse;
  json(data: any): ApiResponse;
  end(): void;
  setHeader(name: string, value: string | string[]): ApiResponse;
}

export type ApiHandler = (req: ApiRequest, res: ApiResponse) => Promise<void> | void; 