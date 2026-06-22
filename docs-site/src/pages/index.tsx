import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/catalog">
            Ver catálogo →
          </Link>
          <Link className="button button--outline button--secondary button--lg" to="/docs/intro">
            Leer la documentación
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Documentación y catálogo de widgets Angular y Flutter, unificados en Docusaurus.">
      <HomepageHeader />
      <main className="container margin-vert--xl">
        <div className="row">
          <div className="col col--4">
            <h3>📚 Documentación unificada</h3>
            <p>
              Guías, convenciones y arquitectura en un solo sitio, con búsqueda full-text sobre todos
              los widgets.
            </p>
          </div>
          <div className="col col--4">
            <h3>🧩 Catálogo en vivo</h3>
            <p>
              El listado se genera en runtime desde <code>catalog-index.json</code> y cada widget
              embebe su demo real vía iframe.
            </p>
          </div>
          <div className="col col--4">
            <h3>⚙️ Actualizado por CI</h3>
            <p>
              Cada deploy de un widget dispara un <code>repository_dispatch</code> que regenera la base
              de información del sitio.
            </p>
          </div>
        </div>
      </main>
    </Layout>
  );
}
