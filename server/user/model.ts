import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';

/**
 * This file defines the properties stored in a User
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for User on the backend
export type User = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  username: string;
  password: string;
  dateJoined: Date;
  following: Array<any>; // change Any to the proper type later
  seen: Array<any>; // change Any to the proper type later
  anonName: string;
  reputation: number;
};

// Mongoose schema definition for interfacing with a MongoDB table
// Users stored in this table will have these fields, with the
// type given by the type property, inside MongoDB
const UserSchema = new Schema({
  // The user's username
  username: {
    type: String,
    required: true
  },
  // The user's password
  password: {
    type: String,
    required: true
  },
  // The date the user joined
  dateJoined: {
    type: Date,
    required: true
  },
  // The user's following list
  following: {
    type: Array,
    required: true
  },
  // The user's seen posts
  seen: {
    type: Array,
    required: true
  },
  // anonymous name
  anonName: {
    type: String,
    required: true
  },
  reputation: {
    type: Number,
    required: true
  }
});

const UserModel = model<User>('User', UserSchema);
export default UserModel;
