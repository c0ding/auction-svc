# Referral

This is a small server that can get the user referral code based on their account address.

## Development

### Environment

* Nodejs v14.17.6
* Yarn v2.4.2

### Start server

The following command is used to start server only at local.

```
# 2
yarn start
```

If you want to setup a server with a database, please using docker to start them together.

```
docker-compose up --remove-orphans
```

then the server is listening at `http://localhost:3000`.

### Test

The following command is used to run all the unit test.

```
yarn test
```

### Lint

The following command is used to check the code style.

```
yarn lint
```

### Migrate(For prd)

Please give all the env of postgres to specific the database connection.

  ```sh
  # Example
  POSTGRES_DB_NAME=polkadot-auction-dev POSTGRES_DB_PORT=5432 POSTGRES_DB_HOST=postgres POSTGRES_DB_USER=root POSTGRES_DB_PASSWORD=password yarn migrate
  ```

### Launch and Shutdown(For dev)

The following command is used to quick start and end the development service.

```sh
yarn launch-dev
yarn shutdown-dev
```


## Database

### Run a mongodb locally

1. Run `docker-compose run -p 27017:27017 mongodb`.
   It will spin the MongoDB latest version (currently 4.x.x version), expose port to host at 27017. 
2. Run `docker exec -it <docker-container-id/docker-container-name> bash` to login to the mongo db container, where you can exec any mongodb command

### Run a postgresql locally

1. Run `docker-compose run -p 5432:5432 postgres`.
   It will spin the PostgreSQL 14, expose port to host at 5432.

## Usage

| endpoint                              | description                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| POST /referral                        | body: {address: "string"}. When calling this endpoint, if the referral info exists, it will return the referralCode which starts with "0x" and has a length of 66 in total. If the referral doesn't exist, it will save the address along with a generated referralCode and return the referralCode. The address is mandatory and should not be empty. |
| GET /referral/:referralCode/check     | This endpoint validates the referral code in the params to see if it is valid. It will return 200 with the found referral code and address when the referral code is valid, otherwise it will return 404 status with not found message.                                                                                                                |
| GET /referral/:address/heiko-bonus    | This endpoint return a sum of the KSM contributions submitted where there is a referral code linked. If we win, referrers and referees will both be rewarded with a 5% bonus $HKO tokens based on every KSM contributed.                                                                                                                               |
| GET /crowdloan/polkadot/contributions | This endpoint return the contributions of polkadot grouped by the paraId                                                                                                                                                                                                                                                                           |
| GET /crowdloan/total-value            | This endpoint return the total value contributed.                                                                                                                                    
| GET /crowdloan/historical-tvl         | This endpoint return the historical TVL of Parallel Finance.                                                                                                                                                              |
| GET /crowdloan/marketshare            | {account: "string"} returns the Market Share related to a specific account                                                                                                                   |