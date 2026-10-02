export const HR_ALLOWED_ROUTES = [
  "/employees",
  "/employee-profile",
  "/attendance",
  "/tracking",
] as const;

export const FULL_ADMIN_NAMES = [
  "er s.m. arif",
  "s.m. arif",
  "syed mohammad tayyab",
  "dr. varun shukla",
  "varun shukla",
  "hina ali",
] as const;

export const HR_ADMIN_NAMES = [
  "naseeba jabeen",
] as const;

export type AdminPermissionMode = "full" | "restricted";

export interface AdminPermissionState {
  mode: AdminPermissionMode;
  allowedRoutes: string[];
}

export function normalizeAdminName(name: string | null | undefined) {
  return (name ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function isHrAdminName(name: string | null | undefined) {
  const normalized = normalizeAdminName(name);
  return HR_ADMIN_NAMES.some((candidate) => normalized === candidate || normalized.includes(candidate));
}

export function isFullAdminName(name: string | null | undefined) {
  const normalized = normalizeAdminName(name);
  return FULL_ADMIN_NAMES.some((candidate) => normalized === candidate || normalized.includes(candidate));
}

export function fallbackPermissionsForAdmin(name: string | null | undefined): AdminPermissionState {
  // Safe compatibility fallback while the database permission rows are being
  // created. The named HR account remains restricted; the four named full
  // admins retain full access. Other existing admin accounts also retain the
  // existing full-access behavior.
  if (isHrAdminName(name)) {
    return { mode: "restricted", allowedRoutes: [...HR_ALLOWED_ROUTES] };
  }

  return { mode: "full", allowedRoutes: [] };
}

export function canAccessRoute(permission: AdminPermissionState | null, pathname: string) {
  if (!permission || permission.mode === "full") return true;

  const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  return permission.allowedRoutes.some(
    (route) => normalizedPath === route || normalizedPath.startsWith(`${route}/`),
  );
}
