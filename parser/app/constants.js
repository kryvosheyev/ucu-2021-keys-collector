module.exports.HEALTH_STATUSES = {
    HEALTHY: "HEALTHY",

    // Do not send batch retries.
    // Try sending individual messages from clients
    SUSPECTED: "SUSPECTED",

    // Do not send anything.
    UNHEALTHY: "UNHEALTHY"
};

module.exports.RESPONSE_MESSAGES = {
    OK: {msg: "OK"},
    ALREADY_PROCESSED: {msg: "This file has already been processed before"},
};