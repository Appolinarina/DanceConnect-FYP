describe('Delete Class', () => {
  beforeEach(() => {
    // clear any previous logged in user before each test
    cy.clearLocalStorage()
  })

  it('deletes a class successfully', () => {
    const myClasses = [
      {
        _id: 'class1',
        title: 'Hip Hop Beginners',
        dance_style: 'Hip Hop',
        dance_level: 'Beginner',
        location: 'Dublin',
        date: '2026-04-15T18:30:00.000Z',
        capacity: 20,
        spotsRemaining: 20,
        price: 10,
        user_id: '123abc',
        createdAt: '2026-03-28T12:00:00.000Z'
      }
    ]

    // mock initial fetch for my classes
    cy.intercept('GET', '**/api/danceclasses', {
      statusCode: 200,
      body: myClasses
    }).as('getMyClasses')

    // mock delete class request
    cy.intercept('DELETE', '**/api/danceclasses/class1', {
      statusCode: 200,
      body: myClasses[0]
    }).as('deleteClass')

    // visit my classes page with logged in user already in local storage
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

    // wait for initial classes request to complete
    cy.wait('@getMyClasses')

    // check class is shown before deletion
    cy.contains('h2', 'My Classes').should('be.visible')
    cy.contains('Hip Hop Beginners').should('be.visible')
    cy.contains('Delete Class').should('be.visible')

    // click delete class button
    cy.contains('Delete Class').click()

    // wait for delete request to complete
    cy.wait('@deleteClass')

    // check deleted class is removed from UI
    cy.contains('Hip Hop Beginners').should('not.exist')
    cy.contains('Delete Class').should('not.exist')

    // check empty state is shown after deleting only class
    cy.contains('You have not created any classes yet. Use the form on the right to add your first class.')
      .should('be.visible')
  })

  it('keeps class visible when delete fails', () => {
    const myClasses = [
      {
        _id: 'class2',
        title: 'Salsa Open',
        dance_style: 'Salsa',
        dance_level: 'Open',
        location: 'Cork',
        date: '2026-04-20T19:00:00.000Z',
        capacity: 30,
        spotsRemaining: 30,
        price: 12,
        user_id: '123abc',
        createdAt: '2026-03-28T12:00:00.000Z'
      }
    ]

    // mock initial fetch for my classes
    cy.intercept('GET', '**/api/danceclasses', {
      statusCode: 200,
      body: myClasses
    }).as('getMyClasses')

    // mock failed delete request
    cy.intercept('DELETE', '**/api/danceclasses/class2', {
      statusCode: 400,
      body: {
        error: 'Could not delete class'
      }
    }).as('deleteClass')

    // visit my classes page with logged in user already in local storage
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

    // wait for initial classes request to complete
    cy.wait('@getMyClasses')

    // try to delete class
    cy.contains('Delete Class').click()

    // wait for failed delete request
    cy.wait('@deleteClass')

    // check class is still visible because delete failed
    cy.contains('Salsa Open').should('be.visible')
    cy.contains('Delete Class').should('be.visible')
  })

  it('does not show delete button for non-owner class on browse page', () => {
    const browseClasses = [
      {
        _id: 'class3',
        title: 'Jazz Beginners',
        dance_style: 'Jazz',
        dance_level: 'Beginner',
        location: 'Galway',
        date: '2026-04-10T18:00:00.000Z',
        capacity: 15,
        spotsRemaining: 10,
        price: 8,
        user_id: 'owner999',
        createdAt: '2026-03-28T12:00:00.000Z'
      }
    ]

    // mock logged in requests for browse page
    cy.intercept('GET', '**/api/danceclasses/bookings/me/upcoming', {
      statusCode: 200,
      body: []
    }).as('getUpcomingBookings')

    cy.intercept('GET', '**/api/danceclasses/browse*', {
      statusCode: 200,
      body: browseClasses
    }).as('getBrowseClasses')

    // visit browse page with logged in user already in local storage
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

    // wait for page requests
    cy.wait('@getUpcomingBookings')
    cy.wait('@getBrowseClasses')

    // check non-owner class shows booking action instead of owner actions
    cy.get('.danceclasses').within(() => {
      cy.contains('Jazz Beginners').should('be.visible')
      cy.contains('button', 'Book Class').should('be.visible')
      cy.contains('Delete Class').should('not.exist')
      cy.contains('Edit Class').should('not.exist')
    })
  })
})