import {Request} from '@hapi/hapi';
import {Errors} from '../view-models/view-model';
import {ReturnState} from '../return-state';
import Controller from './controller';

/**
 * Checks the non-existent inputs on the intro page for non-existent errors.
 * This doesn't even look at the incoming request and always returns undefined.
 *
 * @param {Request} _request An unused `Request` object.
 * @returns {Errors | undefined} Always returns `undefined`.
 */
const introErrorChecker = (_request: Request): Errors | undefined => {
  return undefined;
};

/**
 * Decides what should happen when the intro page is posted. Since we've got no
 * inputs and only one possible direction, this doesn't even look at the
 * incoming request and always returns `Primary`.
 *
 * @param {Request} _request An unused `Request` object.
 * @returns {Promise<ReturnState>} Always resolves to `Primary`.
 */
const introHandler = async (_request: Request): Promise<ReturnState> => {
  return ReturnState.Primary;
};

/**
 * The 'fairly basic' controller for our intro page.
 */
const IntroController: Controller = {
  checkErrors: introErrorChecker,
  handle: introHandler,
};

export default IntroController;
