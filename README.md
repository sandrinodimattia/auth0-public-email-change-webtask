# Auth0 - Change User Email Webtask

The Auth0 Management API only allows changing a user's email address from your backend (using an API token). This webtask is a proxy for the management API that allows users to change their passwords from the client side (by using a valid "user token" issued by Auth0).

## Deployment

```
npm i -g wt-cli
wt init
wt create https://raw.githubusercontent.com/sandrinodimattia/auth0-public-email-change-webtask/master/task.js \
    --name change-email \
    --secret AUTH0_API_TOKEN="YOUR_API2_TOKEN" \
    --secret AUTH0_CONNECTION="NAME_OF_THE_DB_CONNECTION" \
    --secret AUTH0_DOMAIN="YOUR_AUTH0_DOMAIN" \
    --secret AUTH0_CLIENT_ID="YOUR_AUTH0_CLIENT_ID" \
    --secret AUTH0_CLIENT_SECRET="YOUR_AUTH0_CLIENT_SECRET"
    --no-parse
```

> Note: The Auth0 API token must have user update permissions.

## Usage

Once the Webtask has been deployed, you can call it with the user's token:

```
POST https://webtask.it.auth0.com/api/run/{YOUR_CONTAINER_NAME}/change-email
Authorization: Bearer eyJ0eXAiOiJKV1Q...
Content-Type: application/json

{
    "email": "me@my-other-emailaddress.com",
    "connection": "Username-Password-Authentication"
}
```

> Tip: To quickly get a token you can use the [Resource Owner endpoint](https://auth0.com/docs/auth-api#!#post--oauth-ro).
