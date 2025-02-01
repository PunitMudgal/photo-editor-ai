/* eslint-disable camelcase */
import { clerkClient } from "@clerk/nextjs/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error("Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local");
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "No svix headers" }, { status: 400 });
  }

  // Parse request body
  let payload;
  try {
    payload = await req.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  try {
    // CREATE
    if (eventType === "user.created") {
      const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;

      const user = {
        clerkId: id,
        email: email_addresses?.[0]?.email_address || "",
        username: username ?? "User10114",
        firstName: first_name || "",
        lastName: last_name || "",
        photo: image_url || "",
      };

      const newUser = await createUser(user);

      if (newUser) {
        const clerk = await clerkClient(); 
        await clerk.users.updateUserMetadata(id, {
          publicMetadata: { userId: newUser._id },
        });
      }

      return NextResponse.json({ message: "OK", user: newUser });
    }

    // UPDATE
    if (eventType === "user.updated") {
      const { id, image_url, first_name, last_name, username } = evt.data;

      const user = {
        firstName: first_name || "",
        lastName: last_name || "",
        username: username ?? "UnknownUser",
        photo: image_url || "",
      };

      const updatedUser = await updateUser(id, user);
      return NextResponse.json({ message: "OK", user: updatedUser });
    }

    // DELETE
    if (eventType === "user.deleted") {
      if (!id) {
        return NextResponse.json({ error: "User ID missing" }, { status: 400 });
      }

      const deletedUser = await deleteUser(id);
      return NextResponse.json({ message: "OK", user: deletedUser });
    }

    console.log(`Webhook received: ID = ${id}, Type = ${eventType}`);
    console.log("Webhook body:", body);
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

  return NextResponse.json({ message: "No action taken" });
}
