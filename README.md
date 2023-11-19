## How to run

- Install `MySql` server
- Create `.env` file in project root with with next fields
  - `TOKEN` - telegram api token, you can receive it from `BotFather`
  - `DB_NAME` - `MySql` database name
  - `DB_TEST_NAME` - database name for `jest` tests
  - `DB_USERNAME` - database username
  - `DB_PASSWORD` - database password
  - `PORT` - express port for server
  - `ADMIN_CHAT_ID` - `chat_id` for procedural alerts
  - `WEBHOOK_LISTENER_PORT` - port for `telegram` express server
  - `URL` - `URL` for webhook, concatenated with `/tghook/bot`,suffix by default
- Configure `nginx`
  - Add location for `process.env.URL` + `/tghook/bot${token}` and process requests by `http://127.0.0.1:` + `process.env.WEBHOOK_LISTENER_PORT`
