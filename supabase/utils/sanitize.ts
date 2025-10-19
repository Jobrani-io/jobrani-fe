import {
  HiringManagerTitles,
  ProspectMatch,
} from "../functions/search-matches/index.ts";
import { ApolloPersonData } from "../types/apollo.ts";

export const checkIfUrl = (url: string) => {
  try {
    // append https if not exist
    const urlWithHttps = url.startsWith("http") ? url : `https://${url}`;
    new URL(urlWithHttps.toLowerCase());
    return true;
  } catch {
    return false;
  }
};

export const sanitizeDomain = (url: string) => {
  // Extract main domain: abc.x.com -> x.com

  // Remove protocol and trailing slash
  let domain = url
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .toLowerCase();

  // Remove www. prefix if present
  domain = domain.replace(/^www\./, "");

  // Split by dots and take the last two parts (domain.tld)
  const parts = domain.split(".");
  if (parts.length >= 2) {
    return parts.slice(-2).join(".");
  }

  return domain;
};

export const formatApolloPeopleDataToMatch = (
  apolloPeople: ApolloPersonData[]
): ProspectMatch[] => {
  return apolloPeople.map((people) => ({
    name: people.name,
    title: people.title,
    linkedin_url: people.linkedin_url ?? "",
    confidence: 0.95,
    reason: "",
  }));
};

export const extractAllHiringManagerTitlesFromHiringManagerTitles = (
  hiringManagerTitles: HiringManagerTitles[]
): string[] => {
  return Array.from(
    new Set([
      ...hiringManagerTitles.map(
        ({ hiring_manager_title }) => hiring_manager_title
      ),
      ...hiringManagerTitles.flatMap(({ backup_titles }) => backup_titles),
    ])
  );
};
