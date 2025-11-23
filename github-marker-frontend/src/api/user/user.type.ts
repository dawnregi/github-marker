export type LoginCredentials = {
  email: string;
  password: string;
}

export type RegisterCredentials = LoginCredentials & {
  name: string;
}

export type User = {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
}


export type UserDetails = {
  name: string;
  id: number;
  email: string;
}

export type PydanticValidationError = {
  type: string;
  loc: (string | number)[];
  msg: string;
  input?: unknown;
  ctx?: Record<string, unknown>;
}

export type ErrorResponse = {
  detail?: string | PydanticValidationError[];
  message?: string;
}