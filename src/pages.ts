import {ServerRoute} from '@hapi/hapi';
import ApplicationConfig from './application-config';

import introPage from './pages/01-intro';

const pages = (config: ApplicationConfig): ServerRoute[] => {
  return [
    {
      path: `${config.pathPrefix}/`,
      method: ['get', 'post'],
      handler: (_request, h) => {
        return h.redirect(`${config.pathPrefix}/intro`);
      },
    },
    ...[introPage].map((page) => {
      return page(config);
    }),
  ];
};

export default pages;
