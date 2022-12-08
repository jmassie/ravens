import {AxiosStatic} from 'axios';

/**
 * Our injectable configuration object. This is cleaner than doing a run-time
 * global lookup for test vs prod options.
 */
interface ApplicationConfig {
  /**
   * A path to host the app under.
   */
  pathPrefix: string;

  /**
   * An instance of Axios or an AxiosMockAdapter for testing purposes.
   */
  axios: AxiosStatic;

  /**
   * The API for posting our completed applications to.
   */
  apiEndpoint: string;

  /**
   * Where should we start building URLs from if we have to send them to a user
   * in an email, etc.
   */
  hostPrefix: string;
}

export default ApplicationConfig;
