import { ReactNode, useEffect } from "react";
import { Link } from "react-router-dom";
import { CONTACT_CITY, CONTACT_EMAIL, CONTACT_PHONES, HOSTING_PROVIDER, PUBLISHER_NAME, PUBLISHER_NIU, PUBLISHER_RCCM } from "@/lib/contact";

type LegalPageKind = "conditions" | "confidentialite" | "mentions";

interface LegalSection {
  heading: string;
  body: ReactNode;
}

const lastUpdate = "3 octobre 2026";

const links: { kind: LegalPageKind; to: string; label: string }[] = [
  { kind: "conditions", to: "/conditions-utilisation", label: "Conditions d'utilisation" },
  { kind: "confidentialite", to: "/confidentialite", label: "Politique de confidentialité" },
  { kind: "mentions", to: "/mentions-legales", label: "Mentions légales" },
];

const P = ({ children }: { children: ReactNode }) => <p className="mt-3 leading-relaxed text-gray-700">{children}</p>;
const Ul = ({ items }: { items: ReactNode[] }) => <ul className="mt-3 list-disc space-y-1 pl-6 text-gray-700">{items.map((item, index) => <li key={index}>{item}</li>)}</ul>;
const Email = () => <a href={`mailto:${CONTACT_EMAIL}`} className="break-all text-secondary underline hover:text-primary">{CONTACT_EMAIL}</a>;
const Contact = () => <P>Pour toute question : <Email />, ou par téléphone au {CONTACT_PHONES.join(", ")}.</P>;

