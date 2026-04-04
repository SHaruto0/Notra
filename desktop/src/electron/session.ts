export const session = {
  user_id: null as string | null,
  username: null as string | null,
  accessToken: null as string | null,
  isLoggedIn: false as boolean,
};

export function clearSession() {
  session.user_id = null;
  session.username = null;
  session.accessToken = null;
  session.isLoggedIn = false;
}
