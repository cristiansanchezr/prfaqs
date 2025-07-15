import type { APIRoute } from 'astro';

// La directiva prerender = false es necesaria para endpoints dinámicos en SSR.
export const prerender = false;

// La clave bajo la cual guardaremos los datos en Cloudflare KV.
const FAQS_KEY = 'faqs-data';

// Maneja las solicitudes GET para devolver las FAQs desde KV.
export const GET: APIRoute = async ({ locals }) => {
  try {
    // Accedemos al binding de KV directamente desde locals.
    const faqsKv = locals.FAQS_KV;
    const faqsData = await faqsKv.get(FAQS_KEY, 'json');

    return new Response(JSON.stringify(faqsData || []), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al leer de KV';
    console.error('Error en GET de FAQs:', errorMessage);
    return new Response(JSON.stringify({ error: 'No se pudieron obtener las FAQs', details: errorMessage }), {
      status: 500,
    });
  }
};

// Maneja las solicitudes POST para actualizar las FAQs en KV.
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();

    if (!Array.isArray(body) || !body.every(item => item.question && item.answer)) {
      return new Response(JSON.stringify({ error: 'Formato de datos inválido. Se esperaba un array de objetos con question y answer.' }), {
        status: 400,
      });
    }

    const faqsKv = locals.FAQS_KV;
    await faqsKv.put(FAQS_KEY, JSON.stringify(body));

    return new Response(JSON.stringify({ success: true, message: 'FAQs actualizadas correctamente.' }), {
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al escribir en KV';
    console.error('Error en POST de FAQs:', errorMessage);
    return new Response(JSON.stringify({ error: 'Error procesando la solicitud', details: errorMessage }), {
      status: 500,
    });
  }
};
