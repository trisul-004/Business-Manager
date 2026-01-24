
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isSupervisorRoute = createRouteMatcher(['/supervisor(.*)']);
const isManagerRoute = createRouteMatcher(['/manager(.*)']);

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims, redirectToSignIn } = await auth();

    // Protect dashboard routes
    if ((isSupervisorRoute(req) || isManagerRoute(req)) && !userId) {
        return redirectToSignIn();
    }

    if (userId) {
        const role = sessionClaims?.metadata?.role || "manager";
        const url = req.nextUrl.pathname;

        // Redirect from root to appropriate dashboard
        if (url === '/') {
            return NextResponse.redirect(new URL(role === 'supervisor' ? '/supervisor' : '/manager', req.url));
        }

        // If a supervisor tries to access the base manager portal, send them home
        if (role === 'supervisor' && url === '/manager') {
            return NextResponse.redirect(new URL('/supervisor', req.url));
        }

        // If a manager tries to access the supervisor portal, send them home
        if (role === 'manager' && isSupervisorRoute(req)) {
            return NextResponse.redirect(new URL('/manager', req.url));
        }
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
