export const session = {
  userId: null as string | null,
  username: null as string | null,
  accessToken: null as string | null,
  isLoggedIn: false as boolean,
};

export function clearSession() {
  session.userId = null;
  session.username = null;
  session.accessToken = null;
  session.isLoggedIn = false;
}
