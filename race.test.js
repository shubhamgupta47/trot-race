const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { config } = require('./package.json');

describe('insert', () => {
    let server = new MongoMemoryServer();
    let connection;
    let db;

    beforeAll(async () => {
        const url = await server.getConnectionString();
        connection = await MongoClient.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        db = await connection.db(config.dbname);
    });

    afterAll(async () => {
        const collections = await db.listCollections().toArray();
        Promise.all(
            collections
                .map(({ name }) => name)
                .map(collection => db.collection(collection).drop())
        );
        await connection.close();
        await db.close();
    });

    test('should insert a doc into collection', async () => {
        const races = db.collection(config.dbcollection);
        const mockRace = {
            event: "start",
            horse: {
                id: 1,
                horse: "Dazzle"
            },
            time: 0
        };
        await races.insertOne(mockRace);
        const insertedRace = await races.findOne({ event: "start", "horse.id": 1 });
        expect(insertedRace).toEqual(mockRace);
    });
});
