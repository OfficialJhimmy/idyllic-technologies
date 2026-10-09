const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" });
export const formatDate = (iso: string) => dateFormat.format(new Date(iso));
