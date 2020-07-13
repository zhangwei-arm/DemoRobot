/*
 * ----------------------------------------------------------------------------
 * Copyright 2018 ARM Ltd.
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ----------------------------------------------------------------------------
 */

const util = require('util')

const JsonRpcWs = require('json-rpc-ws');
const promisify = require('es6-promisify');

const RED    = '\x1b[31m[RobotPTDemo]\x1b[0m';
const GREEN  = '\x1b[32m[RobotPTDemo]\x1b[0m';
const YELLOW = '\x1b[33m[RobotPTDemo]\x1b[0m';

// Timeout time in milliseconds
const TIMEOUT = 10000;

const OPERATIONS = {
    READ       : 0x01,
    WRITE      : 0x02,
    EXECUTE    : 0x04,
    DELETE     : 0x08
};

var SerialPort = require('serialport');
var serialDevicePath = '/dev/ttyACM0';
var serialPort = new SerialPort(serialDevicePath, {baudRate: 115200});

serialPort.on('open', function() {
    console.log(GREEN, "Serial port " + serialDevicePath + "successfully.")
});

serialPort.on('data', function (data) {
  console.log('Data:', data)
})

// open errors will be emitted as an error event
serialPort.on('error', function(err) {
  console.log(RED, 'Error ' + err.message);
});

function RobotPTDemo() {
    this.name = 'robot-pt';
    this.api_path = '/1/pt';
    this.socket_path = '/tmp/edge.sock';

    this.client = JsonRpcWs.createClient();
}

RobotPTDemo.prototype.connect = async function() {
    let self = this;
    return new Promise((resolve, reject) => {
        let url = util.format('ws+unix://%s:%s',
                              this.socket_path,
                              this.api_path);
        console.log(GREEN, 'Connecting to "', url, '"');
        self.client.connect(url,
            function connected(error, reply) {
                if (!error) {
                    resolve(self);
                } else {
                    reject(error);
                }
            });
    });
};

RobotPTDemo.prototype.disconnect = async function() {
    let self = this;
    return new Promise((resolve, reject) => {
        console.log(GREEN, 'Disconnecting from Edge.');
        self.client.disconnect((error, response) => {
            if (!error) {
                resolve(response);
            } else {
                reject(error);
            }
        });
    });
};

RobotPTDemo.prototype.registerProtocolTranslator = async function() {
    let self = this;
    return new Promise((resolve, reject) => {
        let timeout = setTimeout(() => {
            reject('Timeout');
        }, TIMEOUT);

        self.client.send('protocol_translator_register', { 'name': self.name },
            function(error, response) {
                clearTimeout(timeout);
                if (!error) {
                    // Connection ok. Set up to listen for write calls
                    // from Edge Core.
                    self.exposeWriteMethod();
                    resolve(response);
                } else {
                    reject(error);
                }
            });
    });
};

RobotPTDemo.prototype._createDeviceParams = function(deviceId, currentPositionValue, transitionTimeValue) {
    // Values are always Base64 encoded strings.

    let currentPosition = Buffer.allocUnsafe(4);
    currentPosition.writeFloatBE(currentPositionValue);
    currentPosition = currentPosition.toString('base64');

    let transitionTime = Buffer.allocUnsafe(4);
    transitionTime.writeFloatBE(transitionTimeValue);
    transitionTime = transitionTime.toString('base64');

    // A servo object list
    params = {
        deviceId: deviceId,
        objects: [{
            objectId: 3337,
            objectInstances: [{
                objectInstanceId: 0,
                resources: [{
                    resourceId: 5536,
                    operations: OPERATIONS.READ | OPERATIONS.WRITE,
                    type: 'float',
                    value: currentPosition
                }, {
                    resourceId: 5537,
                    operations: OPERATIONS.READ | OPERATIONS.WRITE,
                    type: 'float',
                    value: transitionTime
                }]
            }]
        }, {
            objectId: 3337,
            objectInstances: [{
                objectInstanceId: 1,
                resources: [{
                    resourceId: 5536,
                    operations: OPERATIONS.READ | OPERATIONS.WRITE,
                    type: 'float',
                    value: currentPosition
                }, {
                    resourceId: 5537,
                    operations: OPERATIONS.READ | OPERATIONS.WRITE,
                    type: 'float',
                    value: transitionTime
                }]
            }]
        }, {
            objectId: 3337,
            objectInstances: [{
                objectInstanceId: 2,
                resources: [{
                    resourceId: 5536,
                    operations: OPERATIONS.READ | OPERATIONS.WRITE,
                    type: 'float',
                    value: currentPosition
                }, {
                    resourceId: 5537,
                    operations: OPERATIONS.READ | OPERATIONS.WRITE,
                    type: 'float',
                    value: transitionTime
                }]
            }]
        }, {
            objectId: 3337,
            objectInstances: [{
                objectInstanceId: 3,
                resources: [{
                    resourceId: 5536,
                    operations: OPERATIONS.READ | OPERATIONS.WRITE,
                    type: 'float',
                    value: currentPosition
                }, {
                    resourceId: 5537,
                    operations: OPERATIONS.READ | OPERATIONS.WRITE,
                    type: 'float',
                    value: transitionTime
                }]
            }]
        }, {
            objectId: 3337,
            objectInstances: [{
                objectInstanceId: 4,
                resources: [{
                    resourceId: 5536,
                    operations: OPERATIONS.READ | OPERATIONS.WRITE,
                    type: 'float',
                    value: currentPosition
                }, {
                    resourceId: 5537,
                    operations: OPERATIONS.READ | OPERATIONS.WRITE,
                    type: 'float',
                    value: transitionTime
                }]
            }]
        }, {
            objectId: 3337,
            objectInstances: [{
                objectInstanceId: 5,
                resources: [{
                    resourceId: 5536,
                    operations: OPERATIONS.READ | OPERATIONS.WRITE,
                    type: 'float',
                    value: currentPosition
                }, {
                    resourceId: 5537,
                    operations: OPERATIONS.READ | OPERATIONS.WRITE,
                    type: 'float',
                    value: transitionTime
                }]
            }]
        }]
    };
    return params;
}

