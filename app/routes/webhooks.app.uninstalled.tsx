import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate, sessionStorage } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  if (session) {
    await sessionStorage.deleteSession(session.id);
  }

  console.log(`Received ${topic} webhook for ${shop}`);
  return new Response();
};
