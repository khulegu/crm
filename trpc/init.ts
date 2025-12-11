import { auth } from '@/lib/auth';
import { initTRPC } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { cache } from 'react';
import superjson from 'superjson';

export const createTRPCContext = cache(async (opts: FetchCreateContextFnOptions) => {
  const session = await auth.api.getSession({
    headers: opts.req.headers as HeadersInit,
  })

  return {
    user: session?.user,
  };
});

export const createServerContext = async () => {
  const session = await auth.api.getSession();
  return { user: session?.user };
};


export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
