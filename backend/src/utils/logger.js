import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.join(__dirname, '..', 'logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const LOG_LEVELS = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
};

// Simple logger utility
const logger = {
    _getTimestamp() {
        return new Date().toISOString();
    },

    _formatMessage(level, category, message, data = null) {
        let msg = `[${this._getTimestamp()}] [${level}] [${category}] ${message}`;
        if (data) {
            msg += ` | ${JSON.stringify(data)}`;
        }
        return msg;
    },

    _writeLog(level, category, message, data) {
        const formatted = this._formatMessage(level, category, message, data);
        
        // Console output
        const colorCodes = {
            DEBUG: '\x1b[36m', // cyan
            INFO: '\x1b[32m',  // green
            WARN: '\x1b[33m',  // yellow
            ERROR: '\x1b[31m'  // red
        };
        const resetCode = '\x1b[0m';
        console.log(`${colorCodes[level] || ''}${formatted}${resetCode}`);

        // File output
        const logFile = path.join(logsDir, `${level.toLowerCase()}.log`);
        fs.appendFileSync(logFile, formatted + '\n');
    },

    debug(category, message, data) {
        this._writeLog(LOG_LEVELS.DEBUG, category, message, data);
    },

    info(category, message, data) {
        this._writeLog(LOG_LEVELS.INFO, category, message, data);
    },

    warn(category, message, data) {
        this._writeLog(LOG_LEVELS.WARN, category, message, data);
    },

    error(category, message, data) {
        this._writeLog(LOG_LEVELS.ERROR, category, message, data);
    }
};

// Middleware untuk log HTTP requests
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const level = res.statusCode >= 400 ? 'WARN' : 'INFO';
        
        logger._writeLog(
            level,
            'HTTP',
            `${req.method} ${req.path}`,
            {
                status: res.statusCode,
                ip: req.ip,
                duration: `${duration}ms`
            }
        );
    });

    next();
};

export default logger;
