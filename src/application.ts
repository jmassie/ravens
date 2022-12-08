// Required to stand up the server.
import * as Hapi from '@hapi/hapi';

// Session storage
import * as Yar from '@hapi/yar';

// Import our template engine.
import * as Vision from '@hapi/vision';
import * as Nunjucks from 'nunjucks';

// Allow static file serving.
import * as Inert from '@hapi/inert';

import ApplicationConfig from './application-config';

// Import the micro-app's pages.
import pages from './pages';

// Start up our micro-app.
const application = async (config: ApplicationConfig) => {
  const server = Hapi.server({
    port: 3005,
    host: '0.0.0.0',
    routes: {
      files: {
        relativeTo: '.',
      },
    },
  });

  // Do session cookies.
  await server.register({
    plugin: Yar,
    options: {
      storeBlank: false,
      name: 'ravens',
      cookieOptions: {
        password: 'override_this_value_with_a_32_character_or_longer_secret',
        isSecure: false,
        path: '/ravens/',
        isSameSite: 'Strict',
      },
    },
  });

  // Disabled arrow-body-style error as the function appears to be correctly formed so not really an error.
  /* eslint-disable arrow-body-style */
  const viewsConfig: Vision.ServerViewsConfiguration = {
    engines: {
      njk: {
        compile: (template: string, options: {environment: Nunjucks.Environment | undefined}) => {
          const njk = Nunjucks.compile(template, options.environment);
          return (context: any) => njk.render(context);
        },
        prepare: (config: {path: string; compileOptions: {environment: Nunjucks.Environment | undefined}}, next) => {
          // eslint-disable-next-line unicorn/prevent-abbreviations
          const njkEnv = Nunjucks.configure(config.path, {watch: false});
          config.compileOptions.environment = njkEnv;
          next();
        },
      },
    },
    path: ['views', 'node_modules/govuk-frontend', 'node_modules/naturescot-frontend'],
  };
  await server.register(Vision);
  server.views(viewsConfig);

  /* eslint-enable arrow-body-style */

  // Tell hapi that it can serve static files.
  await server.register(Inert);

  // `health` is a simple health-check end-point to test whether the service is
  // up.
  server.route({
    method: 'GET',
    path: `${config.pathPrefix}/health`,
    handler: () => {
      return {message: 'OK'};
    },
    options: {
      auth: false,
    },
  });

  server.route(pages(config));

  server.route([
    {
      method: 'GET',
      path: '/assets/{filename}',
      handler: {
        directory: {
          path: 'assets',
        },
      },
    },
    {
      method: 'GET',
      path: `/govuk-frontend/assets/{filename*}`,
      handler: {
        directory: {
          path: 'node_modules/govuk-frontend/govuk/assets',
        },
      },
    },
    {
      method: 'GET',
      path: `/naturescot-frontend/assets/{filename*}`,
      handler: {
        directory: {
          path: 'node_modules/naturescot-frontend/naturescot/assets',
        },
      },
    },
  ]);

  // Start the now fully configured HTTP server.
  await server.start();
  console.log(`Server listening on http://localhost:3020/ravens/`);
};

export default application;
