import type {HydratedDocument, Types} from 'mongoose';
import type {Freet} from './model';
import FreetModel from './model';
import UserCollection from '../user/collection';

/**
 * This files contains a class that has the functionality to explore freets
 * stored in MongoDB, including adding, finding, updating, and deleting freets.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Freet> is the output of the FreetModel() constructor,
 * and contains all the information in Freet. https://mongoosejs.com/docs/typescript.html
 */
class FreetCollection {
  /**
   * Add a freet to the collection
   *
   * @param {string} authorId - The id of the author of the freet
   * @param {string} content - The id of the content of the freet
   * @return {Promise<HydratedDocument<Freet>>} - The newly created freet
   */
  static async addOne(authorId: Types.ObjectId | string, content: string): Promise<HydratedDocument<Freet>> {
    const date = new Date();
    const user = await UserCollection.findOneByUserId(authorId);
    let anon = false;
    let initUpvotes = 0;
    const initUpvoters:Array<any> = [];
    const commentArray:Array<any> = [];
    if (user.username == 'Anonymous') anon = true;
    const freet = new FreetModel({
      authorId,
      dateCreated: date,
      content,
      dateModified: date,
      anonymous: anon,
      comments: commentArray,
      upvoters: initUpvoters,
      upvotes: initUpvotes,
    });
    await freet.save(); // Saves freet to MongoDB
    return freet.populate('authorId');
  }

  /**
   * Find a freet by freetId
   *
   * @param {string} freetId - The id of the freet to find
   * @return {Promise<HydratedDocument<Freet>> | Promise<null> } - The freet with the given freetId, if any
   */
  static async findOne(freetId: Types.ObjectId | string): Promise<HydratedDocument<Freet>> {
    return FreetModel.findOne({_id: freetId}).populate('authorId');
  }

  /**
   * Get all the freets in the database
   *
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of all of the freets
   */
  static async findAll(): Promise<Array<HydratedDocument<Freet>>> {
    // Retrieves freets and sorts them from most to least recent
    return FreetModel.find({}).sort({dateModified: -1}).populate('authorId');
  }

  /**
   * Get all the freets in the database from the author on a certain date
   *
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of all of the freets
   */
   static async findAllOnThisDate(username: string): Promise<Array<HydratedDocument<Freet>>> {
    const author = await UserCollection.findOneByUsername(username);
    const authorFreetArray = await FreetModel.find({authorId: author._id}).populate('authorId');
    const onThisDayArray = [];
    const date = new Date();
    for (const freet of authorFreetArray)
    {
      const dateCreated = freet.dateCreated;
      if (dateCreated.getDate() == date.getDate() && dateCreated.getMonth() == date.getMonth() && dateCreated.getFullYear() != date.getFullYear())
      {
        onThisDayArray.push(freet);
      }
    }
    return onThisDayArray;
  }

  /**
   * Get all the freets in the database that tag a certain user
   *
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of all of the freets
   */
   static async findAllTag(username: string): Promise<Array<HydratedDocument<Freet>>> {
    const freetArray = await FreetModel.find({}).sort({dateModified: -1}).populate('authorId');
    const taggedUserArray = [];
    for (const freet of freetArray)
    {
      const text = freet.content;
      const tag = "@" + username + " ";
      // this is a temporary fix for the @seok vs @seok1 example: currently works unless freet ends in the tag
      // also currently shows self-freets -- get rid of these
      // might want to think about being able to remove freets from important posts and insert them into normal feed?
      if (text.includes(tag))
      {
        taggedUserArray.push(freet);
      }
    }
    return taggedUserArray;
  }

  /**
   * Get all of the seen freets for a certain user.
   *
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of all of the freets
   */
   static async getSeenFreets(username: string): Promise<Array<HydratedDocument<Freet>>> {
    const user = await UserCollection.findOneByUsername(username);
    const emptyArray:Array<HydratedDocument<Freet>> = [];
    if (user) return user.seen; // might be a terrible idea because of aliasing?
    else {
      return emptyArray;
    }
  }

  /**
   * Get all of the freets from freeters that the user follows.
   *
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of all of the freets
   */
   static async getFollowingFreets(username: string): Promise<Array<HydratedDocument<Freet>>> {
    const user = await UserCollection.findOneByUsername(username);
    const followingFreets:Array<any> = []; // fix this lol
    if (user)
    {
      for (const name of user.following)
      {
        const followFreet = await FreetModel.find({authorId: name._id}).populate('authorId');
        for (const freet of followFreet)
        {
          if (freet.anonymous == false) followingFreets.push(freet);
        }
        followingFreets.push(followFreet);
      }      
    }
    return followingFreets;
  }

    /**
   * Get the shortened text for a freet.
   *
   * @return {Promise<string>} - A string of the freet's content.
   */
     static async shortenedFreet(freetId: Types.ObjectId | string): Promise<string> {
      // maybe this shouldn't just return a string?
      const freet = await FreetModel.findOne({_id: freetId}).populate('authorId');
      const content = freet.content;
      if (content.length > 300) 
      {
        return content.slice(0, 300);
      }
      return content;
    }

  /**
   * User upvotes a post.
   *
   * @param {string} username - The user that upvotes the freet
   * @param {string} freetId - The id of the freet to find
   * @return {Promise<HydratedDocument<User>> | Promise<null>} - The user with the updated reputation.
   */
   static async upvotePost(username: string, freetId: Types.ObjectId | string): Promise<HydratedDocument<Freet>> {
    const freet = await this.findOne(freetId);
    if (freet && freet.upvoters.includes(username))
    {
      freet.upvotes -= 1;
      const ix = freet.upvoters.indexOf(username);
      freet.upvoters.splice(ix, 1);
      await freet.save();
    }
    else if (freet && !(freet.upvoters.includes(username)))
    {
      freet.upvotes += 1;
      freet.upvoters.push(username);
      await freet.save();
    }
    return freet;
  }

  /**
   * Get all the freets in by given author
   *
   * @param {string} username - The username of author of the freets
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of all of the freets
   */
  static async findAllByUsername(username: string): Promise<Array<HydratedDocument<Freet>>> {
    const author = await UserCollection.findOneByUsername(username);
    return FreetModel.find({authorId: author._id}).populate('authorId');
  }

  /**
   * Update a freet with the new content
   *
   * @param {string} freetId - The id of the freet to be updated
   * @param {string} content - The new content of the freet
   * @return {Promise<HydratedDocument<Freet>>} - The newly updated freet
   */
  static async updateOne(freetId: Types.ObjectId | string, content: string): Promise<HydratedDocument<Freet>> {
    const freet = await FreetModel.findOne({_id: freetId});
    freet.content = content;
    freet.dateModified = new Date();
    await freet.save();
    return freet.populate('authorId');
  }

  /**
   * Delete a freet with given freetId.
   *
   * @param {string} freetId - The freetId of freet to delete
   * @return {Promise<Boolean>} - true if the freet has been deleted, false otherwise
   */
  static async deleteOne(freetId: Types.ObjectId | string): Promise<boolean> {
    const freet = await FreetModel.deleteOne({_id: freetId});
    return freet !== null;
  }

  /**
   * Delete all the freets by the given author
   *
   * @param {string} authorId - The id of author of freets
   */
  static async deleteMany(authorId: Types.ObjectId | string): Promise<void> {
    await FreetModel.deleteMany({authorId});
  }
}

export default FreetCollection;
