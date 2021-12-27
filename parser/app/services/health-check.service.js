const {HEALTH_STATUSES} = require("../constants");
const _ = require("lodash");
const axios = require('axios');
const config = require('../config');
const {HEALTH_CHECK} = require('../config');
const STATE_SERVICE = require('../services/state.service');
const SEND_SERVICE = require('../services/send.service');
const UTILS = require('../services/utils');
var Mutex = require('async-mutex').Mutex;
const healthCheckMutex = new Mutex();

// HEALTH_CHECK_LOCK
let NODES = [];

async function startHealthCheckMonitors() {
    let nodes = [...config.secondaries];
    await UTILS.sleep(HEALTH_CHECK.start_interval);
    for(let i=0;i<nodes.length;i++){
        let node = {
            name: nodes[i].name,
            baseUrl: nodes[i].baseUrl,
            healthCheckUrl: nodes[i].healthCheckUrl,
            _stateIndex: HEALTH_CHECK.start_health_index,
            state: HEALTH_CHECK.HEALTH_SCHEME[HEALTH_CHECK.start_health_index]
        };
        NODES.push(node);
    }
    for(let i=0;i<nodes.length;i++){
        // start async process
        healthCheck(nodes[i].name, nodes[i].baseUrl, nodes[i].healthCheckUrl );
    }
}

async function getHealthState(nodeName) {
    const release = await healthCheckMutex.acquire();
    try {
        for(let i=0; i<NODES.length; i++){
            if(nodeName.valueOf()===NODES[i].name.valueOf()){
                return NODES[i].state;
            }
        }
    } finally {
        release();
    }
}

async function getHealthStatesReport() {
    const release = await healthCheckMutex.acquire();
    try {
        let states=[];
        for(let i=0; i<NODES.length; i++){
            states.push(`${NODES[i].name}: ${NODES[i].state}`);
        }
        return states;
    } finally {
        release();
    }
}

async function setHealthState(nodeName, healthResponse){
    const release = await healthCheckMutex.acquire();
    try {
        for(let i=0; i<NODES.length; i++){
            if(nodeName.valueOf()===NODES[i].name.valueOf()){
                let newStateIndex = NODES[i]._stateIndex;
                if(healthResponse.valueOf()==='OK'){
                    newStateIndex--;
                    if(newStateIndex < 0) continue;
                }
                if(healthResponse.valueOf()==='BAD'){
                    newStateIndex++;
                    if(newStateIndex === HEALTH_CHECK.HEALTH_SCHEME.length) continue;
                }
                const direction = newStateIndex < NODES[i]._stateIndex ? "is improving":"is degrading";
                console.log(`${NODES[i].name} health ${direction}: was ${NODES[i].state}(${NODES[i]._stateIndex}), now ${HEALTH_CHECK.HEALTH_SCHEME[newStateIndex]}(${newStateIndex})`);
                NODES[i]._stateIndex = newStateIndex;
                NODES[i].state = HEALTH_CHECK.HEALTH_SCHEME[NODES[i]._stateIndex];
                STATE_SERVICE.secondaryHealthHasChanged(NODES);
            }
        }
    } finally {
        release();
    }
}

async function healthCheck(nodeName, nodeUrl, healthCheckUrl) {
    while (true) {
        let result = await reqToNode(nodeUrl, healthCheckUrl, HEALTH_CHECK.timeout);
        await setHealthState(nodeName, result.HEALTH_STATUS);
        let state = await getHealthState(nodeName);
        if(state.valueOf() === HEALTH_STATUSES.UNHEALTHY.valueOf()){
            SEND_SERVICE.pauseSend(nodeName);
        } else {
            SEND_SERVICE.resumeSend(nodeName);
        }
        let intervalAfterReq = HEALTH_CHECK.interval + Math.round(Math.random() * HEALTH_CHECK.interval_jitter);
        await UTILS.sleep(intervalAfterReq);
    }

    async function reqToNode(baseUrl, healthCheckUrl, timeout) {
        try{
            let response = await axios({
                method: 'get',
                url: healthCheckUrl,
                baseURL: baseUrl,
                timeout: timeout,
                data: {}
            });
            if (response.data && response.status === 200)     {
                return {HEALTH_STATUS:'OK'};
            } else {
                return {HEALTH_STATUS:'BAD'};
            }
        } catch (err){
            return {HEALTH_STATUS:'BAD'}
        }
    }
}

module.exports = {
    startHealthCheckMonitors,
    getHealthState,
    getHealthStatesReport
}