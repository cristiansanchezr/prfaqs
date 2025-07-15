import type { APIRoute } from 'astro';
import { promises as fs } from 'fs';
import path from 'path';

export const prerender = false; // Requerido para endpoints que reciben POST

const dataFilePath = path.resolve(process.cwd(), 'src/data/faqs.json');

// Función para obtener los datos de las FAQs desde el archivo
async function getFaqs() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Si el archivo no existe o hay un error, devuelve un array vacío
    return [];
  }
}

// Función para guardar los datos de las FAQs en el archivo
async function setFaqs(newFaqs: any) {
  try {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(newFaqs, null, 2));
  } catch (error) {
    console.error('Error guardando las FAQs:', error);
    throw new Error('No se pudieron guardar las FAQs');
  }
}

// Maneja las solicitudes GET para devolver las FAQs
export const GET: APIRoute = async () => {
  const faqsData = await getFaqs();
  return new Response(JSON.stringify(faqsData), {
    headers: { 'content-type': 'application/json' },
  });
};

// Maneja las solicitudes POST para actualizar las FAQs
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Validación básica del formato esperado
    if (!Array.isArray(body) || !body[0]?.question || !body[0]?.answer) {
      return new Response(JSON.stringify({ error: 'Formato de datos inválido' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    await setFaqs(body);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en el webhook de FAQs:', error);
    return new Response(JSON.stringify({ error: 'Error procesando la solicitud' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
