const { createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file");
const config = require("../config/config");

// Path to local logs, if enabled
const logs_path = "./logs/";

// Properly formatted bot name to be used as label and file name for local logs
const formatted_bot_name = config.generalSettings.bot_name.toLowerCase().replace(/ /g, "");

// Logger configurations
const default_format = format.printf((info) => `${info.timestamp} [${info.label}] ${info.level} ${info.message}`);
const format_timestamp = format((info) => {
    info.timestamp = new Date().toISOString().replace(/T/g, " ").replace(/Z/g, "");
    return info;
});

// Show logs in console
const consoleTransport = new transports.Console({
    level: config.logSettings.level,
    format: config.logSettings.console_colorize ? format.combine(format.colorize(), default_format) : format.combine(default_format),
});

// Save logs locally, as .log files, automatically rotated and archived
const createFileTransport = config.logSettings.local_enabled ? new transports.DailyRotateFile({
    name: `${formatted_bot_name}_log`,
    dirname: logs_path,
    filename: `${formatted_bot_name}_%DATE%.log`,
    level: config.logSettings.level,
    zippedArchive: true,
    maxDays: config.logSettings.local_retention_days,
    format: config.logSettings.local_json_format ? format.combine(format.json()) : format.combine(default_format),
}) : null;

module.exports = createLogger({
    format: format.combine(
        format.timestamp(),
        format.label({ label: `${formatted_bot_name}` }),
        format_timestamp(),
        default_format,
    ),
    transports: (() => {
        const active_transports = [consoleTransport];
        if (config.logSettings.local_enabled) active_transports.push(createFileTransport);
        return active_transports;
    })(),
});
