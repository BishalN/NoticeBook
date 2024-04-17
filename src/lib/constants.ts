export const APP_TITLE = "NoticeBook";
export const DATABASE_PREFIX = "nb";
export const GOOGLE_CODE_VERIFIER = "something_cryptic-code-verifier";

export const EMAIL_SENDER = '"noticebook" <neupanebishal07@gmail.com>';

export const redirects = {
  toLogin: "/login",
  toSignup: "/signup",
  afterLogin: "/dashboard",
  afterLogout: "/",
  toVerify: "/verify-email",
  afterVerify: "/dashboard",
} as const;
