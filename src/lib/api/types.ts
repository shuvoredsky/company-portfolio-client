export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorSource {
  path: string | number;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errorSources?: ApiErrorSource[];
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly errorSources: ApiErrorSource[];

  constructor(
    status: number,
    message: string,
    errorSources: ApiErrorSource[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorSources = errorSources;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PressListParams extends PaginationParams {
  search?: string;
}

export interface PublicBanner {
  _id: string;
  image: {
    url: string;
  };
  order: number;
}

export interface MediaImage {
  url: string;
  publicId?: string;
}

export interface PressItem {
  _id: string;
  title: string;
  description: string;
  image: MediaImage;
  createdAt?: string;
  updatedAt?: string;
}

export interface NetworkItem {
  _id: string;
  title: string;
  description: string;
  image: MediaImage;
  externalUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecruitmentItem {
  _id: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactPayload {
  name: string;
  country: string;
  phone: string;
  email: string;
  message: string;
  website?: string;
}

export interface ContactSubmitResult {
  _id: string;
  name: string;
  country: string;
  createdAt?: string;
}
