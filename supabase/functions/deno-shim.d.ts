declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
};

declare module "https://deno.land/std@0.177.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2.110.8" {
  export interface SupabaseClient {
    auth: any;
    from: any;
  }

  export function createClient(url: string, key: string, options?: unknown): SupabaseClient;
}
