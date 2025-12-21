const formatResponse = (success, message, data = null) => {
    return {
        success,
        message,
        data,
    };
};

const successResponse = (message, data) => {
    return formatResponse(true, message, data);
};

const errorResponse = (message, data = null) => {
    return formatResponse(false, message, data);
};

module.exports = {
    formatResponse,
    successResponse,
    errorResponse,
};