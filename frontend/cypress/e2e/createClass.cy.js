describe('Create Class Page', () => {
  beforeEach(() => {
    // clear any previous logged in user before each test
    cy.clearLocalStorage()
  })

  it('loads my classes page correctly for a logged in user', () => {
    // mock initial fetch for user created classes
    cy.intercept('GET', '**/api/danceclasses', {
      statusCode: 200,
      body: []
    }).as('getDanceClasses')

    // mock follow-up requests so fake token does not cause 401 logout
    cy.intercept('GET', '**/api/danceclasses/bookings/me/upcoming', {
      statusCode: 200,
      body: []
    }).as('upcomingBookings')

    cy.intercept('GET', '**/api/danceclasses/browse*', {
      statusCode: 200,
      body: []
    }).as('browseClasses')

    // visit protected my classes page with user already in local storage
    cy.visit('/my-classes', {
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

    // wait for mocked classes request to complete
    cy.wait('@getDanceClasses')

    // check page heading and create form are shown
    cy.contains('h2', 'My Classes').should('be.visible')
    cy.contains('h3', 'Create New Dance Class').should('be.visible')

    // check empty state is shown when user has no created classes
    cy.contains('You have not created any classes yet. Use the form on the right to add your first class.')
      .should('be.visible')

    // check key form fields are shown
    cy.get('input[type="text"]').should('have.length.at.least', 3)
    cy.get('select').should('be.visible')
    cy.get('input[type="datetime-local"]').should('be.visible')
    cy.get('input[type="number"]').should('have.length.at.least', 2)
    cy.contains('button', 'Create Class').should('exist')
  })

  it('creates a new class successfully', () => {
    const newClass = {
      _id: 'class123',
      title: 'Hip Hop Beginners',
      dance_style: 'Hip Hop',
      dance_level: 'Beginner',
      location: 'Dublin',
      date: '2026-04-15T18:30',
      capacity: 20,
      spotsRemaining: 20,
      price: 10,
      user_id: '123abc',
      createdAt: '2026-03-28T12:00:00.000Z'
    }

    // mock initial fetch for user created classes
    cy.intercept('GET', '**/api/danceclasses', {
      statusCode: 200,
      body: []
    }).as('getDanceClasses')

    // mock follow-up requests so fake token does not cause 401 logout
    cy.intercept('GET', '**/api/danceclasses/bookings/me/upcoming', {
      statusCode: 200,
      body: []
    }).as('upcomingBookings')

    cy.intercept('GET', '**/api/danceclasses/browse*', {
      statusCode: 200,
      body: []
    }).as('browseClasses')

    // mock create class request so no real class is created in database
    cy.intercept('POST', '**/api/danceclasses', {
      statusCode: 200,
      body: newClass
    }).as('createDanceClass')

    // visit protected my classes page with user already in local storage
    cy.visit('/my-classes', {
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

    // wait for initial fetch to complete
    cy.wait('@getDanceClasses')

    // fill in create class form
    cy.get('input[type="text"]').eq(0).type('Hip Hop Beginners')
    cy.get('input[type="text"]').eq(1).type('Hip Hop')
    cy.get('select').select('Beginner')
    cy.get('input[type="text"]').eq(2).type('Dublin')
    cy.get('input[type="datetime-local"]').type('2026-04-15T18:30')
    cy.get('input[type="number"]').eq(0).type('20')
    cy.get('input[type="number"]').eq(1).type('10')

    cy.contains('button', 'Create Class').click()

    // wait for mocked create request to complete
    cy.wait('@createDanceClass')

    // check success toast appears
    cy.get('.toast')
      .should('be.visible')
      .and('contain', 'Your class has been successfully created')

    // check newly created class appears in the UI
    cy.contains('Hip Hop Beginners').should('be.visible')
    cy.contains('Hip Hop').should('be.visible')
    cy.contains('Beginner').should('be.visible')
    cy.contains('Dublin').should('be.visible')
    cy.contains('Edit Class').should('be.visible')
    cy.contains('Delete Class').should('be.visible')
  })

  it('shows validation error when required fields are missing', () => {
    // mock initial fetch for user created classes
    cy.intercept('GET', '**/api/danceclasses', {
      statusCode: 200,
      body: []
    }).as('getDanceClasses')

    // mock follow-up requests so fake token does not cause 401 logout
    cy.intercept('GET', '**/api/danceclasses/bookings/me/upcoming', {
      statusCode: 200,
      body: []
    }).as('upcomingBookings')

    cy.intercept('GET', '**/api/danceclasses/browse*', {
      statusCode: 200,
      body: []
    }).as('browseClasses')

    // mock failed create class request with backend validation response
    cy.intercept('POST', '**/api/danceclasses', {
      statusCode: 400,
      body: {
        error: 'Please fill in all required fields',
        emptyFields: [
          'title',
          'dance_style',
          'dance_level',
          'location',
          'date',
          'capacity',
          'price'
        ]
      }
    }).as('createDanceClass')

    // visit protected my classes page with user already in local storage
    cy.visit('/my-classes', {
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

    // wait for initial fetch to complete
    cy.wait('@getDanceClasses')

    // submit form without filling in any fields
    cy.contains('button', 'Create Class').scrollIntoView().click()

    // wait for mocked create request to complete
    cy.wait('@createDanceClass')

    // check validation error message is shown
    cy.get('.error')
      .should('be.visible')
      .and('contain', 'Please fill in all required fields')

    // check empty fields get error class applied
    cy.get('input[type="text"]').eq(0).should('have.class', 'error')
    cy.get('input[type="text"]').eq(1).should('have.class', 'error')
    cy.get('select').should('have.class', 'error')
    cy.get('input[type="text"]').eq(2).should('have.class', 'error')
    cy.get('input[type="datetime-local"]').should('have.class', 'error')
    cy.get('input[type="number"]').eq(0).should('have.class', 'error')
    cy.get('input[type="number"]').eq(1).should('have.class', 'error')
  })
})