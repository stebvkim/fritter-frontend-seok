import type {HydratedDocument, Types} from 'mongoose';
import type {Comment} from './model';
import CommentModel from './model';
import UserCollection from '../user/collection';
import FreetCollection from '../freet/collection';

class CommentCollection {
  /**
   * Add a Comment to the collection
   *
   * @param {string} authorId - The id of the author of the comment
   * @param {string} content - The id of the content of the comment
   * @param {string} freetId - The id of the original freet
   * @return {Promise<HydratedDocument<Comment>>} - The newly created freet
   */
  static async addOne(authorId: Types.ObjectId | string, content: string, freetId: Types.ObjectId | string): Promise<HydratedDocument<Comment>> {
    const date = new Date();
    const user = await UserCollection.findOneByUserId(authorId);
    let anon = false;
    let initUpvotes = 0;
    const initUpvoters:Array<any> = [];
    const initDownvoters:Array<any> = [];
    if (user.username == 'Anonymous') anon = true;
    const comment = new CommentModel({
      authorId,
      freetId: freetId,
      dateCreated: date,
      content,
      dateModified: date,
      anonymous: anon,
      upvoters: initUpvoters,
      downvoters: initDownvoters,
      upvotes: initUpvotes,
    });
    const freet = await FreetCollection.findOne(freetId);
    freet.comments.push(comment);
    await freet.save();
    await comment.save(); // Saves comment to MongoDB
    return comment.populate('authorId');
  }

  /**
   * Find a comment by commentId
   *
   * @param {string} commentId - The id of the comment to find
   * @return {Promise<HydratedDocument<Comment>> | Promise<null> } - The comment with the given commentId, if any
   */
  static async findOne(commentId: Types.ObjectId | string): Promise<HydratedDocument<Comment>> {
    return CommentModel.findOne({_id: commentId}).populate('authorId');
  }

  /**
   * Get all the comments in the database
   *
   * @return {Promise<HydratedDocument<Comment>[]>} - An array of all of the comments
   */
  static async findAll(): Promise<Array<HydratedDocument<Comment>>> {
    // Retrieves comments and sorts them from most to least recent
    return CommentModel.find({}).sort({dateModified: -1}).populate('authorId');
  }


  /**
   * Get all of the comments that tag a certain user
   *
   * @return {Promise<HydratedDocument<Comment>[]>} - An array of all of the comments
   */
   static async findAllTag(username: string): Promise<Array<HydratedDocument<Comment>>> {
    const commentArray = await CommentModel.find({}).sort({dateModified: -1}).populate('authorId');
    const taggedUserArray = [];
    for (const comment of commentArray)
    {
      const text = comment.content;
      const tag = "@" + username + " ";
      if (text.includes(tag))
      {
        taggedUserArray.push(comment);
      }
    }
    return taggedUserArray;
  }

  /**
   * User upvotes a comment.
   *
   * @param {string} username - The user that upvotes the comment
   * @param {string} commentId - The id of the comment to find
   * @param {number} react: upvote or downvote or unvote (=1 = downvote, 1 = upvote, repeating undoes, overriding exists)
   * @return {Promise<HydratedDocument<User>> | Promise<null>} - The user with the updated reputation.
   */
   static async upvoteComment(username: string, commentId: Types.ObjectId | string, react: number): Promise<HydratedDocument<Comment>> {
    const comment = await this.findOne(commentId);
    if (comment)
    {
      if (comment.upvoters.includes(username))
      {
        if (react == 1)
        {
          comment.upvotes -= 1;
          const ix = comment.upvoters.indexOf(username);
          comment.upvoters.splice(ix, 1);
          await comment.save();
        }
        else if (react == -1)
        {
          comment.upvotes -= 2;
          const ix = comment.upvoters.indexOf(username);
          comment.downvoters.push(username);
          comment.upvoters.splice(ix, 1);
          await comment.save();          
        }
      }
      else if (comment.downvoters.includes(username))
      {
        if (react == 1)
        {
          comment.upvotes += 2;
          const ix = comment.downvoters.indexOf(username);
          comment.upvoters.push(username);
          comment.downvoters.splice(ix, 1);
          await comment.save();
        }
        else if (react == -1)
        {
          comment.upvotes += 1;
          const ix = comment.upvoters.indexOf(username);
          comment.downvoters.splice(ix, 1);
          await comment.save();          
        }
      }
      else
      {
        if (react == 1)
        {
          comment.upvotes += 1;
          comment.upvoters.push(username);
          await comment.save();
        }
        else if (react == -1)
        {
          comment.upvotes -= 1;
          comment.downvoters.push(username);
          await comment.save();          
        }        
      }
    }
    return comment;
  }

  /**
   * Get all the comments in by given author
   *
   * @param {string} username - The username of author of the comments
   * @return {Promise<HydratedDocument<Comment>[]>} - An array of all of the comments
   */
  static async findAllByUsername(username: string): Promise<Array<HydratedDocument<Comment>>> {
    const author = await UserCollection.findOneByUsername(username);
    return CommentModel.find({authorId: author._id}).populate('authorId');
  }

  /**
   * Get all the comments in a freet.
   *
   * @param {string} freetId - The freetId
   * @return {Promise<HydratedDocument<Comment>[]>} - An array of all of the comments
   */
   static async findAllByFreet(freetId: Types.ObjectId | string): Promise<Array<HydratedDocument<Comment>>> {
    const freet = await FreetCollection.findOne(freetId);
    if (freet)
    {
      console.log('valid freet');
      console.log(freet.comments);
      return freet.comments;
    }
    return [];
  }


  /**
   * Update a comment with the new content
   *
   * @param {string} commentId - The id of the comment to be updated
   * @param {string} content - The new content of the comment
   * @return {Promise<HydratedDocument<Comment>>} - The newly updated comment
   */
  static async updateOne(commentId: Types.ObjectId | string, content: string): Promise<HydratedDocument<Comment>> {
    const comment = await CommentModel.findOne({_id: commentId});
    comment.content = content;
    comment.dateModified = new Date();
    await comment.save();
    return comment.populate('authorId');
  }

  /**
   * Delete a comment with given commentId.
   *
   * @param {string} commentId - The commentId of comment to delete
   * @return {Promise<Boolean>} - true if the comment has been deleted, false otherwise
   */
  static async deleteOne(commentId: Types.ObjectId | string): Promise<boolean> {
    const comment = await CommentModel.deleteOne({_id: commentId});
    return comment !== null;
  }

  /**
   * Delete all the comments by the given author
   *
   * @param {string} authorId - The id of author of comments
   */
  static async deleteMany(authorId: Types.ObjectId | string): Promise<void> {
    await CommentModel.deleteMany({authorId});
  }
}

export default CommentCollection;