RobotPTDemo.prototype.registerRobotDevice = async function(deviceId) {
    let self = this;
    return new Promise((resolve, reject) => {

        params = self._createDeviceParams(deviceId,
                                          1000 /* 0~2000 */,
                                          1000 /* 1000 ms */);

        let timeout = setTimeout(() => {
            reject('Timeout');
        }, TIMEOUT);

        self.client.send('device_register', params,
            function(error, response) {
                clearTimeout(timeout);
                if (!error) {
                    resolve(response);
                } else {
                    reject(error);
                }
            });
    });
}

RobotPTDemo.prototype.unregisterRobotDevice = async function(deviceId) {
    let self = this;
    return new Promise((resolve, reject) => {
        let timeout = setTimeout(() => {
            reject('Timeout');
        }, TIMEOUT);

        self.client.send('device_unregister', {deviceId: deviceId},
            function(error, response) {
                clearTimeout(timeout);
                if (!error) {
                    resolve(response);
                } else {
                    reject(error);
                }
            });
    });
}


RobotPTDemo.prototype.exposeWriteMethod = function() {
    let self = this;
    self.client.expose('write', (params, response) => {
        let value = new Buffer.from(params.value, 'base64').readDoubleBE();
        let resourcePath = params.uri.objectId + '/' + params.uri.objectInstanceId
            + '/' + params.uri.resourceId;
        let deviceId = params.uri.deviceId;

        let operation = '';
        if (params.operation === OPERATIONS.WRITE) {
            operation = 'write';
        } else if (params.operation === OPERATIONS.EXECUTE) {
            operation = 'execute';
        } else {
            operation = 'unknown';
        }

        received = {
            deviceId: deviceId,
            resourcePath: resourcePath,
            operation: operation,
            value: value
        }
        console.log(GREEN, 'Received a write method with data:');
        console.log(received);
        console.log(GREEN, 'The raw received JSONRPC 2.0 params:');
        console.log(params);

        if (operation == 'write') {
            self.ExecuteWriteOperation(resourcePath, value);
        }


        /* Always respond back to Edge, it is expecting
         * a success response to finish the write/execute action.
         * If an error is returned the value write is discarded
         * also in the Edge Core.
         */
        response(/* no error */ null, /* success */ 'ok');
    });
};

RobotPTDemo.prototype.ExecuteWriteOperation = async function (resourcePath, value) {
    objectId = resourcePath.split("/")[0]
    servoId = resourcePath.split("/")[1];
    resourceId = resourcePath.split("/")[2];
    if (objectId === '3337' && resourceId === '5536') {
        serialCmd = "servo " + servoId + " " + value + " 1000"
        console.log(GREEN, serialCmd);
        serialPort.write(serialCmd, function(err) {
            if (err) {
              return console.log('Error on write: ', err.message);
            }
            console.log("Serial command " + serialCmd + " executed");
        });
    } else if (objectId === '3337' && resourceId === '5537') {
        console.log(GREEN, "Servo " + servoId + " transition time changed successfully.");
    } else {
        console.log(RED, 'Will not hanlde the write');
    }
}

const holdProgress = async (message) => {
    process.stdin.setRawMode(true)
    console.log(YELLOW, util.format('\x1b[1m%s\x1b[0m', message));
    return new Promise(resolve => process.stdin.once('data', () => {
        process.stdin.setRawMode(false);
        resolve();
    }));
}

(async function() {
    try {
        edge = new RobotPTDemo();

        // Set SIGINT handle
        let quitImmediately = false;
        let sigintHandler;
        process.on('SIGINT', sigintHandler = async function() {
            if (quitImmediately) process.exit(1);
            try {
                await edge.disconnect();
            } catch (ex) {}
            process.exit(1);
        });

        // For waiting user input for example progress
        await holdProgress('Press any key to connect Edge.');

        await edge.connect();
        console.log(GREEN, 'Connected to Edge');

        await holdProgress('Press any key to register as protocol translator.');
        let response = await edge.registerProtocolTranslator();
        console.log(GREEN, 'Registered as protocol translator. Response:', response);

        await holdProgress('Press any key to register the example device.');
        response = await edge.registerRobotDevice('robot-arm-1');
        console.log(GREEN, 'Registered an example device. Response:', response);

        await holdProgress('Press any key to unregister the example device.');
        response = await edge.unregisterRobotDevice('example-device-1');
        console.log(GREEN, 'Example device unregistered. Response:', response);

        console.log(GREEN, 'Kill the example with Ctrl+C');
    } catch (ex) {
        try {
            console.error(RED, 'Error...', ex);
            await edge.disconnect();
            process.exit(1);
        } catch (err) {
            console.error(RED, 'Error on closing the Edge Core connection.', err);
            process.exit(1);
        }
    }
})();

