import ApplicationModel from '../application-model';
import ApplicationConfig from '../application-config';

type Errors = Record<string, boolean>;

/**
 * A `ViewModel` is the representation of application state, filtered and mapped
 * for the purpose of rendering a `View`.
 *
 * It is built by passing our `ApplicationModel` as well as some other
 * parameters and extracting and converting the values we need for the rendered
 * `View`.
 */
interface ViewModel {
  /**
   * Where should the browser take the visitor when they click the '< Back'
   * link? If `undefined` we treat this as 'no back link' and the template hides
   * the link from the visitor.
   */
  backUrl: string | undefined;

  /**
   * An object containing boolean flags to represent multiple errors that may
   * occur during a controller's error checking. If `undefined` we treat this as
   * if no errors have been found so we don't need to display the large error
   * summary at the top of the page, or the smaller in-line error messages.
   */
  error: Errors | undefined;
}

/**
 * Build a `ViewModel` from the `ApplicationModel`.
 *
 * @param {string | undefined} backUrl Where should the browser take the
 * visitor when they click the '< Back' link? If `undefined`, hide the link
 * from the visitor.
 * @param {ApplicationModel} _model The `ApplicationModel` used to build the
 * concrete `ViewModel`, unused in this abstract version of the class.
 * @param {ApplicationConfig} _config Our application's configuration.
 * @param {Errors | undefined} error An object containing boolean flags to
 * represent multiple errors that may occur during a controller's error
 * checking.
 * @returns {Promise<ViewModel>} Our built `ViewModel`.
 */
const buildViewModel = async (
  backUrl: string | undefined,
  _model: ApplicationModel,
  _config: ApplicationConfig,
  error?: Errors,
): Promise<ViewModel> => {
  const viewModel: ViewModel = {
    backUrl,
    error,
  };

  return viewModel;
};

export default buildViewModel;
export {Errors, ViewModel};
