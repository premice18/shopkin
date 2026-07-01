import PageLayout from "@/components/layout/PageLayout";

export default function CguPage() {
  return (
    <PageLayout>
      <article className="rounded-2xl bg-white p-8 shadow-sm md:p-12">
        <h1 className="font-heading text-3xl font-bold text-primary">Conditions Generales d&apos;Utilisation</h1>
        <p className="mt-2 text-sm text-muted">Derniere mise a jour : juillet 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted">
          <section>
            <h2 className="text-lg font-semibold text-primary">1. Objet</h2>
            <p className="mt-2">
              Les presentes conditions generales d&apos;utilisation (ci-apres &laquo; CGU &raquo;) regissent
              l&apos;acces et l&apos;utilisation de la plateforme ShopKin (ci-apres &laquo; la Plateforme &raquo;),
              une marketplace en ligne permettant la mise en relation d&apos;acheteurs et de vendeurs
              residant a Kinshasa (Republique Democratique du Congo).
            </p>
            <p className="mt-2">
              ShopKin agit uniquement comme intermédiaire technique. Elle n&apos;est pas partie aux
              transactions conclues entre les utilisateurs et ne gere aucun paiement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary">2. Inscription et compte</h2>
            <p className="mt-2">
              Pour utiliser la Plateforme, l&apos;utilisateur doit creer un compte en fournissant des
              informations exactes, completes et a jour. L&apos;utilisateur s&apos;engage a :
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
              <li>Ne pas creer plusieurs comptes.</li>
              <li>Ne pas usurper l&apos;identite d&apos;un tiers.</li>
              <li>Etre age d&apos;au moins 18 ans ou disposer de l&apos;autorisation parentale.</li>
              <li>Garantir la confidentialite de ses identifiants de connexion.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary">3. Annonces</h2>
            <p className="mt-2">
              Le vendeur s&apos;engage a publier des annonces conformes a la legislation en vigueur en RDC.
              Il est notamment interdit de mettre en ligne :
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
              <li>Des biens ou services illicites (contrefacon, stupéfiants, armes, etc.).</li>
              <li>Des annonces frauduleuses ou trompeuses.</li>
              <li>Des contenus injurieux, discriminatoires ou portant atteinte aux droits des tiers.</li>
            </ul>
            <p className="mt-2">
              ShopKin se reserve le droit de supprimer toute annonce non conforme sans preavis.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary">4. Transactions</h2>
            <p className="mt-2">
              ShopKin n&apos;intervient pas dans les transactions entre utilisateurs. Les modalites de
              paiement, de livraison et de remise en main propre sont convenues directement entre
              l&apos;acheteur et le vendeur.
            </p>
            <p className="mt-2">
              ShopKin decline toute responsabilite en cas de litige portant sur le prix, la qualite,
              la conformite ou la livraison d&apos;un bien. Les utilisateurs sont invites a privilegier
              les rencontres dans des lieux publics et a ne pas effectuer de paiement integral avant
              d&apos;avoir vu le bien.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary">5. Responsabilites</h2>
            <p className="mt-2">
              ShopKin met en oeuvre les moyens raisonnables pour assurer le bon fonctionnement de la
              Plateforme, mais ne peut garantir une disponibilite ininterrompue.
            </p>
            <p className="mt-2">
              La responsabilite de ShopKin ne saurait etre engagee en cas de :
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
              <li>Dommages indirects lies a l&apos;utilisation de la Plateforme.</li>
              <li>Actes frauduleux commis par un utilisateur.</li>
              <li>Indisponibilite temporaire due a des opérations de maintenance ou a un cas de force majeure.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary">6. Protection des donnees</h2>
            <p className="mt-2">
              Les donnees personnelles collectees sont traitées conformement a notre
              <a href="/privacy" className="text-blue-600 underline hover:text-blue-800"> Politique de confidentialite</a>.
              Conformement a la loi congolaise et au RGPD (pour les utilisateurs europeens), vous
              disposez d&apos;un droit d&apos;acces, de rectification et de suppression de vos donnees.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary">7. Modification des CGU</h2>
            <p className="mt-2">
              ShopKin se reserve le droit de modifier les presentes CGU a tout moment. Les
              utilisateurs seront informes des modifications substantielles par email ou via la
              Plateforme. L&apos;utilisation continue de la Plateforme apres la prise d&apos;effet des
              modifications vaut acceptation des nouvelles CGU.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary">8. Contact</h2>
            <p className="mt-2">
              Pour toute question relative aux presentes CGU, vous pouvez nous contacter via
              WhatsApp au numero indique sur la Plateforme ou par email a l&apos;adresse disponible
              dans la section <a href="/a-propos" className="text-blue-600 underline hover:text-blue-800">A propos</a>.
            </p>
          </section>
        </div>
      </article>
    </PageLayout>
  );
}
