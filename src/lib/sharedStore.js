const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const storageKeys = {
  users: 'users',
  threads: 'nihon_threads',
  dictionary: 'nihon_dict',
  roleplay: 'nihon_role'
};

const apiPaths = {
  threads: '/community-api/threads',
  dictionary: '/community-api/dictionary',
  roleplay: '/community-api/roleplay'
};

function localKey(key) {
  return storageKeys[key] || key;
}

function readLocal(key, fallback) {
  const raw = localStorage.getItem(localKey(key));
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeLocal(key, value) {
  localStorage.setItem(localKey(key), JSON.stringify(value));
}

async function readSupabase(key) {
  const url = `${SUPABASE_URL}/rest/v1/app_state?key=eq.${encodeURIComponent(key)}&select=value`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  if (!res.ok) throw new Error(`Supabase read ${res.status}`);
  const rows = await res.json();
  return rows[0]?.value;
}

async function writeSupabase(key, value) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/app_state`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify({ key, value })
  });
  if (!res.ok) throw new Error(`Supabase write ${res.status}`);
}

async function readLocalApi(key) {
  const path = apiPaths[key];
  if (!path) return undefined;
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Local API read ${res.status}`);
  return res.json();
}

async function writeLocalApi(key, value) {
  const path = apiPaths[key];
  if (!path) return;
  const res = await fetch(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value)
  });
  if (!res.ok) throw new Error(`Local API write ${res.status}`);
}

export async function getSharedArray(key, fallback = []) {
  try {
    if (isSupabaseEnabled) {
      const value = await readSupabase(key);
      if (Array.isArray(value)) {
        writeLocal(key, value);
        return value;
      }
    }
  } catch {
    // Continue to local API/localStorage fallback.
  }

  try {
    const value = await readLocalApi(key);
    if (Array.isArray(value)) {
      writeLocal(key, value);
      return value;
    }
  } catch {
    // Continue to localStorage fallback.
  }

  const value = readLocal(key, fallback);
  writeLocal(key, value);
  return value;
}

export async function setSharedArray(key, value) {
  writeLocal(key, value);

  try {
    if (isSupabaseEnabled) {
      await writeSupabase(key, value);
      return 'supabase';
    }
  } catch {
    // Continue to local API fallback.
  }

  try {
    await writeLocalApi(key, value);
    return 'local-api';
  } catch {
    return 'local';
  }
}

export async function seedSharedArray(key, fallback = []) {
  const value = await getSharedArray(key, fallback);
  if (Array.isArray(value) && value.length > 0) {
    let merged = [...value];
    let changed = false;
    for (const item of fallback) {
      const existingIdx = value.findIndex(existing => existing.id === item.id);
      if (existingIdx === -1) {
        merged.push(item);
        changed = true;
      } else {
        const existing = value[existingIdx];
        let hasDiff = false;
        
        // Dictionary-specific fields check
        if (
          existing.titleJp !== item.titleJp ||
          existing.titleVi !== item.titleVi ||
          existing.category !== item.category
        ) {
          hasDiff = true;
        }
        
        // Roleplay-specific fields check
        if (
          existing.title !== item.title ||
          existing.description !== item.description
        ) {
          hasDiff = true;
        }
        
        // Check options change
        if (Array.isArray(existing.options) && Array.isArray(item.options)) {
          if (existing.options.length !== item.options.length) {
            hasDiff = true;
          } else {
            for (let oIdx = 0; oIdx < item.options.length; oIdx++) {
              if (
                existing.options[oIdx]?.text !== item.options[oIdx]?.text ||
                existing.options[oIdx]?.isCorrect !== item.options[oIdx]?.isCorrect ||
                existing.options[oIdx]?.explanation !== item.options[oIdx]?.explanation
              ) {
                hasDiff = true;
                break;
              }
            }
          }
        }
        
        if (hasDiff) {
          merged[existingIdx] = { ...existing, ...item };
          changed = true;
        }
      }
    }
    if (changed) {
      await setSharedArray(key, merged);
      return merged;
    }
    return value;
  }
  await setSharedArray(key, fallback);
  return fallback;
}

export async function uploadFileToSupabase(blob, fileName) {
  if (!isSupabaseEnabled) {
    throw new Error('Supabase is not configured. Falling back to local storage.');
  }

  // Tries to upload to 'images' bucket
  const bucketName = 'images';
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucketName}/${fileName}`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': blob.type,
      'x-upsert': 'true'
    },
    body: blob
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Supabase Storage upload failed (${response.status}): ${errText}`);
  }

  // Return public URL
  return `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/${fileName}`;
}

export async function deleteFileFromSupabase(fileName) {
  if (!isSupabaseEnabled) return;
  const bucketName = 'images';
  const deleteUrl = `${SUPABASE_URL}/storage/v1/object/${bucketName}`;
  try {
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prefixes: [fileName] })
    });
    if (!response.ok) {
      const errText = await response.text();
      console.warn(`Supabase Storage delete failed (${response.status}): ${errText}`);
    }
  } catch (error) {
    console.error('Error deleting file from Supabase storage:', error);
  }
}

export function extractFileNameFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const marker = '/storage/v1/object/public/images/';
  const index = url.indexOf(marker);
  if (index !== -1) {
    return url.substring(index + marker.length);
  }
  return null;
}

export async function deleteFileByUrlFromSupabase(url) {
  const fileName = extractFileNameFromUrl(url);
  if (fileName) {
    await deleteFileFromSupabase(fileName);
  }
}
