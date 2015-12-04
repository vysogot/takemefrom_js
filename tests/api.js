const Browser = require('zombie');
const util = require('util');

// We're going to make requests to http://example.com/signup
// Which will be routed to our test server localhost:3000
Browser.localhost('example.com', 3000);

describe('User visits signup page', function() {

  const browser = new Browser();

  before(function(done) {
    browser.visit('/register', done);
  });

  describe('submits form', function() {

    before(function(done) {
      browser
        .fill('username', 'johny')
        .fill('password', 'secret')
        .pressButton('Register', done);
    });

    it('should be successful', function() {
      browser.assert.success();
    });

    it('should see welcome page', function() {
      console.log(util.inspect(browser.response));
      browser.assert.text('title', 'Take me from');
    });
  });
});
