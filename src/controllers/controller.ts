import {Request} from '@hapi/hapi';
import ApplicationConfig from '../application-config';
import {Errors} from '../view-models/view-model';
import {ReturnState} from '../return-state';

/**
 * Controllers for pages validate incoming forms and decide which path to take
 * the visitor on next based on their answers.
 */
interface Controller {
  /**
   *
   * @param request
   */
  checkErrors(request: Request): Errors | undefined;

  /**
   * Handle the incoming form.
   *
   * @param {Request} request The incoming form request.
   * @returns {Promise<ReturnState>} Resolves to a decision for onward movement in
   * the app, reloading the current page if there's an error or continuing to
   * another page based on the visitor's answer.
   */
  handle(request: Request, config?: ApplicationConfig): Promise<ReturnState>;
}

export default Controller;
