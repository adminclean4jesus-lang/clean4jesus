import AsyncStorage from "@react-native-async-storage/async-storage";
import { Directory, File, Paths } from "expo-file-system";

import { getJson, setJson, storageKeys } from "@/services/storage";

type AvatarMap = Record<string, string>;

const anonymousProfileKey = "anonymous";

function profileKey(userId?: string | null) {
  return userId || anonymousProfileKey;
}

function avatarDirectory() {
  const directory = new Directory(Paths.document, "profile-avatars");
  directory.create({ idempotent: true, intermediates: true });
  return directory;
}

export async function getProfileAvatarUri(userId?: string | null) {
  const avatars = await getJson<AvatarMap>(storageKeys.profileAvatarUris, {});
  return avatars[profileKey(userId)] ?? null;
}

export async function saveProfileAvatar(sourceUri: string, userId?: string | null) {
  const key = profileKey(userId);
  const avatars = await getJson<AvatarMap>(storageKeys.profileAvatarUris, {});
  const previousUri = avatars[key];
  const source = new File(sourceUri);
  const extension = source.extension || ".jpg";
  const destination = new File(avatarDirectory(), `${key}${extension}`);

  if (destination.exists) destination.delete();
  source.copy(destination);

  if (previousUri && previousUri !== destination.uri) {
    const previous = new File(previousUri);
    if (previous.exists) previous.delete();
  }

  avatars[key] = destination.uri;
  await setJson(storageKeys.profileAvatarUris, avatars);
  await AsyncStorage.removeItem(storageKeys.profileAvatarUri);
  return destination.uri;
}

export async function removeProfileAvatar(userId?: string | null) {
  const key = profileKey(userId);
  const avatars = await getJson<AvatarMap>(storageKeys.profileAvatarUris, {});
  const uri = avatars[key];
  if (uri) {
    const file = new File(uri);
    if (file.exists) file.delete();
    delete avatars[key];
    await setJson(storageKeys.profileAvatarUris, avatars);
  }
}
