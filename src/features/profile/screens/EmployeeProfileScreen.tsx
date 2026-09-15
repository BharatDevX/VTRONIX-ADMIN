import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  Camera,
  CheckCircle2,
  FileText,
  User,
  Upload,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import Colors from "../../../theme/color";
import { useAuthStore } from "../../auth/store/auth.store";
import {
  getEmployeeDocuments,
  getEmployeeProfile,
  uploadEmployeeDocument,
  uploadProfileImage,
  updateEmployeeProfile,
  type EmployeeDocument,
} from "../services/employeeProfile.service";

function calculateAge(dob: string | null) {
  if (!dob) {
    return "";
  }

  const birth = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();

  const monthDifference =
    today.getMonth() - birth.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age >= 0 ? String(age) : "";
}

export default function EmployeeProfileScreen() {
  const navigation = useNavigation();
  const employee = useAuthStore((state) => state.employee);
  const setEmployee = useAuthStore((state) => state.setEmployee);

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [profileImage, setProfileImage] = useState<string | null>(
    null
  );

  const [documents, setDocuments] = useState<EmployeeDocument[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] =
    useState(false);
  const [uploadingDocument, setUploadingDocument] =
    useState<"AADHAAR" | "PAN" | null>(null);

  useEffect(() => {
    if (!employee) {
      return;
    }

    void loadProfile();
  }, [employee?.id]);

  async function loadProfile() {
    if (!employee) {
      return;
    }

    try {
      setLoading(true);

      const [profile, docs] = await Promise.all([
        getEmployeeProfile(employee.id),
        getEmployeeDocuments(employee.id),
      ]);

      setFullName(profile.full_name ?? "");
      setDob(profile.dob ?? null);
      setGender(profile.gender ?? null);

      setDocuments(docs);

      if (profile.profile_image) {
        try {
          const { supabase } = await import(
            "../../../services/supabase"
          );

          const { data } = await supabase.storage
            .from("employee-profiles")
            .createSignedUrl(
              profile.profile_image,
              60 * 60 * 24
            );

          setProfileImage(data?.signedUrl ?? null);
        } catch {
          setProfileImage(null);
        }
      }
    } catch (error) {
      Alert.alert(
        "Unable to load profile",
        error instanceof Error
          ? error.message
          : "Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function chooseProfilePhoto() {
    if (!employee) {
      return;
    }

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo access to select a profile picture."
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const uri = result.assets[0].uri;

    try {
      setUploadingProfile(true);

      setProfileImage(uri);

      const uploaded = await uploadProfileImage(
        employee.id,
        uri
      );

      setProfileImage(uploaded.signedUrl);

      setEmployee({
        ...employee,
        profile_image: uploaded.path,
      });

      Alert.alert(
        "Profile photo updated",
        "Your profile photo has been updated successfully."
      );
    } catch (error) {
      setProfileImage(null);

      Alert.alert(
        "Upload failed",
        error instanceof Error
          ? error.message
          : "Unable to upload profile photo."
      );
    } finally {
      setUploadingProfile(false);
    }
  }

  async function chooseDocument(
    documentType: "AADHAAR" | "PAN"
  ) {
    if (!employee) {
      return;
    }

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo access to select the document."
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.9,
      });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    try {
      setUploadingDocument(documentType);

      await uploadEmployeeDocument(
        employee.id,
        documentType,
        result.assets[0].uri
      );

      const updatedDocuments =
        await getEmployeeDocuments(employee.id);

      setDocuments(updatedDocuments);

      Alert.alert(
        "Document uploaded",
        `${documentType === "AADHAAR" ? "Aadhaar" : "PAN"} card uploaded successfully.`
      );
    } catch (error) {
      Alert.alert(
        "Upload failed",
        error instanceof Error
          ? error.message
          : "Unable to upload document."
      );
    } finally {
      setUploadingDocument(null);
    }
  }

  async function saveProfile() {
    if (!employee) {
      return;
    }

    if (!fullName.trim()) {
      Alert.alert(
        "Full name required",
        "Please enter your full name."
      );
      return;
    }

    try {
      setSaving(true);

      const updated = await updateEmployeeProfile(
        employee.id,
        {
          full_name: fullName.trim(),
          dob,
          gender,
        }
      );

      setEmployee({
        ...employee,
        ...updated,
      });

      Alert.alert(
        "Profile saved",
        "Your profile has been updated successfully."
      );
    } catch (error) {
      Alert.alert(
        "Unable to save",
        error instanceof Error
          ? error.message
          : "Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  const age = useMemo(
    () => calculateAge(dob),
    [dob]
  );

  const hasAadhaar = documents.some(
    (document) =>
      document.document_type === "AADHAAR"
  );

  const hasPan = documents.some(
    (document) =>
      document.document_type === "PAN"
  );

  if (!employee || loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backText}>
                ‹
              </Text>
            </Pressable>

            <View>
              <Text style={styles.headerTitle}>
                My Profile
              </Text>
              <Text style={styles.headerSubtitle}>
                Manage your employee information
              </Text>
            </View>
          </View>

          <View style={styles.profileCard}>
            <Pressable
              style={styles.avatarContainer}
              onPress={chooseProfilePhoto}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User
                    size={38}
                    color={Colors.primary}
                  />
                </View>
              )}

              <View style={styles.cameraButton}>
                <Camera
                  size={15}
                  color="#FFFFFF"
                />
              </View>

              {uploadingProfile && (
                <View style={styles.avatarLoading}>
                  <ActivityIndicator color="#FFFFFF" />
                </View>
              )}
            </Pressable>

            <Text style={styles.profileName}>
              {fullName || "Employee"}
            </Text>

            <Text style={styles.employeeId}>
              Employee ID: {employee.employee_id}
            </Text>

            <Text style={styles.designation}>
              {employee.designation}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Personal Information
            </Text>

            <Text style={styles.label}>
              Full Name
            </Text>

            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter full name"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />

            <Text style={styles.label}>
              Employee ID
            </Text>

            <TextInput
              value={employee.employee_id}
              editable={false}
              style={[
                styles.input,
                styles.disabledInput,
              ]}
            />

            <Text style={styles.label}>
              Date of Birth
            </Text>

            <Pressable
              style={styles.input}
              onPress={() =>
                setShowDatePicker(true)
              }
            >
              <Text
                style={
                  dob
                    ? styles.inputText
                    : styles.placeholderText
                }
              >
                {dob
                  ? new Date(
                      dob
                    ).toLocaleDateString("en-IN")
                  : "Select date of birth"}
              </Text>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={
                  dob
                    ? new Date(dob)
                    : new Date(
                        new Date().setFullYear(
                          new Date().getFullYear() -
                            20
                        )
                      )
                }
                mode="date"
                maximumDate={new Date()}
                onChange={(_, selectedDate) => {
                  setShowDatePicker(false);

                  if (selectedDate) {
                    setDob(
                      selectedDate
                        .toISOString()
                        .slice(0, 10)
                    );
                  }
                }}
              />
            )}

            <Text style={styles.label}>
              Age
            </Text>

            <View
              style={[
                styles.input,
                styles.disabledInput,
              ]}
            >
              <Text style={styles.inputText}>
                {age
                  ? `${age} years`
                  : "Automatically calculated"}
              </Text>
            </View>

            <Text style={styles.label}>
              Sex / Gender
            </Text>

            <View style={styles.genderRow}>
              {["Male", "Female", "Other"].map(
                (option) => (
                  <Pressable
                    key={option}
                    onPress={() =>
                      setGender(option)
                    }
                    style={[
                      styles.genderButton,
                      gender === option &&
                        styles.genderButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        gender === option &&
                          styles.genderTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                )
              )}
            </View>

            <Text style={styles.label}>
              Mobile
            </Text>

            <TextInput
              value={employee.mobile}
              editable={false}
              style={[
                styles.input,
                styles.disabledInput,
              ]}
            />

            <Text style={styles.label}>
              Email
            </Text>

            <TextInput
              value={employee.email}
              editable={false}
              style={[
                styles.input,
                styles.disabledInput,
              ]}
            />

            <Pressable
              onPress={saveProfile}
              disabled={saving}
              style={[
                styles.saveButton,
                saving &&
                  styles.saveButtonDisabled,
              ]}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>
                  Save Changes
                </Text>
              )}
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Identity Documents
            </Text>

            <Text style={styles.sectionDescription}>
              Upload clear images of your official
              identity documents.
            </Text>

            <DocumentCard
              title="Aadhaar Card"
              uploaded={hasAadhaar}
              loading={
                uploadingDocument === "AADHAAR"
              }
              onPress={() =>
                chooseDocument("AADHAAR")
              }
            />

            <DocumentCard
              title="PAN Card"
              uploaded={hasPan}
              loading={
                uploadingDocument === "PAN"
              }
              onPress={() =>
                chooseDocument("PAN")
              }
            />
          </View>

          <View style={styles.securityNote}>
            <FileText
              size={20}
              color={Colors.primary}
            />

            <Text style={styles.securityText}>
              Your identity documents are stored in
              a private secure area and are not
              publicly accessible.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function DocumentCard({
  title,
  uploaded,
  loading,
  onPress,
}: {
  title: string;
  uploaded: boolean;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.documentCard}>
      <View style={styles.documentIcon}>
        <FileText
          size={22}
          color={Colors.primary}
        />
      </View>

      <View style={styles.documentInfo}>
        <Text style={styles.documentTitle}>
          {title}
        </Text>

        <View style={styles.documentStatus}>
          {uploaded ? (
            <>
              <CheckCircle2
                size={15}
                color="#16A34A"
              />

              <Text
                style={styles.uploadedText}
              >
                Uploaded
              </Text>
            </>
          ) : (
            <Text style={styles.pendingText}>
              Not uploaded
            </Text>
          )}
        </View>
      </View>

      <Pressable
        onPress={onPress}
        disabled={loading}
        style={styles.uploadButton}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
          />
        ) : (
          <>
            <Upload
              size={16}
              color="#FFFFFF"
            />

            <Text style={styles.uploadButtonText}>
              {uploaded
                ? "Replace"
                : "Upload"}
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.border,
  },

  backText: {
    fontSize: 34,
    lineHeight: 34,
    color: Colors.primary,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: Colors.black,
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: Colors.gray500,
  },

  profileCard: {
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 3,
  },

  avatarContainer: {
    position: "relative",
    width: 112,
    height: 112,
    marginBottom: 14,
  },

  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },

  avatarPlaceholder: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF4FF",
    borderWidth: 3,
    borderColor: "#D7EAFB",
  },

  cameraButton: {
    position: "absolute",
    right: 0,
    bottom: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  avatarLoading: {
    position: "absolute",
    inset: 0,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  profileName: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.black,
  },

  employeeId: {
    marginTop: 5,
    fontSize: 13,
    color: Colors.gray500,
  },

  designation: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.black,
    marginBottom: 5,
  },

  sectionDescription: {
    fontSize: 13,
    color: Colors.gray500,
    lineHeight: 19,
    marginBottom: 16,
  },

  label: {
    marginTop: 15,
    marginBottom: 7,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.secondary,
  },

  input: {
    minHeight: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "#FBFDFF",
    paddingHorizontal: 14,
    justifyContent: "center",
    fontSize: 15,
    color: Colors.black,
  },

  inputText: {
    color: Colors.black,
    fontSize: 15,
  },

  placeholderText: {
    color: "#94A3B8",
    fontSize: 15,
  },

  disabledInput: {
    backgroundColor: "#F1F5F9",
    color: "#64748B",
  },

  genderRow: {
    flexDirection: "row",
    gap: 8,
  },

  genderButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FBFDFF",
  },

  genderButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  genderText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.secondary,
  },

  genderTextActive: {
    color: "#FFFFFF",
  },

  saveButton: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    backgroundColor: Colors.primary,
  },

  saveButtonDisabled: {
    opacity: 0.65,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  documentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    marginTop: 12,
    borderRadius: 17,
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: "#DCEBFA",
  },

  documentIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF4FF",
  },

  documentInfo: {
    flex: 1,
    marginLeft: 11,
  },

  documentTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.secondary,
  },

  documentStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },

  uploadedText: {
    fontSize: 12,
    color: "#16A34A",
    fontWeight: "700",
  },

  pendingText: {
    fontSize: 12,
    color: Colors.gray500,
  },

  uploadButton: {
    minWidth: 82,
    height: 38,
    paddingHorizontal: 10,
    borderRadius: 11,
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
  },

  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  securityNote: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    padding: 15,
    borderRadius: 17,
    backgroundColor: "#EAF4FF",
  },

  securityText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: "#34506B",
  },
});