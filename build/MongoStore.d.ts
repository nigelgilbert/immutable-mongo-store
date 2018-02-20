import { Collection, ObjectId, InsertOneWriteOpResult } from 'mongodb';
import { TypedRecord } from 'typed-immutable-record';
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
export declare class MongoStore<E extends MongoObject, T extends TypedRecord<T> & E> {
    private collection;
    private cache;
    /**
     * @param {mongodb.Collection<T>} collection The MongoDB Collection for storing records
     */
    constructor(collection: Collection<E>);
    /**
     * Insert a record.
     *
     * @param {immutable.Record} collection The record to insert
     * @returns {Promise<InsertOneWriteOpResult>} InsertOneWriteOpResult
     * @see http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#~insertOneWriteOpResult
     */
    insertRecord(record: T): Promise<InsertOneWriteOpResult>;
    /**
     * Get a record by id.
     *
     * @param {ObjectId} id MongoDB ObjectID of record
     * @returns {Promise<T>} record object
     */
    getRecord(id: ObjectId): Promise<T>;
    /**
     * Update a record.  Stores changes in the MongoDB object's "mutation" property.
     *
     * @param {immutable.Record} record A record that's been changed
     * @returns {Promise<T>} Updated record object
     */
    updateRecord(record: T): Promise<T>;
}
