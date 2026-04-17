describe('Booking and Unbooking', () => {
  beforeEach(() => {
    // clear any previous logged in user before each test
    cy.clearLocalStorage()
  })

  it('books a class successfully', () => {
    const browseClasses = [
      {
        _id: 'class1',
        title: 'Hip Hop Beginners',
        dance_style: 'Hip Hop',
        dance_level: 'Beginner',
        location: 'Dublin',
        date: '2026-04-15T18:30:00.000Z',
        capacity: 20,
        spotsRemaining: 12,
        price: 10,
        user_id: 'owner456',
        createdAt: '2026-03-28T12:00:00.000Z'
      }
    ]

    const upcomingAfterBooking = [
      {
        _id: 'booking1',
        classId: {
          _id: 'class1',
          title: 'Hip Hop Beginners',
          dance_style: 'Hip Hop',
          dance_level: 'Beginner',
          location: 'Dublin',
          date: '2026-04-15T18:30:00.000Z',
          capacity: 20,
          spotsRemaining: 11,
          price: 10,
          user_id: 'owner456',
          createdAt: '2026-03-28T12:00:00.000Z'
        }
      }
    ]

    let hasBooked = false

    // mock upcoming bookings request
    // keep returning no bookings until class is actually booked
    // after booking, return booked class
    cy.intercept('GET', '**/api/danceclasses/bookings/me/upcoming', (req) => {
      if (!hasBooked) {
        req.reply({
          statusCode: 200,
          body: []
        })
      } else {
        req.reply({
          statusCode: 200,
          body: upcomingAfterBooking
        })
      }
    }).as('getUpcomingBookings')

    // mock browse classes request
    // backend still returns same class, but after booking the frontend filters it out
    cy.intercept('GET', '**/api/danceclasses/browse*', {
      statusCode: 200,
      body: browseClasses
    }).as('getBrowseClasses')

    // mock booking request
    cy.intercept('POST', '**/api/danceclasses/class1/book', (req) => {
      hasBooked = true

      req.reply({
        statusCode: 200,
        body: {
          message: 'Class booked successfully',
          spotsRemaining: 11
        }
      })
    }).as('bookClass')

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

    // wait for initial page requests to complete
    cy.wait('@getUpcomingBookings')
    cy.wait('@getBrowseClasses')

    // check class is shown in browse before booking
    cy.get('.danceclasses').within(() => {
      cy.contains('Hip Hop Beginners').should('exist')
      cy.contains('button', 'Book Class').should('exist')
    })

    // click book class button
    cy.get('.danceclasses').contains('button', 'Book Class').click()

    // wait for booking request and refreshed data requests
    cy.wait('@bookClass')
    cy.wait('@getUpcomingBookings')
    cy.wait('@getBrowseClasses')

    // check class now appears in upcoming bookings section
    cy.get('.sidebar-panel').within(() => {
      cy.contains('Hip Hop Beginners').should('exist')
      cy.contains('button', 'Unbook Class').should('exist')
    })

    // check booked class no longer appears in browse section
    cy.get('.danceclasses').within(() => {
      cy.contains('Hip Hop Beginners').should('not.exist')
      cy.contains('button', 'Book Class').should('not.exist')
    })
  })

  it('unbooks a class successfully', () => {
    const browseClasses = [
      {
        _id: 'class1',
        title: 'Hip Hop Beginners',
        dance_style: 'Hip Hop',
        dance_level: 'Beginner',
        location: 'Dublin',
        date: '2026-04-15T18:30:00.000Z',
        capacity: 20,
        spotsRemaining: 12,
        price: 10,
        user_id: 'owner456',
        createdAt: '2026-03-28T12:00:00.000Z'
      }
    ]

    const upcomingBeforeUnbooking = [
      {
        _id: 'booking1',
        classId: {
          _id: 'class1',
          title: 'Hip Hop Beginners',
          dance_style: 'Hip Hop',
          dance_level: 'Beginner',
          location: 'Dublin',
          date: '2026-04-15T18:30:00.000Z',
          capacity: 20,
          spotsRemaining: 11,
          price: 10,
          user_id: 'owner456',
          createdAt: '2026-03-28T12:00:00.000Z'
        }
      }
    ]

    let hasUnbooked = false

    // mock upcoming bookings request
    // keep returning booked class until unbook is confirmed
    // after unbooking, return empty list
    cy.intercept('GET', '**/api/danceclasses/bookings/me/upcoming', (req) => {
      if (!hasUnbooked) {
        req.reply({
          statusCode: 200,
          body: upcomingBeforeUnbooking
        })
      } else {
        req.reply({
          statusCode: 200,
          body: []
        })
      }
    }).as('getUpcomingBookings')

    // mock browse classes request
    // backend returns same class list both times
    // before unbooking frontend filters it out because it is in myUpcoming
    // after unbooking frontend shows it again
    cy.intercept('GET', '**/api/danceclasses/browse*', {
      statusCode: 200,
      body: browseClasses
    }).as('getBrowseClasses')

    // mock unbooking request
    cy.intercept('DELETE', '**/api/danceclasses/class1/book', (req) => {
      hasUnbooked = true

      req.reply({
        statusCode: 200,
        body: {
          message: 'Booking cancelled successfully',
          spotsRemaining: 12
        }
      })
    }).as('unbookClass')

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

    // wait for initial page requests to complete
    cy.wait('@getUpcomingBookings')
    cy.wait('@getBrowseClasses')

    // check class is shown in upcoming bookings section before unbooking
    cy.get('.sidebar-panel').within(() => {
      cy.contains('Hip Hop Beginners').should('exist')
      cy.contains('button', 'Unbook Class').should('exist')
    })

    // click unbook button on class card to open modal
    cy.get('.sidebar-panel').contains('button', 'Unbook Class').click()

    // check confirmation modal appears
    cy.contains('Unbook Class: "Hip Hop Beginners"').should('be.visible')
    cy.contains('Are you sure you want to unbook this class?').should('be.visible')

    // click confirm unbook button inside modal
    cy.get('.modal-overlay').within(() => {
      cy.contains('button', 'Unbook').click()
    })

    // wait for unbooking request and refreshed data requests
    cy.wait('@unbookClass')
    cy.wait('@getUpcomingBookings')
    cy.wait('@getBrowseClasses')

    // check upcoming bookings empty state is shown
    cy.get('.sidebar-panel').within(() => {
      cy.contains('No upcoming bookings yet.').should('be.visible')
    })

    // check class appears back in browse with book button again
    cy.get('.danceclasses').within(() => {
      cy.contains('Hip Hop Beginners').should('exist')
      cy.contains('button', 'Book Class').should('exist')
    })
  })
  
  it('redirects logged out user to login when trying to book a class', () => {
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
        user_id: 'owner222',
        createdAt: '2026-03-28T12:00:00.000Z'
      }
    ]

    // mock public browse request
    cy.intercept('GET', '**/api/danceclasses/browse*', {
      statusCode: 200,
      body: browseClasses
    }).as('getBrowseClasses')

    // visit browse page logged out
    cy.visit('/')

    // wait for browse request
    cy.wait('@getBrowseClasses')

    // click book class while logged out
    cy.get('.danceclasses').contains('button', 'Book Class').click()

    // check user is redirected to login page
    cy.location('pathname').should('eq', '/login')
    cy.contains('h3', 'Log In').should('be.visible')
  })

  it('shows an error when booking fails', () => {
    const browseClasses = [
      {
        _id: 'class4',
        title: 'Contemporary Flow',
        dance_style: 'Contemporary',
        dance_level: 'Intermediate',
        location: 'Limerick',
        date: '2026-04-12T18:30:00.000Z',
        capacity: 18,
        spotsRemaining: 5,
        price: 15,
        user_id: 'owner333',
        createdAt: '2026-03-28T12:00:00.000Z'
      }
    ]

    // mock logged in requests
    cy.intercept('GET', '**/api/danceclasses/bookings/me/upcoming', {
      statusCode: 200,
      body: []
    }).as('getUpcomingBookings')

    cy.intercept('GET', '**/api/danceclasses/browse*', {
      statusCode: 200,
      body: browseClasses
    }).as('getBrowseClasses')

    // mock failed booking request
    cy.intercept('POST', '**/api/danceclasses/class4/book', {
      statusCode: 400,
      body: {
        error: 'Booking failed'
      }
    }).as('bookClass')

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

    // try to book class
    cy.get('.danceclasses').contains('button', 'Book Class').click()

    // wait for failed booking request
    cy.wait('@bookClass')

    // check error is shown and class remains in browse
    cy.get('.danceclasses').within(() => {
      cy.contains('Contemporary Flow').should('be.visible')
      cy.contains('button', 'Book Class').should('be.visible')
    })

    cy.get('.error')
      .should('be.visible')
      .and('contain', 'Booking failed')
  })

  it('shows an error when unbooking fails', () => {
    const browseClasses = [
      {
        _id: 'class5',
        title: 'Latin Night',
        dance_style: 'Latin',
        dance_level: 'Open',
        location: 'Waterford',
        date: '2026-04-18T20:00:00.000Z',
        capacity: 30,
        spotsRemaining: 20,
        price: 10,
        user_id: 'owner444',
        createdAt: '2026-03-28T12:00:00.000Z'
      }
    ]

    const upcomingBeforeUnbooking = [
      {
        _id: 'booking5',
        classId: {
          _id: 'class5',
          title: 'Latin Night',
          dance_style: 'Latin',
          dance_level: 'Open',
          location: 'Waterford',
          date: '2026-04-18T20:00:00.000Z',
          capacity: 30,
          spotsRemaining: 19,
          price: 10,
          user_id: 'owner444',
          createdAt: '2026-03-28T12:00:00.000Z'
        }
      }
    ]

    // mock logged in requests
    cy.intercept('GET', '**/api/danceclasses/bookings/me/upcoming', {
      statusCode: 200,
      body: upcomingBeforeUnbooking
    }).as('getUpcomingBookings')

    cy.intercept('GET', '**/api/danceclasses/browse*', {
      statusCode: 200,
      body: browseClasses
    }).as('getBrowseClasses')

    // mock failed unbooking request
    cy.intercept('DELETE', '**/api/danceclasses/class5/book', {
      statusCode: 400,
      body: {
        error: 'Unbooking failed'
      }
    }).as('unbookClass')

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

    // click unbook button on class card to open modal
    cy.get('.sidebar-panel').contains('button', 'Unbook Class').click()

    // check confirmation modal appears
    cy.contains('Unbook Class: "Latin Night"').should('be.visible')
    cy.contains('Are you sure you want to unbook this class?').should('be.visible')

    // click confirm unbook button inside modal
    cy.get('.modal-overlay').within(() => {
      cy.contains('button', 'Unbook').click()
    })

    // wait for failed unbooking request
    cy.wait('@unbookClass')

    // check class stays in upcoming bookings section
    cy.get('.sidebar-panel').within(() => {
      cy.contains('Latin Night').should('be.visible')
      cy.contains('button', 'Unbook Class').should('exist')
    })

    // check error message is shown
    cy.contains('Unbooking failed').should('be.visible')
  })
})