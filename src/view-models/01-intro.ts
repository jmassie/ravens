import ApplicationModel from '../application-model';
import ApplicationConfig from '../application-config';
import viewModelBuilder, {Errors, ViewModel} from './view-model';

/**
 * Our intro page's view-model is basically empty.
 *
 * We extend the base `ViewModel` to get the `backUrl` field and that's not even
 * really used as we can't actually go back from the first page.
 */
interface IntroViewModel extends ViewModel {}

/**
 * Build our `IntroViewModel` from the `ApplicationModel`.
 *
 * @param {string | undefined} backUrl Where should the browser take the
 * visitor when they click the '< Back' link?
 * @param {ApplicationModel} model The `ApplicationModel` used to build this
 * `ViewModel`. We're not actually interested in any fields for this page.
 * @param {ApplicationConfig} config Our application's configuration.
 * @param {Errors | undefined} error Represents whether the controller found
 * any errors in a submission and is requesting a redisplay with appropriate
 * error messages.
 * @returns {Promise<IntroViewModel>} Our built IntroViewModel.
 */
const introViewModelBuilder = async (
  backUrl: string | undefined,
  model: ApplicationModel,
  config: ApplicationConfig,
  error?: Errors,
): Promise<IntroViewModel> => {
  // Build the generic base ViewModel.
  const introViewModel = (await viewModelBuilder(undefined, model, config, error)) as IntroViewModel;

  // Return our cast IntroViewModel.
  return introViewModel;
};

export default introViewModelBuilder;