const pages: Record<LegalPageKind, { title: string; sections: LegalSection[] }> = {
  conditions: {
    title: "Conditions d'utilisation",
    sections: [
      { heading: "Objet", body: <P>Les présentes conditions encadrent l'utilisation du site et de l'application DSFacile, édités par {PUBLISHER_NAME}. Utiliser DSFacile vaut acceptation de ces conditions.</P> },
      { heading: "Le service", body: <P>DSFacile est un outil gratuit d'aide à la préparation des Déclarations Statistiques et Fiscales (DSF) camerounaises, en Système Normal et en Système Minimal de Trésorerie : saisie, import CSV, contrôles de cohérence et export XLSX. Il s'utilise sans compte et sans inscription.</P> },
      {
        heading: "Nature des documents produits",
        body: (
          <>
            <P>Les classeurs XLSX générés par DSFacile sont des documents de préparation et de revue interne. Ce ne sont pas des déclarations officielles : ils ne reprennent pas les modèles officiels de la Direction Générale des Impôts (DGI) et ne peuvent pas être déposés en l'état.</P>
            <P>Avant tout dépôt, les montants doivent être vérifiés par un professionnel et reportés dans les modèles officiels en vigueur pour l'exercice concerné. DSFacile n'est ni édité ni homologué par la DGI.</P>
          </>
        ),
      },
      { heading: "Responsabilité de l'utilisateur", body: <P>Vous êtes seul responsable des données que vous saisissez, de leur exactitude, ainsi que des déclarations que vous déposez et de leurs conséquences fiscales. Les contrôles de DSFacile sont des contrôles de base (équilibre du bilan, cohérence de la trésorerie, champs obligatoires) : leur réussite ne garantit ni l'exactitude ni la conformité d'une déclaration.</P> },
      { heading: "Données et sauvegardes", body: <P>Vos données sont enregistrées uniquement dans votre navigateur (voir la <Link to="/confidentialite" className="text-secondary underline hover:text-primary">politique de confidentialité</Link>). L'éditeur n'en détient aucune copie et ne peut pas les récupérer en cas de perte : il vous appartient d'exporter régulièrement une sauvegarde JSON de vos dossiers.</P> },
      { heading: "Disponibilité et évolution", body: <P>DSFacile est fourni en l'état, sans garantie de disponibilité. Le service peut être modifié, suspendu ou interrompu à tout moment. Ces conditions peuvent être mises à jour ; la date de dernière mise à jour figure en haut de cette page.</P> },
      { heading: "Limitation de responsabilité", body: <P>Dans les limites permises par la loi, l'éditeur ne saurait être tenu responsable des dommages résultant de l'utilisation de DSFacile, notamment d'une erreur de saisie, d'une perte de données ou d'une déclaration établie à partir des documents produits.</P> },
      { heading: "Droit applicable", body: <P>Les présentes conditions sont soumises au droit camerounais.</P> },
      { heading: "Contact", body: <Contact /> },
    ],
  },
  confidentialite: {
    title: "Politique de confidentialité",
    sections: [
      { heading: "En résumé", body: <P>DSFacile fonctionne entièrement dans votre navigateur. Il n'y a ni compte, ni serveur applicatif, ni base de données : l'éditeur ne reçoit pas et ne conserve pas les informations que vous saisissez dans l'application.</P> },
      {
        heading: "Les données que vous saisissez",
        body: (
          <>
            <P>L'identification du contribuable (raison sociale, NIU, RCCM, centre des impôts, activité…) et les montants de vos états financiers sont enregistrés uniquement dans le stockage local de votre navigateur, sur votre appareil.</P>
            <Ul items={[
              "Les fichiers que vous importez (CSV, sauvegarde JSON) sont lus sur votre appareil et ne sont envoyés nulle part.",
              "Les fichiers que vous exportez (XLSX, JSON) sont créés sur votre appareil et téléchargés directement.",
            ]} />
          </>
        ),
      },
      {
        heading: "Conservation et suppression",
        body: (
          <>
            <P>Vos données restent dans votre navigateur jusqu'à ce que vous cliquiez sur « Nouveau » dans un module ou que vous effaciez les données du site dans les réglages de votre navigateur. Elles ne sont ni sauvegardées à distance ni synchronisées entre appareils : pensez à exporter une sauvegarde JSON.</P>
            <P>Toute personne ayant accès à votre session de navigateur peut consulter ces données. Sur un poste partagé, effacez-les après usage.</P>
          </>
        ),
      },
      { heading: "Formulaires de contact", body: <P>Les formulaires du site n'envoient rien par eux-mêmes : ils préparent un e-mail dans votre messagerie, que vous choisissez d'envoyer ou non. Si vous l'envoyez, les informations qu'il contient (nom, adresse e-mail, entreprise, message) sont reçues à l'adresse <Email /> et utilisées uniquement pour vous répondre.</P> },
      {
        heading: "Services tiers",
        body: (
          <Ul items={[
            "Les polices de caractères du site sont chargées depuis Google Fonts (fonts.googleapis.com et fonts.gstatic.com) : votre navigateur transmet alors à Google votre adresse IP et des informations techniques.",
            "Comme pour tout site web, l'hébergeur peut enregistrer des journaux techniques (adresse IP, date, page demandée) nécessaires au fonctionnement et à la sécurité du site.",
          ]} />
        ),
      },
      { heading: "Cookies et mesure d'audience", body: <P>DSFacile ne dépose aucun cookie et n'utilise aucun outil de mesure d'audience ni de publicité.</P> },
      { heading: "Contact", body: <Contact /> },
    ],
  },
  mentions: {
    title: "Mentions légales",
    sections: [
      {
        heading: "Éditeur du site",
        body: (
          <Ul items={[
            PUBLISHER_NAME,
            CONTACT_CITY,
            ...(PUBLISHER_RCCM ? [`RCCM : ${PUBLISHER_RCCM}`] : []),
            ...(PUBLISHER_NIU ? [`NIU : ${PUBLISHER_NIU}`] : []),
            <>E-mail : <Email /></>,
            `Téléphone : ${CONTACT_PHONES.join(", ")}`,
          ]} />
        ),
      },
      ...(HOSTING_PROVIDER ? [{ heading: "Hébergement", body: <P>Le site est hébergé par {HOSTING_PROVIDER}.</P> }] : []),
      { heading: "Nature du service", body: <P>DSFacile est un outil gratuit d'aide à la préparation des DSF. Il n'est ni édité ni homologué par la Direction Générale des Impôts, et les documents qu'il produit ne constituent pas des déclarations officielles (voir les <Link to="/conditions-utilisation" className="text-secondary underline hover:text-primary">conditions d'utilisation</Link>).</P> },
      { heading: "Propriété intellectuelle", body: <P>Les contenus du site (textes, présentation et application), sauf mention contraire, sont la propriété de l'éditeur. Toute reproduction sans autorisation préalable est interdite.</P> },
      { heading: "Données personnelles", body: <P>Voir la <Link to="/confidentialite" className="text-secondary underline hover:text-primary">politique de confidentialité</Link>.</P> },
    ],
  },
};

const LegalPage = ({ page }: { page: LegalPageKind }) => {
  const { title, sections } = pages[page];

  // Les liens viennent du bas de l'accueil : sans cela, la page s'ouvrirait à la position de défilement précédente.
  useEffect(() => window.scrollTo(0, 0), [page]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white">
        <div className="container mx-auto px-4 py-6">
          <Link to="/" className="text-2xl font-bold">DSF<span className="text-accent">acile</span></Link>
        </div>
      </header>
      <main className="container mx-auto max-w-3xl px-4 py-10">
        <article className="rounded-lg bg-white p-6 shadow md:p-10">
          <h1 className="text-3xl font-bold text-primary">{title}</h1>
          <p className="mt-2 text-sm text-gray-500">Dernière mise à jour : {lastUpdate}</p>
          {sections.map((section) => (
            <section key={section.heading} className="mt-8">
              <h2 className="text-xl font-semibold text-primary">{section.heading}</h2>
              {section.body}
            </section>
          ))}
        </article>
        <nav className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          <Link to="/" className="text-secondary hover:text-primary">Retour à l'accueil</Link>
          {links.filter((link) => link.kind !== page).map((link) => (
            <Link key={link.kind} to={link.to} className="text-secondary hover:text-primary">{link.label}</Link>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default LegalPage;
