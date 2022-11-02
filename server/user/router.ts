import type {Request, Response} from 'express';
import express from 'express';
import FreetCollection from '../freet/collection';
import UserCollection from './collection';
import * as userValidator from '../user/middleware';
import * as util from './util';

const router = express.Router();

/**
 * Sign in user.
 *
 * @name POST /api/users/session
 *
 * @param {string} username - The user's username
 * @param {string} password - The user's password
 * @return {UserResponse} - An object with user's details
 * @throws {403} - If user is already signed in
 * @throws {400} - If username or password is  not in the correct format,
 *                 or missing in the req
 * @throws {401} - If the user login credentials are invalid
 *
 */
router.post(
  '/session',
  [
    userValidator.isUserLoggedOut,
    userValidator.isValidUsername,
    userValidator.isValidPassword,
    userValidator.isAccountExists
  ],
  async (req: Request, res: Response) => {
    const user = await UserCollection.findOneByUsernameAndPassword(
      req.body.username, req.body.password
    );
    req.session.userId = user._id.toString();
    res.status(201).json({
      message: 'You have logged in successfully',
      user: util.constructUserResponse(user)
    });
  }
);

/**
 * Sign out a user
 *
 * @name DELETE /api/users/session
 *
 * @return - None
 * @throws {403} - If user is not logged in
 *
 */
router.delete(
  '/session',
  [
    userValidator.isUserLoggedIn
  ],
  async (req: Request, res: Response) => {
    const user = await UserCollection.findOneByUserId(req.session.userId);
    if (user.username == 'Anonymous')
    {
      user.username = user.anonName;
      user.anonName = 'Anonymous';
      await user.save();
    }
    req.session.userId = undefined;
    res.status(200).json({
      message: 'You have been logged out successfully.'
    });
  }
);

/**
 * Create a user account.
 *
 * @name POST /api/users
 *
 * @param {string} username - username of user
 * @param {string} password - user's password
 * @return {UserResponse} - The created user
 * @throws {403} - If there is a user already logged in
 * @throws {409} - If username is already taken
 * @throws {400} - If password or username is not in correct format
 *
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedOut,
    userValidator.isValidUsername,
    userValidator.isUsernameNotAlreadyInUse,
    userValidator.isValidPassword
  ],
  async (req: Request, res: Response) => {
    const user = await UserCollection.addOne(req.body.username, req.body.password);
    req.session.userId = user._id.toString();
    res.status(201).json({
      message: `Your account was created successfully. You have been logged in as ${user.username}`,
      user: util.constructUserResponse(user)
    });
  }
);

/**
 * Update a user's profile.
 *
 * @name PUT /api/users
 *
 * @param {string} username - The user's new username
 * @param {string} password - The user's new password
 * @return {UserResponse} - The updated user
 * @throws {403} - If user is not logged in
 * @throws {409} - If username already taken
 * @throws {400} - If username or password are not of the correct format
 */
router.put(
  '/',
  [
    userValidator.isUserLoggedIn,
    userValidator.isValidUsername,
    userValidator.isUsernameNotAlreadyInUse,
    userValidator.isValidPassword
  ],
  async (req: Request, res: Response) => {
    console.log('this works?');
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    console.log('this works?');
    const user = await UserCollection.updateOne(userId, req.body);
    res.status(200).json({
      message: 'Your profile was updated successfully.',
      user: util.constructUserResponse(user)
    });
  }
);

/**
 * Update a user's profile (Anonymous mode).
 *
 * @name PUT /api/users/anonymous
 *
 * @return {UserResponse} - The updated user
 * @throws {403} - If user is not logged in
 * @throws {409} - If username already taken
 * @throws {400} - If username or password are not of the correct format
 */
 router.delete(
  '/anonymous',
  [
    userValidator.isUserLoggedIn,
  ],
  async (req: Request, res: Response) => {
    console.log('this works?');
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    console.log('this works?');
    const user = await UserCollection.updateAnon(userId);
    res.status(200).json({
      message: 'You entered/exited anonymous mode.',
      user: util.constructUserResponse(user)
    });
  }
);

/**
 * Delete a user.
 *
 * @name DELETE /api/users
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in
 */
router.delete(
  '/',
  [
    userValidator.isUserLoggedIn
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    await UserCollection.deleteOne(userId);
    await FreetCollection.deleteMany(userId);
    req.session.userId = undefined;
    res.status(200).json({
      message: 'Your account has been deleted successfully.'
    });
  }
);

/**
 * Add a follower for the user.
 *
 * @name PUT /api/users/followers
 *
 * @param {string} username - The to-be-followed user's username
 * @throws {403} - if the user is not logged in
 * @throws {409} - if the user does not exist
 * @throws {400} - if the user is already following that person
 */
 router.put(
  '/followers',
  [
    userValidator.isUserLoggedIn,
    userValidator.isValidUsername,
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn

    await UserCollection.addToFollowList(userId, req.body.user);
    res.status(200).json({
      message: 'Added to following list.'
    });
  }
);

/**
 * Add a seen post for the user.
 *
 * @name PUT /api/users/seen
 *
 * @param {string} freet - The seen freet.
 * @throws {403} - if the user is not logged in
 * @throws {409} - if the user does not exist
 * @throws {400} - if the user is already following that person
 */
 router.put(
  '/seen',
  [
    userValidator.isUserLoggedIn,
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    await UserCollection.addToSeenList(userId, req.body.freet);
    res.status(200).json({
      message: 'Added to seen list.'
    });
  }
);

/**
 * Remove a follower.
 *
 * @name DELETE /api/users/followers/:followId?
 *
 * @return {string} - A success message
 * @throws {403} - if the user is not logged in
 * @throws {409} - if the user does not exist
 * @throws {400} - if the user is already not following that person
 */
 router.delete(
  '/followers/:followId?',
  [
    userValidator.isUserLoggedIn
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    console.log('asdfasdfasdf');
    console.log(req.params);
    await UserCollection.removeFromFollowList(userId, req.params.followId);
    res.status(200).json({
      message: 'Successfully removed the follower.'
    });
  }
);

/**
 * Remove a seen freet.
 *
 * @name DELETE /api/users/seen/:freetID?
 *
 * @return {string} - A success message
 * @throws {403} - if the user is not logged in
 * @throws {409} - if the user does not exist
 * @throws {400} - if the user is already not following that person
 */
 router.delete(
  '/seen/:freet?',
  [
    userValidator.isUserLoggedIn
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    console.log('we got here?');
    await UserCollection.removeFromSeenList(userId, req.params.freet);
    res.status(200).json({
      message: 'Successfully removed the seen post.'
    });
  }
);

/**
 * Change a user's reputation
 *
 * @name PUT /api/users/reputation
 *
 * @param {string} username - The user's username
 * @param {string} repChange - the amount to change the reputation by
 * @return {UserResponse} - An object with user's details
 * @throws {403} - If user does not exist
 *
 */
 router.put(
  '/reputation',
  [
    userValidator.isValidUsername,
    userValidator.isValidNumber
  ],
  async (req: Request, res: Response) => {
    await UserCollection.updateUserReputation(req.body.username, Number(req.body.repChange));
    res.status(200).json({
      message: 'Successfully updated user reputation.'
    });
  }
);

export {router as userRouter};
