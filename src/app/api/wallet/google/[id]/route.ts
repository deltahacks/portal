import { env } from "../../../../../env/server.mjs";
import path from "path";
import { google, walletobjects_v1 } from "googleapis";
import jwt from "jsonwebtoken";

import { assert } from "../../../../../utils/assert";
import { DH11Application, User } from "@prisma/client";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const issuerId = "3388000000022980027";
  const classId = "deltahacks";
  const userId = (await params).id;

  const user = await prisma?.user.findFirst({
    where: {
      id: userId,
    },
    include: {
      DH11Application: true,
    },
  });

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  let classExists = false;
  try {
    await client.eventticketclass.get({
      resourceId: `${issuerId}.${classId}`,
    });
    classExists = true;
  } catch (err: any) {
    if (!err.response || err.response.status !== 404) {
      return new Response("Error checking event ticket class", { status: 500 });
    }
  }

  const eventTicketClass = createClass(issuerId, classId);
  if (classExists) {
    try {
      await client.eventticketclass.update({
        resourceId: `${issuerId}.${classId}`,
        requestBody: eventTicketClass,
      });
    } catch (err) {
      console.error("Error updating event ticket class:", err);
      return new Response("Error updating event ticket class", {
        status: 500,
      });
    }
  } else {
    try {
      await client.eventticketclass.insert({
        requestBody: eventTicketClass,
      });
    } catch (err) {
      console.error("Error creating event ticket class:", err);
      return new Response("Error creating event ticket class", {
        status: 500,
      });
    }
  }

  let objectExists = false;
  try {
    await client.eventticketobject.get({
      resourceId: `${issuerId}.${userId}`,
    });
    objectExists = true;
  } catch (err: any) {
    if (!err.response || err.response.status !== 404) {
      return new Response("Error checking event ticket object", {
        status: 500,
      });
    }
  }

  const newObject = createObject(issuerId, classId, user);
  if (objectExists) {
    try {
      await client.eventticketobject.update({
        resourceId: `${issuerId}.${userId}`,
        requestBody: newObject,
      });
    } catch (err) {
      console.error("Error updating event ticket object:", err);
      return new Response("Error updating event ticket object", {
        status: 500,
      });
    }
  } else {
    try {
      await client.eventticketobject.insert({
        requestBody: newObject,
      });
    } catch (err) {
      console.error("Error creating pass:", err);
      return new Response("Error creating pass", { status: 500 });
    }
  }

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

const auth = new google.auth.GoogleAuth({
  // scans for this file in the project root
  keyFile: "google-wallet-service-key.json",
  scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
});

const client = google.walletobjects({
  version: "v1",
  auth,
});

function createClass(
  issuerId: string,
  classId: string
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
          value: "DeltaHacks XII Logo",
        },
      },
    },
    reviewStatus: "UNDER_REVIEW",
    hexBackgroundColor: "#5F33B8",
    eventName: {
      defaultValue: {
        language: "en-US",
        value: "DeltaHacks XII",
      },
    },
    eventId: "deltahacks-xii",
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
    dateTime: {
      doorsOpen: "2026-01-11T13:00:00Z",
      start: "2026-01-11T13:00:00Z",
      end: "2026-01-13T23:00:00Z",
    },
    locations: [
      {
        latitude: 43.2638001,
        longitude: 79.9217917,
      },
    ],
  };
}

function createObject(
  issuerId: string,
  classId: string,
  user: User & { DH11Application: DH11Application | null }
): walletobjects_v1.Schema$EventTicketObject {
  return {
    id: `${issuerId}.${user.id}`,
    classId: `${issuerId}.${classId}`,
    state: "ACTIVE",
    barcode: {
      type: "QR_CODE",
      value: `${env.NEXT_PUBLIC_URL}/profile/${user.id}`,
    },
    locations: [
      {
        latitude: 37.424015499999996,
        longitude: -122.09259560000001,
      },
    ],
    ticketHolderName: `${user.DH11Application?.firstName} ${user.DH11Application?.lastName}`,
  };
}
