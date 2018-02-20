import { ObjectId } from 'mongodb';

export type Mutation = [string, any];

export interface MongoObject {
    _id?: ObjectId;
    mutations: Mutation[];
}