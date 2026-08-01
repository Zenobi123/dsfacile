// Adresse de contact utilisée par les formulaires du site.
// DSFacile n'ayant pas de backend, aucun formulaire ne peut envoyer de message par lui-même :
// les formulaires composent un e-mail que l'utilisateur envoie depuis sa propre messagerie.
// À remplacer par l'adresse réellement relevée avant la mise en ligne.
export const CONTACT_EMAIL = "contact@dsfacile.cm";

/** Construit un lien mailto: à partir d'un sujet et d'un corps de message. */
export const buildMailtoLink = (subject: string, body: string) =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/** Ouvre le client de messagerie de l'utilisateur sur un message pré-rempli. */
export const openMailClient = (subject: string, body: string) => {
  window.location.href = buildMailtoLink(subject, body);
};
