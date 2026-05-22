export type SubscriptionPlan = 'starter' | 'growth' | 'pro';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'suspended' | 'canceled' | 'archived';
export type BookingStatus = 'pending' | 'confirmed' | 'expired' | 'canceled' | 'blocked';
export type FacilityType = 'cricket_net' | 'badminton_court' | 'tennis_court' | 'turf_5aside';
export type AddonType = 'bowling_machine' | 'equipment_hire' | 'coaching';
export type UserRole = 'customer' | 'club_manager' | 'club_staff' | 'platform_admin';
export type NotificationChannel = 'email' | 'sms';
export type AuditAction =
  | 'booking.created'
  | 'booking.canceled'
  | 'booking.refunded'
  | 'booking.blocked'
  | 'member.added'
  | 'member.removed'
  | 'pricing.updated'
  | 'hours.updated'
  | 'plan.changed'
  | 'club.suspended'
  | 'club.unsuspended'
  | 'trial.extended';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  stripeCustomerId: string;
  createdAt: Date;
}

export interface Club {
  id: string;
  slug: string;
  name: string;
  status: SubscriptionStatus;
  planId: SubscriptionPlan;
  stripeAccountId: string;
  stripeSubscriptionId: string;
  brandingColor: string;
  logoUrl: string;
  heroPhotoUrl: string;
  address: string;
  gstNumber: string;
  timezone: string;
  trialEndsAt: Date | null;
  createdAt: Date;
}

export interface ClubUser {
  clubId: string;
  userId: string;
  role: 'manager' | 'staff';
}

export interface Facility {
  id: string;
  clubId: string;
  facilityType: FacilityType;
  name: string;
  displayOrder: number;
  active: boolean;
  createdAt: Date;
}

export interface Addon {
  id: string;
  clubId: string;
  addonType: AddonType;
  label: string;
  inventoryCount: number;
  priceMemberCents: number;
  priceNonmemberCents: number;
  active: boolean;
  createdAt: Date;
}

export interface Booking {
  id: string;
  clubId: string;
  facilityId: string;
  userId: string;
  startAt: Date;
  endAt: Date;
  status: BookingStatus;
  totalCents: number;
  memberPricingApplied: boolean;
  paymentIntentId: string;
  type: 'customer' | 'walk_in' | 'block' | 'manager';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  facilityName: string;
  addonIds: string[];
  createdAt: Date;
}

export interface BookingAddon {
  bookingId: string;
  addonId: string;
  quantity: number;
  priceCents: number;
}

export interface ClubMember {
  clubId: string;
  userId: string;
  since: Date;
}

export interface OperatingHours {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  openTime: string;  // "06:00"
  closeTime: string; // "22:00"
  closed: boolean;
}

export interface ClubSettings {
  operatingHours: OperatingHours[];
  bookingBufferHours: number;
  maxAdvanceDays: number;
  cancellation24hRefundPct: number;
  cancellation12hRefundPct: number;
  cancellation0hRefundPct: number;
  memberNetRateCents: number;
  nonMemberNetRateCents: number;
  notifyManagerEmail: boolean;
  notifyManagerSms: boolean;
}

export interface Plan {
  id: SubscriptionPlan;
  name: string;
  monthlyPriceCents: number;
  facilityLimit: number | null;
  monthlyBookingLimit: number | null;
  smsIncluded: number;
  customDomainAllowed: boolean;
  whiteLabelAllowed: boolean;
  csvExportAllowed: boolean;
  additionalAdminUsers: number;
  supportSla: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorName: string;
  clubId: string;
  clubName: string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  payloadJson: Record<string, unknown>;
  at: Date;
}

export interface NotificationLog {
  id: string;
  clubId: string;
  bookingId: string;
  channel: NotificationChannel;
  type: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt: Date;
}

export interface Report {
  weeklyRevenueCents: number;
  monthlyRevenueCents: number;
  utilizationPct: number;
  totalBookings: number;
  topSlots: { time: string; bookings: number }[];
  revenueByDay: { day: string; cents: number }[];
}

export interface OnboardingState {
  step: number;
  clubName: string;
  address: string;
  gstNumber: string;
  logoUrl: string;
  brandingColor: string;
  heroPhotoUrl: string;
  facilityCount: number;
  facilityNames: string[];
  operatingHours: OperatingHours[];
  memberRateCents: number;
  nonMemberRateCents: number;
  bowlingMachineEnabled: boolean;
  bowlingMachineCount: number;
  bowlingMachineMemberCents: number;
  bowlingMachineNonMemberCents: number;
  cancellation24hPct: number;
  cancellation12hPct: number;
  cancellation0hPct: number;
  bookingBufferHours: number;
  maxAdvanceDays: number;
  stripeConnected: boolean;
  selectedPlan: SubscriptionPlan;
  completed: boolean;
}

export interface PlatformStats {
  totalClubs: number;
  activeClubs: number;
  trialingClubs: number;
  suspendedClubs: number;
  mrr: number;
  arr: number;
  trialConversionRate: number;
  monthlyChurnRate: number;
  newSignupsThisMonth: number;
  totalBookingsThisMonth: number;
}
