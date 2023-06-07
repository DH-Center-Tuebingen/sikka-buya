// user.spec.js


describe('Setup Page', function () {

  let superUser;

  this.beforeAll(async function () {
    await cy.task("ResetDatabase")
  })

  it('loads the site', function () {

    cy.intercept({
      method: 'GET',
      url: '/setup',
    }).as('setup');
    cy.visit('/setup')

    cy.wait("@setup").its("response.statusCode").should("equal", 200)

  })

  it('correct href', function () {
    cy.visit('/setup')
    cy.location("pathname").should((pathname) => {
      expect(pathname).to.eq("/setup")
    })
  })



  it('register super user', function () {
    cy.visit('/setup')
    cy.fixture("users/admin").then(user => {
      superUser = user
      cy.get("input#username").type(user.email)
      cy.get("input#cpassword").type(user.password)
      cy.get("#submit-button").click();
      cy.get(".success").should("have.text", "Succesfully created superuser!")
    })
  })

  it('redirects if super user is set', function () {
    cy.visit('/setup')
    cy.location("pathname").should((pathname) => {
      expect(pathname).to.eq("/home")
    })
  })

  it('login should be available', function () {
    cy.intercept({
      method: 'GET',
      url: '/login',
    }).as('login');
    cy.visit('/login')

    cy.wait("@login").its("response.statusCode").should("equal", 200)
  })

  it('login button working', function () {
    cy.visit('/login')
    cy.get("input#username").type(superUser.email)
    cy.get("input#cpassword").type(superUser.password)
    const submitBtn = cy.get("#submit-button")
    submitBtn.should("not.have.class", "pending")
    submitBtn.click();
    submitBtn.should("have.class", "pending")

  })

  it('login working', function () {
    cy.visit('/login')
    cy.get("input#username").type(superUser.email)
    cy.get("input#cpassword").type(superUser.password)
    cy.get("#submit-button").click()
    cy.location("pathname").should((pathname) => {
      expect(pathname).to.eq("/editor/")
    })
  })

  it('logout working', function () {
    cy.login(superUser.email, superUser.password)
    cy.visit('/editor')
    cy.get(".user-hub .logout-button").click()
    cy.location("pathname").should((pathname) => {
      expect(pathname).to.eq("/login")
    })
  })
})

describe('User Management', function () {

  let admin, user1, user2

  this.beforeEach(function () {
    cy.fixture("users/user1").then((user) => {
      user1 = user
    })
    cy.fixture("users/user2").then((user) => {
      user2 = user
    })
    cy.fixture("users/admin").then((user) => {
      admin = user
      cy.login(admin.email, admin.password)
    })
  })

  it("Goto editor", function () {
    cy.intercept({
      method: 'GET',
      url: '/editor',
    }).as('editor');
    cy.visit('/editor')

    cy.wait("@editor").its("response.statusCode").should("equal", 200)
  })

  it("Goto UserManagement", function () {
    cy.visit('/editor')
    cy.get("a[href='/editor/user']").click()
    cy.location("pathname").should((pathname) => {
      expect(pathname).to.eq("/editor/user")
    })
  })

  it("Invite User", function () {
    cy.visit('/editor/user')
    cy.get("input[type='email']").type(user1.email)
    cy.get("input[type='submit']").contains("Invite").click()
    cy.get(".user:nth-child(2) .email").contains(user1.email)
  })

  it("Invite Other User", function () {
    cy.visit('/editor/user')
    cy.get("input[type='email']").type(user2.email)
    cy.get("input[type='submit']").contains("Invite").click()
    cy.get(".user:nth-child(3) .email").contains(user2.email)
  })

  it("Can delete user", function () {
    cy.visit('/editor/user')
    cy.triggerDeleteButton(".user:nth-child(3) .dynamic-delete-button")
    cy.get(".user:nth-child(3) .dynamic-delete-button").should("not.exist")
  })

})

describe('Accept Invite', function () {


  let user1

  this.beforeAll(function () {
    cy.fixture("users/user1").then((user) => {
      user1 = user
    })
  })

  it("Login not possible", function () {
    cy.visit('/login')
    cy.location("pathname").should((pathname) => {
      expect(pathname).to.eq(`/login`)
    })
    cy.get("input#username").type(user1.email)
    cy.get("input#cpassword").type(user1.password)
    const submitBtn = cy.get("#submit-button")
    submitBtn.click();
    cy.get("p.error").should("exist")

  })

  it("Goto Invite Page", function () {
    cy.visit(`/invite/${user1.email}`)
    cy.location("pathname").should((pathname) => {
      expect(pathname).to.eq(`/invite/${user1.email}`)
    })
  })

  it("Email should be set", function () {
    cy.visit(`/invite/${user1.email}`)
    cy.get('input').should('have.value', user1.email)
  })

  it("Accept Invite", function () {
    cy.visit(`/invite/${user1.email}`)
    cy.get("#password").type(user1.password)
    cy.get("button.signup-button").click()
    cy.location("pathname").should((pathname) => {
      expect(pathname).to.eq("/login")
    })
  })

  it("Login possible", function () {
    cy.visit('/login')
    cy.location("pathname").should((pathname) => {
      expect(pathname).to.eq(`/login`)
    })
    cy.get("input#username").type(user1.email)
    cy.get("input#cpassword").type(user1.password)
    const submitBtn = cy.get("#submit-button")
    submitBtn.click();
    cy.location("pathname").should((pathname) => {
      expect(pathname).to.eq("/editor/")
    })
  })

})