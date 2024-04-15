export const APP_TITLE = "NoticeBook";
// TODO: change it to noticebook
export const DATABASE_PREFIX = "nbc";
export const EMAIL_SENDER = '"noticebook" <noreply@noticebook.com>';

export const redirects = {
  toLogin: "/login",
  toSignup: "/signup",
  afterLogin: "/dashboard",
  afterLogout: "/",
  toVerify: "/verify-email",
  afterVerify: "/dashboard",
} as const;
