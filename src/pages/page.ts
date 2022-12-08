import {ServerRoute, Lifecycle, Util, Request, RouteOptions, ResponseToolkit} from '@hapi/hapi';
import {ReturnState} from '../return-state';
import ApplicationModel from '../application-model';
import ApplicationConfig from '../application-config';
import {ViewModel} from '../view-models/view-model';
import Controller from '../controllers/controller';

/**
 * Configuration of a M-VM-V-C pattern page.
 */
interface PageParameters {
  /**
   * Where to serve this page from.
   */
  path: string;

  /**
   * Which `View` file to use to render this page.
   */
  view: string;

  /**
   * Which `ViewModel` to use to extract the values required to render this
   * page.
   */
  viewModel: any;

  /**
   * Which `Controller to use to handle the `get` and `post` events sent to this
   * page, including checking for errors and making decisions.
   */
  Controller: Controller;

  /**
   * Any extra hapi `RouteOptions`. This will mostly be unused.
   */
  options?: RouteOptions;

  /**
   * What page must a visitor have previously visited to allow access to this
   * one. When multiple values are supplied in the array we check if they've
   * visited any one of them **not** that they've visited all of them.
   */
  guardAllowPrevious: string[] | undefined;

  /**
   * Where can this page lead the visitor next?
   */
  nextPaths: {
    /**
     * The main forward direction. Used by pages that only have one direction to
     * go to, or when the visitor picks the main route through the app when
     * given a choice of paths.
     */
    primary: string | undefined;

    /**
     * An optional second path for when the visitor picks an alternative route
     * through the app.
     */
    secondary?: string;

    /**
     * An optional third path for when the visitor picks an alternative route
     * through the app.
     */
    tertiary?: string;

    /**
     * An optional fourth path for when the visitor picks an alternative route
     * through the app.
     */
    quaternary?: string;
    /**
     * An optional fifth path for when the visitor picks an alternative route
     * through the app.
     */
    quinary?: string;
  };

  /**
   * Our injectable configuration object. This is cleaner than doing a run-time
   * global lookup for test vs prod options.
   */
  config?: ApplicationConfig;
}

/**
 * Determine whether a visitor is allowed to view a page.
 *
 * @param {string[]} previousPages A list of pages the visitor has previously
 * accessed.
 * @param {string[] | undefined} guardAllowPrevious A list of pages of which the
 * visitor must have accessed at least one before viewing this page.
 * @returns {boolean} `true` if the visitor is allowed to view this page,
 * `false` otherwise.
 */
const guardAllows = (previousPages: string[], guardAllowPrevious: string[] | undefined): boolean => {
  // `undefined` is the flag value for pages that can be visited at any time,
  // therefore just return `true`. Let it work for an empty array too.
  if (guardAllowPrevious === undefined || guardAllowPrevious.length === 0) {
    return true;
  }

  // If we've got no previous pages, then we're still blocked.
  if (previousPages === undefined || previousPages.length === 0) {
    return false;
  }

  // Check to see if any of our allowed previous pages occurs in the stored
  // previous pages list. If there is one, then we're allowed through!
  for (const allowedPrevious of guardAllowPrevious) {
    if (previousPages.includes(allowedPrevious)) {
      return true;
    }
  }

  // The default, fall-through, behaviour is to be blocked.
  return false;
};

/**
 * A `Page` represents one cycle around our Model -> ViewModel -> View ->
 * Controller pattern. It mounts a get and a post responder at a path under a
 * Hapi server and handles the logic required within a page and between pages.
 */
