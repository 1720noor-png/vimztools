// Shared API Client for Vimz.ai Extension
const BASE_URL = 'https://charming-vitality-production-dd02.up.railway.app/api';

export async function getAuthToken() {
  const data = await chrome.storage.local.get('vimz_auth_token');
  return data.vimz_auth_token || null;
}

export async function setAuthToken(token) {
  if (token) {
    await chrome.storage.local.set({ vimz_auth_token: token });
  } else {
    await chrome.storage.local.remove('vimz_auth_token');
  }
}

export async function fetchCurrentUser() {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/user`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      if (res.status === 401) {
        await setAuthToken(null);
      }
      return null;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to fetch user:', err);
    return null;
  }
}

export async function loginUser(email, password) {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed. Please check your credentials.');
    }

    if (data.token) {
      await setAuthToken(data.token);
      return data.user || { email };
    }
    return null;
  } catch (err) {
    throw err;
  }
}

export async function logoutUser() {
  const token = await getAuthToken();
  if (token) {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (e) {
      // Ignore network errors on logout
    }
  }
  await setAuthToken(null);
}
