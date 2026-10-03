// Coordonnées affichées dans le pied de page et utilisées par les formulaires du site.
// DSFacile n'ayant pas de backend, aucun formulaire ne peut envoyer de message par lui-même :
// les formulaires composent un e-mail que l'utilisateur envoie depuis sa propre messagerie.
export const CONTACT_EMAIL = "prismagestionsarl@gmail.com";
export const CONTACT_PHONES = ["+237 694 310 554", "+237 676 277 662", "+237 656 752 475"];
export const CONTACT_CITY = "Yaoundé, Cameroun";

/** Lien tel: d'un numéro affiché avec des espaces. */
export const phoneLink = (phone: string) => `tel:${phone.replace(/\s/g, "")}`;

/** Construit un lien mailto: à partir d'un sujet et d'un corps de message. */
export const buildMailtoLink = (subject: string, body: string) =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/** Ouvre le client de messagerie de l'utilisateur sur un message pré-rempli. */
export const openMailClient = (subject: string, body: string) => {
  window.location.href = buildMailtoLink(subject, body);
};
