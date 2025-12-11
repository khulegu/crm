import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { initTRPC } from '@trpc/server';
import type { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { cache } from 'react';
import superjson from 'superjson';

export const createTRPCContext = cache(async (opts: CreateNextContextOptions) => {
  const session = auth.api.getSession({
    headers: opts.req.headers as HeadersInit,
  })

  return {
    db,
    session,
  };
});

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
