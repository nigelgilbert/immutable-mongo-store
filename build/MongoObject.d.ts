import { ObjectId } from 'mongodb';
export declare type Mutation = [string, any];
export interface MongoObject {
    _id?: ObjectId;
    mutations: Mutation[];
}
