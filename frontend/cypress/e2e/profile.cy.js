describe('My Profile', () => {
  beforeEach(() => {
    // clear any previous logged in user before each test
    cy.clearLocalStorage()
  })

  it('saves profile changes and keeps them after reload', () => {
    let currentProfile = {
      email: 'testuser@email.com',
      name: '',
      aboutMe: ''
    }

    // mock profile fetch
    // first load returns current profile values
    // after save and reload, it should return updated values
    cy.intercept('GET', '**/api/user/me', (req) => {
      req.reply({
        statusCode: 200,
        body: currentProfile
      })
    }).as('getProfile')

    // mock past classes request with no past classes
    cy.intercept('GET', '**/api/danceclasses/bookings/me/past', {
      statusCode: 200,
      body: []
    }).as('getPastClasses')

    // mock save profile request
    // update stored profile values so next profile fetch returns saved data
    cy.intercept('PATCH', '**/api/user/me', (req) => {
      currentProfile = {
        ...currentProfile,
        name: req.body.name,
        aboutMe: req.body.aboutMe
      }

      req.reply({
        statusCode: 200,
        body: currentProfile
      })
    }).as('saveProfile')

    // visit profile page with logged in user already in local storage
    cy.visit('/profile', {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          'user',
          JSON.stringify({
            email: 'testuser@email.com',
            token: 'fake-jwt-token',
            _id: '123abc'
          })
        )
      }
    })

    // wait for initial profile requests to complete
    cy.wait('@getProfile')
    cy.wait('@getPastClasses')

    // check profile page is shown
    cy.contains('h1', 'My Profile').should('be.visible')
    cy.contains('h2', 'Personal Details').should('be.visible')

    // check form starts with empty editable fields
    cy.get('input[type="email"]').should('have.value', 'testuser@email.com')
    cy.get('input[type="text"]').should('have.value', '')
    cy.get('textarea').should('have.value', '')

    // fill in name and about me fields
    cy.get('input[type="text"]').type('Liam')
    cy.get('textarea').type('I enjoy dance classes and trying different styles.')

    // check save button becomes enabled after changes are made
    cy.contains('button', 'Save Changes').should('not.be.disabled')

    // save profile changes
    cy.contains('button', 'Save Changes').click()

    // wait for save request to complete
    cy.wait('@saveProfile')

    // check success toast appears
    cy.get('.toast')
      .should('be.visible')
      .and('contain', 'Your changes have been saved')

    // check updated values remain in the form after saving
    cy.get('input[type="text"]').should('have.value', 'Liam')
    cy.get('textarea').should('have.value', 'I enjoy dance classes and trying different styles.')

    // check save button becomes disabled again because there are no unsaved changes
    cy.contains('button', 'Save Changes').should('be.disabled')

    // reload page to confirm changes persist
    cy.reload()

    // wait for profile requests again after reload
    cy.wait('@getProfile')
    cy.wait('@getPastClasses')

    // check saved values are still present after reload
    cy.get('input[type="text"]').should('have.value', 'Liam')
    cy.get('textarea').should('have.value', 'I enjoy dance classes and trying different styles.')
  })

  it('shows an error when saving profile changes fails', () => {
    const currentProfile = {
      email: 'testuser@email.com',
      name: '',
      aboutMe: ''
    }

    // mock profile fetch with empty existing values
    cy.intercept('GET', '**/api/user/me', {
      statusCode: 200,
      body: currentProfile
    }).as('getProfile')

    // mock past classes request with no past classes
    cy.intercept('GET', '**/api/danceclasses/bookings/me/past', {
      statusCode: 200,
      body: []
    }).as('getPastClasses')

    // mock failed save profile request
    cy.intercept('PATCH', '**/api/user/me', {
      statusCode: 400,
      body: {
        error: 'Could not update profile'
      }
    }).as('saveProfile')

    // visit profile page with logged in user already in local storage
    cy.visit('/profile', {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          'user',
          JSON.stringify({
            email: 'testuser@email.com',
            token: 'fake-jwt-token',
            _id: '123abc'
          })
        )
      }
    })

    // wait for initial profile requests to complete
    cy.wait('@getProfile')
    cy.wait('@getPastClasses')

    // enter new profile values
    cy.get('input[type="text"]').type('Liam')
    cy.get('textarea').type('I enjoy dance classes and trying different styles.')

    // save profile changes
    cy.contains('button', 'Save Changes').click()

    // wait for failed save request
    cy.wait('@saveProfile')

    // check error message is shown
    cy.get('.error')
      .should('be.visible')
      .and('contain', 'Could not update profile')

    // check error toast appears
    cy.get('.toast')
      .should('be.visible')
      .and('contain', 'Could not save changes')

    // check entered values remain in the form
    cy.get('input[type="text"]').should('have.value', 'Liam')
    cy.get('textarea').should('have.value', 'I enjoy dance classes and trying different styles.')

    // check save button is still enabled because changes are still unsaved
    cy.contains('button', 'Save Changes').should('not.be.disabled')
  })

  it('keeps save button disabled when no changes are made', () => {
    const currentProfile = {
      email: 'testuser@email.com',
      name: 'Liam',
      aboutMe: 'I enjoy dance classes.'
    }

    // mock profile fetch with existing saved values
    cy.intercept('GET', '**/api/user/me', {
      statusCode: 200,
      body: currentProfile
    }).as('getProfile')

    // mock past classes request with no past classes
    cy.intercept('GET', '**/api/danceclasses/bookings/me/past', {
      statusCode: 200,
      body: []
    }).as('getPastClasses')

    // visit profile page with logged in user already in local storage
    cy.visit('/profile', {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          'user',
          JSON.stringify({
            email: 'testuser@email.com',
            token: 'fake-jwt-token',
            _id: '123abc'
          })
        )
      }
    })

    // wait for initial profile requests to complete
    cy.wait('@getProfile')
    cy.wait('@getPastClasses')

    // check existing values are loaded into form
    cy.get('input[type="text"]').should('have.value', 'Liam')
    cy.get('textarea').should('have.value', 'I enjoy dance classes.')

    // check save button is disabled because nothing has changed
    cy.contains('button', 'Save Changes').should('be.disabled')
  })

  it('redirects logged out user away from profile page', () => {
    // visit protected profile page without logged in user
    cy.visit('/profile')

    // check user is redirected to login page
    cy.location('pathname').should('eq', '/login')

    // check login page is shown
    cy.contains('h3', 'Log In').should('be.visible')
  })
})