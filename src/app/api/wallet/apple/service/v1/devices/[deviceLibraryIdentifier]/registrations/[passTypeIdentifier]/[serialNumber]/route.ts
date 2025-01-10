import { z } from "zod";
// TODO: FIX THIS ARIAN

const pathParamsSchema = z.object({
  deviceLibraryIdentifier: z.string(),
  passTypeIdentifier: z.string(),
  serialNumber: z.string(),
});

type PathParams = z.infer<typeof pathParamsSchema>;

const bodySchema = z.object({
  pushToken: z.string(),
});

const authSchema = z
  .string()
  .refine((v) => v.startsWith("ApplePass "))
  .transform((v) => v.slice(10));

export async function POST(
  request: Request,
  { params }: { params: Promise<PathParams> }
) {
  const data = pathParamsSchema.parse(await params);

  const { deviceLibraryIdentifier, passTypeIdentifier, serialNumber } = data;

  // @ts-ignore
  const body = await request.json();
  const parsedBody = bodySchema.parse(body);

  const authToken = authSchema.parse(request.headers.get("Authorization"));
  console.log(authToken);

  // const authToken = await authSchema.parse(header);

  // db.appleWalletDevice;

  // 200 - Serial Number Already Registered for Device
  // 201 - Registration Successful
  // 401 - Not Authorized <- when does this happen??? no clue yet maybe you could do sth with user accounts idk

  // I FIGURED IT OUT
  // WHEN you create the pass, you have to give it a token
  // if you dont get that token back here, the request is unauthorized.
  // :brain_exploding: lol

  return new Response("Hello world");
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<PathParams> }
) {
  const v = await params; // 'a', 'b', or 'c'
  console.log(v);

  return new Response("Hello world");
}

// export const DELETE = async (request: Request, response: Response) => {};
