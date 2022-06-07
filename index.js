const { config } = require('./package.json');
const { Worker } = require('worker_threads');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const client = new MongoClient(config.mongourl, { useUnifiedTopology: true });

function save(collection, data, callback) {
    assert.notEqual(null, collection);
    assert.notEqual(null, data);
    assert.notEqual(null, callback);
    collection.find({ "event": data.event, "horse.id": data.horse.id, time: data.time }).toArray((error, docs) => {
        if (error) {
            console.error(error);
        }
        if (docs.length > 0) {
            callback(docs);
        } else {
            collection.insertOne(data, function (err, result) {
                if (err) {
                    console.error('Insert error:', err);
                }
                console.log('Added', data.horse.horse);
                callback(result);
            });
        }
    });
}

function runService() {
    return new Promise((resolve, reject) => {
        console.log("resolve", resolve());
        const worker = new Worker('./service.js');
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

async function run(collection) {
    assert.notEqual(null, collection);
    return runService().then(data => {
        if (data.race) {
            save(collection, data.race, (/*result: don't care what gets sent back*/) => {
                race(collection);
            });
        } else {
            race(collection);
        }
    }).catch(function () {
        race(collection);
    });
}


function race(collection) {
    assert.notEqual(null, collection);
    console.log("Hello");
    run(collection).catch(err => console.error('Err', err));
}

client.connect(err => {
    assert.equal(null, err);
    const db = client.db(config.dbname);
    const collection = db.collection(config.dbcollection);
    console.log("HI");
    race(collection);
});
