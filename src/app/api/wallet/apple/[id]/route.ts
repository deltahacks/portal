import { PKPass } from "passkit-generator";
import { promises as fs } from "fs";
import { env } from "@/env";
import { db } from "@/server/db";
import path from "path";
// async function readFileToBuffer(filePath: string): Promise<Buffer> {
//   try {
//     const buffer = await fs.readFile(filePath);
//     console.log("File buffer:", buffer);
//     return buffer;
//   } catch (err) {
//     console.error("Error reading file:", err);
//     throw err;
//   }
// }

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const id = (await params).id;

  // Get details about the coupon
  const coupon = await db.coupon.findUnique({
    where: {
      id: id,
    },
  });

  if (!coupon) {
    // FIXME: Redirect to 404
    throw new Error();
  }

  console.log(coupon);

  try {
    /** Each, but last, can be either a string or a Buffer. See API Documentation for more */

    const wwdr = env.APPLE_WWDR;
    const signerCert = env.APPLE_SIGNER_CERT;
    const signerKey = env.APPLE_SIGNER_KEY;
    const signerKeyPassphrase = env.APPLE_SIGNER_KEY_PASSPHRASE;

    // const { wwdr, signerCert, signerKey, signerKeyPassphrase } = getCertificatesContentsSomehow();

    const pass = await PKPass.from(
      {
        /**
         * Note: .pass extension is enforced when reading a
         * model from FS, even if not specified here below
         */
        model: path.resolve("src/assets/sample.pass"),
        certificates: {
          wwdr,
          signerCert,
          signerKey,
          signerKeyPassphrase,
        },
      },
      {
        description: coupon.tag,

        // keys to be added or overridden
        // serialNumber: "AAGH44625236dddaffbda"
      },
    );

    // Adding some settings to be written inside pass.json
    // pass.localize("en", { ... });
    pass.setBarcodes(`${env.BASE_URL}/view/${coupon.id}`); // Random value
    pass.primaryFields.push({ key: "header", value: coupon.tag });
    pass.setExpirationDate(coupon.expireAt);

    // Generate the stream .pkpass file stream
    const dataBuffer = pass.getAsBuffer();
    return new Response(dataBuffer, {
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": "attachment; filename=pass.pkpass",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Something went wrong", { status: 500 });
  }
};
