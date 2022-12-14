import type {HydratedDocument, Types} from 'mongoose';
import type {Freet} from './model';
import FreetModel from './model';
import UserCollection from '../user/collection';
import ExpandCollection from '../expand/collection';
import SourceCollection from '../source/collection';
import {findTwoMostSimilarFromContent, findTwoMostSimilar} from '../similar/router';
import ExpandModel from 'server/expand/model';
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
  // eslint-disable-next-line max-params
  static async addOne(authorId: Types.ObjectId | string, content: string, expandContent: string, sourceOne: string, sourceTwo: string, sourceThree: string): Promise<HydratedDocument<Freet>> {
    const date = new Date();
    const [similarIdOne, similarIdTwo] = await findTwoMostSimilarFromContent(content);
    const similarOne_ = similarIdOne.toString();
    const similarTwo_ = similarIdTwo.toString();

    const freet = new FreetModel({
      authorId,
      dateCreated: date,
      content,
      dateModified: date,
      sourceOne,
      sourceTwo,
      sourceThree,
      expandContent,
      similarOne: similarOne_,
      similarTwo: similarTwo_

    });
    await freet.save(); // Saves freet to MongoDB

    await ExpandCollection.addOne(expandContent, freet.id);
    await SourceCollection.addOne(sourceOne, sourceTwo, sourceThree, freet.id);
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
   * Get all the freets in by given author
   *
   * @param {string} username - The username of author of the freets
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of all of the freets
   */
  static async findAllByUsername(username: string): Promise<Array<HydratedDocument<Freet>>> {
    const author = await UserCollection.findOneByUsername(username);
    return FreetModel.find({authorId: author._id}).sort({dateModified: -1}).populate('authorId');
  }

  /**
   * Update a freet with the new content
   *
   * @param {string} freetId - The id of the freet to be updated
   * @param {string} content - The new content of the freet
   * @return {Promise<HydratedDocument<Freet>>} - The newly updated freet
   */
  // eslint-disable-next-line max-params
  static async updateOne(freetId: Types.ObjectId | string, content: string, expandContent: string, sourceOne: string, sourceTwo: string, sourceThree: string): Promise<HydratedDocument<Freet>> {
    const freet = await FreetModel.findOne({_id: freetId});
    freet.content = content;
    await ExpandCollection.addOne(expandContent, freet.id);
    freet.expandContent = expandContent;
    await SourceCollection.addOne(sourceOne, sourceTwo, sourceThree, freet.id);
    freet.sourceOne = sourceOne;
    freet.sourceTwo = sourceTwo;
    freet.sourceThree = sourceThree;
    const [similarIdOne, similarIdTwo] = await findTwoMostSimilar(freet.id);
    freet.similarOne = similarIdOne.toString();
    freet.similarTwo = similarIdTwo.toString();
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

  /**
   * Update a freet with the new content
   *
   * @param {string} freetId - The id of the freet to be updated
   * @param {string} expandId - The new content of the freet
   * @return {Promise<HydratedDocument<Freet>>} - The newly updated freet
   */
  static async updateOneExpandId(freetId: Types.ObjectId | string, expandId: string): Promise<HydratedDocument<Freet>> {
    const freet = await FreetModel.findOne({_id: freetId});
    freet.expandId = expandId;
    await freet.save();
    return freet.populate('authorId');
  }

  /**
   * Update a freet with the new source
   *
   * @param {string} freetId - The id of the freet to be updated
   * @param {string} sourceId - The new content of the freet
   * @return {Promise<HydratedDocument<Freet>>} - The newly updated freet
   */
  static async updateOneSourceId(freetId: Types.ObjectId | string, sourceId: string): Promise<HydratedDocument<Freet>> {
    const freet = await FreetModel.findOne({_id: freetId});
    freet.sourceId = sourceId;
    await freet.save();
    return freet.populate('authorId');
  }

  /**
   * Update a freet with the new content
   *
   * @param {string} freetId - The id of the freet to be updated
   * @param {string} similarId - The new content of the freet
   * @return {Promise<HydratedDocument<Freet>>} - The newly updated freet
   */
  static async updateOneSimilarId(freetId: Types.ObjectId | string, similarId: string): Promise<HydratedDocument<Freet>> {
    const freet = await FreetModel.findOne({_id: freetId});
    freet.similarId = similarId;
    await freet.save();
    return freet.populate('authorId');
  }

  /**
   * Update a freet with the new content
   *
   * @param {string} freetId - The id of the freet to be updated
   * @return {Promise<HydratedDocument<Freet>>} - The newly updated freet
   */
  static async updateOneSimilar(freetId:string): Promise<HydratedDocument<Freet>> {
    const freet = await FreetModel.findOne({_id: freetId});
    [freet.similarOne, freet.similarTwo] = (await findTwoMostSimilar(freetId)).toString();
    await freet.save();
    return freet.populate('authorId');
  }

  /**
   * Find a freet by sourceId
   *
   * @param {string} sourceId_ - The sourceid of the freet to find
   * @return {Promise<HydratedDocument<Freet>> | Promise<null> } - The freet with the given freetId, if any
   */
  static async findOneSourceId(sourceId_: Types.ObjectId | string): Promise<HydratedDocument<Freet>> {
    return FreetModel.findOne({sourceId: sourceId_}).populate('authorId');
  }

  /**
   * Find a freet by sourceId
   *
   * @param {string} sourceId_ - The sourceid of the freet to find
   * @return {Promise<HydratedDocument<Freet>> | Promise<null> } - The freet with the given freetId, if any
   */
  static async findOneExpandId(expandId_: Types.ObjectId | string): Promise<HydratedDocument<Freet>> {
    return FreetModel.findOne({expandId: expandId_}).populate('authorId');
  }
}

export default FreetCollection;
