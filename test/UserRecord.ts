import { MongoObject } from '../src/MongoObject';
import { TypedRecord } from 'typed-immutable-record';

export interface User extends MongoObject {
    readonly name: string;
    readonly age: number;
    readonly email: string;
}

export interface UserRecord extends TypedRecord<UserRecord>, User {}