import * as posthogModule from "posthog-node";

let posthogClient: any = null;

export function getPostHogClient(): any {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (!token) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured",
      );
    }
    return null;
  }

  const PHClass = (posthogModule as any).PostHog || (posthogModule as any).default?.PostHog || posthogModule.default;

  posthogClient ??= new PHClass(token, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
  return posthogClient;
}
