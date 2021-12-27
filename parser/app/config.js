const config = {
    CURRENT_STATE_PATH: './db/current-state.json',

    DOWNLOAD_DIR: "./downloaded",

    PROCESSED_FILES_CHECK_URL: "http://storage_1:5001/",

    // name must be unique
    secondaries: [
        {   name:'storage_one',
            baseUrl:'http://storage_1:5001',
            healthCheckUrl:'/health',
            sendCollectedKeysUrl: '/collected-keys/create'
        },
        {   name:'streamer_one',
            baseUrl:'http://streamer_1:6001',
            healthCheckUrl:'/health',
            sendCollectedKeysUrl: '/send-collected-keys'
        },
        {   name:'streamer_two',
            baseUrl:'http://streamer_2:6002',
            healthCheckUrl:'/health',
            sendCollectedKeysUrl: '/send-collected-keys'
        }
    ],

    SECONDARY_API_SEND_COLLECTED_KEYS_URL: '/add-collected-keys',
    HEALTH_CHECK:{
        //"HEALTHY" = send both realtime messages and BATCH_RETRY work
        //"SUSPECTED" = send only realtime messages. Do not send BATCH_RETRY
        //"UNHEALTHY" = do not send realtime messages. Do not send BATCH_RETRY
        // on every health check, status will move left/right
        HEALTH_SCHEME:["HEALTHY", "HEALTHY", "SUSPECTED", "SUSPECTED", "UNHEALTHY"],
        // HEALTH_SCHEME:["HEALTHY", "SUSPECTED", "UNHEALTHY"],

        // init with index(0...n-1) of HEALTH_SCHEME
        start_health_index: 4,

        //The 1st delay before we send health check request to node.
        start_interval: 2000,

        //The interval between health checks.
        interval: 3000,
        //during every interval will add random(0...n),interval_jitter to the wait time
        interval_jitter: 800,

        //The time to wait for a health check response.
        // If the timeout is reached, the health check attempt
        // will be considered a failure.
        timeout: 3000,

    },

    // first, try to deliver a message infinite number of times, if node is healthy
    RETRY: {
        default_write_concern: 1,

        //  exponentialBackOff = on send failure, move right on INTERVALS[]
        //  1.5^k
        INTERVALS: [0, 1500, 2250, 3375],

        // random(0...n) will be added to interval
        interval_jitter: 100,

        //The time to wait for a secondary node response when sending a retry message.
        // If the timeout is reached, the message sending attempt
        // will be considered a failure.
        timeout: 3000,
    },

    // if node is unhealthy, then this message goes to BATCH_RETRY
    // In BATCH_RETRY, each node will have separate process, which will send messages in batches to that node
    BATCH_RETRY:{
        //  exponentialBackOff = on send failure, move right on INTERVALS[] and MESSAGES_QTY[]
        //  + gradual recovery = on send success, move left on INTERVALS[] and MESSAGES_QTY[]

        //  1.5^k
        INTERVALS: [  1000, 1500, 2250, 3375],

        // random(0...n) will be added to interval
        interval_jitter: 100,

        // number of messages to send in one batch.
        // It will depend on the network health state
        // MESSAGES_QTY.size must be = INTERVALS.size
        MESSAGES_QTY: [ 10, 3, 2, 1 ],

        // init with index(0...n-1) on INTERVALS[] and MESSAGES_QTY[]
        start_retry_index: 3,

        //The time to wait for a secondary node response when sending a retry message.
        // If the timeout is reached, the message sending attempt
        // will be considered a failure.
        timeout: 3000,

        // for each secondary, we will check retry buffer.
        // If empty, then next check will be after this interval
        empty_buffer_check_interval: 4000,

        // if health checks that node is not available,
        // then next next retry attempt will be after this interval
        sleep_interval_if_not_available: 5000
    },

};

module.exports = config;