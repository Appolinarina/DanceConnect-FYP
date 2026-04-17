describe('Login Page', () => {
  beforeEach(() => {
    // clear any previous logged in user before each test
    cy.clearLocalStorage()
  })

  it('loads the login page correctly', () => {
    // visit login page
    cy.visit('/login')

    // check login form elements are shown
    cy.contains('h3', 'Log In').should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.contains('button', 'Log In').should('be.visible')
  })

  it('logs the user in successfully', () => {
    // mock login request so no real backend login is needed
    cy.intercept('POST', '**/api/user/login', {
      statusCode: 200,
      body: {
        email: 'testuser@email.com',
        token: 'fake-jwt-token',
        _id: '123abc'
      }
    }).as('loginRequest')

    // mock follow-up authenticated requests after login
    // this prevents fake token from causing 401 and logging user out
    cy.intercept('GET', '**/api/danceclasses/bookings/me/upcoming', {
      statusCode: 200,
      body: []
    }).as('upcomingBookings')

    cy.intercept('GET', '**/api/danceclasses/browse*', {
      statusCode: 200,
      body: []
    }).as('browseClasses')

    // visit login page
    cy.visit('/login')

    // fill in login form
    cy.get('input[type="email"]').type('testuser@email.com')
    cy.get('input[type="password"]').type('Password123!')
    cy.contains('button', 'Log In').click()

    // wait for mocked requests to complete
    cy.wait('@loginRequest')
    cy.wait('@upcomingBookings')

    // check success toast appears
    cy.get('.toast')
      .should('be.visible')
      .and('contain', 'You are now logged in')

    // check user is redirected to home page
    cy.location('pathname').should('eq', '/')

    // check navbar now shows logged in state
    cy.contains('button', 'Logout').should('be.visible')
    cy.contains('testuser@email.com').should('be.visible')
    cy.contains('Login').should('not.exist')
    cy.contains('Signup').should('not.exist')
  })

  it('shows an error message when login fails', () => {
    // mock failed login request
    cy.intercept('POST', '**/api/user/login', {
      statusCode: 400,
      body: {
        error: 'Incorrect email or password'
      }
    }).as('loginRequest')

    // visit login page
    cy.visit('/login')

    // fill in login form with incorrect details
    cy.get('input[type="email"]').type('testuser@email.com')
    cy.get('input[type="password"]').type('WrongPassword123!')
    cy.contains('button', 'Log In').click()

    // wait for mocked request to complete
    cy.wait('@loginRequest')

    // check error message is shown
    cy.get('.error')
      .should('be.visible')
      .and('contain', 'Incorrect email or password')

    // check user stays on login page
    cy.location('pathname').should('eq', '/login')

    // check navbar still shows logged out state
    cy.contains('Login').should('be.visible')
    cy.contains('Signup').should('be.visible')
    cy.contains('button', 'Logout').should('not.exist')
  })
})