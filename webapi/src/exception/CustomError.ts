class ServiceError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, ServiceError.prototype);
    }
}
class SystemError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, SystemError.prototype);
    }
}

export { SystemError, ServiceError };
