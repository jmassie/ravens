import IntroViewModel from '../view-models/01-intro';
import IntroController from '../controllers/01-intro';
import ApplicationConfig from '../application-config';
import Page from './page';

/**
 * Build our app's intro page.
 *
 * @param {ApplicationConfig} config Our application's configuration.
 * @returns {Page} Our app's intro page.
 */
const introPage = (config: ApplicationConfig): Page => {
  return new Page({
    // The intro page is an entry page, so we don't have any required previous
    // pages.
    guardAllowPrevious: undefined,

    // Serving on 'intro'.
    path: '/intro',

    // We only have one way forward.
    nextPaths: {
      // That ways is to 'whatever-comes-next'.
      primary: '/whatever-comes-next',
    },

    // The view is pretty much the only important part of this page.
    view: '01-intro',

    // Our intro page's view-model is basically empty.
    viewModel: IntroViewModel,

    // Our intro page's controller just says 'go forward'.
    Controller: IntroController,

    // Our application's configuration.
    config,
  });
};

export default introPage;
