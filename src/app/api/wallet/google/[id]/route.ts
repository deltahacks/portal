import { env } from "../../../../../env/server.mjs";
import { prisma } from "../../../../../server/db/client";
import { google, walletobjects_v1 } from "googleapis";
import jwt from "jsonwebtoken";

import { DH12Application, User } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../pages/api/auth/[...nextauth]";

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(env.GOOGLE_WALLET_SERVICE_KEY_JSON),
  scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
});

const client = google.walletobjects({
  version: "v1",
  auth,
});

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = (await params).id;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.id !== userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // if (!env.GOOGLE_WALLET_ISSUER_ID || !env.GOOGLE_WALLET_CLASS_ID) {
  //   return new Response("Google wallet issuer ID or class ID is not set", {
  //     status: 500,
  //   });
  // }

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    include: {
      DH12Application: true,
    },
  });

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  const eventTicketClass = createClass(
    env.GOOGLE_WALLET_ISSUER_ID,
    env.GOOGLE_WALLET_CLASS_ID,
  );

  await syncClass(eventTicketClass);

  const newObject = createObject(
    env.GOOGLE_WALLET_ISSUER_ID,
    env.GOOGLE_WALLET_CLASS_ID,
    user,
  );

  await syncObject(newObject, userId);

  const credentials = await auth.getCredentials();
  const jwtClaims = {
    iss: credentials.client_email,
    aud: "google",
    origins: [env.NEXTAUTH_URL],
    typ: "savetowallet",
    payload: {
      eventTicketClasses: [eventTicketClass],
      eventTicketObjects: [newObject],
    },
  };

  assert(credentials.private_key, "Private key is required");
  let token = jwt.sign(jwtClaims, credentials.private_key, {
    algorithm: "RS256",
  });

  return Response.redirect(`https://pay.google.com/gp/v/save/${token}`, 302);
}

async function syncClass(
  walletClass: walletobjects_v1.Schema$EventTicketClass,
) {
  let classExists = false;
  try {
    await client.eventticketclass.get({
      resourceId: `${env.GOOGLE_WALLET_ISSUER_ID}.${env.GOOGLE_WALLET_CLASS_ID}`,
    });
    classExists = true;
  } catch (err: any) {
    if (!err.response || err.response.status !== 404) {
      console.error(err);
      return new Response("Error checking event ticket class", { status: 500 });
    }
  }

  if (classExists) {
    try {
      await client.eventticketclass.update({
        resourceId: `${env.GOOGLE_WALLET_ISSUER_ID}.${env.GOOGLE_WALLET_CLASS_ID}`,
        requestBody: walletClass,
      });
    } catch (err) {
      console.log(err);
      return new Response("Error updating event ticket class", {
        status: 500,
      });
    }
  } else {
    try {
      await client.eventticketclass.insert({
        requestBody: walletClass,
      });
    } catch (err) {
      return new Response("Error creating event ticket class", {
        status: 500,
      });
    }
  }
}

function createClass(
  issuerId: string,
  classId: string,
): walletobjects_v1.Schema$EventTicketClass {
  return {
    id: `${issuerId}.${classId}`,
    issuerName: "DeltaHacks",
    multipleDevicesAndHoldersAllowedStatus: "ONE_USER_ONE_DEVICE",
    countryCode: "CA",
    logo: {
      sourceUri: {
        uri: "https://i.imgur.com/OynK4zp_d.webp?maxwidth=760&fidelity=grand",
      },
      contentDescription: {
        defaultValue: {
          language: "en-US",
          value: "DeltaHacks 12 Logo",
        },
      },
    },
    reviewStatus: "UNDER_REVIEW",
    hexBackgroundColor: "#5F33B8",
    eventName: {
      defaultValue: {
        language: "en-US",
        value: "DeltaHacks 12",
      },
    },
    eventId: "deltahacks-12",
    venue: {
      name: {
        defaultValue: {
          language: "en-US",
          value: "Peter George Centre for Living and Learning",
        },
      },
      address: {
        defaultValue: {
          language: "en-US",
          value: "1280 Main St W, Hamilton, ON L8S 4L8, Canada",
        },
      },
    },
    // Datetimes are written in UTC but on an android emulator they are
    // displayed as the UTC time in the local timezone.
    // So Android Emulator in EST would be at doorsOpen: 8 AM
    dateTime: {
      doorsOpen: "2026-01-10T08:00:00.000Z",
      start: "2026-01-10T08:00:00.000Z",
      end: "2026-01-11T18:00:00.000Z",
    },
    locations: [
      {
        latitude: 43.2638001,
        longitude: -79.9217917,
      },
    ],
  };
}

// Updates occur only if the user attempts to download their wallet
// again
async function syncObject(
  walletObject: walletobjects_v1.Schema$EventTicketObject,
  userId: string,
) {
  let objectExists = false;
  try {
    await client.eventticketobject.get({
      resourceId: `${env.GOOGLE_WALLET_ISSUER_ID}.${userId}`,
    });
    objectExists = true;
  } catch (err: any) {
    if (!err.response || err.response.status !== 404) {
      return new Response("Error checking event ticket object", {
        status: 500,
      });
    }
  }
  if (objectExists) {
    try {
      await client.eventticketobject.update({
        resourceId: `${env.GOOGLE_WALLET_ISSUER_ID}.${userId}`,
        requestBody: walletObject,
      });
    } catch (err) {
      return new Response("Error updating event ticket object", {
        status: 500,
      });
    }
  } else {
    try {
      await client.eventticketobject.insert({
        requestBody: walletObject,
      });
    } catch (err) {
      return new Response("Error creating pass", { status: 500 });
    }
  }
}

function createObject(
  issuerId: string,
  classId: string,
  user: User & { DH12Application: DH12Application | null },
): walletobjects_v1.Schema$EventTicketObject {
  return {
    id: `${issuerId}.${user.id}`,
    classId: `${issuerId}.${classId}`,
    state: "ACTIVE",
    barcode: {
      type: "QR_CODE",
      value: `${env.NEXT_PUBLIC_URL}/profile/${user.id}`,
    },
    ticketHolderName: user.DH12Application
      ? `${user.DH12Application.firstName} ${user.DH12Application.lastName}`.trim()
      : (user.name ?? user.email ?? "Attendee"),
  };
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
