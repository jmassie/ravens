// eslint-disable-next-line import/no-unassigned-import
import 'cypress-axe';

/**
 * Visit the Intro page.
 */
const visitIntro = () => {
  // Access '/', then redirect to 'intro'.
  cy.visit('/');

  cy.get('h1').contains('apply for', {matchCase: false});
  cy.get('h1').contains('licence', {matchCase: false});
};

Cypress.Commands.add('visitIntro', visitIntro);
