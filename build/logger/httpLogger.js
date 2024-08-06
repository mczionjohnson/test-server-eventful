"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const morgan_1 = __importDefault(require("morgan"));
const morgan_json_fixed_1 = __importDefault(require("morgan-json-fixed"));
const logger_1 = __importDefault(require("./logger"));
const format = (0, morgan_json_fixed_1.default)({
    method: ':method',
    url: ':url',
    status: ':status',
    contentLength: ':res[content-length]',
    responseTime: ':response-time'
});
const httpLogger = (0, morgan_1.default)(format, {
    stream: {
        write: (message) => {
            const { method, url, status, contentLength, responseTime } = JSON.parse(message);
            logger_1.default.info('HTTP Access Log', {
                timestamp: new Date().toString(),
                method,
                url,
                status: Number(status),
                contentLength,
                responseTime: Number(responseTime)
            });
        }
    }
});
exports.default = httpLogger;
