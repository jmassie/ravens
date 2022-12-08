import test from 'ava';
import {Request} from '@hapi/hapi';
import {ReturnState} from '../return-state';

import IntroController from './01-intro';

test('intro page never has errors', (t) => {
  t.is(IntroController.checkErrors({} as Request), undefined);
});

test('intro page always moves to the primary path', async (t) => {
  t.is(await IntroController.handle({} as Request), ReturnState.Primary);
});
