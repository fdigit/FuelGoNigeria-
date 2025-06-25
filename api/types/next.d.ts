declare module 'next' {
  export interface NextApiRequest {
    method: string;
    body: any;
    headers: Record<string, string | string[] | undefined>;
    query: Record<string, string | string[]>;
    cookies: Record<string, string>;
  }

  export interface NextApiResponse {
    status(code: number): NextApiResponse;
    json(data: any): NextApiResponse;
    end(): void;
    setHeader(name: string, value: string | string[]): NextApiResponse;
  }
} 