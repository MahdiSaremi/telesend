export class ApiError extends Error {
    data: any

    constructor(message: string, data: any = null) {
        super(message);
        this.name = 'ApiError';
        this.data = data;
    }
}

export class ValidationError extends ApiError {
    public errors: Record<string, string[]>;

    constructor(errors: Record<string, string[]>, data: any = null) {
        super('خطایی', data);
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

export class AuthenticationError extends ApiError {
    constructor(message = 'ابتدا باید وارد شوید', data: any = null) {
        super(message, data);
        this.name = 'AuthenticationError';
    }
}

export class ForbiddenError extends ApiError {
    constructor(message = 'دسترسی مجاز نمی باشد', data: any = null) {
        super(message, data);
        this.name = 'ForbiddenError';
    }
}
export class TooManyAttemptsError extends ApiError {
    constructor(message = 'بیش از حد امتحان کردید! کمی بعد مجددا تلاش کنید.', data: any = null) {
        super(message, data);
        this.name = 'TooManyAttemptsError';
    }
}
