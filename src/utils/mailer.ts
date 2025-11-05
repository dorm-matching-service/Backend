// src/utils/mailer.ts
import nodemailer from 'nodemailer';

const port = Number(process.env.SMTP_PORT ?? 465);
const secure = port === 465; // 465=SSL, 587=STARTTLS

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!, // smtp.gmail.com
  port,
  secure, // true if 465
  auth: {
    user: process.env.SMTP_USER!, // your_gmail@gmail.com
    pass: process.env.SMTP_PASS!, // 앱 비밀번호(16자리)
  },
});

export async function sendOtpMail(to: string, code: string) {
  const from = process.env.EMAIL_FROM ?? process.env.SMTP_USER!;
  const ttl = Number(process.env.OTP_CODE_TTL_MIN ?? 10);

  await transporter.sendMail({
    from, // Gmail은 From 스푸핑에 민감 → 송신자=SMTP_USER 권장
    to,
    subject: 'Your Knock verification code',
    text: `Your verification code is: ${code} (valid for ${ttl} minutes)`,
    html: `<p>Your verification code is: <b>${code}</b></p>
           <p>It expires in ${ttl} minutes.</p>`,
  });
}
