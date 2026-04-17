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

    // check search bar is shown
    cy.contains('Search classes').should('be.visible')
    cy.get('input[placeholder="Search by title, style or location"]').should('be.visible')
    cy.contains('button', 'Search').should('be.visible')

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
    cy.contains('button', 'Show Filter Options').click()

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
  })

  it('searches browse classes using the Search button', () => {
    const searchedClasses = [
      {
        _id: 'class4',
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

    // mock initial browse request on page load
    cy.intercept('GET', '**/api/danceclasses/browse*', {
      statusCode: 200,
      body: []
    }).as('initialBrowseClasses')

    // visit browse page
    cy.visit('/')

    // wait for initial browse request to complete
    cy.wait('@initialBrowseClasses')

    // mock search request after clicking Search
    cy.intercept('GET', '**/api/danceclasses/browse*', (req) => {
      expect(req.query.search).to.equal('hip')
      expect(req.query.level).to.be.undefined
      expect(req.query.minPrice).to.be.undefined
      expect(req.query.maxPrice).to.be.undefined

      req.reply({
        statusCode: 200,
        body: searchedClasses
      })
    }).as('searchedBrowseClasses')

    // type into search bar
    cy.get('input[placeholder="Search by title, style or location"]').type('hip')

    // click Search button
    cy.contains('button', 'Search').click()

    // wait for search request to complete
    cy.wait('@searchedBrowseClasses')

    // check searched class is shown
    cy.contains('Hip Hop Beginners').should('be.visible')
    cy.contains('Hip Hop').should('be.visible')
    cy.contains('Dublin').should('be.visible')
  })

  it('searches browse classes when Enter is pressed in the search bar', () => {
    const searchedClasses = [
      {
        _id: 'class5',
        title: 'Salsa Social',
        dance_style: 'Salsa',
        dance_level: 'Open',
        location: 'Cork',
        date: '2026-04-20T19:00:00.000Z',
        capacity: 30,
        spotsRemaining: 18,
        price: 8,
        user_id: 'owner789',
        createdAt: '2026-03-28T13:00:00.000Z'
      }
    ]

    // mock initial browse request on page load
    cy.intercept('GET', '**/api/danceclasses/browse*', {
      statusCode: 200,
      body: []
    }).as('initialBrowseClasses')

    // visit browse page
    cy.visit('/')

    // wait for initial browse request to complete
    cy.wait('@initialBrowseClasses')

    // mock search request after pressing Enter
    cy.intercept('GET', '**/api/danceclasses/browse*', (req) => {
      expect(req.query.search).to.equal('salsa')
      expect(req.query.level).to.be.undefined
      expect(req.query.minPrice).to.be.undefined
      expect(req.query.maxPrice).to.be.undefined

      req.reply({
        statusCode: 200,
        body: searchedClasses
      })
    }).as('searchedBrowseClasses')

    // type into search bar and press Enter
    cy.get('input[placeholder="Search by title, style or location"]')
      .type('salsa{enter}')

    // wait for search request to complete
    cy.wait('@searchedBrowseClasses')

    // check searched class is shown
    cy.contains('Salsa Social').should('be.visible')
    cy.contains('Salsa').should('be.visible')
    cy.contains('Cork').should('be.visible')
  })

  it('clears the search box and shows all classes again when searched with an empty value', () => {
    const searchedClasses = [
      {
        _id: 'class6',
        title: 'Contemporary Flow',
        dance_style: 'Contemporary',
        dance_level: 'Intermediate',
        location: 'Limerick',
        date: '2026-04-22T18:00:00.000Z',
        capacity: 18,
        spotsRemaining: 10,
        price: 12,
        user_id: 'owner321',
        createdAt: '2026-03-28T15:00:00.000Z'
      }
    ]

    const allClasses = [
      {
        _id: 'class6',
        title: 'Contemporary Flow',
        dance_style: 'Contemporary',
        dance_level: 'Intermediate',
        location: 'Limerick',
        date: '2026-04-22T18:00:00.000Z',
        capacity: 18,
        spotsRemaining: 10,
        price: 12,
        user_id: 'owner321',
        createdAt: '2026-03-28T15:00:00.000Z'
      },
      {
        _id: 'class7',
        title: 'Jazz Technique',
        dance_style: 'Jazz',
        dance_level: 'Beginner',
        location: 'Dublin',
        date: '2026-04-24T18:30:00.000Z',
        capacity: 20,
        spotsRemaining: 14,
        price: 9,
        user_id: 'owner654',
        createdAt: '2026-03-28T16:00:00.000Z'
      }
    ]

    // mock initial browse request on page load
    cy.intercept('GET', '**/api/danceclasses/browse*', {
      statusCode: 200,
      body: []
    }).as('initialBrowseClasses')

    // visit browse page
    cy.visit('/')

    // wait for initial browse request
    cy.wait('@initialBrowseClasses')

    // mock search request
    cy.intercept('GET', '**/api/danceclasses/browse*', (req) => {
      expect(req.query.search).to.equal('cont')

      req.reply({
        statusCode: 200,
        body: searchedClasses
      })
    }).as('searchedBrowseClasses')

    // search for a keyword
    cy.get('input[placeholder="Search by title, style or location"]').type('cont')
    cy.contains('button', 'Search').click()
    cy.wait('@searchedBrowseClasses')

    // mock request when search box is cleared and searched again
    cy.intercept('GET', '**/api/danceclasses/browse*', (req) => {
      expect(req.query.search).to.be.undefined

      req.reply({
        statusCode: 200,
        body: allClasses
      })
    }).as('clearedSearchBrowseClasses')

    // clear the input and search again
    cy.get('input[placeholder="Search by title, style or location"]').clear()
    cy.contains('button', 'Search').click()

    // wait for cleared search request
    cy.wait('@clearedSearchBrowseClasses')

    // check full list is shown again
    cy.contains('Contemporary Flow').should('be.visible')
    cy.contains('Jazz Technique').should('be.visible')
  })

  it('applies search together with filters', () => {
    const searchedAndFilteredClasses = [
      {
        _id: 'class8',
        title: 'Hip Hop Fundamentals',
        dance_style: 'Hip Hop',
        dance_level: 'Beginner',
        location: 'Dublin',
        date: '2026-04-26T18:00:00.000Z',
        capacity: 16,
        spotsRemaining: 9,
        price: 10,
        user_id: 'owner777',
        createdAt: '2026-03-28T17:00:00.000Z'
      }
    ]

    // mock initial browse request on page load
    cy.intercept('GET', '**/api/danceclasses/browse*', {
      statusCode: 200,
      body: []
    }).as('initialBrowseClasses')

    // visit browse page
    cy.visit('/')

    // wait for initial browse request
    cy.wait('@initialBrowseClasses')

    // mock combined search + filter request after Apply Filters is clicked
    cy.intercept('GET', '**/api/danceclasses/browse*', (req) => {
      expect(req.query.search).to.equal('hip')
      expect(req.query.level).to.equal('Beginner')
      expect(req.query.minPrice).to.equal('5')
      expect(req.query.maxPrice).to.equal('15')
      expect(req.query.sort).to.equal('price_asc')

      req.reply({
        statusCode: 200,
        body: searchedAndFilteredClasses
      })
    }).as('searchedAndFilteredBrowseClasses')

    // type into search bar
    cy.get('input[placeholder="Search by title, style or location"]').type('hip')

    // open filters panel
    cy.contains('button', 'Show Filter Options').click()

    // fill in filter values
    cy.get('select').eq(0).select('Beginner')
    cy.get('select').eq(1).select('Price: lowest first')
    cy.get('input[type="number"]').eq(0).type('5')
    cy.get('input[type="number"]').eq(1).type('15')

    // apply filters
    cy.contains('button', 'Apply Filters').click()

    // wait for combined request
    cy.wait('@searchedAndFilteredBrowseClasses')

    // check class is shown
    cy.contains('Hip Hop Fundamentals').should('be.visible')
    cy.contains('Hip Hop').should('be.visible')
    cy.contains('Dublin').should('be.visible')
  })

  it('clears only the expandable panel filters and keeps the search term', () => {
    const searchedAndFilteredClasses = [
      {
        _id: 'class9',
        title: 'Hip Hop Beginners',
        dance_style: 'Hip Hop',
        dance_level: 'Beginner',
        location: 'Dublin',
        date: '2026-04-27T18:00:00.000Z',
        capacity: 20,
        spotsRemaining: 11,
        price: 10,
        user_id: 'owner999',
        createdAt: '2026-03-28T18:00:00.000Z'
      }
    ]

    const searchedOnlyClasses = [
      {
        _id: 'class9',
        title: 'Hip Hop Beginners',
        dance_style: 'Hip Hop',
        dance_level: 'Beginner',
        location: 'Dublin',
        date: '2026-04-27T18:00:00.000Z',
        capacity: 20,
        spotsRemaining: 11,
        price: 10,
        user_id: 'owner999',
        createdAt: '2026-03-28T18:00:00.000Z'
      },
      {
        _id: 'class10',
        title: 'Hip Hop Open Choreo',
        dance_style: 'Hip Hop',
        dance_level: 'Open',
        location: 'Galway',
        date: '2026-04-28T19:00:00.000Z',
        capacity: 24,
        spotsRemaining: 20,
        price: 14,
        user_id: 'owner888',
        createdAt: '2026-03-28T19:00:00.000Z'
      }
    ]

    // mock initial browse request on page load
    cy.intercept('GET', '**/api/danceclasses/browse*', {
      statusCode: 200,
      body: []
    }).as('initialBrowseClasses')

    // visit browse page
    cy.visit('/')

    // wait for initial browse request
    cy.wait('@initialBrowseClasses')

    // type into search bar
    cy.get('input[placeholder="Search by title, style or location"]').type('hip')

    // open filters panel
    cy.contains('button', 'Show Filter Options').click()

    // mock combined search + filter request
    cy.intercept('GET', '**/api/danceclasses/browse*', (req) => {
      expect(req.query.search).to.equal('hip')
      expect(req.query.level).to.equal('Beginner')
      expect(req.query.minPrice).to.equal('5')
      expect(req.query.maxPrice).to.equal('15')
      expect(req.query.sort).to.equal('price_asc')

      req.reply({
        statusCode: 200,
        body: searchedAndFilteredClasses
      })
    }).as('searchedAndFilteredBrowseClasses')

    // fill in filter values
    cy.get('select').eq(0).select('Beginner')
    cy.get('select').eq(1).select('Price: lowest first')
    cy.get('input[type="number"]').eq(0).type('5')
    cy.get('input[type="number"]').eq(1).type('15')

    // apply filters
    cy.contains('button', 'Apply Filters').click()
    cy.wait('@searchedAndFilteredBrowseClasses')

    // mock request after Clear Filters is clicked
    cy.intercept('GET', '**/api/danceclasses/browse*', (req) => {
      expect(req.query.search).to.equal('hip')
      expect(req.query.level).to.be.undefined
      expect(req.query.minPrice).to.be.undefined
      expect(req.query.maxPrice).to.be.undefined
      expect(req.query.sort).to.equal('date_asc')

      req.reply({
        statusCode: 200,
        body: searchedOnlyClasses
      })
    }).as('searchOnlyBrowseClasses')

    // clear only expandable filters
    cy.contains('button', 'Clear Filters').click()
    cy.wait('@searchOnlyBrowseClasses')

    // search input should still keep the keyword
    cy.get('input[placeholder="Search by title, style or location"]').should('have.value', 'hip')

    // filter fields should reset
    cy.get('select').eq(0).should('have.value', '')
    cy.get('select').eq(1).should('have.value', 'date_asc')
    cy.get('input[type="number"]').eq(0).should('have.value', '')
    cy.get('input[type="number"]').eq(1).should('have.value', '')

    // check search-only results are shown
    cy.contains('Hip Hop Beginners').should('be.visible')
    cy.contains('Hip Hop Open Choreo').should('be.visible')
  })
})