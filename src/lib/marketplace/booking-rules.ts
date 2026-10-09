export const BOOKING_RATE = { max: 20, windowMinutes: 60 } as const;
export const isBookingRateLimited = (recent: number) => recent >= BOOKING_RATE.max;
