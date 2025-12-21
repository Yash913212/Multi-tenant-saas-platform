class CustomError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
    }
}

class ValidationError extends CustomError {
    constructor(message) {
        super(message, 400);
    }
}

class AuthenticationError extends CustomError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
    }
}

class AuthorizationError extends CustomError {
    constructor(message = 'Access denied') {
        super(message, 403);
    }
}

class NotFoundError extends CustomError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

class ConflictError extends CustomError {
    constructor(message = 'Resource conflict') {
        super(message, 409);
    }
}

class LimitExceededError extends CustomError {
    constructor(message = 'Subscription limit exceeded') {
        super(message, 402);
    }
}

module.exports = {
    CustomError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    LimitExceededError,
};