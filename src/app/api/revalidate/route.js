// /app/api/revalidate/route.js
import { revalidatePath } from 'next/cache';

export async function POST(request) {
  const { path, secret } = await request.json();

  if (secret !== process.env.NEXT_PUBLIC_REVALIDATE_TOKEN) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    revalidatePath(path); // 👈 이게 핵심!
    return new Response(JSON.stringify({ revalidated: true }), { status: 200 });
  } catch (err) {
    console.error('Revalidate Error:', err);
    return new Response(JSON.stringify({ error: 'Revalidation failed' }), { status: 500 });
  }
}
