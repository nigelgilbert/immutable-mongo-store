import { Db, Collection, ObjectId, InsertOneWriteOpResult } from 'mongodb';
import { autobind } from 'core-decorators';
import { recordify, TypedRecord } from 'typed-immutable-record';
import { Map, Record }  from 'immutable';
import { merge } from 'lodash';
import update = require('mongo-update');
import { MongoObject } from './MongoObject';

/**
 * Simple MongoDB data store that returns Immutable.js Records. Performs minimal
 * changes on record updates, and persists all mutations in the MongoDB object.
 *
 * <E>: The TypeScript shape of the plain JavaScript object to be made
 * immutable.
 *
 * <T>: A TypedRecord type, used for better type inference of Immutable.js Record.
 * In nearly all cases this will be an interface that extends TypedRecord<T> & E.
 *
 * https://github.com/rangle/typed-immutable-record
 */
@autobind()
export class MongoStore<E extends MongoObject, T extends TypedRecord<T> & E> {

    private collection: Collection<E>;
    private cache: Map<string, T>;

    /**
     * @param {mongodb.Collection<T>} collection The MongoDB Collection for storing records
     */
    constructor(collection: Collection<E>) {
        this.collection = collection;
        this.cache = Map<string, T>();
    }

    /**
     * Insert a record.
     *
     * @param {immutable.Record} collection The record to insert
     * @returns {Promise<InsertOneWriteOpResult>} InsertOneWriteOpResult
     * @see http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#~insertOneWriteOpResult
     */
    public insertRecord(record: T): Promise<InsertOneWriteOpResult> {
        return this.collection.insertOne(record.toJS());
    }

    /**
     * Get a record by id.
     *
     * @param {ObjectId} id MongoDB ObjectID of record
     * @returns {Promise<T>} record object
     */
    public async getRecord(id: ObjectId): Promise<T> {
        const filter = { _id: id };
        const options = { projection: { mutations: 0 }};
        const record = recordify<E, T>(await this.collection.findOne(filter, options));
        this.cache = this.cache.set(id.toHexString(), record);
        return record;
    }

    /**
     * Update a record.  Stores changes in the MongoDB object's "mutation" property.
     *
     * @param {immutable.Record} record A record that's been changed
     * @returns {Promise<T>} Updated record object
     */
    public async updateRecord(record: T): Promise<T> {
        const id = record.get('_id');
        const cached = this.cache.get(id.toHexString());

        if (record === cached) return Promise.resolve(record);

        const filter = { _id: id };
        const query = update(cached.toJS(), record.toJS());
        const change = merge({}, query.$set, query.$unset);

        query.$push = {
            mutations: [Date.now(), change]
        };

        await this.collection.findOneAndUpdate(filter, query);
        return this.getRecord(id);
    }
}