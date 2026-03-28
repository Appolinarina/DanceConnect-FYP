describe('Signup Page', () => {
  beforeEach(() => {
    // clear any previous logged in user before each test
    cy.clearLocalStorage()
  })

  it('loads the signup page correctly', () => {
    // visit signup page
    cy.visit('/signup')

    // check signup form elements are shown
    cy.contains('h3', 'Sign Up').should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.contains('button', 'Sign Up').should('be.visible')
  })

  it('signs the user up successfully', () => {
    // mock signup request so no real user is created in database
    cy.intercept('POST', '**/api/user/signup', {
      statusCode: 200,
      body: {
        email: 'testuser@email.com',
        token: 'fake-jwt-token',
        _id: '123abc'
      }
    }).as('signupRequest')

    // mock follow-up authenticated requests after signup
    // this prevents fake token from causing 401 and logging user out
    cy.intercept('GET', '**/api/danceclasses/bookings/me/upcoming', {
      statusCode: 200,
      body: []
    }).as('upcomingBookings')

    cy.intercept('GET', '**/api/danceclasses/browse*', {
      statusCode: 200,
      body: []
    }).as('browseClasses')

    // visit signup page
    cy.visit('/signup')

    // fill in signup form
    cy.get('input[type="email"]').type('testuser@email.com')
    cy.get('input[type="password"]').type('Password123!')
    cy.contains('button', 'Sign Up').click()

    // wait for mocked requests to complete
    cy.wait('@signupRequest')
    cy.wait('@upcomingBookings')

    // check success toast appears
    cy.get('.toast')
      .should('be.visible')
      .and('contain', 'You have successfully signed up and logged in')

    // check user is redirected to home page
    cy.location('pathname').should('eq', '/')

    // check navbar now shows logged in state
    cy.contains('button', 'Logout').should('be.visible')
    cy.contains('testuser@email.com').should('be.visible')
    cy.contains('Login').should('not.exist')
    cy.contains('Signup').should('not.exist')
  })

  it('shows an error message when signup fails', () => {
    // mock failed signup request
    cy.intercept('POST', '**/api/user/signup', {
      statusCode: 400,
      body: {
        error: 'Email already in use'
      }
    }).as('signupRequest')

    // visit signup page
    cy.visit('/signup')

    // fill in signup form with details
    cy.get('input[type="email"]').type('testuser@email.com')
    cy.get('input[type="password"]').type('Password123!')
    cy.contains('button', 'Sign Up').click()

    // wait for mocked request to complete
    cy.wait('@signupRequest')

    // check error message is shown
    cy.get('.error')
      .should('be.visible')
      .and('contain', 'Email already in use')

    // check user stays on signup page
    cy.location('pathname').should('eq', '/signup')

    // check navbar still shows logged out state
    cy.contains('Login').should('be.visible')
    cy.contains('Signup').should('be.visible')
    cy.contains('button', 'Logout').should('not.exist')
  })
})