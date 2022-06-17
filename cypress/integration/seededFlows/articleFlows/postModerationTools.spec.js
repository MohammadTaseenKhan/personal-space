describe('Moderation Tools for Posts', () => {
  // Helper function for pipe command
  const click = ($el) => $el.click();

  beforeEach(() => {
    cy.testSetup();
  });

  it('should not load moderation tools for a post when the logged on user is not a trusted user', () => {
    cy.fixture('users/articleEditorV1User.json').as('user');

    cy.get('@user').then((user) => {
      cy.loginAndVisit(user, '/admin_mcadmin/test-article-slug').then(() => {
        cy.findByRole('button', { name: 'Moderation' }).should('not.exist');
      });
    });
  });

  it('should not load moderation tools for a post when not logged in', () => {
    cy.fixture('users/articleEditorV1User.json').as('user');

    cy.visit('/admin_mcadmin/test-article-slug').then(() => {
      cy.findByRole('button', { name: 'Moderation' }).should('not.exist');
    });
  });

  context('as admin user', () => {
    beforeEach(() => {
      cy.fixture('users/adminUser.json').as('adminUser');
    });

    it('should not alter tags from a post if a reason is not specified', () => {
      cy.get('@adminUser').then((user) => {
        cy.loginAndVisit(user, '/admin_mcadmin/tag-test-article').then(() => {
          cy.findByRole('button', { name: 'Moderation' }).click();

          cy.getIframeBody('[title="Moderation panel actions"]').within(() => {
            // We use `pipe` here to retry the click, as the animation of the mod tools opening can sometimes cause the button to not be ready yet
            cy.findByRole('button', { name: 'Open adjust tags section' })
              .as('adjustTagsButton')
              .pipe(click)
              .should('have.attr', 'aria-expanded', 'true');

            cy.findByRole('button', { name: '#tag1 Remove tag' }).click();
            cy.findByRole('button', { name: 'Submit' }).click();
          });

          cy.findByTestId('snackbar').should('not.exist');
        });
      });
    });

    it('should show Feature Post button on an unfeatured post', () => {
      cy.get('@adminUser').then((user) => {
        cy.loginAndVisit(user, '/admin_mcadmin/unfeatured-article-slug').then(
          () => {
            cy.findByRole('button', { name: 'Moderation' }).click();

            cy.getIframeBody('[title="Moderation panel actions"]').within(
              () => {
                cy.findByRole('button', { name: 'Feature Post' }).should(
                  'exist',
                );
              },
            );
          },
        );
      });
    });

    it('should show Unfeature Post button on a featured post', () => {
      cy.get('@adminUser').then((user) => {
        cy.loginAndVisit(user, '/admin_mcadmin/test-article-slug').then(() => {
          cy.findByRole('button', { name: 'Moderation' }).click();

          cy.getIframeBody('[title="Moderation panel actions"]').within(() => {
            cy.findByRole('button', { name: 'Unfeature Post' }).should('exist');
          });
        });
      });
    });

    it('should show Unpublish Post button on a published post', () => {
      cy.get('@adminUser').then((user) => {
        cy.loginAndVisit(user, '/admin_mcadmin/test-article-slug').then(() => {
          cy.findByRole('button', { name: 'Moderation' }).click();

          cy.getIframeBody('[title="Moderation panel actions"]').within(() => {
            cy.findByRole('button', { name: 'Unpublish Post' }).should('exist');
          });
        });
      });
    });
  });

  context('as moderator user', () => {
    beforeEach(() => {
      cy.fixture('users/moderatorUser.json').as('moderatorUser');
    });

    it('should load moderation tools on a post', () => {
      cy.get('@moderatorUser').then((user) => {
        cy.loginAndVisit(user, '/admin_mcadmin/test-article-slug').then(() => {
          cy.findByRole('button', { name: 'Moderation' }).should('exist');
        });
      });
    });

    it('should not show Feature Post button on a post', () => {
      cy.get('@moderatorUser').then((user) => {
        cy.loginAndVisit(user, '/admin_mcadmin/unfeatured-article-slug').then(
          () => {
            cy.findByRole('button', { name: 'Moderation' }).click();

            cy.getIframeBody('[title="Moderation panel actions"]').within(
              () => {
                cy.findByRole('button', { name: 'Feature Post' }).should(
                  'not.exist',
                );
              },
            );
          },
        );
      });
    });

    it('should show Unpublish Post button on a published post', () => {
      cy.get('@moderatorUser').then((user) => {
        cy.loginAndVisit(user, '/admin_mcadmin/test-article-slug').then(() => {
          cy.findByRole('button', { name: 'Moderation' }).click();

          cy.getIframeBody('[title="Moderation panel actions"]').within(() => {
            cy.findByRole('button', { name: 'Unpublish Post' }).should('exist');
          });
        });
      });
    });

    it('should show Adjust tags button on a published post', () => {
      cy.get('@moderatorUser').then((user) => {
        cy.loginAndVisit(user, '/admin_mcadmin/test-article-slug').then(() => {
          cy.findByRole('button', { name: 'Moderation' }).click();

          cy.getIframeBody('[title="Moderation panel actions"]').within(() => {
            // We use `pipe` here to retry the click, as the animation of the mod tools opening can sometimes cause the button to not be ready yet
            cy.findByRole('button', { name: 'Open adjust tags section' })
              .as('adjustTagsButton')
              .pipe(click)
              .should('have.attr', 'aria-expanded', 'true');
          });
        });
      });
    });

    it('should show Suspend User button for an unsuspended user', () => {
      cy.get('@moderatorUser').then((user) => {
        cy.loginAndVisit(user, '/series_user/series-test-article-slug').then(
          () => {
            cy.findByRole('button', { name: 'Moderation' }).click();

            cy.getIframeBody('[title="Moderation panel actions"]').within(
              () => {
                cy.findByRole('button', { name: 'Open admin actions' })
                  .as('moderatingActionsButton')
                  .pipe(click)
                  .should('have.attr', 'aria-expanded', 'true');

                cy.findByRole('button', {
                  name: 'Suspend series_user',
                }).should('exist');
              },
            );
          },
        );
      });
    });

    it('should not suspend the user when no suspension reason given', () => {
      cy.get('@moderatorUser').then((user) => {
        cy.loginAndVisit(user, '/series_user/series-test-article-slug').then(
          () => {
            cy.findByRole('button', { name: 'Moderation' }).click();

            cy.getIframeBody('[title="Moderation panel actions"]').within(
              () => {
                cy.findByRole('button', { name: 'Open admin actions' })
                  .as('moderatingActionsButton')
                  .pipe(click)
                  .should('have.attr', 'aria-expanded', 'true');

                cy.findByRole('button', {
                  name: 'Suspend series_user',
                }).click();
              },
            );
            cy.findByRole('dialog').within(() => {
              cy.findByRole('button', { name: 'Submit & Suspend' }).click();

              cy.get('#suspension-reason-error')
                .contains('You must give a suspension reason.')
                .should('exist');
            });
          },
        );
      });
    });

    it('should suspend the user when suspension reason given', () => {
      cy.get('@moderatorUser').then((user) => {
        cy.loginAndVisit(user, '/series_user/series-test-article-slug').then(
          () => {
            cy.findByRole('button', { name: 'Moderation' }).click();

            cy.getIframeBody('[title="Moderation panel actions"]').within(
              () => {
                cy.findByRole('button', { name: 'Open admin actions' })
                  .as('moderatingActionsButton')
                  .pipe(click)
                  .should('have.attr', 'aria-expanded', 'true');

                cy.findByRole('button', {
                  name: 'Suspend series_user',
                }).click();
              },
            );
            cy.findByRole('dialog').within(() => {
              cy.findByRole('textbox', { name: 'Note:' }).type(
                'My suspension reason',
              );

              cy.findByRole('button', { name: 'Submit & Suspend' }).click();
            });

            cy.findByTestId('snackbar')
              .contains('Success: "series_user" has been suspended.')
              .should('exist');
          },
        );
      });
    });
  });

  context('as trusted user', () => {
    beforeEach(() => {
      cy.fixture('users/trustedUser.json').as('trustedUser');
    });

    it('should load moderation tools on a post', () => {
      cy.get('@trustedUser').then((user) => {
        cy.loginAndVisit(user, '/admin_mcadmin/test-article-slug').then(() => {
          cy.findByRole('button', { name: 'Moderation' }).should('exist');
        });
      });
    });

    it('should not show Feature Post button on a post', () => {
      cy.get('@trustedUser').then((user) => {
        cy.loginAndVisit(user, '/admin_mcadmin/unfeatured-article-slug').then(
          () => {
            cy.findByRole('button', { name: 'Moderation' }).click();

            cy.getIframeBody('[title="Moderation panel actions"]').within(
              () => {
                cy.findByRole('button', { name: 'Feature Post' }).should(
                  'not.exist',
                );
              },
            );
          },
        );
      });
    });
  });
});
