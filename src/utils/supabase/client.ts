import { createBrowserClient } from '@supabase/ssr'

const createRecursiveProxy = (): any => {
  return new Proxy(() => {}, {
    get(target, prop) {
      if (prop === 'then') {
        return (resolve: any) => resolve({ data: null, error: null });
      }
      return createRecursiveProxy();
    },
    apply() {
      return createRecursiveProxy();
    }
  });
};

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (typeof window === 'undefined') {
      console.warn("Supabase environment variables are missing during SSR/build. Using dummy proxy client.");
      return createRecursiveProxy();
    }
    throw new Error("Supabase environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.");
  }

  return createBrowserClient(url, anonKey)
}
