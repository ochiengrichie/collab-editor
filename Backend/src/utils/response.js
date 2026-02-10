//A tiny helper so every endpoint returns consistent shaped responses
export const createResponse = (res, success, data = null, error = null, statusCode = 200) => {
    return res.status(statusCode).json({ success, data, error });
};