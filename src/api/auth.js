import axios from 'axios';

const authClient = axios.create({
  baseURL: 'https://api.escuelajs.co/api/v1',
  timeout: 15000,
});

function getApiMessage(error, fallback) {
  const message = error.response?.data?.message;

  if (Array.isArray(message)) {
    return message.join(' ');
  }

  return message || error.response?.data?.error || error.message || fallback;
}

function sanitizeProfile(profile) {
  if (!profile) {
    return profile;
  }

  const { password, ...safeProfile } = profile;
  return safeProfile;
}

export async function loginUser({ email, password }) {
  try {
    const { data: tokens } = await authClient.post('/auth/login', {
      email,
      password,
    });

    const { data: profile } = await authClient.get('/auth/profile', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    return {
      tokens,
      profile: sanitizeProfile(profile),
    };
  } catch (error) {
    throw new Error(getApiMessage(error, 'Unable to log in'));
  }
}

export async function registerUser({ name, email, password }) {
  try {
    // This public demo API stores example users and passwords in plain text.
    // Keep this isolated so it can be replaced by a real auth provider later.
    await authClient.post('/users/', {
      name,
      email,
      password,
      avatar: `https://i.pravatar.cc/300?u=${encodeURIComponent(email)}`,
    });

    return loginUser({ email, password });
  } catch (error) {
    throw new Error(getApiMessage(error, 'Unable to create account'));
  }
}
