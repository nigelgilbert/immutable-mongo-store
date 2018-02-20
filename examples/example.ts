import * as dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import { MongoStore } from '../src';
import { User, UserRecord } from '../test/UserRecord';
import { recordify } from 'typed-immutable-record';

dotenv.config({ path: '.env' });

(async () => {
    try {
        // connect to the Mongo database
        const mongo = await MongoClient.connect(process.env.MONGO_URI);
        const db = mongo.db(process.env.MONGO_DB);
        const store = new MongoStore<User, UserRecord>(db.collection('Users'));

        // typed-immutable-record factory
        // see: https://github.com/rangle/typed-immutable-record
        const user = recordify<User, UserRecord>({
            _id: undefined,
            name: 'nigel',
            age: 23,
            email: 'nigelcodes@gmail.com',
            mutations: []
        });

        const { insertedId }  = await store.insertRecord(user);
        let record = await store.getRecord(insertedId);

        const update1 = record.set('age', 24);
        const update2 = update1.set('name', 'Ralph');
        await store.updateRecord(update2);

        record = await store.getRecord(insertedId);

        const update3 = update2.set('age', 25);
        await store.updateRecord(update3);

        record = await store.getRecord(insertedId);
    } catch (e) {
        console.log(e);
    }
})();