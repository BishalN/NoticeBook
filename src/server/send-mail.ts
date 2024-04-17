import { env } from "@/env";
import { EMAIL_SENDER } from "@/lib/constants";

// import { Resend } from "resend";

// const smtpConfig = {
//   host: env.SMTP_HOST,
//   port: env.SMTP_PORT,
//   auth: {
//     user: env.SMTP_USER,
//     pass: env.SMTP_PASSWORD,
//   },
// };

// const transporter = createTransport(smtpConfig as TransportOptions);

// export type MessageInfo = {
//   to: string;
//   subject: string;
//   body: string;
// };

// export const sendMail = async (message: MessageInfo) => {
//   const { to, subject, body } = message;
//   const mailOptions = {
//     from: EMAIL_SENDER,
//     to,
//     subject,
//     html: body,
//   };
//   return transporter.sendMail(mailOptions);
// };

// const resend = new Resend(process.env.RESEND_API_KEY);

interface MessageInfo {
  to: string;
  subject: string;
  body: string;
}

// export const sendMail = async (message: MessageInfo) => {
//   const { to, subject, body } = message;

//   const { data, error } = await resend.emails.send({
//     from: EMAIL_SENDER,
//     to,
//     subject,
//     html: body,
//     // react: EmailTemplate({ firstName: "John" }),
//   });

//   if (error) {
//     throw new Error(error.message);
//   }

//   return data;
// };

import AWS from "aws-sdk";

AWS.config.update({
  region: env.AWS_REGION,
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
});

const ses = new AWS.SES({ apiVersion: "latest" });

export async function sendMail({ to, body, subject }: MessageInfo) {
  const params = {
    Source: EMAIL_SENDER,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Text: { Data: body } },
    },
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log("Email sent:", result.MessageId);
    return result.MessageId;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
