import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(req: Request) {
  // Vérification de la signature du webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Récupération de l'événement
  const payload = await req.json();
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Gestion des événements
  const evt = payload as WebhookEvent;

  switch (evt.type) {
    case 'user.created':
      // Création d'un nouvel agent dans Supabase
      const { id, email_addresses, first_name, last_name } = evt.data;
      
      await supabase.from('agents').insert({
        clerk_id: id,
        email: email_addresses[0]?.email_address,
        first_name: first_name,
        last_name: last_name,
        created_at: new Date().toISOString()
      });
      
      break;

    case 'user.deleted':
      // Suppression de l'agent dans Supabase
      await supabase
        .from('agents')
        .delete()
        .match({ clerk_id: evt.data.id });
      
      break;
  }

  return new NextResponse('Webhook received', { status: 200 });
} 