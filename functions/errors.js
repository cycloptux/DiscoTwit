const logger = require("./winston");

process.on("uncaughtException", (err) => {
    switch (err.message) {
        default:
            logger.error(`[${err.name}] Uncaught Exception: ${err.message}${err.code ? ` [ ${err.code} ]` : ""}\n----------Exception Stack----------\n${err.stack}\n-----------------------------------`);
            break;
    }
});
process.on("unhandledRejection", (err) => {
    switch (err.message) {
        default:
            logger.error(`[${err.name}] Unhandled Rejection: ${err.message}${err.code ? ` [ ${err.code} ]${err.path ? ` (${err.path})` : ""}` : ""}\n----------Rejection Stack----------\n${err.stack}\n-----------------------------------`);
            break;
    }
});
process.on("warning", (err) => {
    switch (err.message) {
        default:
            logger.error(`[${err.name}] Process Warning: ${err.message}${err.code ? ` [ ${err.code} ]${err.path ? ` (${err.path})` : ""}` : ""}\n-----------Warning Stack-----------\n${err.stack}\n-----------------------------------`);
            break;
    }
});
