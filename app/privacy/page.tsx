import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";

export default function PrivacyPage() {
  return (
    <PageLayout>
      <article className="rounded-2xl bg-white p-8 shadow-sm md:p-12">
        <h1 className="font-heading text-3xl font-bold text-primary">Politique de confidentialite</h1>
        <p className="mt-2 text-sm text-muted">Derniere mise a jour : juillet 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted">
          <section>
            <h2 className="text-lg font-semibold text-primary">1. Donnees collectees</h2>
            <p className="mt-2">
              Lors de votre inscription et de votre utilisation de ShopKin, nous collectons les
              donnees suivantes :
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
              <li>Nom, prenom et nom d&apos;utilisateur.</li>
              <li>Adresse email et numero de telephone WhatsApp.</li>
              <li>Commune de residence et super-repere.</li>
              <li>Photos, annonces publiees et historique de navigation.</li>
              <li>Informations de connexion (adresse IP, navigateur, systeme d&apos;exploitation).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary">2. Utilisation des donnees</h2>
            <p className="mt-2">
              Vos donnees sont utilisees uniquement pour :
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
              <li>Vous permettre de creer et gerer votre compte.</li>
              <li>Publier et gerer vos annonces.</li>
              <li>Vous mettre en relation avec d&apos;autres utilisateurs via WhatsApp.</li>
              <li>Vous envoyer des notifications importantes (validation email, reinitialisation mot de passe).</li>
              <li>Ameliorer la Plateforme et analyser son utilisation de maniere anonymisee.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary">3. Partage des donnees</h2>
            <p className="mt-2">
              ShopKin ne vend ni ne loue vos donnees personnelles a des tiers. Elles sont
              hebergees de maniere securisee via notre infrastructure Appwrite.
            </p>
            <p className="mt-2">
              Certaines donnees (nom, commune, photo de profil, annonces) sont visibles
              publiquement sur la Plateforme car elles sont necessaires au fonctionnement de la
              marketplace. Votre numero de telephone n&apos;est jamais affiche publiquement et n&apos;est
              communique a un acheteur que lorsque vous cliquez sur le bouton de contact.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary">4. Securite</h2>
            <p className="mt-2">
              Nous mettons en oeuvre des mesures techniques et organisationnelles pour proteger
              vos donnees : chiffrement des connexions (HTTPS), acces restreint aux bases de
              donnees, permissions utilisateur strictes.
            </p>
            <p className="mt-2">
              Les donnees de paiement (numeros Mobile Money, cartes bancaires) sont stockees de
              maniere minimisee : seuls les 4 derniers chiffres sont conserves, aucun CVV ni
              numero complet n&apos;est enregistre.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary">5. Droits des utilisateurs</h2>
            <p className="mt-2">
              Conformement a la legislation congolaise et au Reglement General sur la Protection
              des Donnees (RGPD), vous disposez des droits suivants :
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
              <li>Droit d&apos;acces : obtenir une copie de vos donnees.</li>
              <li>Droit de rectification : modifier vos informations personnelles.</li>
              <li>Droit a l&apos;effacement : supprimer votre compte et vos donnees.</li>
              <li>Droit a la portabilite : recuperer vos donnees dans un format structuré.</li>
            </ul>
            <p className="mt-2">
              Pour exercer ces droits, contactez-nous via les coordonnees indiquees sur la page{" "}
              <a href="/a-propos" className="text-blue-600 underline hover:text-blue-800">A propos</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary">6. Cookies</h2>
            <p className="mt-2">
              ShopKin utilise uniquement des cookies techniques necessaires au fonctionnement de
              la Plateforme (gestion de session, authentification). Nous n&apos;utilisons pas de
              cookies publicitaires ni de traqueurs tiers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary">7. Conservation des donnees</h2>
            <p className="mt-2">
              Vos donnees sont conservees aussi longtemps que votre compte est actif. Apres
              suppression de votre compte, vos donnees sont effacees dans un delai de 30 jours,
              sauf obligation legale de conservation.
            </p>
          </section>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center">
          <Link href="/" className="text-sm text-blue-600 underline hover:text-blue-800">
            Retour a l&apos;accueil
          </Link>
        </div>
      </article>
    </PageLayout>
  );
}
