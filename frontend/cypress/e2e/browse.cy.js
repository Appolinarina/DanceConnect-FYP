describe('Browse Page', () => {
  beforeEach(() => {
    // clear any previous logged in user before each test
    cy.clearLocalStorage()
  })

  it('loads browse page correctly for a logged out user', () => {
    // mock browse classes request with no available classes
    cy.intercept('GET', '**/api/danceclasses/browse*', {
      statusCode: 200,
      body: []
    }).as('getBrowseClasses')

    // visit browse page
    cy.visit('/')

    // wait for mocked browse request to complete
    cy.wait('@getBrowseClasses')

    // check hero section and browse section are shown
    cy.contains('Find your next class').should('be.visible')
    cy.contains('Discover dance classes near you').should('be.visible')
    cy.contains('Browse Classes').should('be.visible')

    // check empty state is shown when no classes are returned
    cy.contains('No classes available to book just yet.').should('be.visible')

    // check logged out message is shown in upcoming bookings section
    cy.contains('Please log in to view your upcoming classes.').should('be.visible')
  })

  it('shows browse classes returned from backend', () => {
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
      },
      {
        _id: 'class2',
        title: 'Salsa Open',
        dance_style: 'Salsa',
        dance_level: 'Open',
        location: 'Cork',
        date: '2026-04-20T19:00:00.000Z',
        capacity: 30,
        spotsRemaining: 30,
        price: 0,
        user_id: 'owner789',
        createdAt: '2026-03-28T13:00:00.000Z'
      }
    ]

    // mock browse classes request with available classes
    cy.intercept('GET', '**/api/danceclasses/browse*', {
      statusCode: 200,
      body: browseClasses
    }).as('getBrowseClasses')

    // visit browse page
    cy.visit('/')

    // wait for mocked browse request to complete
    cy.wait('@getBrowseClasses')

    // check returned class details are shown
    cy.contains('Hip Hop Beginners').should('be.visible')
    cy.contains('Salsa Open').should('be.visible')
    cy.contains('Hip Hop').should('be.visible')
    cy.contains('Salsa').should('be.visible')
    cy.contains('Beginner').should('be.visible')
    cy.contains('Open').should('be.visible')
    cy.contains('Dublin').should('be.visible')
    cy.contains('Cork').should('be.visible')
    cy.contains('12').should('be.visible')
    cy.contains('30').should('be.visible')

    // check book buttons are shown for available classes
    cy.contains('button', 'Book Class').should('be.visible')
  })

  it('shows no upcoming bookings message for a logged in user with no bookings', () => {
    // mock browse classes request with no available classes
    cy.intercept('GET', '**/api/danceclasses/browse*', {
      statusCode: 200,
      body: []
    }).as('getBrowseClasses')

    // mock upcoming bookings request with no bookings
    cy.intercept('GET', '**/api/danceclasses/bookings/me/upcoming', {
      statusCode: 200,
      body: []
    }).as('getUpcomingBookings')

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

    // wait for mocked requests to complete
    cy.wait('@getUpcomingBookings')
    cy.wait('@getBrowseClasses')

    // check upcoming bookings empty state is shown for logged in user
    cy.contains('No upcoming bookings yet.').should('be.visible')

    // check logged in navbar state is shown
    cy.contains('testuser@email.com').should('be.visible')
    cy.contains('button', 'Logout').should('be.visible')
  })

  it('opens filters and applies them', () => {
    const filteredClasses = [
      {
        _id: 'class3',
        title: 'Beginner Ballet',
        dance_style: 'Ballet',
        dance_level: 'Beginner',
        location: 'Galway',
        date: '2026-04-25T17:00:00.000Z',
        capacity: 15,
        spotsRemaining: 8,
        price: 5,
        user_id: 'owner999',
        createdAt: '2026-03-28T14:00:00.000Z'
      }
    ]

    // mock initial browse request on page load
    cy.intercept('GET', '**/api/danceclasses/browse*', {
      statusCode: 200,
      body: []
    }).as('initialBrowseClasses')

    // mock filtered browse request after apply filters is clicked
    cy.intercept('GET', '**/api/danceclasses/browse?level=Beginner&minPrice=5&maxPrice=15&sort=price_asc', {
      statusCode: 200,
      body: filteredClasses
    }).as('filteredBrowseClasses')

    // visit browse page
    cy.visit('/')

    // wait for initial browse request to complete
    cy.wait('@initialBrowseClasses')

    // open filters panel
    cy.contains('button', 'Show Filters').click()

    // check filter fields are shown
    cy.contains('Level').should('be.visible')
    cy.contains('Sort by').should('be.visible')
    cy.contains('Min Price').should('be.visible')
    cy.contains('Max Price').should('be.visible')

    // fill in filter values
    cy.get('select').eq(0).select('Beginner')
    cy.get('select').eq(1).select('Price: lowest first')
    cy.get('input[type="number"]').eq(0).type('5')
    cy.get('input[type="number"]').eq(1).type('15')

    // apply filters
    cy.contains('button', 'Apply Filters').click()

    // wait for filtered browse request to complete
    cy.wait('@filteredBrowseClasses')

    // check filtered class is shown
    cy.contains('Beginner Ballet').should('be.visible')
    cy.contains('Ballet').should('be.visible')
    cy.contains('Galway').should('be.visible')
    cy.contains('5').should('be.visible')
  })
})