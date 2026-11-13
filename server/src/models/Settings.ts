import { Schema, model } from 'mongoose';

const faqItemSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false },
);

const whyChooseItemSchema = new Schema(
  {
    icon: { type: String, required: true },
    label: { type: String, required: true },
  },
  { _id: false },
);

const settingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'app' },
    businessName: { type: String, required: true },
    tagline: { type: String, required: true },
    supportPhone: { type: String, required: true },
    helplinePhone: { type: String, default: '' },
    whatsappPhone: { type: String, default: '' },
    supportEmail: { type: String, required: true },
    serviceArea: { type: String, required: true },
    businessHours: { type: String, required: true },
    address: { type: String, required: true },
    website: { type: String, default: '' },
    facebookUrl: { type: String, default: '' },
    instagramUrl: { type: String, default: '' },
    youtubeUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    servicesPageTitle: { type: String, default: '' },
    servicesPageIntro: { type: String, default: '' },
    aboutTitle: { type: String, default: '' },
    aboutBody: { type: String, default: '' },
    privacyPolicyTitle: { type: String, default: '' },
    privacyPolicyBody: { type: String, default: '' },
    termsTitle: { type: String, default: '' },
    termsBody: { type: String, default: '' },
    siteFaqs: { type: [faqItemSchema], default: [] },
    whyChooseTitle: { type: String, default: '' },
    whyChooseItems: { type: [whyChooseItemSchema], default: [] },
  },
  { timestamps: true },
);

export const Settings = model('Settings', settingsSchema);
