<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->

<a name="readme-top"></a>

<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
<!-- FUTURES
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]-->

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/LaSalleGracia-Projectes/projecte-aplicaci-web-client-g5stevejobs">
    <img src="public/images/logo-abyss.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">The Abyss</h3>

  <p align="center">
    Explora las profundidades de un mundo misterioso lleno de peligros y tesoros por descubrir
    <br />
    <!-- Link to Memory PDF -->
    <a href="https://github.com/LaSalleGracia-Projectes/projecte-aplicaci-web-client-g5stevejobs"><strong>Explorar la documentación »</strong></a>
    <br />
    <br />
    <!-- Link to Demo Video -->
    <a href="https://the-abyss-g5stevejobs.vercel.app/">Ver Demo</a>
    ·
    <a href="https://github.com/LaSalleGracia-Projectes/projecte-aplicaci-web-client-g5stevejobs/issues/new?labels=bug&template=bug-report---.md">Reportar Bug</a>
    ·
    <a href="https://github.com/LaSalleGracia-Projectes/projecte-aplicaci-web-client-g5stevejobs/issues/new?labels=enhancement&template=feature-request---.md">Solicitar Función</a>
  </p>
</div>

[![Contributors][contributors-shield]][contributors-url]
[![MIT License][license-shield]][license-url]

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Tabla de Contenidos</summary>
  <ol>
    <li>
      <a href="#about-the-project">Sobre el Proyecto</a>
      <ul>
        <li><a href="#built-with">Construido Con</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Comenzando</a>
      <ul>
        <li><a href="#prerequisites">Prerrequisitos</a></li>
        <li><a href="#installation">Instalación</a></li>
        <li><a href="#deployment">Despliegue</a></li>
      </ul>
    </li>
    <li><a href="#usage">Uso</a></li>
    <li><a href="#test">Pruebas</a></li>
    <li><a href="#roadmap">Hoja de Ruta</a></li>
    <li><a href="#license">Licencia</a></li>
    <li><a href="#acknowledgments">Agradecimientos</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

[![The Abyss Screenshot][product-screenshot]](https://the-abyss-g5stevejobs.vercel.app/)

The Abyss es un videojuego inmersivo que te invita a explorar un mundo misterioso lleno de desafíos y aventuras. Este repositorio contiene el cliente web para el juego, desarrollado con Next.js, React y Tailwind CSS, permitiendo a los usuarios descargar el juego, acceder al foro de la comunidad, leer el blog y contactar con el equipo de soporte.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributors

[![Contributors][contributors-shield]][contributors-url]

Grupo 5 Steve Jobs - Projecte Aplicació Web

### Built With

- [![Next][Next.js]][Next-url]
- [![React][React.js]][React-url]
- [![Tailwind][Tailwind-css]][Tailwind-url]
- [![Supabase][Supabase]][Supabase-url]
- [![Firebase][Firebase]][Firebase-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

Para poner en marcha una copia local del proyecto, sigue estos sencillos pasos.

### Prerequisites

- Node.js (v18 o superior)
- npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clona el repositorio
   ```sh
   git clone https://github.com/LaSalleGracia-Projectes/projecte-aplicaci-web-client-g5stevejobs.git
   ```
2. Instala los paquetes NPM
   ```sh
   npm install
   ```
3. Crea un archivo `.env.local` en la raíz del proyecto y añade las variables de entorno necesarias

   ```
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase

   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_de_firebase
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain_de_firebase
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id_de_firebase
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket_de_firebase
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id_de_firebase
   NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id_de_firebase
   ```

### Deployment

1. Ejecuta el servidor de desarrollo
   ```sh
   npm run dev
   ```
2. Para construir la aplicación para producción
   ```sh
   npm run build
   ```
3. Para iniciar la aplicación en modo producción
   ```sh
   npm run start
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

La aplicación web de The Abyss permite a los usuarios:

- Descargar el juego
- Acceder al foro de la comunidad
- Leer artículos del blog sobre actualizaciones y novedades
- Contactar con el equipo de soporte
- Crear y gestionar su perfil de usuario

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Test

Para ejecutar las pruebas automatizadas del proyecto:

```sh
npm run test
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

- [x] Página principal con descarga del juego
- [x] Sistema de autenticación de usuarios
- [x] Foro de la comunidad
- [x] Blog con artículos y novedades
- [ ] Sistema de logros y rankings
- [ ] Tienda en línea para compras dentro del juego
- [ ] Soporte para múltiples idiomas

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

[![MIT License][license-shield]][license-url]

Distribuido bajo la Licencia MIT. Ver `LICENSE.txt` para más información.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/LaSalleGracia-Projectes/projecte-aplicaci-web-client-g5stevejobs.svg?style=for-the-badge
[contributors-url]: https://github.com/LaSalleGracia-Projectes/projecte-aplicaci-web-client-g5stevejobs/graphs/contributors
[license-shield]: https://img.shields.io/github/license/LaSalleGracia-Projectes/projecte-aplicaci-web-client-g5stevejobs.svg?style=for-the-badge
[license-url]: https://github.com/LaSalleGracia-Projectes/projecte-aplicaci-web-client-g5stevejobs/blob/master/LICENSE.txt
[product-screenshot]: public/images/abyss-imagen.jpg
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Tailwind-css]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[Supabase]: https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white
[Supabase-url]: https://supabase.com/
[Firebase]: https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black
[Firebase-url]: https://firebase.google.com/
