# DeltaHacks Portal

<div>

![](/Cover.png)

DeltaHacks is an annual, 36-hour hackathon hosted at McMaster University. This is the official portal for DeltaHacks 2022. It is the successor to the [DeltaHacks 'My' Portal](https://github.com/deltahacks/my.Deltahacks) which was in use for the previous three years.

## Philosophy

In the past, the DeltaHacks team has used a variety of different tools to manage the hackathon. This included creating, updating and maintaining several dashboards for hackers, volunteers, judges, sponsers. This year, we are taking a different approach. We are building a single, unified portal that will be used by all of the different groups. This will allow us to have a single source of truth for all of the data and will allow us to build a more cohesive experience for all of the different groups.

## Features / Roadmap

- [x] OAuth2 Authentication
- [x] Hacker Applications
- [x] Attendee Acceptence Dashboard
- [ ] Administration Dashboard
- [ ] Judging Portal
- [ ] Sponsor Portal
- [x] QR Code encoded meal tickets

## The Stack

We follow the T3 stack (and axioms) for this project, using:

- Next.JS
- TailwindCSS
- Typescript
- Prisma
- tRPC
- Next-Auth

Additionally, we use PaaS service providers such as Netlify and CockroachDB for hosting to simplify our development cycle.

## Getting Started

To get started developing, clone the repository, setup an `.env` file based on the `.env-example` file and use the following commands:

```bash
# Install dependencies
npm install

# Initialize database
npx prisma db generate
npx prisma db push

# To migrate DB, run
npx prisma migrate deploy

# To Build / Run the project

npm run dev # Start the development server
npm run build # Build the project
```

We recommend using [VSCode](https://code.visualstudio.com/) with the [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) and [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extensions for development.

## Contributors

<!-- Auto generated contributors image -->

![https://github.com/deltahacks/portal/graphs/contributors](https://contrib.rocks/image?repo=deltahacks/portal)

## Get In Touch

To get in touch, please open an issue or contact us at [hello@deltahacks.com](mailto:hello@deltahacks.com)
