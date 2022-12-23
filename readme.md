# ![Rakkas RealWorld](logo.png)

> ### Rakkas codebase containing real world examples (CRUD, auth, advanced patterns, etc.) that adheres to the [RealWorld](https://github.com/gothinkster/realworld) spec and API.

### [Demo](https://realworld.rakkasjs.org/)&nbsp;&nbsp;&nbsp;&nbsp;[RealWorld](https://github.com/gothinkster/realworld)

This codebase was created to demonstrate a fully fledged fullstack application built with **[Rakkas](https://rakkasjs.org)** including CRUD operations, authentication, routing, pagination, and more.

Head over to the [RealWorld](https://github.com/gothinkster/realworld) repo for implementations with other frontends/backends

## Deployments

See the same app is deployed on:

- [Node](https://realworld.rakkasjs.org)
- [Cloudflare Workers](https://rakkas-realworld.rakkasjs.workers.dev/)
- [Vercel Serverless Functions](https://rakkas-realworld.vercel.app/)
- [Netlify](https://rakkas-realworld.netlify.app/)
- [Deno Deploy](https://rakkas-realworld.deno.dev/)

Only the Node deployment supports authentication features because in serverless environments there is too little CPU time available for secure hashing. None-Node deployments use the Node deployment as their authentication backend.

## Getting started

After cloning the repo, install the dependencies:

```sh
pnpm install
```

Rakkas RealWorld requires some environment variables to be set for configuration:

| Variable        | Description                                                                      |
| --------------- | -------------------------------------------------------------------------------- |
| `HOST`          | Host name or address (defaults to `localhost`)                                   |
| `PORT`          | Port number (defaults to `3000`)                                                 |
| `DATABASE_URL`  | Prisma database URL (`postgresql://user:password@host/database`)                 |
| `SERVER_SECRET` | A random string used to sign the JWT                                             |
| `SALT_ROUNDS`   | Bcrypt cost factor for hashing the passwords before storing them to the database |

If you want to deploy on a serverless or edge target, you should also set the `AUTH_API` variable and point it to a Node deployment. Also, the Prisma database URL should be set to a [data proxy](https://www.prisma.io/docs/data-platform/data-proxy) URL.

For production, if your server is going to run behind a reverse proxy (as it should!), you must also add `TRUST_FORWARDED_ORIGIN=1` and configure your reverse proxy to set the headers `X-Forwarded-Proto`, `X-Forwarded-Host`, `X-Forwarded-Server`, `X-Forwarded-For` appropriately.

You can use the `pnpm run configure` script to generate a `.env` file appropriate for a development environment.

Once the environment variables are set, you should then generate the Prisma client with `pnpx prisma generate` (or `pnpx prisma generate --data-proxy`). Then you can start a dev server with `pnpm dev`.

When you're happy with the results, you can build and run a production server with these commands:

```sh
pnpm build # Build the app
pnpm start # Start production server
```

Replace the `build` command with `build:cfw`, `build:netlify`, or `build:vercel` to build for Cloudflare Workers, Netlify, or Vercel respectively. Currently the bundler issues a lot of warnings you can ignore that look like this:

```
▲ [WARNING] Ignoring this import because <file name here> was marked as having no side effects [ignored-bare-import]
```

## How it works

### Backend

#### REST API

The `src/api/_rest` directory contains an implementation of the [Conduit API spec](https://github.com/gothinkster/realworld/tree/master/api) as a set of Rakkas API routes and middleware functions. The backend uses [zod](https://github.com/colinhacks/zod) for request body validation and [Prisma](https://www.prisma.io) for database access. The current implementation uses PostgreSQL but [porting](#porting-to-other-database-systems) to another database system supported by Prisma (like MySQL/MariaDB or SQLite) is just a matter of changing a few lines.

#### Test API

The `src/api/test` folder contains a few endpoints intended to be used as testing helpers. `/api/test/ping` responds to `HEAD` requests in order to detect the time the server becomes functional before starting the tests. A `POST` request to `/api/test/reset` resets the database, it is called before starting an integration test. A `POST` request to `/api/test/populate` or `/api/test/populate-2` seeds the database with some test data and `POST /api/test/create-user` creates a user. A middleware guards these endpoints and only allows them to run when `NODE_ENV` environment variable is set to `test`.

### Frontend

The `src/pages` folder contains an implementation of [Conduit Routing guidelines](https://github.com/gothinkster/realworld/tree/master/spec#routing-guidelines) in the form of a set of Rakkas pages and layouts. There are a few components to avoid repetition and an API client library (in `src/lib/conduit-client.ts`) to facilitate API communication and error handling. Other than that it is a fairly straightforward port of the [original HTML templates](https://github.com/gothinkster/realworld-starter-kit/blob/master/FRONTEND_INSTRUCTIONS.md#layout).

One small thing that you may find strange is the use of uncontrolled form elements. Since client-side validation is not required by the specification, it is actually the easiest way to implement form functionality.

## Development

### Testing

There are three types of tests in **Rakkas RealWorld**:

| Command        | Description      |
| -------------- | ---------------- |
| pnpm test:unit | Unit tests       |
| pnpm test:api  | API tests        |
| pnpm test:e2e  | End-to-end tests |

Before running the API or end-to-end tests, you have to start a development or production server on `localhost:3000` with `NODE_ENV` environment variable set to `test`.

`pnpm test` builds and starts a server and runs all three types of tests back to back. If you're using a `.env` file, you should set it's HOST and PORT to `localhost:3000` before running the tests this way.

Since most of the **Rakkas RealWorld** core consists of either dumb view code copied and pasted from the templates or straightforward calls to some library like `zod` or `prisma`, there are few **unit tests** at the moment. They are located next to the source modules they test.

**API tests** run by sending API requests to a running server and examining the responses. They are quite extensive and test almost every case. They are located in the `api-test` directory.

**End-to-end tests** use `cypress` and they test the common interaction scenarios. They are located in the `cypress` directory.

### Porting to other database systems

Thanks to Prisma, **Rakkas RealWorld** is known to be able to run on MySQL/MariaDB or SQLite as well as on PostgreSQL. Just follow these steps:

1. Change the `provider` in the file `prisma/schema.prisma` to `mysql` or `sqlite`.
2. Remove the `prisma/migrations` directory and its contents.
3. Change the `DATABASE_URL` environment variable to a [connection URL](https://www.prisma.io/docs/reference/database-reference/connection-urls) for the target database.
4. Regenerate the Prisma client with `pnpx prisma generate`.
5. Recreate the initial migration with `pnpx prisma migrate dev`.
6. Run the [tests](#testing) to make sure everything works fine.

Porting to MongoDB or SQL Server should be similarly straightforward but it hasn't been tested.

### Connecting to a different backend

Open your browser's developer console and type the following:

```js
document.cookie =
	"apiUrl=" + encodeURIComponent("https://conduit.productionready.io/api"); // Or any other compatible backend URL
```

To use the builtin API again, just clear the cookies or run the following:

```js
document.cookie = "apiUrl=;max-age=0";
```

Obviously, login sessions will not carry between different backends.

## Credits

- Templates and design by [Thinkster](https://thinkster.io) under [MIT License](https://opensource.org/licenses/MIT).
- Rakkas port by [Fatih Aygün](https://github.com/cyco130), under [MIT License](https://opensource.org/licenses/MIT).
