describe('Logout', () => {
  beforeEach(() => {
    // clear any previous logged in user before each test
    cy.clearLocalStorage()
  })

  it('logs the user out successfully', () => {
    // mock follow-up requests on browse page so fake token does not cause unexpected logout behaviour
    cy.intercept('GET', '**/api/danceclasses/bookings/me/upcoming', {
      statusCode: 200,
      body: []
    }).as('upcomingBookings')

    cy.intercept('GET', '**/api/danceclasses/browse*', {
      statusCode: 200,
      body: []
    }).as('browseClasses')

    // visit home page with logged in user already in local storage
    cy.visit('/', {
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

    // wait for page requests to complete
    cy.wait('@upcomingBookings')
    cy.wait('@browseClasses')

    // check navbar shows logged in state before logout
    cy.contains('testuser@email.com').should('be.visible')
    cy.contains('button', 'Logout').should('be.visible')

    // click logout button
    cy.contains('button', 'Logout').click()

    // check logout toast appears
    cy.get('.toast')
      .should('be.visible')
      .and('contain', 'You are now logged out')

    // check navbar now shows logged out state
    cy.contains('Login').should('be.visible')
    cy.contains('Signup').should('be.visible')
    cy.contains('testuser@email.com').should('not.exist')
    cy.contains('button', 'Logout').should('not.exist')

    // check user was removed from local storage
    cy.window().then((win) => {
      expect(win.localStorage.getItem('user')).to.be.null
    })
  })

  it('redirects logged out user away from protected page', () => {
    // mock follow-up requests on browse page so fake token does not cause unexpected request failures
    cy.intercept('GET', '**/api/danceclasses/bookings/me/upcoming', {
      statusCode: 200,
      body: []
    }).as('upcomingBookings')

    cy.intercept('GET', '**/api/danceclasses/browse*', {
      statusCode: 200,
      body: []
    }).as('browseClasses')

    // visit home page with logged in user already in local storage
    cy.visit('/', {
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

    // wait for page requests to complete
    cy.wait('@upcomingBookings')
    cy.wait('@browseClasses')

    // click logout button
    cy.contains('button', 'Logout').click()

    // try to access protected my classes page after logout
    cy.visit('/my-classes')

    // check user is redirected to login page
    cy.location('pathname').should('eq', '/login')

    // check login page is shown
    cy.contains('h3', 'Log In').should('be.visible')
  })
})