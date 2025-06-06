function profileDevice(callback) {
    // Initialize the SDK
    // replace <envid> with the PingOne console > Environment > Environment ID value
    onPingOneSignalsReady(function () {
        _pingOneSignals.initSilent({
            envId: "b602e229-5c7b-4b20-9df5-968a90804df8",
            deviceAttributesBlackList: []
        }).then(function () {
            console.log("PingOne Signals initialized successfully");
        }).catch(function (e) {
            console.error("SDK Init failed", e);
        });
    });

    // get device profiling data
    if (window.requestIdleCallback) {
        requestIdleCallback(() => getDeviceProfileData(callback));
    } else {
        setTimeout(() => getDeviceProfileData(callback), 500);
    }
}

function onPingOneSignalsReady(callback) {
    if (window['_pingOneSignalsReady']) {
        callback();
    } else {
        document.addEventListener('PingOneSignalsReadyEvent', callback);
    }
}

/**
 * Calls the getData method and with the output, calls the callback function.
 *
 * @param callback
 */
function getDeviceProfileData(callback) {
    _pingOneSignals.getData()
        .then((result) => callback(result))
        .catch((error) => console.error('getData Error!', error));
}
