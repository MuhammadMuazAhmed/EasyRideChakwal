import twilio from 'twilio';

let client: ReturnType<typeof twilio> | null = null;

function getClient() {
  if (!client) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return client;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOTPExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 5); // 5 min expiry
  return expiry;
}

export function formatPakistanPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('92')) return `+${cleaned}`;
  if (cleaned.startsWith('0')) return `+92${cleaned.slice(1)}`;
  return `+92${cleaned}`;
}

export async function sendOTP(phone: string, otp: string): Promise<void> {
  const formatted = formatPakistanPhone(phone);

  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio credentials missing from environment variables.');
    }
    await getClient().messages.create({
      body: `Easy Ride Chakwal: Aapka verification code hai *${otp}*. 5 minute mein expire hoga. Kissi ke saath share mat karein.`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: formatted,
    });
    console.log(`[SMS Sent] OTP ${otp} sent to ${formatted}`);
  } catch (error: any) {
    console.error('Twilio failed to send SMS. Error details:', error.message || error);
    
    // In development mode, we log the OTP to the terminal and succeed
    // so development is not blocked by Twilio limitations/errors.
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      console.log('\n========================================');
      console.log(`[DEV MODE SMS FALLBACK]`);
      console.log(`Phone: ${formatted}`);
      console.log(`OTP Code: ${otp}`);
      console.log('========================================\n');
    } else {
      // In production, propagate the error
      throw error;
    }
  }
}
