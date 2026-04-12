describe('Edit Class', () => {
  beforeEach(() => {
    // clear any previous logged in user before each test
    cy.clearLocalStorage()
  })

  it('loads existing class data into the edit form', () => {
    const existingClass = {
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

    // mock fetch for existing class data
    cy.intercept('GET', '**/api/danceclasses/class1', {
      statusCode: 200,
      body: existingClass
    }).as('getClass')

    // visit edit class page with logged in user already in local storage
    cy.visit('/classes/class1/edit', {
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

    // wait for mocked class request to complete
    cy.wait('@getClass')

    // check edit page heading is shown
    cy.contains('h2', 'Edit Class').should('be.visible')
    cy.contains('Update the details of your class below.').should('be.visible')

    // check form is pre-filled with existing class data
    cy.get('input[type="text"]').eq(0).should('have.value', 'Hip Hop Beginners')
    cy.get('input[type="text"]').eq(1).should('have.value', 'Hip Hop')
    cy.get('select').should('have.value', 'Beginner')
    cy.get('input[type="text"]').eq(2).should('have.value', 'Dublin')
    cy.get('input[type="datetime-local"]').should('not.have.value', '')
    cy.get('input[type="number"]').eq(0).should('have.value', '20')
    cy.get('input[type="number"]').eq(1).should('have.value', '10')
  })

  it('updates a class successfully', () => {
    const existingClass = {
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

    const updatedClass = {
      _id: 'class1',
      title: 'Hip Hop Intermediate',
      dance_style: 'Hip Hop',
      dance_level: 'Intermediate',
      location: 'Cork',
      date: '2026-04-20T19:00:00.000Z',
      capacity: 25,
      spotsRemaining: 20,
      price: 12,
      user_id: '123abc',
      createdAt: '2026-03-28T12:00:00.000Z'
    }

    // mock fetch for existing class data
    cy.intercept('GET', '**/api/danceclasses/class1', {
      statusCode: 200,
      body: existingClass
    }).as('getClass')

    // mock update class request
    cy.intercept('PATCH', '**/api/danceclasses/class1', {
      statusCode: 200,
      body: updatedClass
    }).as('updateClass')

    // mock my classes request after redirect back to my classes page
    cy.intercept('GET', '**/api/danceclasses', {
      statusCode: 200,
      body: [updatedClass]
    }).as('getMyClasses')

    // visit edit class page with logged in user already in local storage
    cy.visit('/classes/class1/edit', {
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

    // wait for existing class to load
    cy.wait('@getClass')

    // update form fields
    cy.get('input[type="text"]').eq(0).clear().type('Hip Hop Intermediate')
    cy.get('select').select('Intermediate')
    cy.get('input[type="text"]').eq(2).clear().type('Cork')
    cy.get('input[type="datetime-local"]').clear().type('2026-04-20T19:00')
    cy.get('input[type="number"]').eq(0).clear().type('25')
    cy.get('input[type="number"]').eq(1).clear().type('12')

    // submit updated class
    cy.contains('button', 'Save Changes').click()

    // wait for update request and redirected page request
    cy.wait('@updateClass')
    cy.wait('@getMyClasses')

    // check user is redirected back to my classes page
    cy.location('pathname').should('eq', '/my-classes')

    // check updated class details are shown
    cy.contains('Hip Hop Intermediate').should('be.visible')
    cy.contains('Intermediate').should('be.visible')
    cy.contains('Cork').should('be.visible')
    cy.contains('25').should('be.visible')
    cy.contains('12').should('be.visible')
  })

  it('shows validation error when required fields are missing', () => {
    const existingClass = {
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

    // mock fetch for existing class data
    cy.intercept('GET', '**/api/danceclasses/class1', {
      statusCode: 200,
      body: existingClass
    }).as('getClass')

    // mock failed update request with backend validation response
    cy.intercept('PATCH', '**/api/danceclasses/class1', {
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
    }).as('updateClass')

    // visit edit class page with logged in user already in local storage
    cy.visit('/classes/class1/edit', {
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

    // wait for existing class to load
    cy.wait('@getClass')

    // clear all required fields
    cy.get('input[type="text"]').eq(0).clear()
    cy.get('input[type="text"]').eq(1).clear()
    cy.get('select').select('Select level')
    cy.get('input[type="text"]').eq(2).clear()
    cy.get('input[type="datetime-local"]').clear()
    cy.get('input[type="number"]').eq(0).clear()
    cy.get('input[type="number"]').eq(1).clear()

    // submit invalid form
    cy.contains('button', 'Save Changes').click()

    // wait for mocked update request to complete
    cy.wait('@updateClass')

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

  it('exits edit page without saving', () => {
    const existingClass = {
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

    // mock fetch for existing class data
    cy.intercept('GET', '**/api/danceclasses/class1', {
      statusCode: 200,
      body: existingClass
    }).as('getClass')

    // mock my classes request after exiting edit page
    cy.intercept('GET', '**/api/danceclasses', {
      statusCode: 200,
      body: [existingClass]
    }).as('getMyClasses')

    // visit edit class page with logged in user already in local storage
    cy.visit('/classes/class1/edit', {
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

    // wait for existing class to load
    cy.wait('@getClass')

    // click exit without saving
    cy.contains('button', 'Exit and discard changes').click()

    // wait for redirected page request
    cy.wait('@getMyClasses')

    // check user is redirected back to my classes page
    cy.location('pathname').should('eq', '/my-classes')

    // check original class is still shown
    cy.contains('Hip Hop Beginners').should('be.visible')
  })

  it('does not submit the form when capacity and price are negative', () => {
    const existingClass = {
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

    // mock fetch for existing class data
    cy.intercept('GET', '**/api/danceclasses/class1', {
      statusCode: 200,
      body: existingClass
    }).as('getClass')

    // spy on update request - it should not happen
    cy.intercept('PATCH', '**/api/danceclasses/class1', {
      statusCode: 200,
      body: existingClass
    }).as('updateClass')

    // visit edit class page with logged in user already in local storage
    cy.visit('/classes/class1/edit', {
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

    cy.wait('@getClass')

    // enter negative values
    cy.get('input[type="number"]').eq(0).clear().type('-5')
    cy.get('input[type="number"]').eq(1).clear().type('-10')

    cy.contains('button', 'Save Changes').click()

    // browser validation should block submission, so no request is sent
    cy.get('@updateClass.all').should('have.length', 0)
  })
})