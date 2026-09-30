export interface CaptchaResponse {
  challengeId: string;
  question: string;
  items: string[];
}

export interface CaptchaVerifyResponse {
  verified: boolean;
  verificationToken: string | null;
  message: string;
}