class Page implements ServerRoute {
  /**
   * Build a M-VM-V-C pattern page.
   *
   * @param {PageParameters} parameters The configuration of this page.
   */
  constructor(parameters: PageParameters) {
    this.path = `${parameters.config?.pathPrefix ?? ''}${parameters.path}`;
    this.method = ['get', 'post'];
    this.handler = async (request: Request, h: ResponseToolkit) => {
      // Grab the list of of previous pages from the visitor's session.
      const previousPages = (request.yar.get('previousPages') ?? []) as string[];
      const previousPage = previousPages[previousPages.length - 1];

      // Get the model from the visitor's session.
      const model = (request.yar.get('applicationModel') ?? {}) as ApplicationModel;

      // If we're not allowed to visit this page, give the visitor a 403 error.
      if (!guardAllows(previousPages, parameters.guardAllowPrevious)) {
        return h.view('error-403').code(403);
      }

      // If we're allowed, and we're just getting the page, build a view-model
      // and render the view.
      if (request.method === 'get') {
        const query = request.query as any;

        // We only have a 'new previous page' if we're going backwards through
        // the app. An `undefined` value signals we've not got a 'new' one.
        let newPreviousPage: string | undefined;

        // If we're going backwards through the app, we'll need to 'adjust
        // history'.
        if (query.action === 'back') {
          const lastVisitIndex = previousPages.lastIndexOf(parameters.path);
          const newPreviousPages = [
            ...previousPages.slice(0, lastVisitIndex),
            ...previousPages.slice(lastVisitIndex + 1),
          ];
          request.yar.set('previousPages', newPreviousPages);

          // We'll be rendering the 'already previous' page, so we need to find
          // out what the 'previous previous' or 'new previous' page is for the
          // back link.
          newPreviousPage = newPreviousPages[newPreviousPages.length - 1];
        }

        // Render the requested page, using the 'new previous' page if we're
        // going backwards, or the normal 'previous' page if we're in the
        // correct direction.
        const viewModel: ViewModel = await parameters.viewModel(
          newPreviousPage ?? previousPage,
          model,
          parameters.config,
        );
        return h.view(parameters.view, viewModel);
      }

      // Check the controller handler to see how it wants us to proceed.
      const decision = await parameters.Controller.handle(request, parameters.config);

      // If the controller tells us we're broken, check for the errors, then
      // render the error-ful page.
      if (decision === ReturnState.ValidationError) {
        const errors = parameters.Controller.checkErrors(request);
        const viewModel: ViewModel = await parameters.viewModel(previousPage, model, parameters.config, errors);
        return h.view(parameters.view, viewModel);
      }

      // If we make it this far, we're OK, so save this page to the list of
      // previous pages for later.
      previousPages.push(parameters.path);
      request.yar.set('previousPages', previousPages);

      // If our controller handler told us that we were to take the quinary
      // path, redirect there.
      if (decision === ReturnState.Quinary) {
        return h.redirect(`${parameters.config?.pathPrefix ?? ''}${parameters.nextPaths.quinary ?? '/'}`);
      }

      // If our controller handler told us that we were to take the quaternary
      // path, redirect there.
      if (decision === ReturnState.Quaternary) {
        return h.redirect(`${parameters.config?.pathPrefix ?? ''}${parameters.nextPaths.quaternary ?? '/'}`);
      }

      // If our controller handler told us that we were to take the tertiary
      // path, redirect there.
      if (decision === ReturnState.Tertiary) {
        return h.redirect(`${parameters.config?.pathPrefix ?? ''}${parameters.nextPaths.tertiary ?? '/'}`);
      }

      // If our controller handler told us that we were to take the secondary
      // path, redirect there.
      if (decision === ReturnState.Secondary) {
        return h.redirect(`${parameters.config?.pathPrefix ?? ''}${parameters.nextPaths.secondary ?? '/'}`);
      }

      // If we made it this far then we've passed all the filters above, so it's
      // time to move forward!
      return h.redirect(`${parameters.config?.pathPrefix ?? ''}${parameters.nextPaths.primary ?? '/'}`);
    };

    this.options = parameters.options;
  }

  path: string;
  method: Util.HTTP_METHODS_PARTIAL | Util.HTTP_METHODS_PARTIAL[];
  handler?: Lifecycle.Method;
  options?: RouteOptions;
}

export default Page;
export {PageParameters, guardAllows};
