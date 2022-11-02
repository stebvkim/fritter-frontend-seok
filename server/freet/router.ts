import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import FreetCollection from './collection';
import * as userValidator from '../user/middleware';
import * as freetValidator from '../freet/middleware';
import * as util from './util';
import UserCollection from '../user/collection';

const router = express.Router();

/**
 * Get all the freets
 *
 * @name GET /api/freets
 *
 * @return {FreetResponse[]} - A list of all the freets sorted in descending
 *                      order by date modified
 */
/**
 * Get freets by author.
 *
 * @name GET /api/freets?authorId=id
 *
 * @return {FreetResponse[]} - An array of freets created by user with id, authorId
 * @throws {400} - If authorId is not given
 * @throws {404} - If no user has given authorId
 *
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if authorId query parameter was supplied
    if (req.query.author !== undefined) {
      next();
      return;
    }

    const allFreets = await FreetCollection.findAll();
    const response = allFreets.map(util.constructFreetResponse);
    res.status(200).json(response);
  },
  [
    userValidator.isAuthorExists
  ],
  async (req: Request, res: Response) => {
    const authorFreets = await FreetCollection.findAllByUsername(req.query.author as string);
    const response = authorFreets.map(util.constructFreetResponse);
    res.status(200).json(response);
  }
);

/**
 * Get freets by author on today's date.
 *
 * @name GET /api/freets/date?authorId=id
 *
 * @return {FreetResponse[]} - An array of freets created by user with id, authorId
 * @throws {400} - If authorId is not given
 * @throws {404} - If no user has given authorId
 *
 */
 router.get(
  '/date',
  [
    userValidator.isAuthorExists
  ],
  async (req: Request, res: Response) => {
    const authorFreetsOnThisDay = await FreetCollection.findAllOnThisDate(req.query.author as string);
    const response = authorFreetsOnThisDay.map(util.constructFreetResponse);
    res.status(200).json(response);
  }
);

/**
 * Get important freets for a user.
 *
 * @name GET /api/freets/important?user=USERNAME
 *
 * @return {FreetResponse[]} - An array of freets including the user's username
 * @throws {400} - If authorId is not given
 * @throws {404} - If no user has given authorId
 *
 */
 router.get(
  '/important',
  [
    // userValidator.doesUserExist // uncomment once it's fixed
  ],
  async (req: Request, res: Response) => {
    const taggedFreets = await FreetCollection.findAllTag(req.query.user as string);
    const response = taggedFreets.map(util.constructFreetResponse);
    res.status(200).json(response);
  }
);

/**
 * Get seen freets for a user.
 *
 * @name GET /api/freets/seen?user=USERNAME
 *
 * @return {FreetResponse[]} - An array of freets that the user has seen
 * @throws {400} - If authorId is not given
 * @throws {404} - If no user has given authorId
 *
 */
 router.get(
  '/seen',
  [
    // userValidator.doesUserExist // uncomment once it's fixed
  ],
  async (req: Request, res: Response) => {
    const seenFreets = await FreetCollection.getSeenFreets(req.query.user as string);
    const response = seenFreets.map(util.constructFreetResponse);
    res.status(200).json(response);
  }
);

/**
 * Get a user's following feed.
 *
 * @name GET /api/freets/following?user=USERNAME
 *
 * @return {FreetResponse[]} - An array of freets from other users that the user follows
 * @throws {400} - If authorId is not given
 * @throws {404} - If no user has given authorId
 *
 */
 router.get(
  '/following',
  [
    // userValidator.doesUserExist // uncomment once it's fixed
  ],
  async (req: Request, res: Response) => {

    const followingFreets = await FreetCollection.getFollowingFreets(req.query.user as string);
    const response = followingFreets.map(util.constructFreetResponse);
    res.status(200).json(response);
  }
);


/**
 * Create a new freet.
 *
 * @name POST /api/freets
 *
 * @param {string} content - The content of the freet
 * @return {FreetResponse} - The created freet
 * @throws {403} - If the user is not logged in
 * @throws {400} - If the freet content is empty or a stream of empty spaces
 * @throws {413} - If the freet content is more than 140 characters long
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isValidFreetContent
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const freet = await FreetCollection.addOne(userId, req.body.content);

    res.status(201).json({
      message: 'Your freet was created successfully.',
      freet: util.constructFreetResponse(freet)
    });
  }
);

/**
 * Delete a freet
 *
 * @name DELETE /api/freets/:id
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in or is not the author of
 *                 the freet
 * @throws {404} - If the freetId is not valid
 */
router.delete(
  '/:freetId?',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    freetValidator.isValidFreetModifier
  ],
  async (req: Request, res: Response) => {
    await FreetCollection.deleteOne(req.params.freetId);
    res.status(200).json({
      message: 'Your freet was deleted successfully.'
    });
  }
);

/**
 * Modify a freet
 *
 * @name PUT /api/freets/:id
 *
 * @param {string} content - the new content for the freet
 * @return {FreetResponse} - the updated freet
 * @throws {403} - if the user is not logged in or not the author of
 *                 of the freet
 * @throws {404} - If the freetId is not valid
 * @throws {400} - If the freet content is empty or a stream of empty spaces
 * @throws {413} - If the freet content is more than 140 characters long
 */
router.put(
  '/:freetId?',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    freetValidator.isValidFreetModifier,
    freetValidator.isValidFreetContent
  ],
  async (req: Request, res: Response) => {
    const freet = await FreetCollection.updateOne(req.params.freetId, req.body.content);
    res.status(200).json({
      message: 'Your freet was updated successfully.',
      freet: util.constructFreetResponse(freet)
    });
  }
);

/**
 * Get a shortened freet.
 *
 * @name GET /api/freets/shortened?id=freetId
 *
 * @return {string} - A string of the shortened freet.
 * @throws {400} - If freetId is not given
 * @throws {404} - If freetId is invalid
 *
 */
 router.get(
  '/shortened',
  [
    // freetValidator.isFreetExists,
  ],
  async (req: Request, res: Response) => {
    const response = await FreetCollection.shortenedFreet(req.query.id as string);
    res.status(200).json(response);
  }
);

/**
 * Upvote a freet.
 *
 * @name PUT /api/freets/react/:freetId?
 *
 * @return {string} - A success message.
 * @throws {400} - If freetId is not given
 * @throws {404} - If freetId is invalid
 *
 */
 router.put(
  '/react/:freetId?',
  [
    freetValidator.isFreetExists, // need to uncomment this
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const user = await UserCollection.findOneByUserId(userId);
    const response = await FreetCollection.upvotePost(user.username, req.params.freetId as string);
    res.status(200).json(response);
  }
);

export {router as freetRouter};
