import { revalidatePath } from 'next/cache';

export async function POST(request) {
  try {
    // 비밀키 검증
    const secret = request.headers.get('x-revalidate-token');
    if (secret !== process.env.REVALIDATE_SECRET) {
      return Response.json(
        { message: 'Invalid revalidation token' },
        { status: 401 }
      );
    }

    const path = request.nextUrl.searchParams.get('path') || '/';
    revalidatePath(path);
    return Response.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return Response.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
