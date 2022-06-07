const fetch = require('node-fetch');
const { parentPort } = require('worker_threads');

fetch('http://35.207.169.147/results', {
    credentials: 'same-origin'
}).then(response => {
    if (response.status === 204) {
        parentPort.close();
        return {};
    } else {
        return response.json();
    }
}).then(
    json => parentPort.postMessage({ race: json })
).catch(
    function (err) {
        throw new Error(err);
    }
);
