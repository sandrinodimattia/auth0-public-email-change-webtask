"use latest";

const auth0 = require('auth0@2.0.0');
const jwt = require('express-jwt');
const Express = require('express');
const bodyParser = require('body-parser');

function normalizeRequest(req) {
  const normalizeRouteBase = '^\/api\/run\/[^\/]+\/';
  const normalizeNamedRoute = '(?:[^\/\?#]*\/?)?';
  const normalizedRoute = new RegExp(normalizeRouteBase + (req.x_wt.jtn ? normalizeNamedRoute : ''));
  req.url = req.url.replace(normalizedRoute, '/');
}

module.exports = function(context, req, res) {
  normalizeRequest(req);

  // Initialize the Auth0 client.
  const client = new auth0.ManagementClient({
    token: context.secrets.AUTH0_API_TOKEN,
    domain: context.secrets.AUTH0_DOMAIN
  });

  // Start express.
  const app = Express();
  app.use(bodyParser.json());
  app.use((req, res, next) => {
    const secrets = context.secrets;

    // Validate.
    if (!secrets.AUTH0_DOMAIN) {
      return next(new Error('Auth0 domain is missing.'));
    }
    if (!secrets.AUTH0_API_TOKEN) {
      return next(new Error('Auth0 API token is missing.'));
    }
    if (!secrets.AUTH0_CLIENT_ID || !secrets.AUTH0_CLIENT_SECRET) {
      return next(new Error('Auth0 application settings are missing.'));
    }

    req.settings = secrets;
    next();
  });

  // Require authentication.
  app.use(jwt({
    audience: context.secrets.AUTH0_CLIENT_ID,
    issuer: `https://${context.secrets.AUTH0_DOMAIN}/`,
    secret: new Buffer(context.secrets.AUTH0_CLIENT_SECRET, 'base64')
  }));

  // Change email.
  app.post('/', (req, res, next) => {
    if (!req.body || !req.body.email) {
      return next(new Error('The new email is required.'));
    }
    if (!req.body || !req.body.email) {
      return next(new Error('The connection is required.'));
    }

    console.log(`Update email for ${req.user.sub} to ${req.body.email}`);

    const payload = {
      connection: req.body.connection,
      email: req.body.email,
      verify_email: true
    };

    client.users.update({ id: req.user.sub }, payload, (err, user) => {
      if (err) {
        return next(new Error('Error updating the user. ' + err.message));
      }

      res.sendStatus(200);
      next();
    });
  });

  // Error handling.
  app.use((err, req, res, next) => {
    if (err && err.message) {
      console.log('Error: ' + err.message);
      res.status(400).send(err.message);
    } else {
      console.log(req.url);
      res.status(500).send('Internal Server Error.');
    }

    next();
  });

  app(req, res);
}
