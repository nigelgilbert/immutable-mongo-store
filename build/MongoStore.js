"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_decorators_1 = require("core-decorators");
const typed_immutable_record_1 = require("typed-immutable-record");
const immutable_1 = require("immutable");
const lodash_1 = require("lodash");
const update = require("mongo-update");
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
let MongoStore = class MongoStore {
    /**
     * @param {mongodb.Collection<T>} collection The MongoDB Collection for storing records
     */
    constructor(collection) {
        this.collection = collection;
        this.cache = immutable_1.Map();
    }
    /**
     * Insert a record.
     *
     * @param {immutable.Record} collection The record to insert
     * @returns {Promise<InsertOneWriteOpResult>} InsertOneWriteOpResult
     * @see http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#~insertOneWriteOpResult
     */
    insertRecord(record) {
        return this.collection.insertOne(record.toJS());
    }
    /**
     * Get a record by id.
     *
     * @param {ObjectId} id MongoDB ObjectID of record
     * @returns {Promise<T>} record object
     */
    getRecord(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = { _id: id };
            const options = { projection: { mutations: 0 } };
            const record = typed_immutable_record_1.recordify(yield this.collection.findOne(filter, options));
            this.cache = this.cache.set(id.toHexString(), record);
            return record;
        });
    }
    /**
     * Update a record.  Stores changes in the MongoDB object's "mutation" property.
     *
     * @param {immutable.Record} record A record that's been changed
     * @returns {Promise<T>} Updated record object
     */
    updateRecord(record) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = record.get('_id');
            const cached = this.cache.get(id.toHexString());
            if (record === cached)
                return Promise.resolve(record);
            const filter = { _id: id };
            const query = update(cached.toJS(), record.toJS());
            const change = lodash_1.merge({}, query.$set, query.$unset);
            query.$push = {
                mutations: [Date.now(), change]
            };
            yield this.collection.findOneAndUpdate(filter, query);
            return this.getRecord(id);
        });
    }
};
MongoStore = __decorate([
    core_decorators_1.autobind(),
    __metadata("design:paramtypes", [Object])
], MongoStore);
exports.MongoStore = MongoStore;
