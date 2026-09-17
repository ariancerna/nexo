import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Términos de servicio",
  description: "Condiciones que regulan el uso de Nexo Personal Hub.",
};

const sections = [
  {
    title: "Aceptación y alcance",
    paragraphs: [
      "Estos términos regulan el acceso y uso de Nexo, incluyendo sus funciones de notas, tareas, calendario, archivos, espacios, listas, enlaces guardados y sesiones de concentración.",
      "Al crear una cuenta o utilizar el servicio confirmas que has leído y aceptas estas condiciones y la Política de privacidad. Si no estás de acuerdo, no debes crear una cuenta ni utilizar Nexo.",
    ],
  },
  {
    title: "Cuenta y seguridad",
    paragraphs: [
      "Debes proporcionar información válida, mantenerla actualizada y proteger tus credenciales. Eres responsable de la actividad realizada desde tu cuenta, salvo que nos informes oportunamente de un acceso no autorizado.",
      "No debes compartir contraseñas, intentar acceder a cuentas ajenas ni evadir los controles de autenticación, permisos o seguridad del servicio.",
    ],
  },
  {
    title: "Uso permitido",
    paragraphs: ["Nexo está diseñado como una herramienta personal de organización. Debes usarlo de forma legal y responsable."],
    items: [
      "No almacenar, publicar o compartir contenido ilegal, fraudulento, abusivo o que vulnere derechos de terceros.",
      "No introducir malware, automatizar solicitudes abusivas ni interferir con la disponibilidad o seguridad del servicio.",
      "No intentar obtener el código, datos o credenciales de otros usuarios mediante accesos no autorizados.",
    ],
  },
  {
    title: "Tu contenido",
    paragraphs: [
      "Conservas la titularidad de las notas, tareas, archivos y demás contenido que incorporas a Nexo. Nos autorizas a procesarlo únicamente en la medida necesaria para almacenar, sincronizar, proteger y mostrar el servicio solicitado.",
      "Eres responsable de contar con los derechos necesarios sobre el contenido que subes y de mantener copias adicionales de cualquier información crítica.",
    ],
  },
  {
    title: "Archivos y enlaces externos",
    paragraphs: [
      "Los enlaces y servicios de terceros se ofrecen para tu conveniencia y se rigen por sus propias condiciones. Nexo no controla su contenido, disponibilidad o prácticas de privacidad.",
      "Los archivos privados pueden utilizar enlaces temporales para permitir su apertura. No debes compartir esos enlaces con personas que no deban acceder al contenido.",
    ],
  },
  {
    title: "Disponibilidad y cambios",
    paragraphs: [
      "Podemos actualizar, mejorar, limitar o retirar funciones para mantener la seguridad y evolución del producto. Procuraremos evitar interrupciones innecesarias, pero no garantizamos disponibilidad ininterrumpida.",
      "Las funciones offline y la sincronización dependen del dispositivo, la conexión y los proveedores de infraestructura utilizados por Nexo.",
    ],
  },
  {
    title: "Suspensión y cierre",
    paragraphs: [
      "Puedes dejar de utilizar Nexo en cualquier momento. Podemos limitar o suspender una cuenta cuando exista un incumplimiento grave, un riesgo de seguridad o una obligación legal.",
      "Cuando sea razonablemente posible, permitiremos corregir el incumplimiento o recuperar información antes del cierre definitivo.",
    ],
  },
  {
    title: "Responsabilidad",
    paragraphs: [
      "Nexo se ofrece con el nivel de diligencia razonablemente esperado para un servicio digital. En la medida permitida por la ley, no respondemos por pérdidas indirectas, fallos de terceros o daños causados por un uso contrario a estas condiciones.",
      "Nada de lo indicado limita derechos irrenunciables que la legislación de protección al consumidor u otras normas aplicables te reconozcan.",
    ],
  },
  {
    title: "Modificaciones y contacto",
    paragraphs: [
      "Podemos actualizar estos términos para reflejar cambios legales, técnicos o funcionales. Publicaremos la fecha de la última actualización y, si el cambio es relevante, lo comunicaremos dentro del servicio o por un medio asociado a tu cuenta.",
      "Para consultas sobre estas condiciones, utiliza el canal de soporte o contacto publicado dentro de Nexo.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Condiciones legales"
      sections={sections}
      summary="Estas condiciones explican qué puedes esperar de Nexo y las reglas necesarias para mantener un espacio personal seguro y confiable."
      title="Términos de servicio"
    />
  );
}
