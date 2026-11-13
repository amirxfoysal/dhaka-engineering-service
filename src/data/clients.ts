export type ClientLogo = {
  id: string;
  name: string;
  logo: string;
  active: boolean;
};

/** No bundled stock client logos — add clients with uploaded logos in admin. */
export const DEFAULT_CLIENTS: ClientLogo[] = [];
