import { supabase } from "../../../services/supabase";

export interface EmployeeProfile {
  id: string;
  employee_id: string;
  full_name: string;
  designation: string;
  branch: string;
  mobile: string;
  email: string;
  dob: string | null;
  gender: string | null;
  profile_image: string | null;
}

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_type: "AADHAAR" | "PAN";
  storage_path: string;
  created_at: string;
  updated_at: string;
}

/**
 * Resolves an employee's stored `profile_image` value into a URL that
 * <Image> can actually load.
 *
 * `profile_image` is saved as a storage PATH (e.g. "emp123/profile.jpg"),
 * not a public URL, so it must be exchanged for a signed URL before use.
 * This is safe to call anywhere (Home, Profile, lists, etc.) so every
 * screen resolves the image the same way.
 */
export async function resolveProfileImageUrl(
  profileImage: string | null | undefined
): Promise<string | null> {
  if (!profileImage) {
    return null;
  }

  // Already a full URL (e.g. old seed/demo data) — use as-is.
  if (profileImage.startsWith("http://") || profileImage.startsWith("https://")) {
    return profileImage;
  }

  try {
    const { data, error } = await supabase.storage
      .from("employee-profiles")
      .createSignedUrl(profileImage, 60 * 60 * 24);

    if (error) {
      throw error;
    }

    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}

export async function getEmployeeProfile(employeeId: string) {
  const { data, error } = await supabase
    .from("employees")
    .select(
      "id, employee_id, full_name, designation, branch, mobile, email, dob, gender, profile_image"
    )
    .eq("id", employeeId)
    .single();

  if (error) {
    throw error;
  }

  return data as EmployeeProfile;
}

export async function updateEmployeeProfile(
  employeeId: string,
  payload: {
    full_name: string;
    dob: string | null;
    gender: string | null;
  }
) {
  const { data, error } = await supabase
    .from("employees")
    .update({
      full_name: payload.full_name,
      dob: payload.dob,
      gender: payload.gender,
    })
    .eq("id", employeeId)
    .select(
      "id, employee_id, full_name, designation, branch, mobile, email, dob, gender, profile_image"
    )
    .single();

  if (error) {
    throw error;
  }

  return data as EmployeeProfile;
}

export async function uploadProfileImage(
  employeeId: string,
  uri: string
) {
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const path = `${employeeId}/profile.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("employee-profiles")
    .upload(path, arrayBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: signedUrlData, error: signedUrlError } =
    await supabase.storage
      .from("employee-profiles")
      .createSignedUrl(path, 60 * 60 * 24 * 7);

  if (signedUrlError) {
    throw signedUrlError;
  }

  const { error: updateError } = await supabase
    .from("employees")
    .update({
      profile_image: path,
    })
    .eq("id", employeeId);

  if (updateError) {
    throw updateError;
  }

  return {
    path,
    signedUrl: signedUrlData.signedUrl,
  };
}

export async function getEmployeeDocuments(employeeId: string) {
  const { data, error } = await supabase
    .from("employee_documents")
    .select("*")
    .eq("employee_id", employeeId);

  if (error) {
    throw error;
  }

  return (data ?? []) as EmployeeDocument[];
}

export async function uploadEmployeeDocument(
  employeeId: string,
  documentType: "AADHAAR" | "PAN",
  uri: string
) {
  const extension =
    uri.toLowerCase().endsWith(".png")
      ? "png"
      : "jpg";

  const path =
    `${employeeId}/${documentType.toLowerCase()}/${Date.now()}.${extension}`;

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const contentType =
    extension === "png"
      ? "image/png"
      : "image/jpeg";

  const { error: uploadError } = await supabase.storage
    .from("employee-documents")
    .upload(path, arrayBuffer, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data, error } = await supabase
    .from("employee_documents")
    .upsert(
      {
        employee_id: employeeId,
        document_type: documentType,
        storage_path: path,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "employee_id,document_type",
      }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as EmployeeDocument;
}

export async function getDocumentSignedUrl(
  storagePath: string
) {
  const { data, error } = await supabase.storage
    .from("employee-documents")
    .createSignedUrl(storagePath, 60 * 10);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}