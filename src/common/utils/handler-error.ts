import { HttpException, HttpStatus } from '@nestjs/common';

/**status code 404*/
export function sendNotFound(message: string): void {
  throw new HttpException(
    {
      status: HttpStatus.NOT_FOUND,
      error: message,
    },
    HttpStatus.NOT_FOUND,
  );
}

/**status code 400*/
export function sendBadRequest(message: string): void {
  throw new HttpException(
    {
      status: HttpStatus.BAD_REQUEST,
      error: message,
    },
    HttpStatus.BAD_REQUEST,
  );
}

/**status code 403*/
export function sendForbidden(message: string): void {
  throw new HttpException(
    {
      status: HttpStatus.FORBIDDEN,
      error: message,
    },
    HttpStatus.FORBIDDEN,
  );
}

/**status code 409*/
export function sendConflictRequest(message: string): void {
  throw new HttpException(
    {
      status: HttpStatus.CONFLICT,
      error: message,
    },
    HttpStatus.CONFLICT,
  );
}

/**status code 422*/
export function sendUnprocessableEntity(message: string): void {
  throw new HttpException(
    {
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      error: message,
    },
    HttpStatus.UNPROCESSABLE_ENTITY,
  );
}
