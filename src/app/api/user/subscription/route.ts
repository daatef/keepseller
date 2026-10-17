import { prisma } from '@/lib/prisma'; // Your Prisma client
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    // Get the current logged-in session
    const session = await auth();

    // If no session, return 401
    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Fetch the user from Prisma using the email from the session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        plan: true,
        subscriptionStart: true,
        subscriptionEnd: true,
      },
    });

    // If user not found, return 404
    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    // Return the user subscription data as JSON
    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error fetching subscription:', err);
    return new Response('Server error', { status: 500 });
  }
}