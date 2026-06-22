import React from 'react';
import Layout from '@theme/Layout';
import WidgetCatalog from '@site/src/components/WidgetCatalog';

export default function CatalogPage(): JSX.Element {
  return (
    <Layout title="Catálogo" description="Catálogo de widgets Angular y Flutter">
      <main className="container margin-vert--lg">
        <h1>Catálogo de Widgets</h1>
        <p>
          Listado en vivo generado en runtime desde <code>catalog-index.json</code> (el mismo índice
          que produce el registry). Hacé clic en un widget para abrir su página con la demo embebida y
          el selector de ambiente/versión.
        </p>
        <WidgetCatalog />
      </main>
    </Layout>
  );
}
