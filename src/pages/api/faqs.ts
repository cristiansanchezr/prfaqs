import type { APIRoute } from 'astro';

// La directiva prerender = false es necesaria para endpoints dinámicos en SSR.
export const prerender = false;

// La clave bajo la cual guardaremos los datos en Cloudflare KV.
const FAQS_KEY = 'faqs-data';

// Maneja las solicitudes GET para devolver las FAQs desde KV.
export const GET: APIRoute = async (context) => {
  try {
    // Obtenemos el binding de KV desde el contexto de ejecución de Cloudflare.
    const faqsKv = context.locals.runtime.env.FAQS_KV;
    const faqsData = await faqsKv.get(FAQS_KEY, 'json');

    // Si no hay datos en KV, devolvemos un array vacío para evitar errores.
    if (!faqsData) {
      return new Response(JSON.stringify([]), {
        headers: { 'content-type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(faqsData), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Error leyendo desde KV:', error);
    return new Response(JSON.stringify({ error: 'No se pudieron obtener las FAQs desde KV' }), {
      status: 500,
    });
  }
};

// Maneja las solicitudes POST para actualizar las FAQs en KV.
export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json();

    // Validación básica del formato esperado
    if (!Array.isArray(body) || !body[0]?.question || !body[0]?.answer) {
      return new Response(JSON.stringify({ error: 'Formato de datos inválido' }), {
        status: 400,
      });
    }

    // Obtenemos el binding de KV y guardamos los nuevos datos.
    const faqsKv = context.locals.runtime.env.FAQS_KV;
    await faqsKv.put(FAQS_KEY, JSON.stringify(body));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error en el webhook de FAQs (KV):', error);
    return new Response(JSON.stringify({ error: 'Error procesando la solicitud' }), {
      status: 500,
    });
  }
};
