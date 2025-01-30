// app/api/webhooks/clerk/route.ts
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { Webhook } from 'svix';

// Your webhook secret from Clerk Dashboard
const webhookSecret = process.env.WEBHOOK_SECRET;

export async function POST(req: Request) {
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  
  if (eventType === 'user.created') {
    const { id, email_addresses, ...attributes } = evt.data;
    
    // Example: Create user in your database
    try {
      // Add your database logic here
      // Example with Prisma:
      // await prisma.user.create({
      //   data: {
      //     clerkId: id,
      //     email: email_addresses[0].email_address,
      //     // ... other fields
      //   }
      // });
      
      console.log('User created:', id);
    } catch (err) {
      console.error('Error syncing user:', err);
      return new Response('Error syncing user', { status: 500 });
    }
  }

  // Handle other event types
  else if (eventType === 'user.updated') {
    // Handle user update
    const { id, email_addresses, ...updates } = evt.data;
    // Update user in your database
  }
  
  else if (eventType === 'user.deleted') {
    // Handle user deletion
    const { id } = evt.data;
    // Delete user from your database
  }

  return new Response('Webhook received', { status: 200 });
}