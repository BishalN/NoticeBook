export const APP_TITLE = "NoticeBook";
export const DATABASE_PREFIX = "yb";
export const EMAIL_SENDER = '"noticebook" <noreply@noticebook.com>';

export const redirects = {
  toLogin: "/login",
  toSignup: "/signup",
  afterLogin: "/dashboard",
  afterLogout: "/",
  toVerify: "/verify-email",
  afterVerify: "/dashboard",
} as const;
