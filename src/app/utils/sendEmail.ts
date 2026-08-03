import { Resend } from "resend";
import config from "../config";

const resend = new Resend(config.email.resendApiKey);

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  await resend.emails.send({
    from: config.email.from,
    to,
    subject,
    html,
  });
};