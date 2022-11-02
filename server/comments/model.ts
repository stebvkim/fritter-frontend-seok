import type {Types, PopulatedDoc, Document} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from '../user/model';

/**
 * This file defines the properties stored in a Freet
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for Freet on the backend
export type Comment = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  authorId: Types.ObjectId;
  freetId: Types.ObjectId;
  dateCreated: Date;
  content: string;
  dateModified: Date;
  anonymous: boolean;
  upvotes: number;
  upvoters: Array<any>;
  downvoters: Array<any>;
};

// Mongoose schema definition for interfacing with a MongoDB table
// Freets stored in this table will have these fields, with the
// type given by the type property, inside MongoDB
const CommentSchema = new Schema<Comment>({
  // The author userId
  authorId: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  // The parent Freet
  freetId: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
  },
  // The date the freet was created
  dateCreated: {
    type: Date,
    required: true
  },
  // The content of the freet
  content: {
    type: String,
    required: true
  },
  // The date the freet was modified
  dateModified: {
    type: Date,
    required: true
  },
  anonymous: {
    type: Boolean,
    required: true
  },
  upvoters: {
    type: [],
    required: true
  },
  upvotes: {
    type: Number,
    required: true
  },
  downvoters: {
    type: [],
    required: true
  },
});

const CommentModel = model<Comment>('Comment', CommentSchema);
export default CommentModel;
