export interface ErrorResponse {
    detail: string;
    statusCode: number;
    timestamp: Date;
}

export interface FetchResult {
  response: Response;
  error: string;
}
