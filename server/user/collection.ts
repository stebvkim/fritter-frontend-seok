import type {HydratedDocument, Types} from 'mongoose';
import type {User} from './model';
import UserModel from './model';
import FreetModel from '../freet/model';

/**
 * This file contains a class with functionality to interact with users stored
 * in MongoDB, including adding, finding, updating, and deleting. Feel free to add
 * additional operations in this file.
 *
 * Note: HydratedDocument<User> is the output of the UserModel() constructor,
 * and contains all the information in User. https://mongoosejs.com/docs/typescript.html
 */
class UserCollection {
  /**
   * Add a new user
   *
   * @param {string} username - The username of the user
   * @param {string} password - The password of the user
   * @return {Promise<HydratedDocument<User>>} - The newly created user
   */
  static async addOne(username: string, password: string): Promise<HydratedDocument<User>> {
    const dateJoined = new Date();
    const seen:Array<any> = [];
    const following:Array<any> = [];
    const anonName:string = 'Anonymous'
    let reputation = 0;
    const user = new UserModel({username, password, dateJoined, seen, following, anonName, reputation});
    await user.save(); // Saves user to MongoDB
    return user;
  }

  /**
   * Find a user by userId.
   *
   * @param {string} userId - The userId of the user to find
   * @return {Promise<HydratedDocument<User>> | Promise<null>} - The user with the given username, if any
   */
  static async findOneByUserId(userId: Types.ObjectId | string): Promise<HydratedDocument<User>> {
    return UserModel.findOne({_id: userId});
  }
  
  /**
   * Find a user by username (case insensitive).
   *
   * @param {string} username - The username of the user to find
   * @return {Promise<HydratedDocument<User>> | Promise<null>} - The user with the given username, if any
   */
  static async findOneByUsername(username: string): Promise<HydratedDocument<User>> {
    return UserModel.findOne({username: new RegExp(`^${username.trim()}$`, 'i')});
  }


  /**
   * Modify a user's reputation.
   *
   * @param {string} userId - The userId of the user to find
   * @return {Promise<HydratedDocument<User>> | Promise<null>} - The user with the updated reputation.
   */
   static async updateUserReputation(username: string, repChange: number): Promise<HydratedDocument<User>> {
    const user = await this.findOneByUsername(username);
    if (user && typeof(repChange) == 'number')
    {
      user.reputation += repChange;
      await user.save();
      return user;
    }
    return user;
  }

  /**
   * Add a freet to the seen list.
   *
   * @param {string} username - The username of the user 
   * @param {string} freetId - The freet to add to the seen list // is this even a string?
   * @return {Promise<HydratedDocument<User>> | Promise<null>} - The user with the given username, if any
   */
   static async addToSeenList(username: string, freetId: Types.ObjectId | string): Promise<HydratedDocument<User>> {
    const user =  await UserModel.findOne({_id: username});
    try { 
      const seenFreet = await FreetModel.findOne({_id: freetId});
      if (user.seen.includes(freetId) == false && seenFreet != null)
      {
        user.seen.push(freetId);
      }
      await user.save();
      return user;
    }
    catch (error) { 
      return user;
    }
  }

  /**
   * Remove a freet from the seen list.
   *
   * @param {string} username - The username of the user
   * @param {string} freetId - The freet to remove from the seen list // is this even a string?
   * @return {Promise<HydratedDocument<User>> | Promise<null>} - The user with the given username, if any
   */
   static async removeFromSeenList(username: string, freetId: Types.ObjectId | string): Promise<HydratedDocument<User>> {
    const user =  await UserModel.findOne({_id: username});
    if (user.seen.includes(freetId)) 
    {
      const ix = user.seen.indexOf(freetId);
      user.seen.splice(ix, 1);
    }

    await user.save();
    return user;
  }

  /**
   * Add a freeter to the user's following list.
   * 
   * @param {string} username - The username of the user
   * @param {string} toFollow - The username of the user to add to the following list
   * @return {Promise<HydratedDocument<User>> | Promise<null>} - The user with the given username, if any
   */
   static async addToFollowList(username: string, toFollow: string): Promise<HydratedDocument<User>> {

    const user =  await UserModel.findOne({_id: username});
    const follow =  await UserModel.findOne({username: new RegExp(`^${toFollow.trim()}$`, 'i')});
    if (user.following.includes(toFollow) == false && follow != null) user.following.push(toFollow);

    await user.save();
    return user;
  }

  /**
   * Remove from the user's following list.
   * 
   * @param {string} username - The username of the user
   * @param {string} toRemove - The username of the user to remove from the following list
   * @return {Promise<HydratedDocument<User>> | Promise<null>} - The user with the given username, if any
   */
   static async removeFromFollowList(username: string, toRemove: string): Promise<HydratedDocument<User>> {
    const user =  await UserModel.findOne({_id: username});
    if (user.following.includes(toRemove)) 
    {
      const ix = user.following.indexOf(toRemove);
      user.following.splice(ix, 1);
    }

    await user.save();
    return user;
  }

  /**
   * Find a user by username (case insensitive).
   *
   * @param {string} username - The username of the user to find
   * @param {string} password - The password of the user to find
   * @return {Promise<HydratedDocument<User>> | Promise<null>} - The user with the given username, if any
   */
  static async findOneByUsernameAndPassword(username: string, password: string): Promise<HydratedDocument<User>> {
    return UserModel.findOne({
      username: new RegExp(`^${username.trim()}$`, 'i'),
      password
    });
  }

  /**
   * Update user's information
   *
   * @param {string} userId - The userId of the user to update
   * @param {Object} userDetails - An object with the user's updated credentials
   * @return {Promise<HydratedDocument<User>>} - The updated user
   */
  static async updateOne(userId: Types.ObjectId | string, userDetails: any): Promise<HydratedDocument<User>> {
    const user = await UserModel.findOne({_id: userId});
    if (userDetails.password) {
      user.password = userDetails.password as string;
    }

    if (userDetails.username) {
      user.username = userDetails.username as string;
    }

    if (userDetails.anonOn) {
      user.anonName = userDetails.username as string;
      user.username = 'Anonymous';
    }

    if (userDetails.anonOff) {
      user.username = userDetails.anonName as string;
      user.anonName = 'Anonymous';
    }

    await user.save();
    return user;
  }

  /**
   * Toggle user's anonymous mode
   *
   * @param {string} userId - The userId of the user to update
   * @param {Object} userDetails - An object with the user's updated credentials
   * @return {Promise<HydratedDocument<User>>} - The updated user
   */
   static async updateAnon(userId: Types.ObjectId | string): Promise<HydratedDocument<User>> {
    const user = await UserModel.findOne({_id: userId});

    if (user.anonName == 'Anonymous')
    {
      user.anonName = user.username as string;
      user.username = 'Anonymous';      
    }

    else
    {
      user.username = user.anonName as string;
      user.anonName = 'Anonymous';
    }
    await user.save();
    return user;
  }

  /**
   * Delete a user from the collection.
   *
   * @param {string} userId - The userId of user to delete
   * @return {Promise<Boolean>} - true if the user has been deleted, false otherwise
   */
  static async deleteOne(userId: Types.ObjectId | string): Promise<boolean> {
    const user = await UserModel.deleteOne({_id: userId});
    return user !== null;
  }
}

export default UserCollection;
