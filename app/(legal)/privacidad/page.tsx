import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo Nexo recopila, utiliza y protege los datos personales.",
};

const sections = [
  {
    title: "Qué información tratamos",
    paragraphs: ["Tratamos únicamente la información necesaria para crear tu cuenta, prestar el servicio y mantenerlo seguro."],
    items: [
      "Datos de cuenta y perfil, como correo electrónico, nombre, usuario, foto y zona horaria.",
      "Contenido que decides guardar: notas, tareas, eventos, listas, archivos, espacios, enlaces y sesiones Focus.",
      "Preferencias de interfaz, módulos habilitados y estado de notificaciones.",
      "Datos técnicos básicos necesarios para autenticación, seguridad, diagnóstico y sincronización.",
    ],
  },
  {
    title: "Para qué utilizamos los datos",
    paragraphs: ["Usamos la información para operar Nexo de acuerdo con tu solicitud y proteger tanto tu cuenta como la plataforma."],
    items: [
      "Crear y autenticar tu cuenta.",
      "Guardar, sincronizar y mostrar el contenido entre tus dispositivos.",
      "Personalizar la apariencia, zona horaria y módulos del workspace.",
      "Prevenir abuso, investigar fallos y mantener la seguridad del servicio.",
      "Cumplir obligaciones legales aplicables y atender solicitudes de derechos.",
    ],
  },
  {
    title: "Base del tratamiento",
    paragraphs: [
      "Procesamos los datos necesarios para ofrecer el servicio que solicitas al crear una cuenta. Algunas operaciones también se sustentan en intereses legítimos de seguridad, prevención del fraude y mejora técnica.",
      "Cuando una ley exija consentimiento específico, podrás retirarlo sin afectar el tratamiento realizado previamente de manera legítima.",
    ],
  },
  {
    title: "Almacenamiento local y cookies",
    paragraphs: [
      "Nexo mantiene una copia local del workspace para permitir el uso sin conexión y sincronizar cambios posteriores. También utiliza almacenamiento y cookies estrictamente necesarios para conservar la sesión, preferencias y seguridad.",
      "Eliminar los datos del navegador puede borrar la copia local que aún no se haya sincronizado con tu cuenta.",
    ],
  },
  {
    title: "Proveedores y transferencias",
    paragraphs: [
      "Utilizamos proveedores de infraestructura y autenticación, incluido Supabase, para alojar datos, gestionar sesiones y almacenar archivos privados. Estos proveedores procesan información bajo medidas contractuales y de seguridad aplicables.",
      "La infraestructura puede operar en países distintos al tuyo. Cuando corresponda, se aplicarán mecanismos válidos para proteger las transferencias internacionales de datos.",
    ],
  },
  {
    title: "Conservación",
    paragraphs: [
      "Conservamos los datos mientras tu cuenta permanezca activa o sean necesarios para prestar Nexo. Al eliminar contenido, puede permanecer temporalmente en copias de seguridad o registros técnicos antes de su eliminación definitiva.",
      "Podemos conservar información mínima durante más tiempo cuando sea necesaria para cumplir una obligación legal, resolver disputas o prevenir abuso.",
    ],
  },
  {
    title: "Seguridad",
    paragraphs: [
      "Aplicamos controles de acceso por usuario, conexiones cifradas, archivos privados y enlaces temporales. Las políticas de seguridad de la base de datos limitan cada cuenta a sus propios registros.",
      "Ningún sistema es infalible. Debes proteger tus credenciales, mantener actualizado tu dispositivo y notificarnos si sospechas de un acceso no autorizado.",
    ],
  },
  {
    title: "Tus derechos",
    paragraphs: [
      "Dependiendo de la legislación aplicable, puedes solicitar acceso, corrección, eliminación, portabilidad, oposición o limitación del tratamiento de tus datos personales.",
      "Para ejercerlos, utiliza el canal de soporte o privacidad publicado en Nexo. Podremos solicitar información razonable para verificar tu identidad antes de responder.",
    ],
  },
  {
    title: "Menores de edad",
    paragraphs: [
      "Nexo no está dirigido deliberadamente a menores que no puedan consentir el tratamiento de datos conforme a la ley de su país. Si detectamos una cuenta creada sin la autorización necesaria, podremos eliminarla.",
    ],
  },
  {
    title: "Cambios y contacto",
    paragraphs: [
      "Podemos actualizar esta política cuando cambien el producto, los proveedores o las obligaciones legales. Indicaremos la fecha vigente y comunicaremos los cambios relevantes.",
      "Para preguntas o solicitudes de privacidad, utiliza el canal de contacto publicado dentro del sitio o la aplicación de Nexo.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacidad y datos"
      sections={sections}
      summary="Esta política describe qué datos utiliza Nexo, por qué son necesarios y qué controles tienes sobre tu información."
      title="Política de privacidad"
    />
  );
}
